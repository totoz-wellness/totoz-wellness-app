import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';

const prisma = new PrismaClient();

// Initialize Gemini AI with the new SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Rate limiting map (in-memory, use Redis for production)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 10;

// Content filtering - Crisis keywords for Kenyan context
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'self harm',
  'hurt myself', 'cutting', 'overdose', 'jump', 'hanging',
  'kujiua', 'niuwe', 'kufa', 'niishe', 'najiumiza'
];

const KENYAN_MENTAL_HEALTH_CONTEXT = `
You are TalkEasy, a compassionate mental health support chatbot specifically designed for Kenyan users.

IMPORTANT GUIDELINES:
1. You ONLY respond to mental health, emotional wellbeing, and psychological support topics
2. Always consider Kenyan cultural context, language nuances (Sheng, Swahili phrases), and social dynamics
3. Be aware of Kenyan-specific challenges: unemployment, family pressure, stigma around mental health
4. Reference Kenyan mental health resources when appropriate (e.g., Befrienders Kenya: 0722178177)
5. Respect cultural values: family importance, community ties, religious beliefs
6. Use warm, empathetic, non-judgmental language
7. Never provide medical diagnoses or replace professional help
8. If you detect crisis language, immediately provide emergency contacts

KENYAN EMERGENCY CONTACTS:
- Befrienders Kenya (Suicide Prevention): 0722 178 177
- Kenya Red Cross: 1199
- Emergency Services: 999/112
- Chiromo Hospital Group: 0730 849 000

If asked about topics unrelated to mental health (e.g., cooking, sports, politics), politely redirect:
"I'm TalkEasy, your mental health companion. I'm here to support your emotional wellbeing. How are you feeling today?"

Keep responses concise (2-3 paragraphs max), warm, and actionable.
`;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Rate limiting check
 */
const checkRateLimit = (userId) => {
  const now = Date.now();
  const userRateData = rateLimitMap.get(userId) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };

  // Reset if window expired
  if (now > userRateData.resetTime) {
    userRateData.count = 0;
    userRateData.resetTime = now + RATE_LIMIT_WINDOW;
  }

  userRateData.count++;
  rateLimitMap.set(userId, userRateData);

  return userRateData.count <= MAX_MESSAGES_PER_WINDOW;
};

/**
 * Content validation and sanitization
 */
const validateAndSanitizeMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message is required' };
  }

  const trimmed = message.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (trimmed.length > 1000) {
    return { valid: false, error: 'Message is too long (max 1000 characters)' };
  }

  // Remove any potential PII patterns (basic filtering)
  const sanitized = trimmed
    .replace(/\b\d{10,}\b/g, '[phone-number]') // Phone numbers
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email]') // Emails
    .replace(/\b\d{8,}\b/g, '[id-number]'); // ID numbers

  return { valid: true, sanitized };
};

/**
 * Detect sentiment and crisis indicators
 */
const detectSentiment = (message) => {
  const lowerMessage = message.toLowerCase();

  // Crisis detection (highest priority)
  for (const keyword of CRISIS_KEYWORDS) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      return 'CRISIS';
    }
  }

  // Simple sentiment analysis
  const positiveWords = ['happy', 'good', 'better', 'hopeful', 'grateful', 'furaha', 'vizuri'];
  const negativeWords = ['sad', 'depressed', 'anxious', 'worried', 'stressed', 'huzuni', 'wasiwasi'];

  const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;

  if (positiveCount > negativeCount) return 'POSITIVE';
  if (negativeCount > positiveCount) return 'NEGATIVE';
  return 'NEUTRAL';
};

/**
 * Generate crisis response
 */
const generateCrisisResponse = () => {
  return `I'm really concerned about what you're sharing with me. Your life is valuable, and there are people who want to help you right now.

🆘 **Please reach out immediately:**
- **Befrienders Kenya (24/7)**: 0722 178 177
- **Emergency Services**: 999 or 112
- **Kenya Red Cross**: 1199

You don't have to face this alone. These trained professionals are available right now to support you. Would you like to talk about what's making you feel this way, or would you prefer I share more resources?`;
};

// ============================================
// CONTROLLERS
// ============================================

