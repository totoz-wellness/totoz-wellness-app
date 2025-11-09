import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';

const prisma = new PrismaClient();

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  RATE_LIMIT: {
    WINDOW_MS: 60000, // 1 minute
    MAX_REQUESTS: 10
  },
  MESSAGE: {
    MAX_LENGTH: 1000,
    MIN_LENGTH: 1
  },
  CONVERSATION: {
    HISTORY_LIMIT: 10, // Number of previous messages to include for context
    SESSION_TIMEOUT_HOURS: 24
  },
  AI: {
    MODEL: 'gemini-2.0-flash-exp',
    MAX_RETRIES: 2
  }
};

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// In-memory rate limiting (use Redis in production)
const rateLimitStore = new Map();

// ============================================
// CONSTANTS
// ============================================

const CRISIS_KEYWORDS = [
  // English
  'suicide', 'kill myself', 'end my life', 'want to die', 'self harm',
  'hurt myself', 'cutting', 'overdose', 'jump', 'hanging', 'no reason to live',
  'better off dead', 'can\'t go on', 'ending it all',
  // Swahili/Sheng
  'kujiua', 'niuwe', 'kufa', 'niishe', 'najiumiza', 'sitaki kuishi'
];

const SENTIMENT_KEYWORDS = {
  POSITIVE: [
    'happy', 'good', 'better', 'hopeful', 'grateful', 'great', 'wonderful',
    'excited', 'calm', 'peaceful', 'furaha', 'vizuri', 'poa', 'safi'
  ],
  NEGATIVE: [
    'sad', 'depressed', 'anxious', 'worried', 'stressed', 'angry', 'frustrated',
    'hopeless', 'lonely', 'overwhelmed', 'huzuni', 'wasiwasi', 'stressed sana'
  ]
};

const SYSTEM_CONTEXT = `You are TalkEasy, a compassionate mental health support chatbot specifically designed for Kenyan users.

CORE IDENTITY:
- You provide emotional support, coping strategies, and mental health resources
- You are warm, empathetic, culturally aware, and non-judgmental
- You understand Kenyan context: Sheng, Swahili phrases, cultural values, and local challenges

SCOPE & BOUNDARIES:
1. ✅ RESPOND TO: Mental health, emotional wellbeing, stress, anxiety, depression, relationships, grief, trauma, coping strategies
2. ❌ DO NOT RESPOND TO: Cooking, sports, politics, technology, finance, travel, shopping, general knowledge
3. ⚠️ NEVER: Provide medical diagnoses, prescribe medication, or replace professional care
4. 🆘 CRISIS: If detecting self-harm/suicide intent, immediately provide emergency contacts

KENYAN CONTEXT & CULTURAL SENSITIVITY:
- Acknowledge stigma around mental health in Kenya
- Respect family importance, community ties, religious beliefs
- Reference local challenges: unemployment, family pressure, financial stress
- Use Kenyan English with Sheng/Swahili naturally (e.g., "Pole sana", "Tuko pamoja", "Habari yako")
- Be aware of limited mental health resources and provide practical alternatives

EMERGENCY CONTACTS (Kenya):
- Befrienders Kenya (24/7 Suicide Prevention): 0722 178 177
- Kenya Red Cross Counseling: 1199
- Emergency Services: 999 / 112
- Chiromo Hospital Group (Mental Health): 0730 849 000

RESPONSE GUIDELINES:
1. **Continuation vs. First Message**: If conversation history exists, continue naturally WITHOUT re-introducing yourself
2. **Off-Topic Redirects**: Politely redirect without "pole sana" unless user expressed distress
   - Good: "Hi! I'm TalkEasy, your mental health companion. I focus on emotional wellbeing. How are you feeling today?"
   - Avoid: "Pole sana, I can't help with that..."
3. **Tone**: Warm, conversational, hopeful - like talking to a supportive friend
4. **Length**: 2-4 paragraphs max. Be concise and actionable
5. **Validation**: Always validate feelings before offering solutions
6. **Resources**: Suggest Kenyan-specific resources when appropriate

EXAMPLE RESPONSES:
- Crisis: "I'm really concerned about what you're sharing. Your life is valuable. Please reach out to Befrienders Kenya immediately at 0722 178 177..."
- Support: "I hear you. Feeling anxious before exams is totally normal, but it sounds like it's really weighing on you..."
- Redirect: "That's an interesting question, but I specialize in mental health support. Is there anything stressing you emotionally today?"
`;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Rate limiting with automatic cleanup
 */
