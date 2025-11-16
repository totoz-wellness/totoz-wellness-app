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
 * Check if user has professional role
 * @param {string} role - User role
 * @returns {boolean} - Is professional
 */
const isProfessionalRole = (role) => {
  const professionalRoles = ['MODERATOR', 'SUPER_ADMIN', 'CONTENT_LEAD', 'CONTENT_WRITER'];
  return professionalRoles.includes(role);
};

// ============================================
// ANSWER CONTROLLERS
// ============================================

/**
 * Create new answer to a question
 * @route POST /api/parentcircle/questions/:questionId/answers
 * @access AUTHENTICATED (All logged-in users can answer)
 */
export const createAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Validate required fields
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Answer content is required'
      });
    }

    // Validate content length
    if (content.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Answer must be at least 10 characters long'
      });
    }

    // Check if question exists and is approved
    const question = await prisma.question.findUnique({
      where: { id: parseInt(questionId) },
      include: {
        category: true
      }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    if (question.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot answer questions that are not approved'
      });
    }

    // Sanitize content
    const sanitizedContent = sanitizeContent(content.trim());

    // Auto-verify if user is a professional
    // Regular users (caregivers) can answer but won't be auto-verified
    const isVerified = isProfessionalRole(userRole);

    // Create answer
    const answer = await prisma.answer.create({
      data: {
        content: sanitizedContent,
        questionId: parseInt(questionId),
        createdBy: userId,
        isVerified: isVerified // Automatically verify professional answers
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        question: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    // Add helpful message based on user type
    const responseMessage = isVerified 
      ? 'Professional answer posted and verified successfully'
      : 'Answer posted successfully. Thank you for sharing your experience!';

    return res.status(201).json({
      success: true,
      message: responseMessage,
      data: { 
        answer,
        isProfessional: isVerified,
        answerType: isVerified ? 'PROFESSIONAL' : 'COMMUNITY'
      }
    });

  } catch (error) {
    console.error('Create answer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all answers for a question (with professional/community distinction)
 * @route GET /api/parentcircle/questions/:questionId/answers
 * @access PUBLIC
 */
export const getAnswersByQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { sortBy = 'best', filterType } = req.query;

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: parseInt(questionId) }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Build where clause
    const where = {
      questionId: parseInt(questionId)
    };

    // Filter by answer type if requested
    if (filterType === 'professional') {
      where.isVerified = true;
    } else if (filterType === 'community') {
      where.isVerified = false;
    }

    // Determine sort order
    let orderBy = [];
    
    switch (sortBy) {
      case 'best':
        // Prioritize: accepted > verified (professional) > helpful > newest
        orderBy = [
          { isAccepted: 'desc' },
          { isVerified: 'desc' }, // Professional answers float to top
          { helpfulCount: 'desc' },
          { createdAt: 'asc' }
        ];
        break;
      case 'newest':
        orderBy = [{ createdAt: 'desc' }];
        break;
      case 'oldest':
        orderBy = [{ createdAt: 'asc' }];
        break;
      case 'helpful':
        orderBy = [{ helpfulCount: 'desc' }];
        break;
      case 'professional':
        // Show professional answers first
        orderBy = [
          { isVerified: 'desc' },
          { helpfulCount: 'desc' },
          { createdAt: 'desc' }
        ];
        break;
      default:
        orderBy = [
          { isAccepted: 'desc' },
          { isVerified: 'desc' },
          { helpfulCount: 'desc' }
        ];
    }

    // Fetch answers
    const answers = await prisma.answer.findMany({
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
      orderBy
    });

    // Separate answers by type for frontend convenience
    const professionalAnswers = answers.filter(a => a.isVerified);
    const communityAnswers = answers.filter(a => !a.isVerified);

    return res.json({
      success: true,
      data: {
        answers,
        total: answers.length,
        breakdown: {
          professional: professionalAnswers.length,
          community: communityAnswers.length
        },
        // Optionally return separated lists
        professionalAnswers,
        communityAnswers
      }
    });

  } catch (error) {
    console.error('Get answers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get single answer by ID
 * @route GET /api/parentcircle/answers/:id
 * @access PUBLIC
 */
export const getAnswerById = async (req, res) => {
  try {
    const { id } = req.params;

    const answer = await prisma.answer.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        question: {
          select: {
            id: true,
            title: true,
            slug: true,
            content: true
          }
        }
      }
    });

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Add answer type metadata
    const answerType = answer.isVerified ? 'PROFESSIONAL' : 'COMMUNITY';
    const isProfessional = isProfessionalRole(answer.author.role);

    return res.json({
      success: true,
      data: { 
        answer,
        metadata: {
          answerType,
          isProfessional,
          badge: isProfessional ? 'Verified Professional' : 'Community Member'
        }
      }
    });

  } catch (error) {
    console.error('Get answer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update answer
 * @route PUT /api/parentcircle/answers/:id
 * @access AUTHOR, MODERATOR, SUPER_ADMIN
 */
export const updateAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, isVerified, isAccepted } = req.body;
    const userId = req.user.userId;

    // Check if answer exists
    const existingAnswer = await prisma.answer.findUnique({
      where: { id: parseInt(id) },
      include: {
        question: true,
        author: true
      }
    });

    if (!existingAnswer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Check permissions
    const isAuthor = userId === existingAnswer.createdBy;
    const isModerator = req.user.role === 'MODERATOR' || req.user.role === 'SUPER_ADMIN';

    if (!isAuthor && !isModerator) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this answer'
      });
    }

    // Build update data
    const updateData = {};

    if (content) {
      if (content.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Answer must be at least 10 characters long'
        });
      }
      updateData.content = sanitizeContent(content.trim());
      
      // If community member edits their answer, keep it unverified
      // If professional edits, maintain verification (unless moderator removes it)
      if (isAuthor && !isProfessionalRole(existingAnswer.author.role)) {
        updateData.isVerified = false; // Community answers stay unverified
      }
    }

    // Only moderators can change verified/accepted status
    if (isModerator) {
      if (typeof isVerified === 'boolean') {
        updateData.isVerified = isVerified;
      }
      if (typeof isAccepted === 'boolean') {
        updateData.isAccepted = isAccepted;
        
        // If marking as accepted, unaccept other answers for this question
        if (isAccepted === true) {
          await prisma.answer.updateMany({
            where: {
              questionId: existingAnswer.questionId,
              id: { not: parseInt(id) }
            },
            data: { isAccepted: false }
          });
        }
      }
    }

    // Update answer
    const answer = await prisma.answer.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        question: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    return res.json({
      success: true,
      message: 'Answer updated successfully',
      data: { answer }
    });

  } catch (error) {
    console.error('Update answer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete answer
 * @route DELETE /api/parentcircle/answers/:id
 * @access AUTHOR, MODERATOR, SUPER_ADMIN
 */
export const deleteAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if answer exists
    const answer = await prisma.answer.findUnique({
      where: { id: parseInt(id) }
    });

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Check permissions
    const isAuthor = userId === answer.createdBy;
    const isModerator = req.user.role === 'MODERATOR' || req.user.role === 'SUPER_ADMIN';

    if (!isAuthor && !isModerator) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this answer'
      });
    }

    // Delete answer
    await prisma.answer.delete({
      where: { id: parseInt(id) }
    });

    return res.json({
      success: true,
      message: 'Answer deleted successfully'
    });

  } catch (error) {
    console.error('Delete answer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Mark answer as verified (moderators can verify good community answers)
 * @route PATCH /api/parentcircle/answers/:id/verify
 * @access MODERATOR, SUPER_ADMIN
 */
export const toggleVerifyAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const answer = await prisma.answer.update({
      where: { id: parseInt(id) },
      data: { isVerified: Boolean(isVerified) },
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

    const message = isVerified 
      ? 'Answer verified successfully (now marked as professional-quality)'
      : 'Answer verification removed';

    return res.json({
      success: true,
      message,
      data: { answer }
    });

  } catch (error) {
    console.error('Verify answer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Mark answer as accepted (best answer)
 * @route PATCH /api/parentcircle/answers/:id/accept
 * @access MODERATOR, SUPER_ADMIN
 */
export const toggleAcceptAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAccepted } = req.body;

    // Get the answer with question info
    const existingAnswer = await prisma.answer.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAnswer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // If marking as accepted, unaccept all other answers for this question
    if (isAccepted === true) {
      await prisma.answer.updateMany({
        where: {
          questionId: existingAnswer.questionId,
          id: { not: parseInt(id) }
        },
        data: { isAccepted: false }
      });
    }

    // Update this answer
    const answer = await prisma.answer.update({
      where: { id: parseInt(id) },
      data: { isAccepted: Boolean(isAccepted) },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        question: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    return res.json({
      success: true,
      message: `Answer ${isAccepted ? 'accepted as best answer' : 'unaccepted'} successfully`,
      data: { answer }
    });

  } catch (error) {
    console.error('Accept answer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Increment helpful count for an answer (with vote tracking)
 * @route POST /api/parentcircle/answers/:id/helpful
 * @access AUTHENTICATED
 */
export const markAnswerHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const answer = await prisma.answer.update({
      where: { id: parseInt(id) },
      data: {
        helpfulCount: {
          increment: 1
        }
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
      message: 'Answer marked as helpful',
      data: { answer }
    });

  } catch (error) {
    console.error('Mark helpful error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all answers by a specific user (with professional indicator)
 * @route GET /api/parentcircle/users/:userId/answers
 * @access PUBLIC
 */
export const getAnswersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [answers, total, user] = await Promise.all([
      prisma.answer.findMany({
        where: {
          createdBy: userId
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              role: true
            }
          },
          question: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.answer.count({
        where: {
          createdBy: userId
        }
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, name: true }
      })
    ]);

    // Count professional vs community answers
    const professionalAnswers = answers.filter(a => a.isVerified).length;
    const communityAnswers = answers.filter(a => !a.isVerified).length;

    return res.json({
      success: true,
      data: {
        answers,
        pagination: {
          current: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalAnswers: total
        },
        userInfo: {
          name: user?.name,
          role: user?.role,
          isProfessional: user ? isProfessionalRole(user.role) : false
        },
        statistics: {
          total,
          professional: professionalAnswers,
          community: communityAnswers
        }
      }
    });

  } catch (error) {
    console.error('Get user answers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get answer statistics for a question (professional vs community breakdown)
 * @route GET /api/parentcircle/questions/:questionId/answers/stats
 * @access PUBLIC
 */
export const getAnswerStats = async (req, res) => {
  try {
    const { questionId } = req.params;

    const [total, professionalCount, communityCount, acceptedAnswer] = await Promise.all([
      prisma.answer.count({
        where: { questionId: parseInt(questionId) }
      }),
      prisma.answer.count({
        where: { 
          questionId: parseInt(questionId),
          isVerified: true
        }
      }),
      prisma.answer.count({
        where: { 
          questionId: parseInt(questionId),
          isVerified: false
        }
      }),
      prisma.answer.findFirst({
        where: {
          questionId: parseInt(questionId),
          isAccepted: true
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
      })
    ]);

    return res.json({
      success: true,
      data: {
        totalAnswers: total,
        professionalAnswers: professionalCount,
        communityAnswers: communityCount,
        hasAcceptedAnswer: !!acceptedAnswer,
        acceptedAnswer: acceptedAnswer || null,
        breakdown: {
          professionalPercentage: total > 0 ? ((professionalCount / total) * 100).toFixed(1) : 0,
          communityPercentage: total > 0 ? ((communityCount / total) * 100).toFixed(1) : 0
        }
      }
    });

  } catch (error) {
    console.error('Get answer stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};