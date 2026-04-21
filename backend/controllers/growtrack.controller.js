// ============================================
// GROWTRACK CONTROLLER
// ============================================
// @version     2.0.0
// @author      ArogoClin
// @updated     2025-11-27 07:45:00 UTC
// @description Professional mood, behavior & trigger tracking for caregivers
//              Tracks self or children with AI-powered insights
// ============================================

import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';

const prisma = new PrismaClient();

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  MOOD_TYPES: [
    'Happy', 'Sad', 'Anxious', 'Calm', 'Angry',
    'Excited', 'Frustrated', 'Confused', 'Tired',
    'Overwhelmed', 'Content', 'Bored', 'Worried',
    'Peaceful', 'Stressed', 'Energetic', 'Withdrawn'
  ],
  
  BEHAVIOR_EXAMPLES: [
    'Aggressive', 'Withdrawn', 'Hyperactive', 'Cooperative',
    'Defiant', 'Affectionate', 'Clingy', 'Independent',
    'Talkative', 'Silent', 'Playful', 'Irritable',
    'Attentive', 'Distracted', 'Obedient', 'Rebellious'
  ],

  TRIGGER_EXAMPLES: [
    'School stress', 'Homework', 'Peer conflict', 'Family argument',
    'Sleep deprivation', 'Hunger', 'Screen time', 'Loud noises',
    'Change in routine', 'Separation anxiety', 'New environment',
    'Overstimulation', 'Boredom', 'Physical discomfort'
  ],

  VALIDATION: {
    MAX_NOTES_LENGTH: 2000,
    MIN_MOOD_INTENSITY: 1,
    MAX_MOOD_INTENSITY: 10,
    MAX_BEHAVIORS: 10,
    MAX_TRIGGERS: 10,
    MAX_PERSON_NAME_LENGTH: 100
  },

  AI: {
    MODEL: 'gemini-2.5-flash',
    MAX_RETRIES: 2,
    TIMEOUT_MS: 30000
  },

  PERIODS: {
    WEEK: 7,
    MONTH: 30,
    YEAR: 365
  }
};

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// ============================================
// VALIDATION UTILITIES
// ============================================

