import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create a new article (Content Writers & above)
export const createArticle = async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, videoUrl, category, tags } = req.body;
    const authorId = req.user.userId;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Calculate read time (approx 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    const article = await prisma.article.create({
      data: {
        title: title.trim(),
        content,
        excerpt: excerpt?.trim(),
        coverImage,
        videoUrl,
        category,
        tags: tags || [],
        readTime,
        slug,
        authorId,
        status: 'DRAFT' // Start as draft
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: { article }
    });

  } catch (error) {
    console.error('Create article error:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'An article with similar title already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Submit article for review
export const submitForReview = async (req, res) => {
  try {
    const { id } = req.params;
    const authorId = req.user.userId;

    const article = await prisma.article.findFirst({
      where: {
        id,
        authorId // Ensure the user owns the article
      }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    if (article.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: 'Only draft articles can be submitted for review'
      });
    }

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return res.json({
      success: true,
      message: 'Article submitted for review',
      data: { article: updatedArticle }
    });

  } catch (error) {
    console.error('Submit for review error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all articles with filtering (Public & Admin)
export const getArticles = async (req, res) => {
  try {
    const { 
      status, 
      category, 
      authorId, 
      page = 1, 
      limit = 10,
      publishedOnly = true 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Base where clause
    let where = {};
    
    // For public access, only show published articles
    if (publishedOnly === 'true' && !req.user) {
      where.status = 'PUBLISHED';
    }
    
    // Admins can filter by status
    if (status && req.user) {
      where.status = status;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (authorId) {
      where.authorId = authorId;
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          reviewer: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.article.count({ where })
    ]);

    return res.json({
      success: true,
      data: {
        articles,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          totalArticles: total
        }
      }
    });

  } catch (error) {
    console.error('Get articles error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single article
export const getArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reviewer: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Only show published articles to public
    if (article.status !== 'PUBLISHED' && !req.user) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    return res.json({
      success: true,
      data: { article }
    });

  } catch (error) {
    console.error('Get article error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Content Lead: Review and approve/reject articles
export const reviewArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, feedback } = req.body; // action: 'approve', 'reject'
    const reviewerId = req.user.userId;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "approve" or "reject"'
      });
    }

    const article = await prisma.article.findFirst({
      where: {
        id,
        status: 'SUBMITTED' // Only review submitted articles
      }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found or not ready for review'
      });
    }

    let updateData = {
      reviewerId,
      updatedAt: new Date()
    };

    if (action === 'approve') {
      updateData.status = 'APPROVED';
      updateData.publishedAt = new Date();
    } else {
      updateData.status = 'REJECTED';
      // You might want to store feedback in a separate table
    }

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reviewer: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return res.json({
      success: true,
      message: `Article ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      data: { article: updatedArticle }
    });

  } catch (error) {
    console.error('Review article error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Content Lead: Publish approved article
export const publishArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const reviewerId = req.user.userId;

    const article = await prisma.article.findFirst({
      where: {
        id,
        status: 'APPROVED' // Only publish approved articles
      }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found or not approved for publishing'
      });
    }

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        reviewerId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reviewer: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return res.json({
      success: true,
      message: 'Article published successfully',
      data: { article: updatedArticle }
    });

  } catch (error) {
    console.error('Publish article error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update article (Author only)
export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const authorId = req.user.userId;
    const { title, content, excerpt, coverImage, videoUrl, category, tags } = req.body;

    const article = await prisma.article.findFirst({
      where: {
        id,
        authorId // Ensure the user owns the article
      }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Only allow updates to drafts or rejected articles
    if (!['DRAFT', 'REJECTED'].includes(article.status)) {
      return res.status(400).json({
        success: false,
        message: 'Can only update draft or rejected articles'
      });
    }

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (content) updateData.content = content;
    if (excerpt) updateData.excerpt = excerpt.trim();
    if (coverImage) updateData.coverImage = coverImage;
    if (videoUrl) updateData.videoUrl = videoUrl;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags;

    // Recalculate read time if content changed
    if (content) {
      const wordCount = content.split(/\s+/).length;
      updateData.readTime = Math.ceil(wordCount / 200);
    }

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        ...updateData,
        status: 'DRAFT', // Reset to draft after update
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return res.json({
      success: true,
      message: 'Article updated successfully',
      data: { article: updatedArticle }
    });

  } catch (error) {
    console.error('Update article error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete article (Author or Admin)
export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const article = await prisma.article.findFirst({
      where: { id }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check if user is author or has admin privileges
    // I'll need to implement role checking here
    if (article.authorId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this article'
      });
    }

    await prisma.article.delete({
      where: { id }
    });

    return res.json({
      success: true,
      message: 'Article deleted successfully'
    });

  } catch (error) {
    console.error('Delete article error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};