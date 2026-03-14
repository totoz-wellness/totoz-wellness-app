// ============================================
// KIDSCORNER CONTROLLER - Multi-Child Support
// ============================================
// @version     1.0.0
// @author      ArogoClin
// @updated     2026-02-10
// @description Complete KidsCorner backend with privacy, encryption, and AI
// ============================================

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// ============================================
// ENCRYPTION UTILITIES (AES-256)
// ============================================

const ENCRYPTION_KEY = process.env.WORRY_ENCRYPTION_KEY || crypto.randomBytes(32); // Must be 32 bytes
const IV_LENGTH = 16; // AES block size

/**
 * Encrypt worry text (AES-256-CBC)
 */
function encryptWorry(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt worry text (for admin access only)
 */
function decryptWorry(encryptedText) {
  try {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    return '[Encrypted]';
  }
}

// ============================================
// CHILD MANAGEMENT
// ============================================

/**
 * GET /kidscorner/children
 * Get all children for logged-in parent
 */
export const getChildren = async (req, res) => {
  try {
    const parentId = req.user.userId;

    const children = await prisma.child.findMany({
      where: {
        parentId,
        isActive: true
      },
      include: {
        progress: true,
        _count: {
          select: {
            moodLogs: true,
            worries: true,
            buddyChats: true,
            activityLogs: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return res.json({
      success: true,
      data: {
        children
      }
    });

  } catch (error) {
    console.error('Get children error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch children'
    });
  }
};

/**
 * POST /kidscorner/children
 * Create a new child profile
 */
export const createChild = async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { name, age, avatarEmoji } = req.body;

    // Validation
    if (!name || !age) {
      return res.status(400).json({
        success: false,
        message: 'Name and age are required'
      });
    }

    if (age < 3 || age > 12) {
      return res.status(400).json({
        success: false,
        message: 'Age must be between 3 and 12'
      });
    }

    // Create child with initial progress
    const child = await prisma.child.create({
      data: {
        name: name.trim(),
        age: parseInt(age),
        avatarEmoji: avatarEmoji || '😊',
        parentId,
        progress: {
          create: {
            stickers: [],
            streak: 0
          }
        }
      },
      include: {
        progress: true
      }
    });

    return res.status(201).json({
      success: true,
      message: `${name}'s profile created successfully!`,
      data: {
        child
      }
    });

  } catch (error) {
    console.error('Create child error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create child profile'
    });
  }
};

/**
 * PUT /kidscorner/children/:childId
 * Update child profile
 */
export const updateChild = async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { childId } = req.params;
    const { name, age, avatarEmoji, isActive } = req.body;

    // Verify ownership
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId }
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    // Update child
    const updated = await prisma.child.update({
      where: { id: childId },
      data: {
        ...(name && { name: name.trim() }),
        ...(age && { age: parseInt(age) }),
        ...(avatarEmoji && { avatarEmoji }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        progress: true
      }
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        child: updated
      }
    });

  } catch (error) {
    console.error('Update child error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update child profile'
    });
  }
};

// ============================================
// MOOD TRACKING
// ============================================

/**
 * POST /kidscorner/children/:childId/mood
 * Log a mood check-in
 */
export const logMood = async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { childId } = req.params;
    const { mood } = req.body;

    const validMoods = ['happy', 'calm', 'sad', 'angry', 'silly', 'worried'];
    
    if (!mood || !validMoods.includes(mood)) {
      return res.status(400).json({
        success: false,
        message: `Mood must be one of: ${validMoods.join(', ')}`
      });
    }

    // Verify ownership
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId }
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    // Create mood log
    const moodLog = await prisma.childMoodLog.create({
      data: {
        childId,
        mood
      }
    });

    // Update streak (if mood logged today for first time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const progress = await prisma.childProgress.findUnique({
      where: { childId }
    });

    let updatedProgress = progress;

    if (progress) {
      const lastActive = progress.lastActiveDate ? new Date(progress.lastActiveDate) : null;
      const wasYesterday = lastActive && 
        (today - lastActive) === 86400000; // 24 hours in ms

      const isToday = lastActive && 
        lastActive.toDateString() === today.toDateString();

      updatedProgress = await prisma.childProgress.update({
        where: { childId },
        data: {
          streak: isToday ? progress.streak : wasYesterday ? progress.streak + 1 : 1,
          lastActiveDate: new Date()
        }
      });
    }

    return res.json({
      success: true,
      message: 'Mood logged successfully!',
      data: {
        moodLog,
        progress: updatedProgress
      }
    });

  } catch (error) {
    console.error('Log mood error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to log mood'
    });
  }
};

/**
 * GET /kidscorner/children/:childId/mood-trends
 * Get mood trends for parent dashboard (aggregated, not individual logs)
 */
export const getMoodTrends = async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { childId } = req.params;
    const { days = 7 } = req.query;

    // Verify ownership
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId }
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get mood logs
    const moodLogs = await prisma.childMoodLog.findMany({
      where: {
        childId,
        timestamp: {
          gte: startDate
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Aggregate data (privacy-focused: trends, not individual entries)
    const moodCounts = moodLogs.reduce((acc, log) => {
      acc[log.mood] = (acc[log.mood] || 0) + 1;
      return acc;
    }, {});

    const predominantMood = Object.entries(moodCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || null;

    return res.json({
      success: true,
      data: {
        summary: {
          totalEntries: moodLogs.length,
          predominantMood,
          moodDistribution: moodCounts
        },
        // Only return aggregated data, not individual logs (privacy)
        period: `Last ${days} days`
      }
    });

  } catch (error) {
    console.error('Get mood trends error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch mood trends'
    });
  }
};

// ============================================
// WORRY BOX (ENCRYPTED)
// ============================================

/**
 * POST /kidscorner/children/:childId/worries
 * Lock a worry in the worry box (encrypted)
 */
export const lockWorry = async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { childId } = req.params;
    const { worryText } = req.body;

    if (!worryText || worryText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Worry text is required'
      });
    }

    // Verify ownership
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId }
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    // Encrypt and store worry
    const encryptedContent = encryptWorry(worryText.trim());

    await prisma.childWorry.create({
      data: {
        childId,
        encryptedContent
      }
    });

    return res.json({
      success: true,
      message: 'Worry locked away safely! 🔒'
    });

  } catch (error) {
    console.error('Lock worry error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to lock worry'
    });
  }
};