class Validator {
  /**
   * Validate mood entry data
   */
  static validateEntry(data) {
    const errors = [];

    // Mood validation
    if (!data.mood || typeof data.mood !== 'string') {
      errors.push('Mood is required and must be a string');
    } else if (data.mood.trim().length === 0) {
      errors. push('Mood cannot be empty');
    }

    // Mood intensity validation
    if (data.moodIntensity === undefined || data.moodIntensity === null) {
      errors.push('Mood intensity is required');
    } else if (
      data.moodIntensity < CONFIG.VALIDATION.MIN_MOOD_INTENSITY ||
      data.moodIntensity > CONFIG.VALIDATION.MAX_MOOD_INTENSITY
    ) {
      errors.push(
        `Mood intensity must be between ${CONFIG.VALIDATION.MIN_MOOD_INTENSITY} and ${CONFIG.VALIDATION.MAX_MOOD_INTENSITY}`
      );
    }

    // Behaviors validation
    if (! Array.isArray(data.behaviors)) {
      errors.push('Behaviors must be an array');
    } else if (data.behaviors.length === 0) {
      errors.push('At least one behavior must be provided');
    } else if (data.behaviors.length > CONFIG.VALIDATION.MAX_BEHAVIORS) {
      errors. push(`Maximum ${CONFIG.VALIDATION.MAX_BEHAVIORS} behaviors allowed`);
    }

    // Triggers validation
    if (!Array.isArray(data.triggers)) {
      errors.push('Triggers must be an array');
    } else if (data.triggers. length === 0) {
      errors.push('At least one trigger must be provided');
    } else if (data.triggers.length > CONFIG.VALIDATION.MAX_TRIGGERS) {
      errors.push(`Maximum ${CONFIG.VALIDATION. MAX_TRIGGERS} triggers allowed`);
    }

    // Notes validation
    if (data.notes && data.notes.length > CONFIG.VALIDATION.MAX_NOTES_LENGTH) {
      errors. push(
        `Notes must be less than ${CONFIG.VALIDATION.MAX_NOTES_LENGTH} characters`
      );
    }

    // Tracked person validation
    if (data.trackedPersonType && !['SELF', 'CHILD'].includes(data.trackedPersonType)) {
      errors.push('trackedPersonType must be either SELF or CHILD');
    }

    if (data.trackedPersonType === 'CHILD') {
      if (!data.trackedPersonName || data.trackedPersonName.trim(). length === 0) {
        errors.push('trackedPersonName is required when tracking a child');
      } else if (data.trackedPersonName.length > CONFIG.VALIDATION.MAX_PERSON_NAME_LENGTH) {
        errors.push(
          `Child name must be less than ${CONFIG. VALIDATION.MAX_PERSON_NAME_LENGTH} characters`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize array of strings
   */
  static sanitizeArray(arr) {
    if (!Array.isArray(arr)) return [];
    return arr
      .map(item => (typeof item === 'string' ?  item.trim() : ''))
      .filter(item => item.length > 0);
  }

  /**
   * Sanitize text input
   */
  static sanitizeText(text) {
    if (!text || typeof text !== 'string') return null;
    return text.trim() || null;
  }
}

// ============================================
// DATE RANGE UTILITIES
// ============================================

class DateRangeHelper {
  static getRange(period) {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    switch (period. toLowerCase()) {
      case 'week':
      case 'weekly':
        startDate.setDate(startDate. getDate() - CONFIG.PERIODS.WEEK);
        break;

      case 'month':
      case 'monthly':
        startDate.setDate(startDate.getDate() - CONFIG.PERIODS.MONTH);
        break;

      case 'year':
      case 'yearly':
        startDate.setDate(startDate.getDate() - CONFIG.PERIODS.YEAR);
        break;

      default:
        startDate.setDate(startDate. getDate() - CONFIG.PERIODS.WEEK);
    }

    return {
      startDate,
      endDate,
      label: this.formatDateRange(startDate, endDate)
    };
  }

  static formatDateRange(start, end) {
    return {
      start: start.toISOString(). split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }
}

// ============================================
// ANALYTICS UTILITIES
// ============================================

class AnalyticsEngine {
  /**
   * Calculate comprehensive metrics from entries
   */
  static calculateMetrics(entries) {
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        averageMoodIntensity: 0,
        predominantMood: 'N/A',
        moodVariety: 0,
        moodDistribution: {},
        behaviorFrequency: {},
        triggerFrequency: {},
        topBehaviors: [],
        topTriggers: [],
        moodTrend: 'STABLE'
      };
    }

    // Mood analysis
    const moodCounts = entries.reduce((acc, e) => {
      acc[e.mood] = (acc[e.mood] || 0) + 1;
      return acc;
    }, {});

    const predominantMood = Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])[0][0];

    const averageMoodIntensity = parseFloat(
      (entries.reduce((sum, e) => sum + e.moodIntensity, 0) / entries.length).toFixed(1)
    );

    // Behavior analysis
    const behaviorCounts = entries.reduce((acc, e) => {
      e.behaviors.forEach(behavior => {
        acc[behavior] = (acc[behavior] || 0) + 1;
      });
      return acc;
    }, {});

    const topBehaviors = Object.entries(behaviorCounts)
      . sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([behavior, frequency]) => ({ behavior, frequency }));

    // Trigger analysis
    const triggerCounts = entries.reduce((acc, e) => {
      e.triggers.forEach(trigger => {
        acc[trigger] = (acc[trigger] || 0) + 1;
      });
      return acc;
    }, {});

    const topTriggers = Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      . slice(0, 5)
      .map(([trigger, frequency]) => ({ trigger, frequency }));

    // Mood trend analysis
    const moodTrend = this.analyzeMoodTrend(entries);

    return {
      totalEntries: entries.length,
      averageMoodIntensity,
      predominantMood,
      moodVariety: Object.keys(moodCounts). length,
      moodDistribution: moodCounts,
      behaviorFrequency: behaviorCounts,
      triggerFrequency: triggerCounts,
      topBehaviors,
      topTriggers,
      moodTrend
    };
  }