class RateLimiter {
  static check(userId) {
    const now = Date.now();
    const userRecord = rateLimitStore.get(userId);

    // Initialize or reset if window expired
    if (!userRecord || now > userRecord.resetTime) {
      rateLimitStore.set(userId, {
        count: 1,
        resetTime: now + CONFIG.RATE_LIMIT.WINDOW_MS
      });
      return { allowed: true, remaining: CONFIG.RATE_LIMIT.MAX_REQUESTS - 1 };
    }

    // Check limit
    if (userRecord.count >= CONFIG.RATE_LIMIT.MAX_REQUESTS) {
      const retryAfter = Math.ceil((userRecord.resetTime - now) / 1000);
      return { allowed: false, retryAfter };
    }

    // Increment count
    userRecord.count++;
    rateLimitStore.set(userId, userRecord);

    return {
      allowed: true,
      remaining: CONFIG.RATE_LIMIT.MAX_REQUESTS - userRecord.count
    };
  }

  static cleanup() {
    const now = Date.now();
    for (const [userId, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(userId);
      }
    }
  }
}

// Cleanup rate limit store every 5 minutes
setInterval(() => RateLimiter.cleanup(), 5 * 60 * 1000);

/**
 * Input validation and sanitization
 */
class MessageValidator {
  static validate(message) {
    if (!message || typeof message !== 'string') {
      return { valid: false, error: 'Message is required and must be text' };
    }

    const trimmed = message.trim();

    if (trimmed.length < CONFIG.MESSAGE.MIN_LENGTH) {
      return { valid: false, error: 'Message cannot be empty' };
    }

    if (trimmed.length > CONFIG.MESSAGE.MAX_LENGTH) {
      return {
        valid: false,
        error: `Message is too long (max ${CONFIG.MESSAGE.MAX_LENGTH} characters)`
      };
    }

    return { valid: true, sanitized: this.sanitize(trimmed) };
  }

  static sanitize(message) {
    return message
      .replace(/\b\d{10,}\b/g, '[phone-number]') // Phone numbers
      .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email]') // Emails
      .replace(/\b\d{8,}\b/g, '[id-number]') // ID numbers
      .trim();
  }
}

/**
 * Sentiment and crisis detection
 */
class SentimentAnalyzer {
  static analyze(message) {
    const lowerMessage = message.toLowerCase();

    // Crisis detection (highest priority)
    if (this.detectCrisis(lowerMessage)) {
      return 'CRISIS';
    }

    // Sentiment analysis
    const positiveCount = this.countMatches(lowerMessage, SENTIMENT_KEYWORDS.POSITIVE);
    const negativeCount = this.countMatches(lowerMessage, SENTIMENT_KEYWORDS.NEGATIVE);

    if (positiveCount > negativeCount) return 'POSITIVE';
    if (negativeCount > positiveCount) return 'NEGATIVE';
    return 'NEUTRAL';
  }

  static detectCrisis(message) {
    return CRISIS_KEYWORDS.some(keyword =>
      message.includes(keyword.toLowerCase())
    );
  }

  static countMatches(message, keywords) {
    return keywords.filter(word =>
      message.includes(word.toLowerCase())
    ).length;
  }
}

/**
 * Crisis response generator
 */
