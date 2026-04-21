import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Current date/time for consistent logging
const getCurrentDateTime = () => {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19);
};

// Create a new article (Content Writers & above)
export const createArticle = async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, videoUrl, category, tags } = req.body;
    const authorId = req.user.userId;

    console.log(`📝 [${getCurrentDateTime()}] createArticle called by ${req.user.name} (${req.user.role}) with data:`, {
      title: title?.substring(0, 50) + '...',
      hasContent: !!content,
      contentLength: content?.length,
      excerpt: excerpt?.substring(0, 50) + '...',
      category,
      tags,
      tagsType: typeof tags,
      tagsLength: Array.isArray(tags) ? tags.length : 'not array',
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
        try {
          processedTags = JSON.parse(tags);
        } catch {
          processedTags = [tags];
        }
      }
    }

    console.log(`🏷️ [${getCurrentDateTime()}] ${req.user.name} processed tags:`, {
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

    console.log(`📊 [${getCurrentDateTime()}] Article metadata for ${req.user.name}:`, {
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
        tags: processedTags,
        readTime,
        slug,
        authorId,
        status: 'DRAFT'
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

    console.log(`✅ [${getCurrentDateTime()}] Article created successfully by ${req.user.name}:`, {
      id: article.id.substring(0, 8),
      title: article.title,
      status: article.status,
      tags: article.tags,
      tagsCount: article.tags?.length || 0,
      category: article.category
    });

    return res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: { article }
    });

  } catch (error) {
    console.error(`❌ [${getCurrentDateTime()}] Create article error for ${req.user?.name}:`, error);
    
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

    console.log(`📝 [${getCurrentDateTime()}] submitForReview called by ${req.user.name}:`, { 
      id: id.substring(0, 8), 
      authorId 
    });

    const article = await prisma.article.findFirst({
      where: {
        id,
        authorId
      }
    });

    if (!article) {
      console.log(`❌ [${getCurrentDateTime()}] Article not found for ${req.user.name}:`, { id: id.substring(0, 8), authorId });
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    console.log(`📄 [${getCurrentDateTime()}] Found article for submission by ${req.user.name}:`, {
      id: article.id.substring(0, 8),
      title: article.title.substring(0, 30) + '...',
      currentStatus: article.status
    });

    if (article.status !== 'DRAFT' && article.status !== 'REJECTED') {
      console.log(`❌ [${getCurrentDateTime()}] Invalid status for submission by ${req.user.name}:`, {
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

    console.log(`✅ [${getCurrentDateTime()}] Article submitted for review by ${req.user.name}:`, {
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
    console.error(`❌ [${getCurrentDateTime()}] Submit for review error for ${req.user?.name}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


export const getArticles = async (req, res) => {
  try {
    const user = req.user; // ✅ Can be null for public users
    const { 
      status, 
      category, 
      authorId, 
      page = 1, 
      limit = 10,
      publishedOnly = 'true' 
    } = req.query;

    console.log(`🔍 [${getCurrentDateTime()}] getArticles called by ${user?.name || 'Public'} (${user?.role || 'Public'}) with:`, {
      status,
      category,
      authorId,
      page,
      limit,
      publishedOnly,
      hasUser: !!user,
      userRole: user?.role,
      userId: user?.userId
    });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Base where clause
    let where = {};
    
    // ✅ HANDLE PUBLIC VS AUTHENTICATED ACCESS
    if (!user || publishedOnly === 'true') {
      // Public users or explicit publishedOnly query: only PUBLISHED articles
      where.status = 'PUBLISHED';
      console.log(`📚 [${getCurrentDateTime()}] Public/publishedOnly query: filtering for PUBLISHED articles only`);
    } else {
      // Authenticated users with publishedOnly=false
      
      // Role-based filtering
      if (user.role === 'CONTENT_WRITER') {
        // Content Writers can ONLY see their own articles
        where.authorId = user.userId;
        console.log(`👤 [${getCurrentDateTime()}] CONTENT_WRITER ${user.name}: Filtering for OWN articles only`);
      } else if (user.role === 'CONTENT_LEAD' || user.role === 'SUPER_ADMIN') {
        // Content Leads and Super Admins can see all articles
        console.log(`🔐 [${getCurrentDateTime()}] ${user.role} ${user.name}: Access to ALL articles`);
        
        // Apply specific author filter if provided
        if (authorId) {
          where.authorId = authorId;
          console.log(`👤 [${getCurrentDateTime()}] Admin filtering for specific author:`, authorId);
        }
      }
      
      // Apply status filter if provided
      if (status) {
        where.status = status;
        console.log(`📊 [${getCurrentDateTime()}] Status filter applied:`, status);
      }
    }
    
    // Apply category filter (works for both public and authenticated)
    if (category) {
      where.category = category;
      console.log(`🏷️ [${getCurrentDateTime()}] Category filter applied:`, category);
    }

    console.log(`🔍 [${getCurrentDateTime()}] Final where clause for ${user?.name || 'Public'}:`, where);

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
          updatedAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.article.count({ where })
    ]);

    console.log(`📦 [${getCurrentDateTime()}] Query result for ${user?.name || 'Public'}:`, { // ← FIXED LINE
      totalFound: total,
      articlesReturned: articles.length,
      userRole: user?.role,
      statuses: articles.map(a => ({ 
        id: a.id.substring(0, 8), 
        status: a.status,
        author: a.author.name,
        isOwnArticle: user && a.authorId === user.userId
      }))
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
    console.error(`❌ [${getCurrentDateTime()}] Get articles error for ${req.user?.name || 'Public'}:`, error); // ← ALSO FIX THIS LINE
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
    const user = req.user; // ✅ Can be null for public users

    console.log(`📖 [${getCurrentDateTime()}] getArticle called by ${user?. name || 'Public'}:`, {
      id: id.substring(0, 8),
      hasUser: !!user,
      userRole: user?.role,
      userId: user?.userId
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
      console.log(`❌ [${getCurrentDateTime()}] Article not found in database:`, id.substring(0, 8));
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    console.log(`📄 [${getCurrentDateTime()}] Found article for ${user?.name || 'Public'}:`, {
      id: article.id.substring(0, 8),
      title: article.title.substring(0, 30) + '...',
      status: article.status,
      authorId: article.authorId,
      requestUserId: user?.userId
    });

    // ✅ PUBLIC ACCESS: Allow anyone to view PUBLISHED articles
    if (article.status === 'PUBLISHED') {
      console.log(`✅ [${getCurrentDateTime()}] Public access granted for published article`);
      return res.json({
        success: true,
        data: { article }
      });
    }

    // ✅ RESTRICTED ACCESS: Only authenticated users can see non-published
    if (! user) {
      console.log(`❌ [${getCurrentDateTime()}] Public access denied - article not published:`, article.status);
      return res.status(403).json({
        success: false,
        message: 'This article has not been published yet'
      });
    }

    // Check if user is author or has admin rights
    const isAuthor = user. userId === article.authorId;
    const isContentLead = user.role === 'CONTENT_LEAD';
    const isSuperAdmin = user.role === 'SUPER_ADMIN';
    
    // Content Writers can only see their own articles
    if (user.role === 'CONTENT_WRITER' && !isAuthor) {
      console.log(`❌ [${getCurrentDateTime()}] Access denied for CONTENT_WRITER ${user.name} - not author:`, {
        userId: user. userId,
        authorId: article.authorId
      });
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this article'
      });
    }
    
    // Content Leads and Super Admins can see any article
    if (! isAuthor && !isContentLead && !isSuperAdmin) {
      console.log(`❌ [${getCurrentDateTime()}] Access denied - not author or admin:`, {
        userId: user.userId,
        authorId: article.authorId,
        userRole: user.role
      });
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this article'
      });
    }

    console.log(`✅ [${getCurrentDateTime()}] Admin/Author access granted to ${user. name}`);
    return res.json({
      success: true,
      data: { article }
    });

  } catch (error) {
    console.error(`❌ [${getCurrentDateTime()}] Get article error:`, error);
    return res. status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Content Lead: Review and approve/reject articles
export const reviewArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, feedback } = req.body;
    const reviewerId = req.user.userId;

    console.log(`🔍 [${getCurrentDateTime()}] reviewArticle called by ${req.user.name} (${req.user.role}):`, { 
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
        status: 'SUBMITTED'
      }
    });

    if (!article) {
      console.log(`❌ [${getCurrentDateTime()}] Article not found or not ready for review by ${req.user.name}:`, {
        id: id.substring(0, 8),
        expectedStatus: 'SUBMITTED'
      });
      return res.status(404).json({
        success: false,
        message: 'Article not found or not ready for review'
      });
    }

    let updateData = {
      updatedAt: new Date()
    };

    if (action === 'approve') {
      updateData.status = 'APPROVED';
      if (reviewerId) {
        updateData.reviewer = {
          connect: { id: reviewerId }
        };
      }
      console.log(`✅ [${getCurrentDateTime()}] ${req.user.name} approving article`);
    } else {
      updateData.status = 'REJECTED';
      if (feedback) {
        updateData.reviewFeedback = feedback.trim();
      }
      if (reviewerId) {
        updateData.reviewer = {
          connect: { id: reviewerId }
        };
      }
      console.log(`❌ [${getCurrentDateTime()}] ${req.user.name} rejecting article with feedback:`, !!feedback);
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

    console.log(`📝 [${getCurrentDateTime()}] Article review completed by ${req.user.name}:`, {
      id: updatedArticle.id.substring(0, 8),
      oldStatus: article.status,
      newStatus: updatedArticle.status,
      reviewerId: updatedArticle.reviewer?.id
    });

    return res.json({
      success: true,
      message: `Article ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      data: { article: updatedArticle }
    });

  } catch (error) {
    console.error(`❌ [${getCurrentDateTime()}] Review article error for ${req.user?.name}:`, error);
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

    console.log(`🚀 [${getCurrentDateTime()}] publishArticle called by ${req.user.name} (${req.user.role}):`, { 
      id: id.substring(0, 8), 
      reviewerId 
    });

    const article = await prisma.article.findFirst({
      where: {
        id,
        status: 'APPROVED'
      }
    });

    if (!article) {
      console.log(`❌ [${getCurrentDateTime()}] Article not found or not approved for ${req.user.name}:`, { 
        id: id.substring(0, 8), 
        currentStatus: article?.status 
      });
      return res.status(404).json({
        success: false,
        message: 'Article not found or not approved for publishing'
      });
    }

    const updateData = {
      status: 'PUBLISHED',
      publishedAt: new Date()
    };

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

    console.log(`🎉 [${getCurrentDateTime()}] Article published successfully by ${req.user.name}:`, {
      id: updatedArticle.id.substring(0, 8),
      title: updatedArticle.title.substring(0, 30) + '...',
      status: updatedArticle.status,
      publishedAt: updatedArticle.publishedAt
    });

    return res.json({
      success: true,
      message: 'Article published successfully',
      data: { article: updatedArticle }
    });

  } catch (error) {
    console.error(`❌ [${getCurrentDateTime()}] Publish article error for ${req.user?.name}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update article (Author only, or Content Lead/Super Admin)
export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { title, content, excerpt, coverImage, videoUrl, category, tags } = req.body;

    console.log(`📝 [${getCurrentDateTime()}] updateArticle called by ${req.user.name} (${req.user.role}):`, { 
      id: id.substring(0, 8), 
      userId, 
      userRole: req.user.role,
      hasTitle: !!title,
      hasContent: !!content
    });

    // Enhanced validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      console.log(`❌ [${getCurrentDateTime()}] Invalid title for ${req.user.name}:`, { title, titleType: typeof title });
      return res.status(400).json({
        success: false,
        message: 'Title is required and must be a non-empty string'
      });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      console.log(`❌ [${getCurrentDateTime()}] Invalid content for ${req.user.name}:`, { hasContent: !!content, contentType: typeof content });
      return res.status(400).json({
        success: false,
        message: 'Content is required and must be a non-empty string'
      });
    }

    const article = await prisma.article.findUnique({
      where: { id }
    });

    if (!article) {
      console.log(`❌ [${getCurrentDateTime()}] Article not found for ${req.user.name}:`, { id: id.substring(0, 8), userId });
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check permissions
    const isAuthor = article.authorId === userId;
    const isContentLead = req.user.role === 'CONTENT_LEAD';
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

    // Content Writers can only edit their own articles
    if (req.user.role === 'CONTENT_WRITER' && !isAuthor) {
      console.log(`❌ [${getCurrentDateTime()}] CONTENT_WRITER ${req.user.name} cannot edit other's article:`, {
        userId,
        authorId: article.authorId
      });
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own articles'
      });
    }

    // Content Leads and Super Admins can edit any article
    if (!isAuthor && !isContentLead && !isSuperAdmin) {
      console.log(`❌ [${getCurrentDateTime()}] ${req.user.name} not authorized to edit article:`, {
        userId,
        authorId: article.authorId,
        userRole: req.user.role
      });
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this article'
      });
    }

    console.log(`📄 [${getCurrentDateTime()}] Found article for ${req.user.name}:`, {
      id: article.id.substring(0, 8),
      title: article.title.substring(0, 30) + '...',
      currentStatus: article.status,
      authorId: article.authorId,
      isAuthor,
      canEdit: isAuthor || isContentLead || isSuperAdmin
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

    console.log(`🏷️ [${getCurrentDateTime()}] Processed tags for ${req.user.name}:`, {
      originalTags: tags,
      processedTags,
      processedLength: processedTags.length
    });

    // Build update data
    const updateData = {
      updatedAt: new Date()
    };

    if (title !== undefined) {
      updateData.title = title.trim();
    }
    
    if (content !== undefined) {
      updateData.content = content;
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
      updateData.reviewer = { disconnect: true };
      console.log(`🔄 [${getCurrentDateTime()}] ${req.user.name} resetting status to DRAFT for ${article.status} article`);
    } else if (article.status === 'SUBMITTED') {
      updateData.status = 'DRAFT';
      if (article.reviewer) {
        updateData.reviewer = { disconnect: true };
      }
      console.log(`🔄 [${getCurrentDateTime()}] ${req.user.name} resetting status to DRAFT for submitted article`);
    } else if (article.status === 'REJECTED') {
      updateData.status = 'DRAFT';
      if (article.reviewer) {
        updateData.reviewer = { disconnect: true };
      }
      console.log(`🔄 [${getCurrentDateTime()}] ${req.user.name} changing REJECTED article to DRAFT status`);
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

    console.log(`✅ [${getCurrentDateTime()}] Article updated successfully by ${req.user.name}:`, {
      id: updatedArticle.id.substring(0, 8),
      oldStatus: article.status,
      newStatus: updatedArticle.status,
      title: updatedArticle.title.substring(0, 30) + '...',
      tagsCount: updatedArticle.tags?.length || 0
    });

    return res.json({
      success: true,
      message: `Article updated successfully. Status changed from ${article.status} to ${updatedArticle.status}.`,
      data: { article: updatedArticle }
    });

  } catch (error) {
    console.error(`❌ [${getCurrentDateTime()}] Update article error for ${req.user?.name}:`, {
      error: error.message,
      code: error.code,
      articleId: req.params.id?.substring(0, 8),
      userId: req.user?.userId
    });

    let errorMessage = 'Internal server error while updating article';
    let statusCode = 500;

    if (error.code === 'P2002') {
      errorMessage = 'An article with this title already exists';
      statusCode = 409;
    } else if (error.code === 'P2025') {
      errorMessage = 'Article not found';
      statusCode = 404;
    }

    return res.status(statusCode).json({
      success: false,
      message: errorMessage
    });
  }
};

// Content Lead: Unpublish published article
export const unpublishArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const reviewerId = req.user.userId;

    console.log(`📤 [${getCurrentDateTime()}] unpublishArticle called by ${req.user.name} (${req.user.role}):`, { 
      id: id.substring(0, 8), 
      reviewerId 
    });

    const article = await prisma.article.findFirst({
      where: {
        id,
        status: 'PUBLISHED'
      }
    });

    if (!article) {
      console.log(`❌ [${getCurrentDateTime()}] Article not found or not published for ${req.user.name}:`, { 
        id: id.substring(0, 8), 
        currentStatus: article?.status 
      });
      return res.status(404).json({
        success: false,
        message: 'Article not found or not published'
      });
    }

    const updateData = {
      status: 'APPROVED'
    };

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

    console.log(`📤 [${getCurrentDateTime()}] Article unpublished successfully by ${req.user.name}:`, {
      id: updatedArticle.id.substring(0, 8),
      title: updatedArticle.title.substring(0, 30) + '...',
      oldStatus: article.status,
      newStatus: updatedArticle.status
    });

    return res.json({
      success: true,
      message: 'Article unpublished successfully',
      data: { article: updatedArticle }
    });

  } catch (error) {
    console.error(`❌ [${getCurrentDateTime()}] Unpublish article error for ${req.user?.name}:`, error);
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

    console.log(`🗑️ [${getCurrentDateTime()}] deleteArticle called by ${req.user.name} (${req.user.role}):`, { 
      id: id.substring(0, 8), 
      userId 
    });

    const article = await prisma.article.findFirst({
      where: { id }
    });

    if (!article) {
      console.log(`❌ [${getCurrentDateTime()}] Article not found for deletion by ${req.user.name}:`, { id: id.substring(0, 8) });
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    console.log(`📄 [${getCurrentDateTime()}] Found article for deletion by ${req.user.name}:`, {
      id: article.id.substring(0, 8),
      title: article.title.substring(0, 30) + '...',
      status: article.status,
      authorId: article.authorId
    });

    // Check permissions
    const isAuthor = article.authorId === userId;
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    
    // Content Writers can only delete their own DRAFT articles
    if (req.user.role === 'CONTENT_WRITER') {
      if (!isAuthor) {
        console.log(`❌ [${getCurrentDateTime()}] CONTENT_WRITER ${req.user.name} cannot delete other's article`);
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own articles'
        });
      }
      if (article.status !== 'DRAFT') {
        console.log(`❌ [${getCurrentDateTime()}] CONTENT_WRITER ${req.user.name} cannot delete non-DRAFT article`);
        return res.status(403).json({
          success: false,
          message: 'You can only delete draft articles'
        });
      }
    }
    
    // Content Leads cannot delete articles
    if (req.user.role === 'CONTENT_LEAD') {
      console.log(`❌ [${getCurrentDateTime()}] CONTENT_LEAD ${req.user.name} cannot delete articles`);
      return res.status(403).json({
        success: false,
        message: 'Only Super Admins can delete published articles'
      });
    }
    
    // Only Super Admins can delete any article
    if (!isSuperAdmin && !(isAuthor && article.status === 'DRAFT')) {
      console.log(`❌ [${getCurrentDateTime()}] Not authorized to delete article for ${req.user.name}:`, {
        userId,
        authorId: article.authorId,
        userRole: req.user.role,
        articleStatus: article.status
      });
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this article'
      });
    }

    await prisma.article.delete({
      where: { id }
    });

    console.log(`✅ [${getCurrentDateTime()}] Article deleted successfully by ${req.user.name}:`, {
      id: id.substring(0, 8),
      title: article.title.substring(0, 30) + '...'
    });

    return res.json({
      success: true,
      message: 'Article deleted successfully'
    });

  } catch (error) {
    console.error(`❌ [${getCurrentDateTime()}] Delete article error for ${req.user?.name}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};