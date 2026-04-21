// controllers/talkeasy.controller.js
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
    HISTORY_LIMIT: 10,
    SESSION_TIMEOUT_HOURS: 24
  },
  AI: {
    MODEL: 'gemini-2.5-flash',
    MAX_RETRIES: 2
  },
  RECOMMENDATIONS: {
    MAX_ARTICLES: 2,
    MAX_DIRECTORIES: 2
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

const TOPIC_KEYWORDS = {
  ANXIETY: ['anxious', 'anxiety', 'worried', 'panic', 'nervous', 'fear', 'wasiwasi', 'stressed', 'overthinking'],
  DEPRESSION: ['depressed', 'depression', 'sad', 'hopeless', 'empty', 'worthless', 'huzuni', 'numb'],
  STRESS: ['stressed', 'stress', 'overwhelmed', 'pressure', 'burden', 'too much', 'mzigo', 'exhausted'],
  WORK: ['job', 'work', 'boss', 'career', 'kazi', 'deadline', 'employment', 'workplace', 'colleague'],
  FAMILY: ['family', 'parents', 'mother', 'father', 'familia', 'mama', 'baba', 'siblings', 'relatives'],
  RELATIONSHIPS: ['relationship', 'boyfriend', 'girlfriend', 'partner', 'dating', 'breakup', 'marriage', 'spouse'],
  FINANCIAL: ['money', 'rent', 'bills', 'debt', 'broke', 'pesa', 'financial', 'poverty', 'jobless'],
  ACADEMIC: ['exam', 'school', 'university', 'study', 'grades', 'mtihani', 'college', 'student'],
  GRIEF: ['loss', 'death', 'died', 'passed away', 'funeral', 'mourning', 'kifo', 'bereaved'],
  TRAUMA: ['abuse', 'violence', 'assault', 'hurt', 'traumatic', 'pain', 'attacked', 'violated'],
  LONELINESS: ['lonely', 'alone', 'isolated', 'no friends', 'peke yangu', 'nobody'],
  SELF_ESTEEM: ['confidence', 'self-worth', 'ugly', 'failure', 'not good enough', 'insecure'],
  PARENTING: ['children', 'kids', 'parenting', 'mtoto', 'child', 'baby', 'toddler'],
  ADDICTION: ['alcohol', 'drinking', 'drugs', 'substance', 'addiction', 'addict']
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
6. **Resources**: When user asks for resources or shows strong need, mention that helpful articles and professional support can be provided

EXAMPLE RESPONSES:
- Crisis: "I'm really concerned about what you're sharing. Your life is valuable. Please reach out to Befrienders Kenya immediately at 0722 178 177..."
- Support: "I hear you. Feeling anxious before exams is totally normal, but it sounds like it's really weighing on you..."
- Redirect: "That's an interesting question, but I specialize in mental health support. Is there anything stressing you emotionally today?"
`;

// ============================================
// UTILITY CLASSES
// ============================================

/**
 * Rate limiting with automatic cleanup
 */
class RateLimiter {
  static check(userId) {
    const now = Date.now();
    const userRecord = rateLimitStore.get(userId);

    if (!userRecord || now > userRecord.resetTime) {
      rateLimitStore.set(userId, {
        count: 1,
        resetTime: now + CONFIG.RATE_LIMIT.WINDOW_MS
      });
      return { allowed: true, remaining: CONFIG.RATE_LIMIT.MAX_REQUESTS - 1 };
    }

    if (userRecord.count >= CONFIG.RATE_LIMIT.MAX_REQUESTS) {
      const retryAfter = Math.ceil((userRecord.resetTime - now) / 1000);
      return { allowed: false, retryAfter };
    }

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
      .replace(/\b\d{10,}\b/g, '[phone-number]')
      .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email]')
      .replace(/\b\d{8,}\b/g, '[id-number]')
      .trim();
  }
}

/**
 * Sentiment and crisis detection
 */
class SentimentAnalyzer {
  static analyze(message) {
    const lowerMessage = message.toLowerCase();

    if (this.detectCrisis(lowerMessage)) {
      return 'CRISIS';
    }

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
 * Topic and category analyzer
 */
class TopicAnalyzer {
  static extractTopics(message) {
    const lowerMessage = message.toLowerCase();
    const detectedTopics = [];

    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      const found = keywords.some(keyword => lowerMessage.includes(keyword));
      if (found) {
        detectedTopics.push(topic);
      }
    }

    return detectedTopics;
  }

  static extractKeywords(message) {
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'my', 'me'];
    const words = message.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));

    return [...new Set(words)].slice(0, 15);
  }

  static determinePrimaryCategory(topics) {
    if (topics.length === 0) return 'GENERAL';
    
    const priorities = ['TRAUMA', 'DEPRESSION', 'ANXIETY', 'GRIEF', 'STRESS', 'ADDICTION'];
    
    for (const priority of priorities) {
      if (topics.includes(priority)) return priority;
    }
    
    return topics[0];
  }

  static assessEmotionalIntensity(message, sentiment) {
    if (sentiment === 'CRISIS') return 'CRISIS';

    const intensityMarkers = {
      HIGH: ['extremely', 'very', 'so much', 'really', 'cant', 'unbearable', 'terrible', 'awful', 'sana sana', 'completely'],
      MEDIUM: ['quite', 'pretty', 'somewhat', 'fairly', 'kidogo', 'bit'],
    };

    const lowerMessage = message.toLowerCase();

    for (const [level, markers] of Object.entries(intensityMarkers)) {
      const found = markers.some(marker => lowerMessage.includes(marker));
      if (found) return level;
    }

    return 'LOW';
  }

  static detectResourceRequest(message) {
    const requestIndicators = [
      'help', 'resource', 'where can i', 'how do i', 'need support',
      'looking for', 'find', 'recommend', 'suggest', 'show me',
      'want to learn', 'read more', 'more information', 'tell me more',
      'therapy', 'therapist', 'counselor', 'counselling', 'professional help',
      'article', 'read about', 'information on',
      'msaada', 'natafuta', 'nionyeshe', 'nataka kujua'
    ];

    const lowerMessage = message.toLowerCase();
    return requestIndicators.some(indicator => lowerMessage.includes(indicator));
  }

  static detectUrgentNeed(message, sentiment, emotionalIntensity) {
    if (sentiment === 'CRISIS') return true;
    if (emotionalIntensity === 'HIGH') {
      const urgentKeywords = ['cant cope', 'breaking down', 'losing control', 'need help now', 'immediately'];
      const lowerMessage = message.toLowerCase();
      return urgentKeywords.some(keyword => lowerMessage.includes(keyword));
    }
    return false;
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

    let context = '\n**CONVERSATION HISTORY:**\n';
    messages.reverse().forEach((msg, index) => {
      context += `\n[Message ${index + 1}]\n`;
      context += `User: ${msg.message}\n`;
      context += `TalkEasy: ${msg.response}\n`;
    });
    context += '\n---\n';

    return context;
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
      if (retries > 0 && (error.status === 503 || error.status === 500)) {
        console.warn(`AI request failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
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

/**
 * Resource Recommendation Service
 */
class ResourceRecommender {
  static async findRelevantArticles(topics, keywords, limit = CONFIG.RECOMMENDATIONS.MAX_ARTICLES) {
    if (topics.length === 0 && keywords.length === 0) return [];

    try {
      const searchConditions = [];

      if (topics.length > 0) {
        const topicLower = topics.map(t => t.toLowerCase());
        searchConditions.push({
          OR: [
            { tags: { hasSome: topicLower } },
            { category: { in: topicLower, mode: 'insensitive' } }
          ]
        });
      }

      if (keywords.length > 0) {
        searchConditions.push({
          OR: [
            { tags: { hasSome: keywords } },
            { title: { contains: keywords[0], mode: 'insensitive' } },
            { excerpt: { contains: keywords[0], mode: 'insensitive' } }
          ]
        });
      }

      const articles = await prisma.article.findMany({
        where: {
          status: 'PUBLISHED',
          AND: searchConditions
        },
        select: {
          id: true,
          title: true,
          excerpt: true,
          slug: true,
          category: true,
          tags: true,
          readTime: true
        },
        take: limit * 2,
        orderBy: { publishedAt: 'desc' }
      });

      // Score articles by relevance
      const scoredArticles = articles.map(article => {
        let score = 0;
        
        if (topics.some(t => article.category?.toLowerCase().includes(t.toLowerCase()))) {
          score += 10;
        }
        
        const matchingTags = article.tags.filter(tag => 
          topics.some(t => tag.toLowerCase().includes(t.toLowerCase())) ||
          keywords.some(k => tag.toLowerCase().includes(k.toLowerCase()))
        );
        score += matchingTags.length * 5;
        
        keywords.forEach(keyword => {
          if (article.title.toLowerCase().includes(keyword.toLowerCase())) score += 3;
          if (article.excerpt?.toLowerCase().includes(keyword.toLowerCase())) score += 2;
        });

        return { ...article, relevanceScore: score };
      });

      return scoredArticles
        .filter(a => a.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);

    } catch (error) {
      console.error('❌ Article recommendation error:', error);
      return [];
    }
  }

  static async findRelevantDirectories(primaryCategory, isUrgent = false, limit = CONFIG.RECOMMENDATIONS.MAX_DIRECTORIES) {
    try {
      const typeMapping = {
        ANXIETY: ['THERAPIST', 'COUNSELOR', 'CLINIC', 'ONLINE_SERVICE'],
        DEPRESSION: ['THERAPIST', 'PSYCHIATRIST', 'CLINIC', 'HOSPITAL'],
        STRESS: ['COUNSELOR', 'THERAPIST', 'SUPPORT_GROUP'],
        TRAUMA: ['THERAPIST', 'PSYCHIATRIST', 'HOSPITAL'],
        GRIEF: ['COUNSELOR', 'SUPPORT_GROUP', 'THERAPIST'],
        ADDICTION: ['CLINIC', 'SUPPORT_GROUP', 'HOSPITAL'],
        CRISIS: ['HELPLINE', 'HOSPITAL', 'CLINIC']
      };

      let types = typeMapping[primaryCategory] || ['COUNSELOR', 'THERAPIST'];
      if (isUrgent && !types.includes('HELPLINE')) {
        types = ['HELPLINE', ...types];
      }

      const directories = await prisma.directory.findMany({
        where: {
          type: { in: types },
          isVerified: true
        },
        select: {
          id: true,
          name: true,
          type: true,
          excerpt: true,
          phone: true,
          email: true,
          website: true,
          city: true,
          county: true,
          operatingHours: true,
          specializations: true,
          isFeatured: true,
          slug: true
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit
      });

      return directories;

    } catch (error) {
      console.error('❌ Directory recommendation error:', error);
      return [];
    }
  }

  static formatRecommendations(articles, directories) {
    let formatted = '';

    if (articles.length > 0) {
      formatted += '\n\n📚 **Learn More:**\n';
      articles.forEach(article => {
        formatted += `• **${article.title}**`;
        if (article.excerpt) {
          formatted += ` - ${article.excerpt.substring(0, 80)}...`;
        }
        if (article.readTime) {
          formatted += ` (${article.readTime} min read)`;
        }
        formatted += '\n';
      });
    }

    if (directories.length > 0) {
      formatted += '\n\n💚 **Get Professional Support:**\n';
      directories.forEach(dir => {
        formatted += `• **${dir.name}**`;
        if (dir.excerpt) {
          formatted += ` - ${dir.excerpt.substring(0, 80)}...`;
        }
        formatted += '\n';
        if (dir.phone) formatted += `  📞 ${dir.phone}`;
        if (dir.city) formatted += ` | 📍 ${dir.city}`;
        if (dir.operatingHours) formatted += ` | ⏰ ${dir.operatingHours}`;
        formatted += '\n';
      });
    }

    return formatted;
  }
}

/**
 * Analytics Service
 */
class AnalyticsService {
  static async saveMessageWithAnalytics(data) {
    const {
      userId,
      message,
      response,
      sentiment,
      sessionId,
      processingTimeMs,
      modelVersion = CONFIG.AI.MODEL,
      promptVersion = '1.0',
      recommendedArticles = [],
      recommendedDirectories = [],
      resourcesRequested = false
    } = data;

    const topics = TopicAnalyzer.extractTopics(message);
    const keywords = TopicAnalyzer.extractKeywords(message);
    const primaryCategory = TopicAnalyzer.determinePrimaryCategory(topics);
    const emotionalIntensity = TopicAnalyzer.assessEmotionalIntensity(message, sentiment);

    let conversationTurn = 1;
    if (sessionId) {
      conversationTurn = await prisma.talkEasyMessage.count({
        where: { userId, sessionId }
      }) + 1;
    }

    const savedMessage = await prisma.talkEasyMessage.create({
      data: {
        userId,
        message,
        response,
        sentiment,
        sessionId,
        messageLength: message.length,
        responseLength: response.length,
        detectedTopics: topics,
        detectedKeywords: keywords,
        emotionalIntensity,
        conversationTurn,
        processingTimeMs,
        primaryCategory,
        secondaryCategory: topics.length > 1 ? topics[1] : null,
        modelVersion,
        promptVersion,
        recommendedArticles,
        recommendedDirectories,
        resourcesRequested
      }
    });

    // Save to training dataset (async)
    if (sentiment !== 'CRISIS' && message.length >= 10) {
      this.saveToTrainingDataset(savedMessage).catch(err => 
        console.error('Training data save error:', err)
      );
    }

    return savedMessage;
  }

  static async saveToTrainingDataset(message) {
    try {
      const anonymizedMessage = this.anonymizeText(message.message);
      const anonymizedResponse = this.anonymizeText(message.response);
      const qualityScore = this.calculateQualityScore(message);

      await prisma.talkEasyTrainingData.create({
        data: {
          anonymizedMessage,
          anonymizedResponse,
          sentiment: message.sentiment,
          primaryCategory: message.primaryCategory,
          emotionalIntensity: message.emotionalIntensity,
          topics: message.detectedTopics,
          keywords: message.detectedKeywords,
          qualityScore,
          originalTimestamp: message.timestamp,
          conversationTurn: message.conversationTurn,
          includeInTraining: qualityScore > 0.6
        }
      });
    } catch (error) {
      console.error('❌ Training data save error:', error);
    }
  }

  static anonymizeText(text) {
    return text
      .replace(/\b\d{10,}\b/g, '[PHONE]')
      .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[EMAIL]')
      .replace(/\b\d{8,}\b/g, '[ID]')
      .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME]')
      .replace(/\b(0\d{9})\b/g, '[PHONE]');
  }

  static calculateQualityScore(message) {
    let score = 0.5;

    if (message.messageLength > 20 && message.messageLength < 500) score += 0.2;
    if (message.responseLength > 50 && message.responseLength < 1000) score += 0.1;
    if (message.detectedTopics.length > 0) score += 0.1;
    if (message.conversationTurn > 1) score += 0.1;
    if (message.messageLength < 10) score -= 0.3;
    if (message.detectedTopics.length === 0) score -= 0.1;

    return Math.max(0, Math.min(1, score));
  }

  static async aggregateDailyAnalytics(date = new Date()) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const messages = await prisma.talkEasyMessage.findMany({
        where: {
          timestamp: { gte: startOfDay, lte: endOfDay }
        }
      });

      if (messages.length === 0) return null;

      const uniqueUsers = new Set(messages.map(m => m.userId)).size;
      const crisisCount = messages.filter(m => m.sentiment === 'CRISIS').length;
      const positiveCount = messages.filter(m => m.sentiment === 'POSITIVE').length;
      const negativeCount = messages.filter(m => m.sentiment === 'NEGATIVE').length;
      const neutralCount = messages.filter(m => m.sentiment === 'NEUTRAL').length;

      const categoryBreakdown = {};
      const topicTrends = {};
      let articlesRecommended = 0;
      let directoriesRecommended = 0;

      messages.forEach(msg => {
        if (msg.primaryCategory) {
          categoryBreakdown[msg.primaryCategory] = (categoryBreakdown[msg.primaryCategory] || 0) + 1;
        }
        msg.detectedTopics?.forEach(topic => {
          topicTrends[topic] = (topicTrends[topic] || 0) + 1;
        });
        articlesRecommended += msg.recommendedArticles?.length || 0;
        directoriesRecommended += msg.recommendedDirectories?.length || 0;
      });

      const avgProcessingTime = messages
        .filter(m => m.processingTimeMs)
        .reduce((sum, m) => sum + m.processingTimeMs, 0) / messages.length || 0;

      const avgMessageLength = messages.reduce((sum, m) => sum + (m.messageLength || 0), 0) / messages.length;
      const avgResponseLength = messages.reduce((sum, m) => sum + (m.responseLength || 0), 0) / messages.length;

      await prisma.talkEasyAnalytics.upsert({
        where: { date: startOfDay },
        update: {
          totalMessages: messages.length,
          uniqueUsers,
          crisisCount,
          positiveCount,
          negativeCount,
          neutralCount,
          categoryBreakdown,
          topicTrends,
          articlesRecommended,
          directoriesRecommended,
          avgProcessingTime,
          avgMessageLength,
          avgResponseLength
        },
        create: {
          date: startOfDay,
          totalMessages: messages.length,
          uniqueUsers,
          crisisCount,
          positiveCount,
          negativeCount,
          neutralCount,
          categoryBreakdown,
          topicTrends,
          articlesRecommended,
          directoriesRecommended,
          avgProcessingTime,
          avgMessageLength,
          avgResponseLength
        }
      });

      console.log(`📊 Analytics aggregated for ${startOfDay.toISOString().split('T')[0]}`);
      return true;
    } catch (error) {
      console.error('❌ Analytics aggregation error:', error);
      return false;
    }
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

    // ===== ANALYTICS EXTRACTION =====
    const topics = TopicAnalyzer.extractTopics(sanitizedMessage);
    const keywords = TopicAnalyzer.extractKeywords(sanitizedMessage);
    const primaryCategory = TopicAnalyzer.determinePrimaryCategory(topics);
    const sentiment = SentimentAnalyzer.analyze(sanitizedMessage);
    const emotionalIntensity = TopicAnalyzer.assessEmotionalIntensity(sanitizedMessage, sentiment);
    
    const resourcesRequested = TopicAnalyzer.detectResourceRequest(sanitizedMessage);
    const urgentNeed = TopicAnalyzer.detectUrgentNeed(sanitizedMessage, sentiment, emotionalIntensity);

    // ===== CRISIS HANDLING =====
    if (sentiment === 'CRISIS') {
      const crisisResponse = CrisisResponseHandler.generate();

      const savedMessage = await AnalyticsService.saveMessageWithAnalytics({
        userId,
        message: '[Crisis message - content filtered for privacy]',
        response: crisisResponse,
        sentiment: 'CRISIS',
        sessionId,
        processingTimeMs: Date.now() - startTime,
        resourcesRequested: true
      });

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

    // Get conversation turn for smarter recommendations
    const conversationTurn = sessionId ? await prisma.talkEasyMessage.count({
      where: { userId, sessionId }
    }) + 1 : 1;

    // ===== AI PROMPT CONSTRUCTION =====
    const prompt = AIService.buildPrompt(
      SYSTEM_CONTEXT,
      conversationHistory,
      sanitizedMessage
    );

    // ===== AI GENERATION =====
    console.log(`🤖 Generating AI response for user ${userId}...`);
    const aiResponse = await AIService.generateResponse(prompt);
    const processingTime = Date.now() - startTime;
    console.log(`✅ AI response generated (${processingTime}ms)`);

    // ===== SMART RESOURCE RECOMMENDATIONS =====
    let recommendedArticles = [];
    let recommendedDirectories = [];
    let resourceAppendix = '';

    // Only recommend if:
    // 1. User explicitly asked for resources
    // 2. Urgent need detected
    // 3. Multi-turn conversation with high emotional intensity
    const shouldRecommend = resourcesRequested || urgentNeed || 
      (conversationTurn > 2 && emotionalIntensity === 'HIGH');

    if (shouldRecommend && topics.length > 0) {
      console.log(`📚 Finding relevant resources for ${primaryCategory}...`);

      // Fetch articles (only if user shows interest in learning)
      if (resourcesRequested || conversationTurn > 2) {
        const articles = await ResourceRecommender.findRelevantArticles(topics, keywords);
        recommendedArticles = articles.map(a => a.id);
        
        if (articles.length > 0) {
          console.log(`  ✓ Found ${articles.length} relevant article(s)`);
        }
      }

      // Fetch directories (if urgent need or explicitly requested)
      if (urgentNeed || resourcesRequested) {
        const directories = await ResourceRecommender.findRelevantDirectories(primaryCategory, urgentNeed);
        recommendedDirectories = directories.map(d => d.id);
        
        if (directories.length > 0) {
          console.log(`  ✓ Found ${directories.length} relevant support service(s)`);
        }
      }

      // Format recommendations
      if (recommendedArticles.length > 0 || recommendedDirectories.length > 0) {
        const articles = await prisma.article.findMany({
          where: { id: { in: recommendedArticles } },
          select: { id: true, title: true, excerpt: true, slug: true, readTime: true }
        });

        const directories = await prisma.directory.findMany({
          where: { id: { in: recommendedDirectories } },
          select: { id: true, name: true, excerpt: true, phone: true, city: true, operatingHours: true }
        });

        resourceAppendix = ResourceRecommender.formatRecommendations(articles, directories);
      }
    }

    // ===== SAVE TO DATABASE WITH ANALYTICS =====
    const finalResponse = aiResponse + resourceAppendix;

    const savedMessage = await AnalyticsService.saveMessageWithAnalytics({
      userId,
      message: sanitizedMessage,
      response: finalResponse,
      sentiment,
      sessionId,
      processingTimeMs: processingTime,
      recommendedArticles,
      recommendedDirectories,
      resourcesRequested
    });

    // ===== RESPONSE =====
    return res.status(200).json({
      success: true,
      data: {
        id: savedMessage.id,
        response: finalResponse,
        sentiment,
        timestamp: savedMessage.timestamp,
        sessionId: sessionId || null
      },
      metadata: {
        processingTime,
        rateLimitRemaining: rateLimit.remaining,
        resourcesProvided: recommendedArticles.length + recommendedDirectories.length > 0
      }
    });

  } catch (error) {
    console.error('❌ TalkEasy chat error:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.userId
    });

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

    if (error.code === 'P2002') {
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

    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
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
        messages: messages.reverse(),
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

/**
 * @desc    Get insights and trends (ADMIN)
 * @route   GET /talkeasy/admin/insights
 * @access  Private (Super Admin only)
 */

export const getInsights = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const [
      topCategories,
      topTopics,
      emotionalIntensityDist,
      resourceStats
    ] = await Promise.all([
      prisma.talkEasyMessage.groupBy({
        by: ['primaryCategory'],
        where: {
          timestamp: { gte: daysAgo },
          primaryCategory: { not: null }
        },
        _count: true,
        orderBy: { _count: { primaryCategory: 'desc' } },
        take: 10
      }),

      prisma.$queryRaw`
        SELECT 
          unnest("detectedTopics") as topic,
          COUNT(*) as count
        FROM "talkeasy_messages"
        WHERE timestamp >= ${daysAgo}
        GROUP BY topic
        ORDER BY count DESC
        LIMIT 15
      `,

      prisma.talkEasyMessage.groupBy({
        by: ['emotionalIntensity'],
        where: { timestamp: { gte: daysAgo } },
        _count: true
      }),

      prisma.talkEasyMessage.aggregate({
        where: { timestamp: { gte: daysAgo } },
        _count: {
          resourcesRequested: true
        }
      })
    ]);

    // Count total recommended resources
    const messagesWithResources = await prisma.talkEasyMessage.findMany({
      where: { timestamp: { gte: daysAgo } },
      select: {
        recommendedArticles: true,
        recommendedDirectories: true
      }
    });

    const totalArticles = messagesWithResources.reduce((sum, m) => sum + (m.recommendedArticles?.length || 0), 0);
    const totalDirectories = messagesWithResources.reduce((sum, m) => sum + (m.recommendedDirectories?.length || 0), 0);

    // 🆕 Convert BigInt to Number for JSON serialization
    const topTopicsFormatted = topTopics.map(t => ({
      topic: t.topic,
      count: Number(t.count)  // Convert BigInt to Number
    }));

    return res.json({
      success: true,
      data: {
        period: `Last ${period} days`,
        topCategories: topCategories.map(c => ({
          category: c.primaryCategory,
          count: c._count
        })),
        topTopics: topTopicsFormatted,  // Use formatted version
        emotionalIntensity: emotionalIntensityDist.map(e => ({
          intensity: e.emotionalIntensity,
          count: e._count
        })),
        resources: {
          articlesRecommended: totalArticles,
          directoriesRecommended: totalDirectories,
          requestsForResources: resourceStats._count.resourcesRequested
        }
      }
    });

  } catch (error) {
    console.error('❌ Get insights error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve insights',
      errorCode: 'INSIGHTS_ERROR'
    });
  }
};