class CrisisResponseHandler {
  static generate() {
    return `🆘 **URGENT: I'm very concerned about what you're sharing with me.**

Your life has value, and you don't have to face this alone. Please reach out to someone who can help you right now:

**IMMEDIATE HELP (Kenya):**
📞 **Befrienders Kenya (24/7)**: 0722 178 177
🚨 **Emergency Services**: 999 or 112
🏥 **Kenya Red Cross**: 1199
💚 **Chiromo Hospital**: 0730 849 000

These are trained professionals who care and want to support you. They're available RIGHT NOW.

I'm here to listen too. Would you like to talk about what's making you feel this way? Sometimes sharing can help lighten the burden. Tuko pamoja - you're not alone in this.`;
  }
}

/**
 * Conversation history manager
 */
class ConversationManager {
  static async getHistory(userId, sessionId) {
    if (!sessionId) return null;

    const messages = await prisma.talkEasyMessage.findMany({
      where: { userId, sessionId },
      orderBy: { timestamp: 'desc' },
      take: CONFIG.CONVERSATION.HISTORY_LIMIT,
      select: {
        message: true,
        response: true,
        timestamp: true
      }
    });

    if (messages.length === 0) return null;

    // Build conversation context (reverse to chronological order)
    let context = '\n**CONVERSATION HISTORY:**\n';
    messages.reverse().forEach((msg, index) => {
      context += `\n[Message ${index + 1}]\n`;
      context += `User: ${msg.message}\n`;
      context += `TalkEasy: ${msg.response}\n`;
    });
    context += '\n---\n';

    return context;
  }

  static async save(userId, message, response, sentiment, sessionId) {
    return await prisma.talkEasyMessage.create({
      data: {
        userId,
        message,
        response,
        sentiment,
        sessionId: sessionId || null
      }
    });
  }
}

/**
 * AI Service wrapper with retry logic
 */