  /**
   * Analyze mood trend over time
   */
  static analyzeMoodTrend(entries) {
    if (entries.length < 3) return 'INSUFFICIENT_DATA';

    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.recordedAt) - new Date(b.recordedAt)
    );

    const firstHalf = sortedEntries.slice(0, Math.floor(sortedEntries.length / 2));
    const secondHalf = sortedEntries.slice(Math.floor(sortedEntries. length / 2));

    const avgFirstHalf =
      firstHalf.reduce((sum, e) => sum + e.moodIntensity, 0) / firstHalf.length;
    const avgSecondHalf =
      secondHalf. reduce((sum, e) => sum + e.moodIntensity, 0) / secondHalf.length;

    const difference = avgSecondHalf - avgFirstHalf;

    if (difference > 1) return 'IMPROVING';
    if (difference < -1) return 'DECLINING';
    return 'STABLE';
  }
}

// ============================================
// AI INSIGHTS GENERATOR
// ============================================

class AIInsightsService {
  /**
   * Generate AI-powered insights
   */
  static async generate(entries, period, trackedPersonName = null) {
    try {
      console.log(`🤖 Generating AI insights for ${entries.length} entries... `);

      const metrics = AnalyticsEngine.calculateMetrics(entries);

      // Build mood summary
      const moodSummary = Object.entries(metrics.moodDistribution)
        .sort((a, b) => b[1] - a[1])
        .map(([mood, count]) => `${mood} (${count} times)`)
        .join('\n');

      // Build behavior summary
      const behaviorSummary = metrics.topBehaviors
        .map(({ behavior, frequency }) => `${behavior} (${frequency} times)`)
        .join('\n');

      // Build trigger summary
      const triggerSummary = metrics.topTriggers
        .map(({ trigger, frequency }) => `${trigger} (${frequency} times)`)
        .join('\n');

      // Sample notes
      const sampleNotes = entries
        .slice(0, 3)
        .map(e => e.notes)
        .filter(Boolean)
        .join('\n\n');

      // Build context
      const personContext = trackedPersonName
        ? `for ${trackedPersonName} (a child being tracked by their caregiver)`
        : 'for the person tracking themselves';

      const audienceContext = trackedPersonName
        ? `You are speaking to a caregiver about their child ${trackedPersonName}.  Frame suggestions for the caregiver. `
        : 'You are speaking directly to the person tracking themselves. ';

      const prompt = `You are a professional child development and mental health assistant analyzing tracking data ${personContext}. 

**TRACKING PERIOD:** ${period}
**NUMBER OF ENTRIES:** ${entries.length}
**AVERAGE MOOD INTENSITY:** ${metrics. averageMoodIntensity}/10
**MOOD TREND:** ${metrics.moodTrend}

**MOOD DISTRIBUTION:**
${moodSummary}

**TOP BEHAVIORS OBSERVED:**
${behaviorSummary || 'No behaviors recorded'}

**TOP TRIGGERS/STRESSORS:**
${triggerSummary || 'No triggers recorded'}

**SAMPLE NOTES FROM ENTRIES:**
${sampleNotes || 'No notes provided'}

Please provide a comprehensive analysis with the following sections:

1. **Overview** (2-3 sentences): Summarize the overall emotional and behavioral patterns

2. **Mood Patterns** (2-3 sentences): What do the moods reveal?  Is there progress or concern?

3. **Behavior Insights** (2-3 sentences): What patterns emerge from observed behaviors?

4. **Trigger Analysis** (2-3 sentences): What are the main stressors and how do they impact mood/behavior?

5. **Actionable Strategies** (4-6 bullet points): Specific, practical suggestions tailored to the triggers and behaviors

6. **Encouragement** (2-3 sentences): Supportive message acknowledging the effort of tracking

${audienceContext}

Keep it warm, professional, evidence-based, and actionable. Use simple language suitable for parents/caregivers.`;

      console.log(`   → Calling Gemini AI... `);

      const response = await ai.models.generateContent({
        model: CONFIG.AI.MODEL,
        contents: prompt
      });

      const text = response.text;

      console.log(`   ✅ AI insights generated (${text.length} characters)`);

      return text;
    } catch (error) {
      console.error('❌ AI Insights Error:', error. message);

      // Fallback summary
      const metrics = AnalyticsEngine.calculateMetrics(entries);
      return this.generateFallbackSummary(entries, metrics, period, trackedPersonName);
    }
  }