/**
 * @desc    Get training dataset statistics (ADMIN)
 * @route   GET /talkeasy/admin/training-stats
 * @access  Private (Super Admin only)
 */
export const getTrainingDataStats = async (req, res) => {
  try {
    const [
      totalRecords,
      qualityDistribution,
      categoryBreakdown
    ] = await Promise.all([
      prisma.talkEasyTrainingData.count({
        where: { includeInTraining: true }
      }),

      prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN "qualityScore" >= 0.8 THEN 'excellent'
            WHEN "qualityScore" >= 0.6 THEN 'good'
            WHEN "qualityScore" >= 0.4 THEN 'fair'
            ELSE 'poor'
          END as quality_tier,
          COUNT(*) as count
        FROM "talkeasy_training_data"
        WHERE "includeInTraining" = true
        GROUP BY quality_tier
      `,

      prisma.talkEasyTrainingData.groupBy({
        by: ['primaryCategory'],
        where: { includeInTraining: true },
        _count: true,
        orderBy: { _count: { primaryCategory: 'desc' } }
      })
    ]);

    return res.json({
      success: true,
      data: {
        totalRecords,
        qualityDistribution,
        categoryBreakdown: categoryBreakdown.map(c => ({
          category: c.primaryCategory,
          count: c._count
        })),
        readyForTraining: totalRecords >= 1000
      }
    });

  } catch (error) {
    console.error('❌ Get training stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve training statistics',
      errorCode: 'TRAINING_STATS_ERROR'
    });
  }
};

/**
 * @desc    Export training dataset (ADMIN)
 * @route   GET /talkeasy/admin/export-training-data
 * @access  Private (Super Admin only)
 */
export const exportTrainingData = async (req, res) => {
  try {
    const { minQuality = 0.6, format = 'json' } = req.query;

    const trainingData = await prisma.talkEasyTrainingData.findMany({
      where: {
        includeInTraining: true,
        qualityScore: { gte: parseFloat(minQuality) }
      },
      select: {
        anonymizedMessage: true,
        anonymizedResponse: true,
        sentiment: true,
        primaryCategory: true,
        emotionalIntensity: true,
        topics: true,
        qualityScore: true
      }
    });

    if (format === 'jsonl') {
      const jsonl = trainingData.map(d => JSON.stringify(d)).join('\n');
      res.setHeader('Content-Type', 'application/jsonlines');
      res.setHeader('Content-Disposition', 'attachment; filename=training-data.jsonl');
      return res.send(jsonl);
    }

    return res.json({
      success: true,
      count: trainingData.length,
      data: trainingData
    });

  } catch (error) {
    console.error('❌ Export training data error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to export training data',
      errorCode: 'EXPORT_ERROR'
    });
  }
};

/**
 * @desc    Manual database cleanup trigger (ADMIN)
 * @route   POST /talkeasy/admin/cleanup
 * @access  Private (Super Admin only)
 */
export const manualCleanup = async (req, res) => {
  try {
    const { cleanupOldMessages } = await import('../utils/database-cleanup.js');
    const result = await cleanupOldMessages();

    if (result.success) {
      return res.json({
        success: true,
        message: `Successfully deleted ${result.totalDeleted} old messages`,
        data: result
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Cleanup failed',
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ Manual cleanup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to perform cleanup',
      errorCode: 'CLEANUP_ERROR'
    });
  }
};

/**
 * @desc    Aggregate analytics manually (ADMIN)
 * @route   POST /talkeasy/admin/aggregate-analytics
 * @access  Private (Super Admin only)
 */
export const aggregateAnalytics = async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = date ? new Date(date) : new Date();

    const result = await AnalyticsService.aggregateDailyAnalytics(targetDate);

    if (result) {
      return res.json({
        success: true,
        message: `Analytics aggregated for ${targetDate.toISOString().split('T')[0]}`
      });
    } else {
      return res.json({
        success: true,
        message: 'No messages found for the specified date'
      });
    }

  } catch (error) {
    console.error('❌ Aggregate analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to aggregate analytics',
      errorCode: 'AGGREGATION_ERROR'
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