class AIService {
  static async generateResponse(prompt, retries = CONFIG.AI.MAX_RETRIES) {
    try {
      const response = await ai.models.generateContent({
        model: CONFIG.AI.MODEL,
        contents: prompt
      });

      return response.text;
    } catch (error) {
      // Retry on transient errors
      if (retries > 0 && (error.status === 503 || error.status === 500)) {
        console.warn(`AI request failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
        return this.generateResponse(prompt, retries - 1);
      }

      throw error;
    }
  }

  static buildPrompt(systemContext, conversationHistory, currentMessage) {
    let prompt = systemContext;

    if (conversationHistory) {
      prompt += conversationHistory;
      prompt += '\n**CURRENT MESSAGE:**\n';
      prompt += `User: ${currentMessage}\n\n`;
      prompt += '**INSTRUCTIONS**: This is a continuation. DO NOT re-introduce yourself. Continue the conversation naturally based on the history above.\n';
    } else {
      prompt += '\n**FIRST MESSAGE IN CONVERSATION:**\n';
      prompt += `User: ${currentMessage}\n\n`;
    }

    return prompt;
  }
}

// ============================================
// CONTROLLERS
// ============================================

/**
 * @desc    Send a message to TalkEasy chatbot
 * @route   POST /talkeasy/chat
 * @access  Private (Authenticated users)
 * @body    { message: string, sessionId?: string }
 */
export const sendMessage = async (req, res) => {
  const startTime = Date.now();

  try {
    const userId = req.user.userId;
    const { message, sessionId } = req.body;

    // ===== RATE LIMITING =====
    const rateLimit = RateLimiter.check(userId);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: 'Too many messages. Please wait before sending another.',
        retryAfter: rateLimit.retryAfter
      });
    }

    // ===== INPUT VALIDATION =====
    const validation = MessageValidator.validate(message);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    const sanitizedMessage = validation.sanitized;

    // ===== SENTIMENT ANALYSIS =====
    const sentiment = SentimentAnalyzer.analyze(sanitizedMessage);

    // ===== CRISIS HANDLING =====
    if (sentiment === 'CRISIS') {
      const crisisResponse = CrisisResponseHandler.generate();

      const savedMessage = await ConversationManager.save(
        userId,
        '[Crisis message - content filtered for privacy]',
        crisisResponse,
        'CRISIS',
        sessionId
      );

      console.log(`⚠️ CRISIS DETECTED - User: ${userId}, Message ID: ${savedMessage.id}`);

      return res.status(200).json({
        success: true,
        data: {
          id: savedMessage.id,
          response: crisisResponse,
          sentiment: 'CRISIS',
          timestamp: savedMessage.timestamp
        },
        crisis: true,
        metadata: {
          processingTime: Date.now() - startTime
        }
      });
    }

    // ===== CONVERSATION HISTORY =====
    const conversationHistory = await ConversationManager.getHistory(userId, sessionId);

    // ===== AI PROMPT CONSTRUCTION =====
    const prompt = AIService.buildPrompt(
      SYSTEM_CONTEXT,
      conversationHistory,
      sanitizedMessage
    );

    // ===== AI GENERATION =====
    console.log(`🤖 Generating AI response for user ${userId}...`);
    const aiResponse = await AIService.generateResponse(prompt);
    console.log(`✅ AI response generated (${Date.now() - startTime}ms)`);

    // ===== SAVE TO DATABASE =====
    const savedMessage = await ConversationManager.save(
      userId,
      sanitizedMessage,
      aiResponse,
      sentiment,
      sessionId
    );

    // ===== RESPONSE =====
    return res.status(200).json({
      success: true,
      data: {
        id: savedMessage.id,
        response: aiResponse,
        sentiment,
        timestamp: savedMessage.timestamp,
        sessionId: sessionId || null
      },
      metadata: {
        processingTime: Date.now() - startTime,
        rateLimitRemaining: rateLimit.remaining
      }
    });

  } catch (error) {
    console.error('❌ TalkEasy chat error:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.userId
    });

    // ===== ERROR HANDLING =====
    if (error.message?.includes('API key') || error.message?.includes('apiKey')) {
      return res.status(500).json({
        success: false,
        message: 'AI service configuration error. Please contact support.',
        errorCode: 'AI_CONFIG_ERROR'
      });
    }

    if (error.message?.includes('quota') || error.status === 429) {
      return res.status(503).json({
        success: false,
        message: 'AI service is temporarily unavailable. Please try again in a few minutes.',
        errorCode: 'AI_QUOTA_EXCEEDED',
        retryAfter: 60
      });
    }

    if (error.code === 'P2002') { // Prisma unique constraint
      return res.status(409).json({
        success: false,
        message: 'Duplicate message detected',
        errorCode: 'DUPLICATE_MESSAGE'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Unable to process your message. Please try again.',
      errorCode: 'INTERNAL_ERROR'
    });
  }
};

/**
 * @desc    Get user's conversation history
 * @route   GET /talkeasy/history
 * @access  Private
 * @query   sessionId?, limit?, page?
 */
export const getConversationHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      sessionId,
      limit = 20,
      page = 1
    } = req.query;

    const parsedLimit = Math.min(parseInt(limit) || 20, 100); // Max 100
    const parsedPage = Math.max(parseInt(page) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const where = { userId };
    if (sessionId) {
      where.sessionId = sessionId;
    }

    const [messages, total] = await Promise.all([
      prisma.talkEasyMessage.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: parsedLimit,
        select: {
          id: true,
          message: true,
          response: true,
          sentiment: true,
          timestamp: true,
          sessionId: true
        }
      }),
      prisma.talkEasyMessage.count({ where })
    ]);

    return res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Chronological order
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total: Math.ceil(total / parsedLimit),
          totalMessages: total
        }
      }
    });

  } catch (error) {
    console.error('❌ Get conversation history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve conversation history',
      errorCode: 'HISTORY_FETCH_ERROR'
    });
  }
};

/**
 * @desc    Delete conversation history
 * @route   DELETE /talkeasy/history
 * @access  Private
 * @query   sessionId? (optional - deletes all if not provided)
 */
export const deleteConversationHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.query;

    const where = { userId };
    if (sessionId) {
      where.sessionId = sessionId;
    }

    const result = await prisma.talkEasyMessage.deleteMany({ where });

    console.log(`🗑️ Deleted ${result.count} messages for user ${userId}${sessionId ? ` (session: ${sessionId})` : ''}`);

    return res.json({
      success: true,
      message: sessionId
        ? `Deleted ${result.count} message(s) from session "${sessionId}"`
        : `Deleted all ${result.count} message(s) from your history`,
      data: {
        deletedCount: result.count,
        sessionId: sessionId || null
      }
    });

  } catch (error) {
    console.error('❌ Delete conversation history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to delete conversation history',
      errorCode: 'HISTORY_DELETE_ERROR'
    });
  }
};

/**
 * @desc    Get TalkEasy statistics
 * @route   GET /talkeasy/stats
 * @access  Private (Super Admin only)
 */
export const getTalkEasyStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalMessages,
      totalUsers,
      sentimentBreakdown,
      recentCrisis,
      last7Days,
      last30Days
    ] = await Promise.all([
      prisma.talkEasyMessage.count(),
      prisma.talkEasyMessage.findMany({
        distinct: ['userId'],
        select: { userId: true }
      }).then(users => users.length),
      prisma.talkEasyMessage.groupBy({
        by: ['sentiment'],
        _count: true
      }),
      prisma.talkEasyMessage.count({
        where: {
          sentiment: 'CRISIS',
          timestamp: { gte: sevenDaysAgo }
        }
      }),
      prisma.talkEasyMessage.count({
        where: { timestamp: { gte: sevenDaysAgo } }
      }),
      prisma.talkEasyMessage.count({
        where: { timestamp: { gte: thirtyDaysAgo } }
      })
    ]);

    const sentimentStats = sentimentBreakdown.reduce((acc, item) => {
      acc[item.sentiment || 'UNKNOWN'] = item._count;
      return acc;
    }, {});

    return res.json({
      success: true,
      data: {
        overview: {
          totalMessages,
          totalUsers,
          averageMessagesPerUser: totalUsers > 0 ? (totalMessages / totalUsers).toFixed(2) : 0
        },
        activity: {
          last7Days,
          last30Days
        },
        sentiment: sentimentStats,
        crisis: {
          last7Days: recentCrisis,
          total: sentimentStats.CRISIS || 0
        },
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Get TalkEasy stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve statistics',
      errorCode: 'STATS_FETCH_ERROR'
    });
  }
};

/**
 * @desc    Get user's personal stats
 * @route   GET /talkeasy/my-stats
 * @access  Private
 */
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalMessages,
      sentimentBreakdown,
      recentMessages,
      uniqueSessions
    ] = await Promise.all([
      prisma.talkEasyMessage.count({ where: { userId } }),
      prisma.talkEasyMessage.groupBy({
        where: { userId },
        by: ['sentiment'],
        _count: true
      }),
      prisma.talkEasyMessage.count({
        where: {
          userId,
          timestamp: { gte: thirtyDaysAgo }
        }
      }),
      prisma.talkEasyMessage.findMany({
        where: { userId, sessionId: { not: null } },
        distinct: ['sessionId'],
        select: { sessionId: true }
      }).then(sessions => sessions.length)
    ]);

    const sentimentStats = sentimentBreakdown.reduce((acc, item) => {
      acc[item.sentiment || 'UNKNOWN'] = item._count;
      return acc;
    }, {});

    return res.json({
      success: true,
      data: {
        totalMessages,
        last30Days: recentMessages,
        sessions: uniqueSessions,
        sentiment: sentimentStats
      }
    });

  } catch (error) {
    console.error('❌ Get user stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve your statistics',
      errorCode: 'USER_STATS_ERROR'
    });
  }
};

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received - closing Prisma connection...');
  await prisma.$disconnect();
  process.exit(0);
});