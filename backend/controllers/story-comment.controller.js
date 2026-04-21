import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// HELPER FUNCTIONS
// ============================================

const sanitizeContent = (content) => {
  if (!content) return '';
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '');
};

// ============================================
// COMMENT CONTROLLERS
// ============================================

/**
 * Create comment on story
 * @route POST /api/parentcircle/stories/:storyId/comments
 * @access PUBLIC (authenticated or anonymous)
 */
export const createComment = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { content, isAnonymous, authorName } = req.body;

    // Validate content
    if (!content || content.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Comment must be at least 3 characters long'
      });
    }

    // Check if story exists and is approved
    const story = await prisma.story.findUnique({
      where: { id: parseInt(storyId) }
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    if (story.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot comment on stories that are not approved'
      });
    }

    // Sanitize content
    const sanitizedContent = sanitizeContent(content.trim());
    const sanitizedAuthorName = authorName ? sanitizeContent(authorName.trim()) : null;

    // Determine author
    let createdBy = null;
    let displayName = 'Anonymous';

    if (!isAnonymous && req.user) {
      createdBy = req.user.userId;
      const user = await prisma.user.findUnique({
        where: { id: createdBy },
        select: { name: true }
      });
      displayName = user?.name || 'User';
    } else if (sanitizedAuthorName) {
      displayName = sanitizedAuthorName;
    }

    // Create comment
    const comment = await prisma.storyComment.create({
      data: {
        content: sanitizedContent,
        storyId: parseInt(storyId),
        createdBy,
        authorName: displayName,
        status: 'PENDING' // Comments require moderation
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Comment submitted successfully and is pending moderation',
      data: { comment }
    });

  } catch (error) {
    console.error('Create comment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all comments for a story
 * @route GET /api/parentcircle/stories/:storyId/comments
 * @access PUBLIC
 */
export const getCommentsByStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { page = 1, limit = 20, sortBy = 'newest' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      storyId: parseInt(storyId)
    };

    // Only show approved comments to public
    if (req.user?.role !== 'MODERATOR' && req.user?.role !== 'SUPER_ADMIN') {
      where.status = 'APPROVED';
    }

    // Sort order
    const orderBy = sortBy === 'oldest' 
      ? { createdAt: 'asc' }
      : { createdAt: 'desc' };

    const [comments, total] = await Promise.all([
      prisma.storyComment.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        },
        orderBy,
        skip,
        take: parseInt(limit)
      }),
      prisma.storyComment.count({ where })
    ]);

    return res.json({
      success: true,
      data: {
        comments,
        pagination: {
          current: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalComments: total
        }
      }
    });

  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update comment
 * @route PUT /api/parentcircle/comments/:id
 * @access AUTHOR, MODERATOR
 */
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const existingComment = await prisma.storyComment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check permissions
    const isAuthor = req.user.userId === existingComment.createdBy;
    const isModerator = req.user.role === 'MODERATOR' || req.user.role === 'SUPER_ADMIN';

    if (!isAuthor && !isModerator) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this comment'
      });
    }

    if (!content || content.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Comment must be at least 3 characters long'
      });
    }

    const comment = await prisma.storyComment.update({
      where: { id: parseInt(id) },
      data: {
        content: sanitizeContent(content.trim()),
        // If author edits approved comment, reset to pending
        status: isAuthor && !isModerator && existingComment.status === 'APPROVED' 
          ? 'PENDING' 
          : existingComment.status
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    return res.json({
      success: true,
      message: 'Comment updated successfully',
      data: { comment }
    });

  } catch (error) {
    console.error('Update comment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete comment
 * @route DELETE /api/parentcircle/comments/:id
 * @access AUTHOR, MODERATOR
 */
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await prisma.storyComment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check permissions
    const isAuthor = req.user.userId === comment.createdBy;
    const isModerator = req.user.role === 'MODERATOR' || req.user.role === 'SUPER_ADMIN';

    if (!isAuthor && !isModerator) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this comment'
      });
    }

    await prisma.storyComment.delete({
      where: { id: parseInt(id) }
    });

    return res.json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Approve comment (moderator)
 * @route PATCH /api/parentcircle/comments/:id/approve
 * @access MODERATOR
 */
export const approveComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await prisma.storyComment.update({
      where: { id: parseInt(id) },
      data: { status: 'APPROVED' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    return res.json({
      success: true,
      message: 'Comment approved successfully',
      data: { comment }
    });

  } catch (error) {
    console.error('Approve comment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Reject comment (moderator)
 * @route PATCH /api/parentcircle/comments/:id/reject
 * @access MODERATOR
 */
export const rejectComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await prisma.storyComment.update({
      where: { id: parseInt(id) },
      data: { status: 'REJECTED' }
    });

    return res.json({
      success: true,
      message: 'Comment rejected successfully',
      data: { comment }
    });

  } catch (error) {
    console.error('Reject comment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};