  /**
   * Generate fallback summary when AI fails
   */
  static generateFallbackSummary(entries, metrics, period, trackedPersonName) {
    const personText = trackedPersonName ?  `for ${trackedPersonName}` : 'for you';

    return `**Summary Report ${personText}** *(AI temporarily unavailable)*

**Overview:**
Based on ${entries.length} entries over the past ${period}, the predominant mood was ${metrics.predominantMood} with an average intensity of ${metrics.averageMoodIntensity}/10. 

**Top Behaviors:**
${metrics.topBehaviors.map(b => `- ${b.behavior} (${b.frequency} times)`).join('\n')}

**Top Triggers:**
${metrics.topTriggers.map(t => `- ${t.trigger} (${t. frequency} times)`).join('\n')}

**Suggestion:**
Continue tracking to identify patterns.  Consider discussing persistent concerns with a mental health professional.

*Note: Detailed AI insights temporarily unavailable. Please try again later.*`;
  }
}

// ============================================
// CONTROLLERS
// ============================================

/**
 * @desc    Create a new GrowTrack entry
 * @route   POST /growtrack/entries
 * @access  Private
 * @body    { mood, moodIntensity, behaviors[], triggers[], notes?, trackedPersonType?, trackedPersonName? }
 */
export const createEntry = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      mood,
      moodIntensity,
      behaviors,
      triggers,
      notes,
      trackedPersonType = 'SELF',
      trackedPersonName
    } = req.body;

    // Validate input
    const validation = Validator.validateEntry({
      mood,
      moodIntensity,
      behaviors,
      triggers,
      notes,
      trackedPersonType,
      trackedPersonName
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Sanitize data
    const sanitizedData = {
      userId,
      mood: Validator. sanitizeText(mood),
      moodIntensity: parseInt(moodIntensity),
      behaviors: Validator.sanitizeArray(behaviors),
      triggers: Validator.sanitizeArray(triggers),
      notes: Validator. sanitizeText(notes),
      trackedPersonType,
      trackedPersonName:
        trackedPersonType === 'CHILD' ?  Validator.sanitizeText(trackedPersonName) : null,
      recordedAt: new Date()
    };

    // Create entry
    const entry = await prisma.growTrackEntry.create({
      data: sanitizedData
    });

    console.log(
      `✅ GrowTrack entry created: User ${userId}, Type: ${trackedPersonType}, Mood: ${mood}`
    );

    return res.status(201).json({
      success: true,
      message: 'Entry recorded successfully',
      data: entry
    });
  } catch (error) {
    console.error('❌ Create entry error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create entry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get entries with filtering
 * @route   GET /growtrack/entries
 * @access  Private
 * @query   period?, trackedPersonType?, trackedPersonName?
 */
export const getEntries = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      period = 'week',
      trackedPersonType,
      trackedPersonName
    } = req.query;

    const { startDate, endDate, label } = DateRangeHelper. getRange(period);

    // Build where clause
    const where = {
      userId,
      recordedAt: {
        gte: startDate,
        lte: endDate
      }
    };

    if (trackedPersonType) {
      where.trackedPersonType = trackedPersonType;
    }

    if (trackedPersonName) {
      where. trackedPersonName = trackedPersonName;
    }

    // Fetch entries
    const entries = await prisma.growTrackEntry.findMany({
      where,
      orderBy: { recordedAt: 'desc' }
    });

    // Calculate metrics
    const metrics = AnalyticsEngine.calculateMetrics(entries);

    return res.json({
      success: true,
      data: {
        entries,
        metrics,
        period,
        dateRange: label,
        filters: {
          trackedPersonType: trackedPersonType || 'ALL',
          trackedPersonName: trackedPersonName || 'ALL'
        }
      }
    });
  } catch (error) {
    console.error('❌ Get entries error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve entries'
    });
  }
};

