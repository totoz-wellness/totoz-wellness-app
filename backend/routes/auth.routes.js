import express from 'express';
import {
  register,
  login,
  adminSetup,
  getProfile,
  updateUserRole,
  getAllUsers
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

// ======================================
// PUBLIC ROUTES
// ======================================

// @desc    Register new user (public - creates USER role only)
// @route   POST /auth/register
// @access  Public
router.post('/register', register);

// @desc    Login user
// @route   POST /auth/login
// @access  Public
router.post('/login', login);

// @desc    Admin/Staff first-time setup
// @route   POST /auth/admin-setup
// @access  Public (requires admin code)
router.post('/admin-setup', adminSetup);

// ======================================
// PROTECTED ROUTES
// ======================================

// @desc    Get current user profile
// @route   GET /auth/profile
// @access  Private
router.get('/profile', authenticateToken, getProfile);

// ======================================
// SUPER ADMIN ONLY ROUTES
// ======================================

// @desc    Update user role
// @route   PATCH /auth/users/:userId/role
// @access  Private (Super Admin only)
router.patch(
  '/users/role',
  authenticateToken,
  requireRole(['SUPER_ADMIN']),
  updateUserRole
);

// @desc    Get all users with optional filtering
// @route   GET /auth/users
// @access  Private (Super Admin only)
// @query   role, page, limit
router.get(
  '/users',
  authenticateToken,
  requireRole(['SUPER_ADMIN']),
  getAllUsers
);

export default router;