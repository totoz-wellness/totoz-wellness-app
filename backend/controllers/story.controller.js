/**
 * ============================================
 * PARENTCIRCLE - STORY CONTROLLER
 * ============================================
 * @module      controllers/parentcircle/story.controller
 * @description Handles personal stories and community experiences
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-16 21:25:02 UTC
 * 
 * Features:
 * - Story CRUD operations
 * - Anonymous posting support
 * - Like/unlike functionality
 * - Featured & trending stories
 * - Comment count tracking
 * - View count tracking
 * ============================================
 */

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

/**
 * Generate URL-friendly slug from text
 * @param {string} text - Text to slugify
 * @returns {string|null} - URL-friendly slug or null
 */
const generateSlug = (text) => {
  if (!text) return null;
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
};

// ============================================
// STORY CONTROLLERS
// ============================================

/**
 * Create new story
 * @route POST /api/parentcircle/stories
 * @access PUBLIC (authenticated users or anonymous)
 */
export const createStory = async (req, res) => {
  try {
    const { title, content, categoryId, tags, isAnonymous, authorName } = req.body;

    // Validate required fields
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Story content is required'
      });
    }

    // Validate content length
    if (content.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Story content must be at least 20 characters long'
      });
    }

    // Validate category if provided
    if (categoryId) {
      const category = await prisma.parentCircleCategory.findUnique({
        where: { id: parseInt(categoryId) }
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      if (category.type === 'QUESTION') {
        return res.status(400).json({
          success: false,
          message: 'This category does not support stories'
        });
      }

      if (!category.isActive) {
        return res.status(400).json({
          success: false,
          message: 'This category is currently inactive'
        });
      }
    }

    // Sanitize inputs
    const sanitizedTitle = title ? sanitizeContent(title.trim()) : null;
    const sanitizedContent = sanitizeContent(content.trim());
    const sanitizedAuthorName = authorName ? sanitizeContent(authorName.trim()) : null;

    // Process tags
    const processedTags = Array.isArray(tags)
      ? tags.map(tag => sanitizeContent(tag.trim())).filter(Boolean)
      : [];

    // Generate slug from title if provided
    let slug = null;
    if (sanitizedTitle) {
      slug = generateSlug(sanitizedTitle);
      
      // Ensure slug uniqueness
      if (slug) {
        let slugExists = await prisma.story.findUnique({
          where: { slug }
        });

        let counter = 1;
        while (slugExists) {
          slug = `${generateSlug(sanitizedTitle)}-${counter}`;
          slugExists = await prisma.story.findUnique({
            where: { slug }
          });
          counter++;
        }
      }
    }

    // Determine author details
    let createdBy = null;
    let displayName = 'Anonymous';

    if (!isAnonymous && req.user) {
      // Authenticated user posting with their identity
      createdBy = req.user.userId;
      const user = await prisma.user.findUnique({
        where: { id: createdBy },
        select: { name: true }
      });
      displayName = user?.name || 'User';
    } else if (sanitizedAuthorName) {
      // Custom display name
      displayName = sanitizedAuthorName;
    }

    // Create story
    const story = await prisma.story.create({
      data: {
        title: sanitizedTitle,
        content: sanitizedContent,
        slug,
        categoryId: categoryId ? parseInt(categoryId) : null,
        createdBy,
        authorName: displayName,
        tags: processedTags,
        status: 'PENDING' // All stories start as pending for moderation
      },
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
            role: true
          }
        },
        _count: {
          select: {
            votes: true,
            comments: true // 🆕 Include comment count
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Story submitted successfully and is pending moderation',
      data: { story }
    });

  } catch (error) {
    console.error('Create story error:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A story with this slug already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all stories with filters and pagination
 * @route GET /api/parentcircle/stories
 * @access PUBLIC
 */
export const getAllStories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'APPROVED',
      categoryId,
      search,
      tags,
      sortBy = 'recent',
      isFeatured
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    // Status filter (moderators can see all, public sees only approved)
    if (req.user?.role === 'MODERATOR' || req.user?.role === 'SUPER_ADMIN') {
      if (status) {
        where.status = status;
      }
    } else {
      where.status = 'APPROVED';
    }

    // Category filter
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      where.tags = {
        hasSome: tagArray
      };
    }

    // Featured filter
    if (isFeatured === 'true') where.isFeatured = true;

    // Determine sort order
    let orderBy = {};
    switch (sortBy) {
      case 'popular':
        orderBy = { likesCount: 'desc' };
        break;
      case 'views':
        orderBy = { views: 'desc' };
        break;
      case 'recent':
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Add featured priority
    const finalOrderBy = isFeatured !== 'false'
      ? [{ isFeatured: 'desc' }, orderBy]
      : orderBy;

    // Fetch stories and total count
    const [stories, total] = await Promise.all([
      prisma.story.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true
            }
          },
          author: {
            select: {
              id: true,
              name: true,
              role: true
            }
          },
          _count: {
            select: {
              votes: true,
              comments: { // 🆕 Count only approved comments for public
                where: { status: 'APPROVED' }
              }
            }
          }
        },
        orderBy: finalOrderBy,
        skip,
        take: parseInt(limit)
      }),
      prisma.story.count({ where })
    ]);

    return res.json({
      success: true,
      data: {
        stories,
        pagination: {
          current: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalStories: total,
          hasMore: skip + stories.length < total
        }
      }
    });

  } catch (error) {
    console.error('Get stories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get single story by ID or slug
 * @route GET /api/parentcircle/stories/:identifier
 * @access PUBLIC
 */
export const getStoryById = async (req, res) => {
  try {
    const { identifier } = req.params;
    const { incrementView } = req.query;

    // Check if identifier is numeric (ID) or string (slug)
    const isNumeric = /^\d+$/.test(identifier);
    
    const story = await prisma.story.findUnique({
      where: isNumeric ? { id: parseInt(identifier) } : { slug: identifier },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        _count: {
          select: {
            votes: true,
            reports: true,
            comments: { // 🆕 Count approved comments
              where: { status: 'APPROVED' }
            }
          }
        }
      }
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Check if user has permission to view (if not approved)
    if (story.status !== 'APPROVED') {
      const canView = 
        req.user?.userId === story.createdBy ||
        req.user?.role === 'MODERATOR' ||
        req.user?.role === 'SUPER_ADMIN';

      if (!canView) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this story'
        });
      }
    }

    // Increment view count if requested (and not the author viewing)
    if (incrementView === 'true' && req.user?.userId !== story.createdBy) {
      await prisma.story.update({
        where: { id: story.id },
        data: { views: { increment: 1 } }
      });
      story.views += 1;
    }

    return res.json({
      success: true,
      data: { story }
    });

  } catch (error) {
    console.error('Get story error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update story
 * @route PUT /api/parentcircle/stories/:id
 * @access AUTHOR, MODERATOR, SUPER_ADMIN
 */
export const updateStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, categoryId, tags } = req.body;

    // Check if story exists
    const existingStory = await prisma.story.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingStory) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Check permissions
    const isAuthor = req.user.userId === existingStory.createdBy;
    const isModerator = req.user.role === 'MODERATOR' || req.user.role === 'SUPER_ADMIN';

    if (!isAuthor && !isModerator) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this story'
      });
    }

    // Build update data
    const updateData = {};

    if (title !== undefined) {
      const sanitizedTitle = title ? sanitizeContent(title.trim()) : null;
      updateData.title = sanitizedTitle;

      // Regenerate slug if title changes
      if (sanitizedTitle) {
        let newSlug = generateSlug(sanitizedTitle);
        
        if (newSlug) {
          const slugConflict = await prisma.story.findFirst({
            where: {
              slug: newSlug,
              id: { not: parseInt(id) }
            }
          });

          if (slugConflict) {
            newSlug = `${newSlug}-${Date.now()}`;
          }
          
          updateData.slug = newSlug;
        }
      }
    }

    if (content) {
      if (content.trim().length < 20) {
        return res.status(400).json({
          success: false,
          message: 'Story content must be at least 20 characters long'
        });
      }
      updateData.content = sanitizeContent(content.trim());
    }

    if (categoryId !== undefined) {
      if (categoryId) {
        const category = await prisma.parentCircleCategory.findUnique({
          where: { id: parseInt(categoryId) }
        });

        if (!category || category.type === 'QUESTION') {
          return res.status(400).json({
            success: false,
            message: 'Invalid category for stories'
          });
        }

        updateData.categoryId = parseInt(categoryId);
      } else {
        updateData.categoryId = null;
      }
    }

    if (tags !== undefined) {
      const processedTags = Array.isArray(tags)
        ? tags.map(tag => sanitizeContent(tag.trim())).filter(Boolean)
        : [];
      updateData.tags = processedTags;
    }

    // If author edited approved content, reset to pending (except moderators)
    if (isAuthor && !isModerator && existingStory.status === 'APPROVED') {
      updateData.status = 'PENDING';
    }

    // Update story
    const story = await prisma.story.update({
      where: { id: parseInt(id) },
      data: updateData,
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
            role: true
          }
        },
        _count: {
          select: {
            votes: true,
            comments: { // 🆕 Include comment count
              where: { status: 'APPROVED' }
            }
          }
        }
      }
    });

    return res.json({
      success: true,
      message: 'Story updated successfully',
      data: { story }
    });

  } catch (error) {
    console.error('Update story error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete story
 * @route DELETE /api/parentcircle/stories/:id
 * @access AUTHOR, MODERATOR, SUPER_ADMIN
 */
export const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if story exists
    const story = await prisma.story.findUnique({
      where: { id: parseInt(id) }
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Check permissions
    const isAuthor = req.user.userId === story.createdBy;
    const isModerator = req.user.role === 'MODERATOR' || req.user.role === 'SUPER_ADMIN';

    if (!isAuthor && !isModerator) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this story'
      });
    }

    // Delete story (cascades to votes, comments, reports)
    await prisma.story.delete({
      where: { id: parseInt(id) }
    });

    return res.json({
      success: true,
      message: 'Story deleted successfully'
    });

  } catch (error) {
    console.error('Delete story error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Like/Unlike story (toggle)
 * @route POST /api/parentcircle/stories/:id/like
 * @access AUTHENTICATED
 */
export const toggleLikeStory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if story exists
    const story = await prisma.story.findUnique({
      where: { id: parseInt(id) }
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Check if user already liked this story
    const existingVote = await prisma.storyVote.findUnique({
      where: {
        storyId_userId: {
          storyId: parseInt(id),
          userId
        }
      }
    });

    if (existingVote) {
      // Unlike - remove vote and decrement count
      await prisma.$transaction([
        prisma.storyVote.delete({
          where: { id: existingVote.id }
        }),
        prisma.story.update({
          where: { id: parseInt(id) },
          data: {
            likesCount: {
              decrement: 1
            }
          }
        })
      ]);

      return res.json({
        success: true,
        message: 'Story unliked successfully',
        data: { liked: false }
      });
    } else {
      // Like - create vote and increment count
      await prisma.$transaction([
        prisma.storyVote.create({
          data: {
            storyId: parseInt(id),
            userId
          }
        }),
        prisma.story.update({
          where: { id: parseInt(id) },
          data: {
            likesCount: {
              increment: 1
            }
          }
        })
      ]);

      return res.status(201).json({
        success: true,
        message: 'Story liked successfully',
        data: { liked: true }
      });
    }

  } catch (error) {
    console.error('Toggle like story error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Check if user liked a story
 * @route GET /api/parentcircle/stories/:id/like/status
 * @access AUTHENTICATED
 */
export const getLikeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const vote = await prisma.storyVote.findUnique({
      where: {
        storyId_userId: {
          storyId: parseInt(id),
          userId
        }
      }
    });

    return res.json({
      success: true,
      data: {
        liked: !!vote,
        likedAt: vote?.createdAt || null
      }
    });

  } catch (error) {
    console.error('Get like status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Feature/Unfeature story
 * @route PATCH /api/parentcircle/stories/:id/feature
 * @access MODERATOR, SUPER_ADMIN
 */
export const toggleFeatureStory = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    const story = await prisma.story.update({
      where: { id: parseInt(id) },
      data: { isFeatured: Boolean(isFeatured) },
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
            role: true
          }
        },
        _count: {
          select: {
            votes: true,
            comments: { // 🆕 Include comment count
              where: { status: 'APPROVED' }
            }
          }
        }
      }
    });

    return res.json({
      success: true,
      message: `Story ${isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: { story }
    });

  } catch (error) {
    console.error('Toggle feature story error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get featured stories
 * @route GET /api/parentcircle/stories/featured
 * @access PUBLIC
 */
export const getFeaturedStories = async (req, res) => {
  try {
    const { limit = 10, categoryId } = req.query;

    const where = {
      status: 'APPROVED',
      isFeatured: true
    };

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    const stories = await prisma.story.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        _count: {
          select: {
            votes: true,
            comments: { // 🆕 Include comment count
              where: { status: 'APPROVED' }
            }
          }
        }
      },
      orderBy: [
        { likesCount: 'desc' },
        { views: 'desc' },
        { createdAt: 'desc' }
      ],
      take: parseInt(limit)
    });

    return res.json({
      success: true,
      data: {
        stories,
        total: stories.length
      }
    });

  } catch (error) {
    console.error('Get featured stories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get trending stories (by views and likes in the past week)
 * @route GET /api/parentcircle/stories/trending
 * @access PUBLIC
 */
export const getTrendingStories = async (req, res) => {
  try {
    const { limit = 10, days = 7 } = req.query;

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));

    const stories = await prisma.story.findMany({
      where: {
        status: 'APPROVED',
        createdAt: {
          gte: dateThreshold
        }
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        _count: {
          select: {
            votes: true,
            comments: { // 🆕 Include comment count
              where: { status: 'APPROVED' }
            }
          }
        }
      },
      orderBy: [
        { likesCount: 'desc' },
        { views: 'desc' }
      ],
      take: parseInt(limit)
    });

    return res.json({
      success: true,
      data: {
        stories,
        total: stories.length,
        timeframe: `${days} days`
      }
    });

  } catch (error) {
    console.error('Get trending stories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get user's own stories
 * @route GET /api/parentcircle/users/:userId/stories
 * @access AUTHOR or MODERATOR
 */
export const getUserStories = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    // Check permissions - users can only see their own stories unless moderator
    if (req.user.userId !== userId && 
        req.user.role !== 'MODERATOR' && 
        req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view these stories'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      createdBy: userId
    };

    if (status) {
      where.status = status;
    }

    const [stories, total] = await Promise.all([
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
          _count: {
            select: {
              votes: true,
              comments: { // 🆕 Include comment count (all statuses for author)
                where: req.user.role === 'MODERATOR' || req.user.role === 'SUPER_ADMIN'
                  ? {} // Moderators see all comments
                  : { status: 'APPROVED' } // Authors see approved only
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.story.count({ where })
    ]);

    return res.json({
      success: true,
      data: {
        stories,
        pagination: {
          current: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalStories: total
        }
      }
    });

  } catch (error) {
    console.error('Get user stories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};