/**
 * GET /kidscorner/children/:childId/worries/count
 * Get worry count (parents can see count, not content)
 */
export const getWorryCount = async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { childId } = req.params;

    // Verify ownership
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId }
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    const count = await prisma.childWorry.count({
      where: { childId }
    });

    return res.json({
      success: true,
      data: {
        worryCount: count,
        message: count > 0 
          ? `${child.name} has locked away ${count} ${count === 1 ? 'worry' : 'worries'}`
          : `${child.name} hasn't locked away any worries yet`
      }
    });

  } catch (error) {
    console.error('Get worry count error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get worry count'
    });
  }
};

// ============================================
// BUDDY CHAT (AI Integration - Next Step)
// ============================================

/**
 * POST /kidscorner/children/:childId/buddy-chat
 * Chat with Buddy AI (secure backend proxy for Gemini)
 */
export const buddyChat = async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { childId } = req.params;
    const { message, sessionId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Verify ownership
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId }
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    // TODO: Call Gemini API here (next step)
    // For now, return a placeholder response
    const buddyResponse = "Hi there! I'm Buddy, and I'm here to listen. (AI integration coming in next step!)";

    // Save chat
    const chat = await prisma.childBuddyChat.create({
      data: {
        childId,
        sessionId: sessionId || crypto.randomUUID(),
        userMessage: message.trim(),
        buddyResponse,
        sentiment: 'neutral', // Will be analyzed by AI
        isFlagged: false
      }
    });

    return res.json({
      success: true,
      data: {
        response: buddyResponse,
        sessionId: chat.sessionId,
        chatId: chat.id
      }
    });

  } catch (error) {
    console.error('Buddy chat error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to chat with Buddy'
    });
  }
};

/**
 * GET /kidscorner/children/:childId/buddy-chat/summary
 * Get AI-generated summary of chats for parents (privacy-focused)
 */
export const getChatSummary = async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { childId } = req.params;

    // Verify ownership
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId }
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    const chats = await prisma.childBuddyChat.findMany({
      where: { childId },
      select: {
        sentiment: true,
        isFlagged: true,
        flagReason: true,
        timestamp: true
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    const sentimentCounts = chats.reduce((acc, chat) => {
      acc[chat.sentiment || 'unknown'] = (acc[chat.sentiment || 'unknown'] || 0) + 1;
      return acc;
    }, {});

    const flaggedChats = chats.filter(c => c.isFlagged);

    return res.json({
      success: true,
      data: {
        summary: {
          totalConversations: chats.length,
          sentimentBreakdown: sentimentCounts,
          concerningTopics: flaggedChats.length,
          flaggedReasons: flaggedChats.map(c => c.flagReason).filter(Boolean)
        },
        message: flaggedChats.length > 0 
          ? '⚠️ Some conversations contain concerning topics. Consider talking to your child.'
          : '✅ All conversations seem positive and healthy!'
      }
    });

  } catch (error) {
    console.error('Get chat summary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get chat summary'
    });
  }
};

// ============================================
// ACTIVITY TRACKING & STICKERS
// ============================================

/**
 * POST /kidscorner/children/:childId/activity
 * Log activity completion and award sticker
 */
export const logActivity = async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { childId } = req.params;
    const { activityType, activityName, zone, stickerEarned, durationSeconds } = req.body;

    // Verify ownership
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId }
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    // Log activity
    const activity = await prisma.childActivityLog.create({
      data: {
        childId,
        activityType: activityType || 'game',
        activityName: activityName || 'Unknown',
        zone: zone || 'play',
        stickerEarned,
        durationSeconds: durationSeconds ? parseInt(durationSeconds) : null
      }
    });

    // Award sticker if provided
    let updatedProgress = null;
    if (stickerEarned) {
      const progress = await prisma.childProgress.findUnique({
        where: { childId }
      });

      if (progress) {
        updatedProgress = await prisma.childProgress.update({
          where: { childId },
          data: {
            stickers: [...progress.stickers, stickerEarned],
            lastActiveDate: new Date()
          }
        });
      }
    }

    return res.json({
      success: true,
      message: stickerEarned ? 'Sticker earned! 🎉' : 'Activity logged!',
      data: {
        activity,
        progress: updatedProgress
      }
    });

  } catch (error) {
    console.error('Log activity error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to log activity'
    });
  }
};

/**
 * GET /kidscorner/children/:childId/progress
 * Get child's progress (stickers, streak, stats)
 */
export const getProgress = async (req, res) => {
  try {
    const parentId = req.user.userId;
    const { childId } = req.params;

    // Verify ownership
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId },
      include: {
        progress: true,
        _count: {
          select: {
            moodLogs: true,
            activityLogs: true,
            worries: true
          }
        }
      }
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    return res.json({
      success: true,
      data: {
        child: {
          id: child.id,
          name: child.name,
          avatarEmoji: child.avatarEmoji
        },
        progress: child.progress,
        stats: {
          moodCheckIns: child._count.moodLogs,
          activitiesCompleted: child._count.activityLogs,
          worriesLocked: child._count.worries
        }
      }
    });

  } catch (error) {
    console.error('Get progress error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get progress'
    });
  }
};