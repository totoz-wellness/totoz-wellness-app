import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Admin setup codes - store these securely in environment variables
const ADMIN_SETUP_CODES = {
  SUPER_ADMIN: process.env.SUPER_ADMIN_CODE || 'TOTOZ2025',
  CONTENT_LEAD: process.env.CONTENT_LEAD_CODE || 'LEAD2025',
  CONTENT_WRITER: process.env.CONTENT_WRITER_CODE || 'WRITER2025'
};

// Helper function to determine role from admin code
const getRoleFromAdminCode = (adminCode) => {
  if (adminCode === ADMIN_SETUP_CODES.SUPER_ADMIN) return 'SUPER_ADMIN';
  if (adminCode === ADMIN_SETUP_CODES.CONTENT_LEAD) return 'CONTENT_LEAD';
  if (adminCode === ADMIN_SETUP_CODES.CONTENT_WRITER) return 'CONTENT_WRITER';
  return null;
};

// Register new user (regular users only)
export const register = async (req, res) => {
  try {
    const { name, age, email, password, gender } = req.body;

    // Validate required fields
    if (!name || !age || !email || !password || !gender) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, age, email, password, gender'
      });
    }

    // Validate age
    if (age < 1 || age > 120) {
      return res.status(400).json({
        success: false,
        message: 'Age must be between 1 and 120'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in database (always USER role for public registration)
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        age: parseInt(age),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        gender: gender.trim(),
        role: 'USER' // Public registration only creates USER accounts
      },
      select: {
        id: true,
        name: true,
        age: true,
        email: true,
        gender: true,
        role: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin/Staff setup for first-time access
export const adminSetup = async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;

    // Validate required fields
    if (!email || !password || !adminCode) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and admin code are required'
      });
    }

    // Determine role from admin code
    const role = getRoleFromAdminCode(adminCode);
    
    if (!role) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin code'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists. Please try logging in instead.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin/staff user
    const user = await prisma.user.create({
      data: {
        name: name?.trim() || 'Admin User',
        age: 30, // Default age for staff accounts
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        gender: 'Not specified',
        role: role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      success: true,
      message: `${role.replace('_', ' ')} account created successfully`,
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Admin setup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        age: true,
        email: true,
        gender: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// SUPER_ADMIN only: Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;

    // Validate request
    if (!userId || !newRole) {
      return res.status(400).json({
        success: false,
        message: 'User ID and new role are required'
      });
    }

    // Validate role
    const validRoles = ['USER', 'CONTENT_WRITER', 'CONTENT_LEAD', 'SUPER_ADMIN'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true
      }
    });

    return res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('Update role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// SUPER_ADMIN only: Get all users with optional role filter
export const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = role ? { role } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              articles: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.user.count({ where })
    ]);

    return res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          totalUsers: total
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};