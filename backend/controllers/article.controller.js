import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Current date/time for consistent logging
const getCurrentDateTime = () => {
  return '2025-10-24 14:58:00';
};

// Create a new article (Content Writers & above) - ENHANCED WITH DEBUG
export const createArticle = async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, videoUrl, category, tags } = req.body;
    const authorId = req.user.userId;

    console.log(`📝 [${getCurrentDateTime()}] createArticle called by ArogoClin with data:`, {
      title: title?.substring(0, 50) + '...',
      hasContent: !!content,
      contentLength: content?.length,
      excerpt: excerpt?.substring(0, 50) + '...',
      category,
      tags,
      tagsType: typeof tags,
      tagsLength: Array.isArray(tags) ? tags.length : 'not array',
      tagsArray: Array.isArray(tags) ? tags : 'not array',
      coverImage: !!coverImage,
      videoUrl: !!videoUrl,
      authorId
    });

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Process tags - ensure it's an array
    let processedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags.filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0);
      } else if (typeof tags === 'string') {
        // If somehow tags comes as a string, try to parse it
        try {
          processedTags = JSON.parse(tags);
        } catch {
          processedTags = [tags]; // If parsing fails, treat as single tag
        }
      }
    }

    console.log(`🏷️ [${getCurrentDateTime()}] ArogoClin processed tags:`, {
      originalTags: tags,
      processedTags,
      processedType: typeof processedTags,
      processedLength: processedTags.length
    });

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Calculate read time (approx 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    console.log(`📊 [${getCurrentDateTime()}] Article metadata for ArogoClin:`, {
      slug,
      wordCount,
      readTime,
      finalTags: processedTags
    });

    const article = await prisma.article.create({
      data: {
        title: title.trim(),
        content,
        excerpt: excerpt?.trim() || null,
        coverImage: coverImage || null,
        videoUrl: videoUrl || null,
        category: category || null,
        tags: processedTags, // Use processed tags
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

    console.log(`✅ [${getCurrentDateTime()}] Article created successfully by ArogoClin:`, {
      id: article.id.substring(0, 8),
      title: article.title,
      status: article.status,
      tags: article.tags,
      tagsInDB: typeof article.tags,
      tagsCount: article.tags?.length || 0,
      category: article.category
    });

    return res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: { article }
    });

  } catch (error) {
    console.error(`❌ [${getCurrentDateTime()}] Create article error for ArogoClin:`, error);
    
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

// Submit article for review - FIXED to handle REJECTED articles
export const submitForReview = async (req, res) => {
  try {
    const { id } = req.params;
    const authorId = req.user.userId;

    console.log(`📝 [${getCurrentDateTime()}] submitForReview called by ArogoClin:`, { 
      id: id.substring(0, 8), 
      authorId 
    });

    const article = await prisma.article.findFirst({
      where: {
        id,
        authorId // Ensure the user owns the article
      }
    });

    if (!article) {
      console.log(`❌ [${getCurrentDateTime()}] Article not found for ArogoClin:`, { id: id.substring(0, 8), authorId });
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    console.log(`📄 [${getCurrentDateTime()}] Found article for submission by ArogoClin:`, {
      id: article.id.substring(0, 8),
      title: article.title.substring(0, 30) + '...',
      currentStatus: article.status
    });

    // FIXED: Allow submission for both DRAFT and REJECTED articles
    if (article.status !== 'DRAFT' && article.status !== 'REJECTED') {
      console.log(`❌ [${getCurrentDateTime()}] Invalid status for submission by ArogoClin:`, {
        id: id.substring(0, 8),
        currentStatus: article.status,
        allowedStatuses: ['DRAFT', 'REJECTED']
      });
      return res.status(400).json({
        success: false,
        message: `Cannot submit article for review. Current status is "${article.status}". Only DRAFT or REJECTED articles can be submitted for review.`
      });
    }

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        updatedAt: new Date()
        // REMOVED: reviewerId - not a valid field
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

    console.log(`✅ [${getCurrentDateTime()}] Article submitted for review by ArogoClin:`, {
      id: updatedArticle.id.substring(0, 8),
      oldStatus: article.status,
      newStatus: updatedArticle.status,
      title: updatedArticle.title.substring(0, 30) + '...'
    });

    return res.json({
      success: true,
      message: `Article submitted for review successfully. Status changed from ${article.status} to SUBMITTED.`,
      data: { article: updatedArticle }
    });

  } catch (error) {
    console.error(`❌ [${getCurrentDateTime()}] Submit for review error for ArogoClin:`, error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all articles with filtering (Public & Admin) - ENHANCED
export const getArticles = async (req, res) => {
  try {
    const { 
      status, 
      category, 
      authorId, 
      page = 1, 
      limit = 10,
      publishedOnly = 'true' 
    } = req.query;

    console.log(`🔍 [${getCurrentDateTime()}] getArticles called by ArogoClin with:`, {
      status,
      category,
      authorId,
      page,
      limit,
      publishedOnly,
      hasUser: !!req.user,
      userRole: req.user?.role,
      userId: req.user?.userId
    });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Base where clause
    let where = {};
    
    // Handle filtering logic based on user and publishedOnly flag
    if (publishedOnly === 'true') {
      // Public query: only published articles
      where.status = 'PUBLISHED';
      console.log(`📚 [${getCurrentDateTime()}] Public query: filtering for PUBLISHED articles only`);
    } else if (req.user) {
      // Admin/authenticated user query
      if (status) {
        where.status = status;
        console.log(`🔐 [${getCurrentDateTime()}] Admin query by ArogoClin: filtering for status:`, status);
      }
      
      // FIXED: If no specific authorId is provided, filter by current user's articles
      if (!authorId) {
        where.authorId = req.user.userId;
        console.log(`👤 [${getCurrentDateTime()}] Filtering articles for ArogoClin (${req.user.userId})`);
      } else if (authorId) {
        where.authorId = authorId;
        console.log(`👤 [${getCurrentDateTime()}] Filtering articles for specific author:`, authorId);
      }
    }
    
    if (category) {
      where.category = category;
    }

    console.log(`🔍 [${getCurrentDateTime()}] Final where clause for ArogoClin:`, where);

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
          updatedAt: 'desc' // Changed to show recently updated articles first
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.article.count({ where })
    ]);

    console.log(`📦 [${getCurrentDateTime()}] Query result for ArogoClin:`, {
      totalFound: total,
      articlesReturned: articles.length,
      statuses: articles.map(a => ({ id: a.id.substring(0, 8), status: a.status }))
    });

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
    console.error(`❌ [${getCurrentDateTime()}] Get articles error for ArogoClin:`, error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single article - ENHANCED
export const getArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdminRoute = req.path.includes('/admin');

    console.log(`📖 [${getCurrentDateTime()}] getArticle called by ArogoClin:`, {
      id: id.substring(0, 8),
      isAdminRoute,
      hasUser: !!req.user,
      userRole: req.user?.role,
      userId: req.user?.userId
    });

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
      console.log(`❌ [${getCurrentDateTime()}] Article not found in database for ArogoClin:`, id.substring(0, 8));
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    console.log(`📄 [${getCurrentDateTime()}] Found article for ArogoClin:`, {
      id: article.id.substring(0, 8),
      title: article.title.substring(0, 30) + '...',
      status: article.status,
      authorId: article.authorId,
      requestUserId: req.user?.userId
    });

    // For admin routes or authenticated users, check ownership or admin rights
    if (isAdminRoute || req.user) {
      // Check if user is the author or has admin privileges
      const isAuthor = req.user?.userId === article.authorId;
      const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'CONTENT_LEAD';
      
      if (!isAuthor && !isAdmin) {
        console.log(`❌ [${getCurrentDateTime()}] Access denied for ArogoClin - not author or admin:`, {
          userId: req.user?.userId,
          authorId: article.authorId,
          userRole: req.user?.role
        });
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this article'
        });
      }

      // Admin/author can see any status
      console.log(`✅ [${getCurrentDateTime()}] Admin/Author access granted to ArogoClin`);
      return res.json({
        success: true,
        data: { article }
      });
    }

    // For public access, only show published articles
    if (article.status !== 'PUBLISHED') {
      console.log(`❌ [${getCurrentDateTime()}] Public access denied - article not published:`, article.status);
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    console.log(`✅ [${getCurrentDateTime()}] Public access granted for published article`);
    return res.json({
      success: true,
      data: { article }
    });

  } catch (error) {
    console.error(`❌ [${getCurrentDateTime()}] Get article error for ArogoClin:`, error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Content Lead: Review and approve/reject articles - ENHANCED
export const reviewArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, feedback } = req.body; // action: 'approve', 'reject'
    const reviewerId = req.user.userId;

    console.log(`🔍 [${getCurrentDateTime()}] reviewArticle called by ArogoClin:`, { 
      id: id.substring(0, 8), 
      action, 
      reviewerId,
      hasFeedback: !!feedback 
    });

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
      console.log(`❌ [${getCurrentDateTime()}] Article not found or not ready for review by ArogoClin:`, {
        id: id.substring(0, 8),
        expectedStatus: 'SUBMITTED'
      });
      return res.status(404).json({
        success: false,
        message: 'Article not found or not ready for review'
      });
    }

    // FIXED: Build update data without reviewerId field
    let updateData = {
      updatedAt: new Date()
    };

    if (action === 'approve') {
      updateData.status = 'APPROVED';
      // Connect the reviewer relation if the field exists in your schema
      if (reviewerId) {
        updateData.reviewer = {
          connect: { id: reviewerId }
        };
      }
      console.log(`✅ [${getCurrentDateTime()}] ArogoClin approving article (status will be APPROVED, not PUBLISHED)`);
    } else {
      updateData.status = 'REJECTED';
      // Store feedback for rejected articles if the field exists
      if (feedback) {
        updateData.reviewFeedback = feedback.trim();
      }
      // Connect the reviewer relation if the field exists in your schema
      if (reviewerId) {
        updateData.reviewer = {
          connect: { id: reviewerId }
        };
      }
      console.log(`❌ [${getCurrentDateTime()}] ArogoClin rejecting article with feedback:`, !!feedback);
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

    console.log(`📝 [${getCurrentDateTime()}] Article review completed by ArogoClin:`, {
      id: updatedArticle.id.substring(0, 8),
      oldStatus: article.status,
      newStatus: updatedArticle.status,
      publishedAt: updatedArticle.publishedAt,
      reviewerId: updatedArticle.reviewer?.id
    });

    return res.json({
      success: true,
      message: `Article ${action === 'approve' ? 'approved' : 'rejected'} successfully by ArogoClin`,
      data: { article: updatedArticle }
    });

  } catch (error) {
    console.error(`❌ [${getCurrentDateTime()}] Review article error for ArogoClin:`, error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Content Lead: Publish approved article - ENHANCED
export const publishArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const reviewerId = req.user.userId;

    console.log(`🚀 [${getCurrentDateTime()}] publishArticle called by ArogoClin:`, { 
      id: id.substring(0, 8), 
      reviewerId 
    });

    const article = await prisma.article.findFirst({
      where: {
        id,
        status: 'APPROVED' // Only publish approved articles
      }
    });

    if (!article) {
      console.log(`❌ [${getCurrentDateTime()}] Article not found or not approved for ArogoClin:`, { 
        id: id.substring(0, 8), 
        currentStatus: article?.status 
      });
      return res.status(404).json({
        success: false,
        message: 'Article not found or not approved for publishing'
      });
    }

    // FIXED: Build update data without reviewerId field
    const updateData = {
      status: 'PUBLISHED',
      publishedAt: new Date()
    };

    // Connect the reviewer relation if needed
    if (reviewerId) {
      updateData.reviewer = {
        connect: { id: reviewerId }
      };
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

    console.log(`🎉 [${getCurrentDateTime()}] Article published successfully by ArogoClin:`, {
      id: updatedArticle.id.substring(0, 8),
      title: updatedArticle.title.substring(0, 30) + '...',
      status: updatedArticle.status,
      publishedAt: updatedArticle.publishedAt
    });

    return res.json({
      success: true,
      message: 'Article published successfully by ArogoClin',
      data: { article: updatedArticle }
    });

  } catch (error) {
    console.error(`❌ [${getCurrentDateTime()}] Publish article error for ArogoClin:`, error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update article (Author only) - FIXED to remove reviewerId and reviewFeedback references
export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const authorId = req.user.userId;
    const { title, content, excerpt, coverImage, videoUrl, category, tags } = req.body;

    console.log(`📝 [${getCurrentDateTime()}] updateArticle called by ArogoClin:`, { 
      id: id.substring(0, 8), 
      authorId, 
      userRole: req.user.role,
      hasTitle: !!title,
      titleLength: title?.length || 0,
      hasContent: !!content,
      contentLength: content?.length || 0,
      hasExcerpt: !!excerpt,
      hasCategory: !!category,
      hasCoverImage: !!coverImage,
      hasVideoUrl: !!videoUrl,
      hasTagsArray: Array.isArray(tags),
      tagsLength: Array.isArray(tags) ? tags.length : 'not array',
      tagsType: typeof tags
    });

    // Enhanced validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      console.log(`❌ [${getCurrentDateTime()}] Invalid title for ArogoClin:`, { title, titleType: typeof title });
      return res.status(400).json({
        success: false,
        message: 'Title is required and must be a non-empty string'
      });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      console.log(`❌ [${getCurrentDateTime()}] Invalid content for ArogoClin:`, { hasContent: !!content, contentType: typeof content });
      return res.status(400).json({
        success: false,
        message: 'Content is required and must be a non-empty string'
      });
    }

    const article = await prisma.article.findFirst({
      where: {
        id,
        authorId // Ensure the user owns the article
      }
    });

    if (!article) {
      console.log(`❌ [${getCurrentDateTime()}] Article not found for ArogoClin:`, { id: id.substring(0, 8), authorId });
      return res.status(404).json({
        success: false,
        message: 'Article not found or you do not have permission to edit this article'
      });
    }

    console.log(`📄 [${getCurrentDateTime()}] Found article for ArogoClin:`, {
      id: article.id.substring(0, 8),
      title: article.title.substring(0, 30) + '...',
      currentStatus: article.status,
      authorId: article.authorId
    });

    // Process and validate tags
    let processedTags = [];
    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        processedTags = tags.filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0);
      } else if (typeof tags === 'string') {
        try {
          const parsedTags = JSON.parse(tags);
          if (Array.isArray(parsedTags)) {
            processedTags = parsedTags.filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0);
          } else {
            processedTags = [tags.trim()].filter(tag => tag.length > 0);
          }
        } catch {
          processedTags = [tags.trim()].filter(tag => tag.length > 0);
        }
      } else {
        processedTags = [];
      }
    } else {
      processedTags = article.tags || [];
    }

    console.log(`🏷️ [${getCurrentDateTime()}] Processed tags for ArogoClin:`, {
      originalTags: tags,
      originalType: typeof tags,
      processedTags,
      processedLength: processedTags.length
    });

    // Build update data with enhanced validation - REMOVED reviewerId and reviewFeedback
    const updateData = {
      updatedAt: new Date()
    };

    // Only update fields that are provided and valid
    if (title !== undefined) {
      updateData.title = title.trim();
    }
    
    if (content !== undefined) {
      updateData.content = content;
      // Recalculate read time if content changed
      const wordCount = content.split(/\s+/).length;
      updateData.readTime = Math.ceil(wordCount / 200);
    }
    
    if (excerpt !== undefined) {
      updateData.excerpt = excerpt?.trim() || null;
    }
    
    if (coverImage !== undefined) {
      updateData.coverImage = coverImage?.trim() || null;
    }
    
    if (videoUrl !== undefined) {
      updateData.videoUrl = videoUrl?.trim() || null;
    }
    
    if (category !== undefined) {
      updateData.category = category?.trim() || null;
    }
    
    if (tags !== undefined) {
      updateData.tags = processedTags;
    }

    // Handle status changes based on current status
    if (article.status === 'PUBLISHED' || article.status === 'APPROVED') {
      updateData.status = 'DRAFT';
      updateData.publishedAt = null;
      // FIXED: Disconnect reviewer relation instead of setting reviewerId
      updateData.reviewer = {
        disconnect: true
      };
      console.log(`🔄 [${getCurrentDateTime()}] ArogoClin resetting status to DRAFT for ${article.status} article`);
    } else if (article.status === 'SUBMITTED') {
      updateData.status = 'DRAFT';
      // FIXED: Disconnect reviewer relation if it exists
      if (article.reviewer) {
        updateData.reviewer = {
          disconnect: true
        };
      }
      console.log(`🔄 [${getCurrentDateTime()}] ArogoClin resetting status to DRAFT for submitted article`);
    } else if (article.status === 'REJECTED') {
      updateData.status = 'DRAFT';
      // FIXED: Disconnect reviewer relation if it exists
      if (article.reviewer) {
        updateData.reviewer = {
          disconnect: true
        };
      }
      console.log(`🔄 [${getCurrentDateTime()}] ArogoClin changing REJECTED article to DRAFT status and clearing reviewer`);
    }

    console.log(`💾 [${getCurrentDateTime()}] Update data for ArogoClin:`, {
      ...updateData,
      content: updateData.content ? `${updateData.content.substring(0, 50)}...` : undefined,
      tags: updateData.tags
    });

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

    console.log(`✅ [${getCurrentDateTime()}] Article updated successfully by ArogoClin:`, {
      id: updatedArticle.id.substring(0, 8),
      oldStatus: article.status,
      newStatus: updatedArticle.status,
      title: updatedArticle.title.substring(0, 30) + '...',
      tagsCount: updatedArticle.tags?.length || 0
    });

    return res.json({
      success: true,
      message: `Article updated successfully by ArogoClin. Status changed from ${article.status} to ${updatedArticle.status}.`,
      data: { article: updatedArticle }
    });

  } catch (error) {
    console.error(`❌ [${getCurrentDateTime()}] Update article error for ArogoClin:`, {
      error: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta,
      articleId: req.params.id?.substring(0, 8),
      userId: req.user?.userId
    });

    // Enhanced error response
    let errorMessage = 'Internal server error while updating article';
    let statusCode = 500;

    if (error.code === 'P2002') {
      errorMessage = 'An article with this title already exists';
      statusCode = 409;
    } else if (error.code === 'P2025') {
      errorMessage = 'Article not found';
      statusCode = 404;
    } else if (error.message.includes('validation')) {
      errorMessage = 'Invalid data provided: ' + error.message;
      statusCode = 400;
    } else if (error.message.includes('Unknown argument')) {
      errorMessage = 'Database schema mismatch - please check your Prisma schema';
      statusCode = 500;
    }

    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      debug: process.env.NODE_ENV === 'development' ? {
        originalError: error.message,
        code: error.code,
        timestamp: getCurrentDateTime()
      } : undefined
    });
  }
};

