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
 * @returns {string} - URL-friendly slug
 */
const generateSlug = (text) => {
  if (!text) return null;
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100); // Limit slug length
};

// ============================================
// QUESTION CONTROLLERS
// ============================================

/**
 * Create new question
 * @route POST /api/parentcircle/questions
 * @access PUBLIC (authenticated users or anonymous)
 */
export const createQuestion = async (req, res) => {
  try {
    const { title, content, categoryId, tags, isAnonymous, authorName } = req.body;

    // Validate required fields
    if (!content || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Content and categoryId are required fields'
      });
    }

    // Validate content length
    if (content.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Question content must be at least 10 characters long'
      });
    }

    // Check if category exists and supports questions
    const category = await prisma.parentCircleCategory.findUnique({
      where: { id: parseInt(categoryId) }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (category.type === 'STORY') {
      return res.status(400).json({
        success: false,
        message: 'This category does not support questions'
      });
    }

    if (!category.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This category is currently inactive'
      });
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
        let slugExists = await prisma.question.findUnique({
          where: { slug }
        });

        let counter = 1;
        while (slugExists) {
          slug = `${generateSlug(sanitizedTitle)}-${counter}`;
          slugExists = await prisma.question.findUnique({
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
      // Custom display name (for anonymous or authenticated users)
      displayName = sanitizedAuthorName;
    }

    // Create question
    const question = await prisma.question.create({
      data: {
        title: sanitizedTitle,
        content: sanitizedContent,
        slug,
        categoryId: parseInt(categoryId),
        createdBy,
        authorName: displayName,
        tags: processedTags,
        status: 'PENDING' // All questions start as pending for moderation
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
            answers: true,
            votes: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Question submitted successfully and is pending moderation',
      data: { question }
    });

  } catch (error) {
    console.error('Create question error:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A question with this slug already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all questions with filters and pagination
 * @route GET /api/parentcircle/questions
 * @access PUBLIC
 */
export const getAllQuestions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'APPROVED',
      categoryId,
      search,
      tags,
      sortBy = 'recent',
      isPinned,
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

    // Pinned/Featured filters
    if (isPinned === 'true') where.isPinned = true;
    if (isFeatured === 'true') where.isFeatured = true;

    // Determine sort order
    let orderBy = {};
    switch (sortBy) {
      case 'popular':
        orderBy = { helpfulCount: 'desc' };
        break;
      case 'views':
        orderBy = { views: 'desc' };
        break;
      case 'answered':
        orderBy = { answers: { _count: 'desc' } };
        break;
      case 'recent':
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Add pinned priority
    const finalOrderBy = isPinned !== 'false' 
      ? [{ isPinned: 'desc' }, orderBy]
      : orderBy;

    // Fetch questions and total count
    const [questions, total] = await Promise.all([
      prisma.question.findMany({
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
              answers: true,
              votes: true
            }
          }
        },
        orderBy: finalOrderBy,
        skip,
        take: parseInt(limit)
      }),
      prisma.question.count({ where })
    ]);

    return res.json({
      success: true,
      data: {
        questions,
        pagination: {
          current: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalQuestions: total,
          hasMore: skip + questions.length < total
        }
      }
    });

  } catch (error) {
    console.error('Get questions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get single question by ID or slug
 * @route GET /api/parentcircle/questions/:identifier
 * @access PUBLIC
 */
export const getQuestionById = async (req, res) => {
  try {
    const { identifier } = req.params;
    const { incrementView } = req.query;

    // Check if identifier is numeric (ID) or string (slug)
    const isNumeric = /^\d+$/.test(identifier);
    
    const question = await prisma.question.findUnique({
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
        answers: {
          where: {
            // Only show answers (could add status filter if needed)
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          },
          orderBy: [
            { isAccepted: 'desc' },
            { isVerified: 'desc' },
            { helpfulCount: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        _count: {
          select: {
            answers: true,
            votes: true,
            reports: true
          }
        }
      }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user has permission to view (if not approved)
    if (question.status !== 'APPROVED') {
      const canView = 
        req.user?.userId === question.createdBy ||
        req.user?.role === 'MODERATOR' ||
        req.user?.role === 'SUPER_ADMIN';

      if (!canView) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this question'
        });
      }
    }

    // Increment view count if requested (and not the author viewing)
    if (incrementView === 'true' && req.user?.userId !== question.createdBy) {
      await prisma.question.update({
        where: { id: question.id },
        data: { views: { increment: 1 } }
      });
      question.views += 1;
    }

    return res.json({
      success: true,
      data: { question }
    });

  } catch (error) {
    console.error('Get question error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update question
 * @route PUT /api/parentcircle/questions/:id
 * @access AUTHOR, MODERATOR, SUPER_ADMIN
 */
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, categoryId, tags } = req.body;

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check permissions
    const isAuthor = req.user.userId === existingQuestion.createdBy;
    const isModerator = req.user.role === 'MODERATOR' || req.user.role === 'SUPER_ADMIN';

    if (!isAuthor && !isModerator) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this question'
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
          const slugConflict = await prisma.question.findFirst({
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
      if (content.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Question content must be at least 10 characters long'
        });
      }
      updateData.content = sanitizeContent(content.trim());
    }

    if (categoryId) {
      const category = await prisma.parentCircleCategory.findUnique({
        where: { id: parseInt(categoryId) }
      });

      if (!category || category.type === 'STORY') {
        return res.status(400).json({
          success: false,
          message: 'Invalid category for questions'
        });
      }

      updateData.categoryId = parseInt(categoryId);
    }

    if (tags !== undefined) {
      const processedTags = Array.isArray(tags)
        ? tags.map(tag => sanitizeContent(tag.trim())).filter(Boolean)
        : [];
      updateData.tags = processedTags;
    }

    // If author edited approved content, reset to pending (except moderators)
    if (isAuthor && !isModerator && existingQuestion.status === 'APPROVED') {
      updateData.status = 'PENDING';
    }

    // Update question
    const question = await prisma.question.update({
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
            answers: true,
            votes: true
          }
        }
      }
    });

    return res.json({
      success: true,
      message: 'Question updated successfully',
      data: { question }
    });

  } catch (error) {
    console.error('Update question error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete question
 * @route DELETE /api/parentcircle/questions/:id
 * @access AUTHOR, MODERATOR, SUPER_ADMIN
 */
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { answers: true }
        }
      }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check permissions
    const isAuthor = req.user.userId === question.createdBy;
    const isModerator = req.user.role === 'MODERATOR' || req.user.role === 'SUPER_ADMIN';

    if (!isAuthor && !isModerator) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this question'
      });
    }

    // Prevent deletion if has answers (moderators can override)
    if (question._count.answers > 0 && !isModerator) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete question with existing answers. Please contact a moderator.'
      });
    }

    // Delete question (cascades to answers, votes, reports)
    await prisma.question.delete({
      where: { id: parseInt(id) }
    });

    return res.json({
      success: true,
      message: 'Question deleted successfully'
    });

  } catch (error) {
    console.error('Delete question error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Vote on question (helpful/not helpful)
 * @route POST /api/parentcircle/questions/:id/vote
 * @access AUTHENTICATED
 */
export const voteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { isHelpful } = req.body;
    const userId = req.user.userId;

    if (typeof isHelpful !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isHelpful must be a boolean value'
      });
    }

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: parseInt(id) }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user already voted
    const existingVote = await prisma.questionVote.findUnique({
      where: {
        questionId_userId: {
          questionId: parseInt(id),
          userId
        }
      }
    });

    if (existingVote) {
      // Update existing vote if different
      if (existingVote.isHelpful !== isHelpful) {
        await prisma.$transaction([
          prisma.questionVote.update({
            where: { id: existingVote.id },
            data: { isHelpful }
          }),
          prisma.question.update({
            where: { id: parseInt(id) },
            data: {
              helpfulCount: {
                increment: isHelpful ? 2 : -2 // Change from -1 to +1 or vice versa
              }
            }
          })
        ]);

        return res.json({
          success: true,
          message: 'Vote updated successfully'
        });
      } else {
        // Remove vote if clicking same option
        await prisma.$transaction([
          prisma.questionVote.delete({
            where: { id: existingVote.id }
          }),
          prisma.question.update({
            where: { id: parseInt(id) },
            data: {
              helpfulCount: {
                increment: isHelpful ? -1 : 1
              }
            }
          })
        ]);

        return res.json({
          success: true,
          message: 'Vote removed successfully'
        });
      }
    } else {
      // Create new vote
      await prisma.$transaction([
        prisma.questionVote.create({
          data: {
            questionId: parseInt(id),
            userId,
            isHelpful
          }
        }),
        prisma.question.update({
          where: { id: parseInt(id) },
          data: {
            helpfulCount: {
              increment: isHelpful ? 1 : -1
            }
          }
        })
      ]);

      return res.status(201).json({
        success: true,
        message: 'Vote recorded successfully'
      });
    }

  } catch (error) {
    console.error('Vote question error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Pin/Unpin question
 * @route PATCH /api/parentcircle/questions/:id/pin
 * @access MODERATOR, SUPER_ADMIN
 */
export const togglePinQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPinned } = req.body;

    const question = await prisma.question.update({
      where: { id: parseInt(id) },
      data: { isPinned: Boolean(isPinned) }
    });

    return res.json({
      success: true,
      message: `Question ${isPinned ? 'pinned' : 'unpinned'} successfully`,
      data: { question }
    });

  } catch (error) {
    console.error('Toggle pin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Feature/Unfeature question
 * @route PATCH /api/parentcircle/questions/:id/feature
 * @access MODERATOR, SUPER_ADMIN
 */
export const toggleFeatureQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    const question = await prisma.question.update({
      where: { id: parseInt(id) },
      data: { isFeatured: Boolean(isFeatured) }
    });

    return res.json({
      success: true,
      message: `Question ${isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: { question }
    });

  } catch (error) {
    console.error('Toggle feature error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};