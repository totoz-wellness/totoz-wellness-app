import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create a new directory entry (Admin only)
export const createDirectory = async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      excerpt,
      phone,
      email,
      website,
      address,
      city,
      county,
      region,
      coordinates,
      operatingHours,
      languages,
      specializations,
      tags,
      isVerified,
      isFeatured
    } = req.body;

    const createdById = req.user.userId;

    // Validation
    if (!name || !type || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, and description are required'
      });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Process arrays
    const processedLanguages = Array.isArray(languages) 
      ? languages.filter(lang => lang && typeof lang === 'string') 
      : [];
    
    const processedSpecializations = Array.isArray(specializations) 
      ? specializations.filter(spec => spec && typeof spec === 'string') 
      : [];
    
    const processedTags = Array.isArray(tags) 
      ? tags.filter(tag => tag && typeof tag === 'string') 
      : [];

    const directory = await prisma.directory.create({
      data: {
        name: name.trim(),
        type,
        description,
        excerpt: excerpt?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        website: website?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        county: county?.trim() || null,
        region: region?.trim() || null,
        coordinates: coordinates?.trim() || null,
        operatingHours: operatingHours?.trim() || null,
        languages: processedLanguages,
        specializations: processedSpecializations,
        tags: processedTags,
        isVerified: isVerified || false,
        isFeatured: isFeatured || false,
        slug,
        createdById
      },
      include: {
        createdBy: {
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
      message: 'Directory entry created successfully',
      data: { directory }
    });

  } catch (error) {
    console.error('Create directory error:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A directory entry with similar name already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all directory entries with filtering
export const getDirectories = async (req, res) => {
  try {
    const {
      type,
      county,
      city,
      verified,
      featured,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause
    const where = {};
    
    if (type) {
      where.type = type;
    }
    
    if (county) {
      where.county = county;
    }
    
    if (city) {
      where.city = city;
    }
    
    if (verified === 'true') {
      where.isVerified = true;
    }
    
    if (featured === 'true') {
      where.isFeatured = true;
    }
    
    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }

    const [directories, total] = await Promise.all([
      prisma.directory.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { isFeatured: 'desc' },
          { isVerified: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: parseInt(limit)
      }),
      prisma.directory.count({ where })
    ]);

    return res.json({
      success: true,
      data: {
        directories,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          totalEntries: total
        }
      }
    });

  } catch (error) {
    console.error('Get directories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single directory entry
export const getDirectory = async (req, res) => {
  try {
    const { id } = req.params;

    const directory = await prisma.directory.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!directory) {
      return res.status(404).json({
        success: false,
        message: 'Directory entry not found'
      });
    }

    return res.json({
      success: true,
      data: { directory }
    });

  } catch (error) {
    console.error('Get directory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update directory entry (Admin only)
export const updateDirectory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      description,
      excerpt,
      phone,
      email,
      website,
      address,
      city,
      county,
      region,
      coordinates,
      operatingHours,
      languages,
      specializations,
      tags,
      isVerified,
      isFeatured
    } = req.body;

    // Check if directory exists
    const existingDirectory = await prisma.directory.findUnique({
      where: { id }
    });

    if (!existingDirectory) {
      return res.status(404).json({
        success: false,
        message: 'Directory entry not found'
      });
    }

    // Build update data
    const updateData = {};

    if (name !== undefined) {
      updateData.name = name.trim();
      // Regenerate slug if name changed
      updateData.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }
    
    if (type !== undefined) updateData.type = type;
    if (description !== undefined) updateData.description = description;
    if (excerpt !== undefined) updateData.excerpt = excerpt?.trim() || null;
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (email !== undefined) updateData.email = email?.trim() || null;
    if (website !== undefined) updateData.website = website?.trim() || null;
    if (address !== undefined) updateData.address = address?.trim() || null;
    if (city !== undefined) updateData.city = city?.trim() || null;
    if (county !== undefined) updateData.county = county?.trim() || null;
    if (region !== undefined) updateData.region = region?.trim() || null;
    if (coordinates !== undefined) updateData.coordinates = coordinates?.trim() || null;
    if (operatingHours !== undefined) updateData.operatingHours = operatingHours?.trim() || null;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

    // Process arrays
    if (languages !== undefined) {
      updateData.languages = Array.isArray(languages) 
        ? languages.filter(lang => lang && typeof lang === 'string') 
        : [];
    }
    
    if (specializations !== undefined) {
      updateData.specializations = Array.isArray(specializations) 
        ? specializations.filter(spec => spec && typeof spec === 'string') 
        : [];
    }
    
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) 
        ? tags.filter(tag => tag && typeof tag === 'string') 
        : [];
    }

    const updatedDirectory = await prisma.directory.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return res.json({
      success: true,
      message: 'Directory entry updated successfully',
      data: { directory: updatedDirectory }
    });

  } catch (error) {
    console.error('Update directory error:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A directory entry with this name already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete directory entry (Admin only)
export const deleteDirectory = async (req, res) => {
  try {
    const { id } = req.params;

    const directory = await prisma.directory.findUnique({
      where: { id }
    });

    if (!directory) {
      return res.status(404).json({
        success: false,
        message: 'Directory entry not found'
      });
    }

    await prisma.directory.delete({
      where: { id }
    });

    return res.json({
      success: true,
      message: 'Directory entry deleted successfully'
    });

  } catch (error) {
    console.error('Delete directory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get directory statistics (Admin)
export const getDirectoryStats = async (req, res) => {
  try {
    const [total, byType, verified, featured] = await Promise.all([
      prisma.directory.count(),
      prisma.directory.groupBy({
        by: ['type'],
        _count: true
      }),
      prisma.directory.count({ where: { isVerified: true } }),
      prisma.directory.count({ where: { isFeatured: true } })
    ]);

    return res.json({
      success: true,
      data: {
        total,
        verified,
        featured,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Get directory stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};