// Content Lead: Unpublish published article - ENHANCED
export const unpublishArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const reviewerId = req.user.userId;

    console.log(`📤 [${getCurrentDateTime()}] unpublishArticle called by ArogoClin:`, { 
      id: id.substring(0, 8), 
      reviewerId 
    });

    const article = await prisma.article.findFirst({
      where: {
        id,
        status: 'PUBLISHED' // Only unpublish published articles
      }
    });

    if (!article) {
      console.log(`❌ [${getCurrentDateTime()}] Article not found or not published for ArogoClin:`, { 
        id: id.substring(0, 8), 
        currentStatus: article?.status 
      });
      return res.status(404).json({
        success: false,
        message: 'Article not found or not published'
      });
    }

    // FIXED: Build update data without reviewerId field
    const updateData = {
      status: 'APPROVED'
      // Keep publishedAt for reference but article won't show as published
    };

    // Connect the reviewer relation if needed
    if (reviewerId) {
      updateData.reviewer = {
        connect: { id: reviewerId }
      };
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

    console.log(`📤 [${getCurrentDateTime()}] Article unpublished successfully by ArogoClin:`, {
      id: updatedArticle.id.substring(0, 8),
      title: updatedArticle.title.substring(0, 30) + '...',
      oldStatus: article.status,
      newStatus: updatedArticle.status,
      publishedAt: updatedArticle.publishedAt
    });

    return res.json({
      success: true,
      message: 'Article unpublished successfully by ArogoClin',
      data: { article: updatedArticle }
    });

  } catch (error) {
    console.error(`❌ [${getCurrentDateTime()}] Unpublish article error for ArogoClin:`, error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete article (Author or Admin) - ENHANCED
export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    console.log(`🗑️ [${getCurrentDateTime()}] deleteArticle called by ArogoClin:`, { 
      id: id.substring(0, 8), 
      userId 
    });

    const article = await prisma.article.findFirst({
      where: { id }
    });

    if (!article) {
      console.log(`❌ [${getCurrentDateTime()}] Article not found for deletion by ArogoClin:`, { id: id.substring(0, 8) });
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    console.log(`📄 [${getCurrentDateTime()}] Found article for deletion by ArogoClin:`, {
      id: article.id.substring(0, 8),
      title: article.title.substring(0, 30) + '...',
      status: article.status,
      authorId: article.authorId
    });

    // Check if user is author or has admin privileges
    const isAuthor = article.authorId === userId;
    const isAdmin = req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'CONTENT_LEAD';
    
    if (!isAuthor && !isAdmin) {
      console.log(`❌ [${getCurrentDateTime()}] Not authorized to delete article for ArogoClin:`, {
        userId,
        authorId: article.authorId,
        userRole: req.user?.role
      });
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this article'
      });
    }

    await prisma.article.delete({
      where: { id }
    });

    console.log(`✅ [${getCurrentDateTime()}] Article deleted successfully by ArogoClin:`, {
      id: id.substring(0, 8),
      title: article.title.substring(0, 30) + '...'
    });

    return res.json({
      success: true,
      message: 'Article deleted successfully by ArogoClin'
    });

  } catch (error) {
    console.error(`❌ [${getCurrentDateTime()}] Delete article error for ArogoClin:`, error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};