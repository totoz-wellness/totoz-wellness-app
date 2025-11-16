import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Sanitize HTML content - basic XSS prevention
 * @param {string} content - Content to sanitize
 * @returns {string} - Sanitized content
 */
const sanitizeContent = (content) => {
  if (!content) return '';
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '');
};

// ============================================
// MODERATION QUEUE CONTROLLERS
// ============================================

/**
 * Get all pending content for moderation (questions + stories)
 * @route GET /api/parentcircle/moderation/pending
 * @access MODERATOR, SUPER_ADMIN
 */
export const getPendingContent = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      contentType, // 'QUESTION' | 'STORY' | undefined (both)
      sortBy = 'oldest' // 'oldest' | 'newest'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Determine sort order
    const orderBy = sortBy === 'newest' 
      ? { createdAt: 'desc' }
      : { createdAt: 'asc' }; // Oldest first (FIFO)

    const where = { status: 'PENDING' };

    let questions = [];
    let stories = [];
    let totalQuestions = 0;
    let totalStories = 0;

    // Fetch questions if requested
    if (!contentType || contentType === 'QUESTION') {
      [questions, totalQuestions] = await Promise.all([
        prisma.question.findMany({
          where,
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            },
            author: {
              select: {
                id: true,
                name: true,
                role: true,
                email: true
              }
            },
            _count: {
              select: {
                answers: true,
                reports: true
              }
            }
          },
          orderBy,
          skip: contentType === 'QUESTION' ? skip : 0,
          take: contentType === 'QUESTION' ? parseInt(limit) : parseInt(limit) / 2
        }),
        prisma.question.count({ where })
      ]);
    }

    // Fetch stories if requested
    if (!contentType || contentType === 'STORY') {
      [stories, totalStories] = await Promise.all([
        prisma.story.findMany({
          where,
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            },
            author: {
              select: {
                id: true,
                name: true,
                role: true,
                email: true
              }
            },
            _count: {
              select: {
                reports: true
              }
            }
          },
          orderBy,
          skip: contentType === 'STORY' ? skip : 0,
          take: contentType === 'STORY' ? parseInt(limit) : parseInt(limit) / 2
        }),
        prisma.story.count({ where })
      ]);
    }

    // Combine and format results
    const pendingItems = [
      ...questions.map(q => ({
        ...q,
        contentType: 'QUESTION',
        waitingTime: Date.now() - new Date(q.createdAt).getTime()
      })),
      ...stories.map(s => ({
        ...s,
        contentType: 'STORY',
        waitingTime: Date.now() - new Date(s.createdAt).getTime()
      }))
    ].sort((a, b) => {
      return sortBy === 'newest'
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt);
    });

    return res.json({
      success: true,
      data: {
        pendingItems,
        breakdown: {
          questions: totalQuestions,
          stories: totalStories,
          total: totalQuestions + totalStories
        },
        pagination: {
          current: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil((totalQuestions + totalStories) / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get pending content error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Approve question or story
 * @route POST /api/parentcircle/moderation/approve
 * @access MODERATOR, SUPER_ADMIN
 */
export const approveContent = async (req, res) => {
  try {
    const { contentType, contentId, notes } = req.body;
    const moderatorId = req.user.userId;

    // Validate input
    if (!contentType || !contentId) {
      return res.status(400).json({
        success: false,
        message: 'contentType and contentId are required'
      });
    }

    if (!['QUESTION', 'STORY'].includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'contentType must be QUESTION or STORY'
      });
    }

    let approvedContent;
    const sanitizedNotes = notes ? sanitizeContent(notes.trim()) : null;

    // Approve based on content type
    if (contentType === 'QUESTION') {
      // Check if question exists
      const question = await prisma.question.findUnique({
        where: { id: parseInt(contentId) }
      });

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      if (question.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: `Question is already ${question.status.toLowerCase()}`
        });
      }

      // Update question and create moderation log
      [approvedContent] = await prisma.$transaction([
        prisma.question.update({
          where: { id: parseInt(contentId) },
          data: {
            status: 'APPROVED',
            approvedAt: new Date()
          },
          include: {
            category: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }),
        prisma.moderationLog.create({
          data: {
            contentType: 'QUESTION',
            contentId: parseInt(contentId),
            questionId: parseInt(contentId),
            action: 'APPROVE',
            previousStatus: 'PENDING',
            newStatus: 'APPROVED',
            moderatorId,
            notes: sanitizedNotes
          }
        })
      ]);
    } else {
      // STORY
      const story = await prisma.story.findUnique({
        where: { id: parseInt(contentId) }
      });

      if (!story) {
        return res.status(404).json({
          success: false,
          message: 'Story not found'
        });
      }

      if (story.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: `Story is already ${story.status.toLowerCase()}`
        });
      }

      // Update story and create moderation log
      [approvedContent] = await prisma.$transaction([
        prisma.story.update({
          where: { id: parseInt(contentId) },
          data: {
            status: 'APPROVED',
            approvedAt: new Date()
          },
          include: {
            category: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }),
        prisma.moderationLog.create({
          data: {
            contentType: 'STORY',
            contentId: parseInt(contentId),
            storyId: parseInt(contentId),
            action: 'APPROVE',
            previousStatus: 'PENDING',
            newStatus: 'APPROVED',
            moderatorId,
            notes: sanitizedNotes
          }
        })
      ]);
    }

    return res.json({
      success: true,
      message: `${contentType.toLowerCase()} approved successfully`,
      data: {
        content: approvedContent,
        contentType
      }
    });

  } catch (error) {
    console.error('Approve content error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Reject question or story
 * @route POST /api/parentcircle/moderation/reject
 * @access MODERATOR, SUPER_ADMIN
 */
export const rejectContent = async (req, res) => {
  try {
    const { contentType, contentId, reason, notes } = req.body;
    const moderatorId = req.user.userId;

    // Validate input
    if (!contentType || !contentId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'contentType, contentId, and reason are required'
      });
    }

    if (!['QUESTION', 'STORY'].includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'contentType must be QUESTION or STORY'
      });
    }

    let rejectedContent;
    const sanitizedReason = sanitizeContent(reason.trim());
    const sanitizedNotes = notes ? sanitizeContent(notes.trim()) : null;

    // Reject based on content type
    if (contentType === 'QUESTION') {
      const question = await prisma.question.findUnique({
        where: { id: parseInt(contentId) }
      });

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      if (question.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: `Question is already ${question.status.toLowerCase()}`
        });
      }

      [rejectedContent] = await prisma.$transaction([
        prisma.question.update({
          where: { id: parseInt(contentId) },
          data: {
            status: 'REJECTED',
            rejectedAt: new Date()
          },
          include: {
            category: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }),
        prisma.moderationLog.create({
          data: {
            contentType: 'QUESTION',
            contentId: parseInt(contentId),
            questionId: parseInt(contentId),
            action: 'REJECT',
            previousStatus: 'PENDING',
            newStatus: 'REJECTED',
            moderatorId,
            reason: sanitizedReason,
            notes: sanitizedNotes
          }
        })
      ]);
    } else {
      // STORY
      const story = await prisma.story.findUnique({
        where: { id: parseInt(contentId) }
      });

      if (!story) {
        return res.status(404).json({
          success: false,
          message: 'Story not found'
        });
      }

      if (story.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: `Story is already ${story.status.toLowerCase()}`
        });
      }

      [rejectedContent] = await prisma.$transaction([
        prisma.story.update({
          where: { id: parseInt(contentId) },
          data: {
            status: 'REJECTED',
            rejectedAt: new Date()
          },
          include: {
            category: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }),
        prisma.moderationLog.create({
          data: {
            contentType: 'STORY',
            contentId: parseInt(contentId),
            storyId: parseInt(contentId),
            action: 'REJECT',
            previousStatus: 'PENDING',
            newStatus: 'REJECTED',
            moderatorId,
            reason: sanitizedReason,
            notes: sanitizedNotes
          }
        })
      ]);
    }

    return res.json({
      success: true,
      message: `${contentType.toLowerCase()} rejected successfully`,
      data: {
        content: rejectedContent,
        contentType,
        reason: sanitizedReason
      }
    });

  } catch (error) {
    console.error('Reject content error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Archive question or story
 * @route POST /api/parentcircle/moderation/archive
 * @access MODERATOR, SUPER_ADMIN
 */
export const archiveContent = async (req, res) => {
  try {
    const { contentType, contentId, reason } = req.body;
    const moderatorId = req.user.userId;

    if (!contentType || !contentId) {
      return res.status(400).json({
        success: false,
        message: 'contentType and contentId are required'
      });
    }

    if (!['QUESTION', 'STORY'].includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'contentType must be QUESTION or STORY'
      });
    }

    let archivedContent;
    const sanitizedReason = reason ? sanitizeContent(reason.trim()) : null;

    if (contentType === 'QUESTION') {
      const question = await prisma.question.findUnique({
        where: { id: parseInt(contentId) }
      });

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      [archivedContent] = await prisma.$transaction([
        prisma.question.update({
          where: { id: parseInt(contentId) },
          data: { status: 'ARCHIVED' }
        }),
        prisma.moderationLog.create({
          data: {
            contentType: 'QUESTION',
            contentId: parseInt(contentId),
            questionId: parseInt(contentId),
            action: 'ARCHIVE',
            previousStatus: question.status,
            newStatus: 'ARCHIVED',
            moderatorId,
            reason: sanitizedReason
          }
        })
      ]);
    } else {
      const story = await prisma.story.findUnique({
        where: { id: parseInt(contentId) }
      });

      if (!story) {
        return res.status(404).json({
          success: false,
          message: 'Story not found'
        });
      }

      [archivedContent] = await prisma.$transaction([
        prisma.story.update({
          where: { id: parseInt(contentId) },
          data: { status: 'ARCHIVED' }
        }),
        prisma.moderationLog.create({
          data: {
            contentType: 'STORY',
            contentId: parseInt(contentId),
            storyId: parseInt(contentId),
            action: 'ARCHIVE',
            previousStatus: story.status,
            newStatus: 'ARCHIVED',
            moderatorId,
            reason: sanitizedReason
          }
        })
      ]);
    }

    return res.json({
      success: true,
      message: `${contentType.toLowerCase()} archived successfully`,
      data: { content: archivedContent, contentType }
    });

  } catch (error) {
    console.error('Archive content error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Restore archived content
 * @route POST /api/parentcircle/moderation/restore
 * @access MODERATOR, SUPER_ADMIN
 */
export const restoreContent = async (req, res) => {
  try {
    const { contentType, contentId } = req.body;
    const moderatorId = req.user.userId;

    if (!contentType || !contentId) {
      return res.status(400).json({
        success: false,
        message: 'contentType and contentId are required'
      });
    }

    let restoredContent;

    if (contentType === 'QUESTION') {
      const question = await prisma.question.findUnique({
        where: { id: parseInt(contentId) }
      });

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      if (question.status !== 'ARCHIVED') {
        return res.status(400).json({
          success: false,
          message: 'Question is not archived'
        });
      }

      [restoredContent] = await prisma.$transaction([
        prisma.question.update({
          where: { id: parseInt(contentId) },
          data: { status: 'APPROVED' }
        }),
        prisma.moderationLog.create({
          data: {
            contentType: 'QUESTION',
            contentId: parseInt(contentId),
            questionId: parseInt(contentId),
            action: 'RESTORE',
            previousStatus: 'ARCHIVED',
            newStatus: 'APPROVED',
            moderatorId
          }
        })
      ]);
    } else {
      const story = await prisma.story.findUnique({
        where: { id: parseInt(contentId) }
      });

      if (!story) {
        return res.status(404).json({
          success: false,
          message: 'Story not found'
        });
      }

      if (story.status !== 'ARCHIVED') {
        return res.status(400).json({
          success: false,
          message: 'Story is not archived'
        });
      }

      [restoredContent] = await prisma.$transaction([
        prisma.story.update({
          where: { id: parseInt(contentId) },
          data: { status: 'APPROVED' }
        }),
        prisma.moderationLog.create({
          data: {
            contentType: 'STORY',
            contentId: parseInt(contentId),
            storyId: parseInt(contentId),
            action: 'RESTORE',
            previousStatus: 'ARCHIVED',
            newStatus: 'APPROVED',
            moderatorId
          }
        })
      ]);
    }

    return res.json({
      success: true,
      message: `${contentType.toLowerCase()} restored successfully`,
      data: { content: restoredContent, contentType }
    });

  } catch (error) {
    console.error('Restore content error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get moderation history/logs
 * @route GET /api/parentcircle/moderation/logs
 * @access MODERATOR, SUPER_ADMIN
 */
export const getModerationLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      contentType,
      action,
      moderatorId,
      startDate,
      endDate
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (contentType) where.contentType = contentType;
    if (action) where.action = action;
    if (moderatorId) where.moderatorId = moderatorId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.moderationLog.findMany({
        where,
        include: {
          moderator: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          question: {
            select: {
              id: true,
              title: true,
              content: true
            }
          },
          story: {
            select: {
              id: true,
              title: true,
              content: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.moderationLog.count({ where })
    ]);

    return res.json({
      success: true,
      data: {
        logs,
        pagination: {
          current: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalLogs: total
        }
      }
    });

  } catch (error) {
    console.error('Get moderation logs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get moderation statistics
 * @route GET /api/parentcircle/moderation/stats
 * @access MODERATOR, SUPER_ADMIN
 */
export const getModerationStats = async (req, res) => {
  try {
    const { period = 30 } = req.query; // Days

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - parseInt(period));

    const [
      pendingQuestions,
      pendingStories,
      approvedQuestions,
      approvedStories,
      rejectedQuestions,
      rejectedStories,
      moderationActions,
      topModerators
    ] = await Promise.all([
      prisma.question.count({ where: { status: 'PENDING' } }),
      prisma.story.count({ where: { status: 'PENDING' } }),
      prisma.question.count({
        where: {
          status: 'APPROVED',
          approvedAt: { gte: dateThreshold }
        }
      }),
      prisma.story.count({
        where: {
          status: 'APPROVED',
          approvedAt: { gte: dateThreshold }
        }
      }),
      prisma.question.count({
        where: {
          status: 'REJECTED',
          rejectedAt: { gte: dateThreshold }
        }
      }),
      prisma.story.count({
        where: {
          status: 'REJECTED',
          rejectedAt: { gte: dateThreshold }
        }
      }),
      prisma.moderationLog.count({
        where: {
          createdAt: { gte: dateThreshold }
        }
      }),
      prisma.moderationLog.groupBy({
        by: ['moderatorId'],
        where: {
          createdAt: { gte: dateThreshold }
        },
        _count: true,
        orderBy: {
          _count: {
            moderatorId: 'desc'
          }
        },
        take: 5
      })
    ]);

    // Get moderator details
    const moderatorIds = topModerators.map(m => m.moderatorId);
    const moderators = await prisma.user.findMany({
      where: {
        id: { in: moderatorIds }
      },
      select: {
        id: true,
        name: true,
        role: true
      }
    });

    const topModeratorsWithDetails = topModerators.map(tm => ({
      ...moderators.find(m => m.id === tm.moderatorId),
      actionsCount: tm._count
    }));

    return res.json({
      success: true,
      data: {
        period: `${period} days`,
        pending: {
          questions: pendingQuestions,
          stories: pendingStories,
          total: pendingQuestions + pendingStories
        },
        approved: {
          questions: approvedQuestions,
          stories: approvedStories,
          total: approvedQuestions + approvedStories
        },
        rejected: {
          questions: rejectedQuestions,
          stories: rejectedStories,
          total: rejectedQuestions + rejectedStories
        },
        totalActions: moderationActions,
        topModerators: topModeratorsWithDetails,
        approvalRate: {
          questions: approvedQuestions + rejectedQuestions > 0
            ? ((approvedQuestions / (approvedQuestions + rejectedQuestions)) * 100).toFixed(1)
            : 0,
          stories: approvedStories + rejectedStories > 0
            ? ((approvedStories / (approvedStories + rejectedStories)) * 100).toFixed(1)
            : 0
        }
      }
    });

  } catch (error) {
    console.error('Get moderation stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Bulk approve content
 * @route POST /api/parentcircle/moderation/bulk-approve
 * @access MODERATOR, SUPER_ADMIN
 */
export const bulkApproveContent = async (req, res) => {
  try {
    const { items } = req.body; // [{ contentType, contentId }]
    const moderatorId = req.user.userId;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'items must be a non-empty array'
      });
    }

    const results = {
      approved: [],
      failed: []
    };

    // Process each item
    for (const item of items) {
      try {
        const { contentType, contentId } = item;

        if (contentType === 'QUESTION') {
          await prisma.$transaction([
            prisma.question.update({
              where: { id: parseInt(contentId) },
              data: { status: 'APPROVED', approvedAt: new Date() }
            }),
            prisma.moderationLog.create({
              data: {
                contentType: 'QUESTION',
                contentId: parseInt(contentId),
                questionId: parseInt(contentId),
                action: 'APPROVE',
                previousStatus: 'PENDING',
                newStatus: 'APPROVED',
                moderatorId,
                notes: 'Bulk approval'
              }
            })
          ]);
        } else if (contentType === 'STORY') {
          await prisma.$transaction([
            prisma.story.update({
              where: { id: parseInt(contentId) },
              data: { status: 'APPROVED', approvedAt: new Date() }
            }),
            prisma.moderationLog.create({
              data: {
                contentType: 'STORY',
                contentId: parseInt(contentId),
                storyId: parseInt(contentId),
                action: 'APPROVE',
                previousStatus: 'PENDING',
                newStatus: 'APPROVED',
                moderatorId,
                notes: 'Bulk approval'
              }
            })
          ]);
        }

        results.approved.push({ contentType, contentId });
      } catch (error) {
        results.failed.push({
          contentType: item.contentType,
          contentId: item.contentId,
          error: error.message
        });
      }
    }

    return res.json({
      success: true,
      message: `Bulk approval completed: ${results.approved.length} approved, ${results.failed.length} failed`,
      data: results
    });

  } catch (error) {
    console.error('Bulk approve error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};