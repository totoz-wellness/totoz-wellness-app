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
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// ============================================
// CATEGORY CONTROLLERS
// ============================================

/**
 * Create new ParentCircle category
 * @route POST /api/parentcircle/categories
 * @access ADMIN, SUPER_ADMIN
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description, type, icon, color, order } = req.body;

    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Name and type are required fields'
      });
    }

    // Validate type
    const validTypes = ['QUESTION', 'STORY', 'BOTH'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be one of: QUESTION, STORY, BOTH'
      });
    }

    // Sanitize inputs
    const sanitizedName = sanitizeContent(name.trim());
    const sanitizedDescription = description ? sanitizeContent(description.trim()) : null;

    // Generate unique slug
    let slug = generateSlug(sanitizedName);
    let slugExists = await prisma.parentCircleCategory.findUnique({
      where: { slug }
    });

    // Add suffix if slug exists
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(sanitizedName)}-${counter}`;
      slugExists = await prisma.parentCircleCategory.findUnique({
        where: { slug }
      });
      counter++;
    }

    // Create category
    const category = await prisma.parentCircleCategory.create({
      data: {
        name: sanitizedName,
        slug,
        description: sanitizedDescription,
        type,
        icon: icon?.trim() || null,
        color: color?.trim() || null,
        order: order ? parseInt(order) : 0,
        isActive: true
      },
      include: {
        _count: {
          select: {
            questions: true,
            stories: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });

  } catch (error) {
    console.error('Create category error:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A category with this name already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all categories with optional filters
 * @route GET /api/parentcircle/categories
 * @access PUBLIC
 */
export const getAllCategories = async (req, res) => {
  try {
    const { type, isActive, includeInactive } = req.query;

    // Build where clause
    const where = {};
    
    if (type) {
      const validTypes = ['QUESTION', 'STORY', 'BOTH'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid type parameter'
        });
      }
      where.OR = [
        { type: type },
        { type: 'BOTH' }
      ];
    }

    // Filter by active status unless includeInactive is true
    if (includeInactive !== 'true') {
      where.isActive = isActive === 'false' ? false : true;
    }

    // Fetch categories
    const categories = await prisma.parentCircleCategory.findMany({
      where,
      include: {
        _count: {
          select: {
            questions: true,
            stories: true
          }
        }
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    });

    return res.json({
      success: true,
      data: {
        categories,
        total: categories.length
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get single category by ID or slug
 * @route GET /api/parentcircle/categories/:identifier
 * @access PUBLIC
 */
export const getCategoryById = async (req, res) => {
  try {
    const { identifier } = req.params;

    // Check if identifier is numeric (ID) or string (slug)
    const isNumeric = /^\d+$/.test(identifier);
    
    const category = await prisma.parentCircleCategory.findUnique({
      where: isNumeric ? { id: parseInt(identifier) } : { slug: identifier },
      include: {
        _count: {
          select: {
            questions: {
              where: { status: 'APPROVED' }
            },
            stories: {
              where: { status: 'APPROVED' }
            }
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    return res.json({
      success: true,
      data: { category }
    });

  } catch (error) {
    console.error('Get category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update category
 * @route PUT /api/parentcircle/categories/:id
 * @access ADMIN, SUPER_ADMIN
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type, icon, color, order, isActive } = req.body;

    // Check if category exists
    const existingCategory = await prisma.parentCircleCategory.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Validate type if provided
    if (type) {
      const validTypes = ['QUESTION', 'STORY', 'BOTH'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid type. Must be one of: QUESTION, STORY, BOTH'
        });
      }
    }

    // Build update data
    const updateData = {};
    
    if (name) {
      updateData.name = sanitizeContent(name.trim());
      // Regenerate slug if name changes
      let newSlug = generateSlug(updateData.name);
      
      // Check if new slug conflicts with other categories
      const slugConflict = await prisma.parentCircleCategory.findFirst({
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
    
    if (description !== undefined) {
      updateData.description = description ? sanitizeContent(description.trim()) : null;
    }
    
    if (type) updateData.type = type;
    if (icon !== undefined) updateData.icon = icon?.trim() || null;
    if (color !== undefined) updateData.color = color?.trim() || null;
    if (order !== undefined) updateData.order = parseInt(order);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    // Update category
    const category = await prisma.parentCircleCategory.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        _count: {
          select: {
            questions: true,
            stories: true
          }
        }
      }
    });

    return res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });

  } catch (error) {
    console.error('Update category error:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A category with this name already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete category (soft delete by setting isActive to false)
 * @route DELETE /api/parentcircle/categories/:id
 * @access SUPER_ADMIN
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { hardDelete } = req.query;

    // Check if category exists
    const category = await prisma.parentCircleCategory.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            questions: true,
            stories: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has content
    const hasContent = category._count.questions > 0 || category._count.stories > 0;

    if (hasContent && hardDelete === 'true') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing questions or stories. Please reassign content first.',
        data: {
          questionsCount: category._count.questions,
          storiesCount: category._count.stories
        }
      });
    }

    if (hardDelete === 'true') {
      // Hard delete
      await prisma.parentCircleCategory.delete({
        where: { id: parseInt(id) }
      });

      return res.json({
        success: true,
        message: 'Category deleted permanently'
      });
    } else {
      // Soft delete - set isActive to false
      const updatedCategory = await prisma.parentCircleCategory.update({
        where: { id: parseInt(id) },
        data: { isActive: false }
      });

      return res.json({
        success: true,
        message: 'Category deactivated successfully',
        data: { category: updatedCategory }
      });
    }

  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Reorder categories
 * @route PATCH /api/parentcircle/categories/reorder
 * @access ADMIN, SUPER_ADMIN
 */
export const reorderCategories = async (req, res) => {
  try {
    const { categoryOrders } = req.body;

    // Validate input
    if (!Array.isArray(categoryOrders) || categoryOrders.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'categoryOrders must be a non-empty array of {id, order} objects'
      });
    }

    // Update all categories in a transaction
    const updatePromises = categoryOrders.map(({ id, order }) =>
      prisma.parentCircleCategory.update({
        where: { id: parseInt(id) },
        data: { order: parseInt(order) }
      })
    );

    await prisma.$transaction(updatePromises);

    // Fetch updated categories
    const categories = await prisma.parentCircleCategory.findMany({
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    });

    return res.json({
      success: true,
      message: 'Categories reordered successfully',
      data: { categories }
    });

  } catch (error) {
    console.error('Reorder categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};