/**
 * @desc    Get AI-powered insights
 * @route   GET /growtrack/insights
 * @access  Private
 * @query   period?, trackedPersonType?, trackedPersonName?
 */
export const getInsights = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      period = 'week',
      trackedPersonType,
      trackedPersonName
    } = req.query;

    const { startDate, endDate, label } = DateRangeHelper.getRange(period);

    // Build where clause
    const where = {
      userId,
      recordedAt: {
        gte: startDate,
        lte: endDate
      }
    };

    if (trackedPersonType) {
      where.trackedPersonType = trackedPersonType;
    }

    if (trackedPersonName) {
      where.trackedPersonName = trackedPersonName;
    }

    // Fetch entries
    const entries = await prisma.growTrackEntry.findMany({
      where,
      orderBy: { recordedAt: 'asc' }
    });

    if (entries.length === 0) {
      return res.json({
        success: true,
        data: {
          message: `No entries found for the specified period and filters`,
          period,
          dateRange: label,
          insights: null,
          metrics: {}
        }
      });
    }

    // Calculate metrics
    const metrics = AnalyticsEngine.calculateMetrics(entries);

    // Generate AI insights
    console.log(`🤖 Generating insights for ${userId}...`);
    const insights = await AIInsightsService. generate(
      entries,
      period,
      trackedPersonName
    );

    return res.json({
      success: true,
      data: {
        period,
        dateRange: label,
        totalEntries: entries.length,
        metrics,
        insights,
        trackedPerson: {
          type: trackedPersonType || 'ALL',
          name: trackedPersonName || null
        },
        generatedAt: new Date(). toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Get insights error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate insights'
    });
  }
};

/**
 * @desc    Get summary statistics
 * @route   GET /growtrack/summary
 * @access  Private
 * @query   period?, trackedPersonType?, trackedPersonName? 
 */
export const getSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      period = 'week',
      trackedPersonType,
      trackedPersonName
    } = req.query;

    const { startDate, endDate, label } = DateRangeHelper.getRange(period);

    const where = {
      userId,
      recordedAt: {
        gte: startDate,
        lte: endDate
      }
    };

    if (trackedPersonType) {
      where.trackedPersonType = trackedPersonType;
    }

    if (trackedPersonName) {
      where.trackedPersonName = trackedPersonName;
    }

    const entries = await prisma.growTrackEntry.findMany({ where });

    if (entries. length === 0) {
      return res.json({
        success: true,
        data: {
          message: 'No entries found',
          summary: null
        }
      });
    }

    const metrics = AnalyticsEngine.calculateMetrics(entries);

    const summary = {
      period,
      dateRange: label,
      totalEntries: entries. length,
      averageMoodIntensity: metrics.averageMoodIntensity,
      predominantMood: metrics.predominantMood,
      moodVariety: metrics. moodVariety,
      moodTrend: metrics.moodTrend,
      topBehaviors: metrics.topBehaviors,
      topTriggers: metrics.topTriggers,
      trackedPerson: {
        type: trackedPersonType || 'ALL',
        name: trackedPersonName || null
      }
    };

    return res. json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('❌ Get summary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve summary'
    });
  }
};

/**
 * @desc    Get list of tracked children
 * @route   GET /growtrack/children
 * @access  Private
 */