/**
 * Send a message to TalkEasy chatbot
 * @route   POST /talkeasy/chat
 * @access  Private (Authenticated users only)
 */
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { message, sessionId } = req.body;

    // Rate limiting
    if (!checkRateLimit(userId)) {
      return res.status(429).json({
        success: false,
        message: 'Too many messages. Please wait a moment before sending another message.',
        retryAfter: 60
      });
    }

    // Validate and sanitize input
    const validation = validateAndSanitizeMessage(message);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const sanitizedMessage = validation.sanitized;

    // Detect sentiment
    const sentiment = detectSentiment(sanitizedMessage);

    // Handle crisis immediately
    if (sentiment === 'CRISIS') {
      const crisisResponse = generateCrisisResponse();

      // Store crisis message
      const savedMessage = await prisma.talkEasyMessage.create({
        data: {
          userId,
          message: '[Crisis message - content filtered]', // Don't store actual crisis content
          response: crisisResponse,
          sentiment: 'CRISIS',
          sessionId: sessionId || null
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          id: savedMessage.id,
          response: crisisResponse,
          sentiment: 'CRISIS',
          timestamp: savedMessage.timestamp
        },
        crisis: true
      });
    }

    // Generate AI response using Gemini (NEW SDK)
    const prompt = `${KENYAN_MENTAL_HEALTH_CONTEXT}

User message: "${sanitizedMessage}"

Respond with empathy and cultural sensitivity:`;

    console.log('🚀 Sending request to Gemini API...');
    
    // 🌐 API CALL TO GOOGLE'S SERVERS (NEW METHOD)
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', // or 'gemini-pro', 'gemini-2.5-flash'
      contents: prompt
    });

    console.log('✅ Received response from Gemini API');

    // Extract AI response text
    const aiResponse = response.text;

    // Store conversation (without storing PII)
    const savedMessage = await prisma.talkEasyMessage.create({
      data: {
        userId,
        message: sanitizedMessage,
        response: aiResponse,
        sentiment,
        sessionId: sessionId || null
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        id: savedMessage.id,
        response: aiResponse,
        sentiment,
        timestamp: savedMessage.timestamp
      }
    });

  } catch (error) {
    console.error('TalkEasy chat error:', error);

    // Handle Gemini API errors
    if (error.message?.includes('API key') || error.message?.includes('apiKey')) {
      return res.status(500).json({
        success: false,
        message: 'AI service configuration error. Please contact support.'
      });
    }

    if (error.message?.includes('quota') || error.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'AI service is temporarily unavailable. Please try again in a few minutes.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Unable to process your message. Please try again.'
    });
  }
};

/**
 * Get user's conversation history
 * @route   GET /talkeasy/history
 * @access  Private
 */
export const getConversationHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId, limit = 20, page = 1 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId };
    if (sessionId) {
      where.sessionId = sessionId;
    }

    const [messages, total] = await Promise.all([
      prisma.talkEasyMessage.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          message: true,
          response: true,
          sentiment: true,
          timestamp: true,
          sessionId: true
          // Note: userId is excluded for privacy
        }
      }),
      prisma.talkEasyMessage.count({ where })
    ]);

    return res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Show oldest first
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          totalMessages: total
        }
      }
    });

  } catch (error) {
    console.error('Get conversation history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve conversation history'
    });
  }
};

/**
 * Delete conversation history
 * @route   DELETE /talkeasy/history
 * @access  Private
 */
export const deleteConversationHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.query;

    const where = { userId };
    if (sessionId) {
      where.sessionId = sessionId;
    }

    const deleted = await prisma.talkEasyMessage.deleteMany({ where });

    return res.json({
      success: true,
      message: `Deleted ${deleted.count} message(s) from your history`,
      deletedCount: deleted.count
    });

  } catch (error) {
    console.error('Delete conversation history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to delete conversation history'
    });
  }
};

/**
 * Get TalkEasy statistics (Admin only)
 * @route   GET /talkeasy/stats
 * @access  Private (Super Admin)
 */
export const getTalkEasyStats = async (req, res) => {
  try {
    const [totalMessages, sentimentBreakdown, recentCrisis] = await Promise.all([
      prisma.talkEasyMessage.count(),
      prisma.talkEasyMessage.groupBy({
        by: ['sentiment'],
        _count: true
      }),
      prisma.talkEasyMessage.count({
        where: {
          sentiment: 'CRISIS',
          timestamp: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ]);

    return res.json({
      success: true,
      data: {
        totalMessages,
        recentCrisisMessages: recentCrisis,
        sentimentBreakdown: sentimentBreakdown.reduce((acc, item) => {
          acc[item.sentiment || 'UNKNOWN'] = item._count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Get TalkEasy stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve statistics'
    });
  }
};