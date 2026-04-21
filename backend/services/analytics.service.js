// services/analytics.service.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Topic and category analyzer
 */
export class TopicAnalyzer {
  static TOPIC_KEYWORDS = {
    ANXIETY: ['anxious', 'anxiety', 'worried', 'panic', 'nervous', 'fear', 'wasiwasi', 'stressed', 'overthinking'],
    DEPRESSION: ['depressed', 'depression', 'sad', 'hopeless', 'empty', 'worthless', 'huzuni', 'numb', 'suicide'],
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

  static extractTopics(message) {
    const lowerMessage = message.toLowerCase();
    const detectedTopics = [];

    for (const [topic, keywords] of Object.entries(this.TOPIC_KEYWORDS)) {
      const found = keywords.some(keyword => lowerMessage.includes(keyword));
      if (found) {
        detectedTopics.push(topic);
      }
    }

    return detectedTopics;
  }

  static extractKeywords(message) {
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for'];
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

  /**
   * 🆕 Detect if user is requesting resources
   */
  static detectResourceRequest(message) {
    const requestIndicators = [
      'help', 'resource', 'where can i', 'how do i', 'need support',
      'looking for', 'find', 'recommend', 'suggest', 'show me',
      'want to learn', 'read more', 'more information', 'tell me more',
      'therapy', 'therapist', 'counselor', 'counselling', 'professional help',
      'msaada', 'natafuta', 'nionyeshe', 'nataka kujua'
    ];

    const lowerMessage = message.toLowerCase();
    return requestIndicators.some(indicator => lowerMessage.includes(indicator));
  }

  /**
   * 🆕 Detect if user needs professional help urgently
   */
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
 * 🆕 Resource Recommendation Service
 */
export class ResourceRecommender {
  /**
   * Find relevant published articles based on topics and keywords
   */
  static async findRelevantArticles(topics, keywords, limit = 3) {
    if (topics.length === 0 && keywords.length === 0) return [];

    try {
      // Build search conditions
      const searchConditions = [];

      // Match by topics (converted to lowercase for comparison)
      if (topics.length > 0) {
        const topicLower = topics.map(t => t.toLowerCase());
        searchConditions.push({
          OR: [
            { tags: { hasSome: topicLower } },
            { category: { in: topicLower, mode: 'insensitive' } }
          ]
        });
      }

      // Match by keywords
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
        take: limit,
        orderBy: { publishedAt: 'desc' }
      });

      // Score and sort articles by relevance
      const scoredArticles = articles.map(article => {
        let score = 0;
        
        // Category match
        if (topics.some(t => article.category?.toLowerCase().includes(t.toLowerCase()))) {
          score += 10;
        }
        
        // Tag matches
        const matchingTags = article.tags.filter(tag => 
          topics.some(t => tag.toLowerCase().includes(t.toLowerCase())) ||
          keywords.some(k => tag.toLowerCase().includes(k.toLowerCase()))
        );
        score += matchingTags.length * 5;
        
        // Title/excerpt keyword matches
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

  /**
   * Find relevant directory resources based on user needs
   */
  static async findRelevantDirectories(primaryCategory, isUrgent = false, limit = 3) {
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

      // If urgent or crisis, always include helplines
      let types = typeMapping[primaryCategory] || ['COUNSELOR', 'THERAPIST'];
      if (isUrgent && !types.includes('HELPLINE')) {
        types = ['HELPLINE', ...types];
      }

      const directories = await prisma.directory.findMany({
        where: {
          type: { in: types },
          isVerified: true // Only verified resources
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
          { isFeatured: 'desc' }, // Featured first
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

  /**
   * Format recommendations for response
   */
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
 * Analytics data saver
 */
export class AnalyticsService {
  static async saveMessageWithAnalytics(data) {
    const {
      userId,
      message,
      response,
      sentiment,
      sessionId,
      processingTimeMs,
      modelVersion = 'gemini-2.0-flash-exp',
      promptVersion = '1.0',
      recommendedArticles = [],
      recommendedDirectories = [],
      resourcesRequested = false
    } = data;

    // Extract analytics
    const topics = TopicAnalyzer.extractTopics(message);
    const keywords = TopicAnalyzer.extractKeywords(message);
    const primaryCategory = TopicAnalyzer.determinePrimaryCategory(topics);
    const emotionalIntensity = TopicAnalyzer.assessEmotionalIntensity(message, sentiment);

    // Get conversation turn
    let conversationTurn = 1;
    if (sessionId) {
      conversationTurn = await prisma.talkEasyMessage.count({
        where: { userId, sessionId }
      }) + 1;
    }

    // Save message with analytics
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

    // Save to training dataset (async, don't block response)
    if (sentiment !== 'CRISIS' && message.length >= 10) {
      this.saveToTrainingDataset(savedMessage).catch(err => 
        console.error('Training data save error:', err)
      );
    }

    return savedMessage;
  }

  static async saveToTrainingDataset(message) {
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

  /**
   * Daily analytics aggregation
   */
  static async aggregateDailyAnalytics(date = new Date()) {
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
  }
}