export const getTrackedChildren = async (req, res) => {
  try {
    const userId = req.user. userId;

    const children = await prisma. growTrackEntry.findMany({
      where: {
        userId,
        trackedPersonType: 'CHILD',
        trackedPersonName: { not: null }
      },
      select: {
        trackedPersonName: true
      },
      distinct: ['trackedPersonName']
    });

    const childList = children.map(c => c.trackedPersonName);

    return res.json({
      success: true,
      data: {
        children: childList,
        count: childList.length
      }
    });
  } catch (error) {
    console.error('❌ Get children error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve children list'
    });
  }
};

/**
 * @desc    Update an entry
 * @route   PUT /growtrack/entries/:id
 * @access  Private
 */
export const updateEntry = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { mood, moodIntensity, behaviors, triggers, notes } = req.body;

    // Check ownership
    const entry = await prisma.growTrackEntry.findUnique({ where: { id } });

    if (!entry || entry.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found or access denied'
      });
    }

    // Build update data
    const updateData = {};

    if (mood) updateData.mood = Validator.sanitizeText(mood);
    if (moodIntensity !== undefined) {
      if (
        moodIntensity < CONFIG. VALIDATION.MIN_MOOD_INTENSITY ||
        moodIntensity > CONFIG.VALIDATION.MAX_MOOD_INTENSITY
      ) {
        return res.status(400).json({
          success: false,
          message: `Mood intensity must be between ${CONFIG.VALIDATION.MIN_MOOD_INTENSITY} and ${CONFIG. VALIDATION.MAX_MOOD_INTENSITY}`
        });
      }
      updateData.moodIntensity = parseInt(moodIntensity);
    }
    if (behaviors) updateData. behaviors = Validator.sanitizeArray(behaviors);
    if (triggers) updateData.triggers = Validator.sanitizeArray(triggers);
    if (notes !== undefined) updateData.notes = Validator.sanitizeText(notes);

    const updatedEntry = await prisma. growTrackEntry.update({
      where: { id },
      data: updateData
    });

    console.log(`✅ Entry updated: ${id}`);

    return res.json({
      success: true,
      message: 'Entry updated successfully',
      data: updatedEntry
    });
  } catch (error) {
    console.error('❌ Update entry error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update entry'
    });
  }
};

/**
 * @desc    Delete an entry
 * @route   DELETE /growtrack/entries/:id
 * @access  Private
 */
export const deleteEntry = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const entry = await prisma.growTrackEntry.findUnique({ where: { id } });

    if (!entry || entry.userId !== userId) {
      return res. status(404).json({
        success: false,
        message: 'Entry not found or access denied'
      });
    }

    await prisma.growTrackEntry.delete({ where: { id } });

    console.log(`✅ Entry deleted: ${id}`);

    return res.json({
      success: true,
      message: 'Entry deleted successfully'
    });
  } catch (error) {
    console. error('❌ Delete entry error:', error);
    return res. status(500).json({
      success: false,
      message: 'Failed to delete entry'
    });
  }
};

/**
 * @desc    Get available options (moods, behaviors, triggers)
 * @route   GET /growtrack/options
 * @access  Public
 */
export const getOptions = async (req, res) => {
  return res.json({
    success: true,
    data: {
      moodTypes: CONFIG.MOOD_TYPES,
      behaviorExamples: CONFIG.BEHAVIOR_EXAMPLES,
      triggerExamples: CONFIG.TRIGGER_EXAMPLES,
      validation: {
        moodIntensityRange: {
          min: CONFIG.VALIDATION.MIN_MOOD_INTENSITY,
          max: CONFIG. VALIDATION.MAX_MOOD_INTENSITY
        },
        maxNotesLength: CONFIG.VALIDATION. MAX_NOTES_LENGTH,
        maxBehaviors: CONFIG.VALIDATION.MAX_BEHAVIORS,
        maxTriggers: CONFIG.VALIDATION.MAX_TRIGGERS
      }
    }
  });
};

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received - closing Prisma connection...');
  await prisma.$disconnect();
  process.exit(0);
});