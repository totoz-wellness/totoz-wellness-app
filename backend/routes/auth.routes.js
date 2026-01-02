import express from 'express';
import {
  register,
  login,
  adminSetup,
  refreshToken,
  getProfile,
  updateUserRole,
  getAllUsers
} from '../controllers/auth.controller.js';
import { authenticateToken, requireAuth, requireRole } from '../middleware/auth.middleware.js';

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

// @desc    Refresh access token
// @route   POST /auth/refresh
// @access  Public (requires valid refresh token)
router.post('/refresh', refreshToken);

// ======================================
// PROTECTED ROUTES
// ======================================

// @desc    Get current user profile
// @route   GET /auth/profile
// @access  Private
router.get('/profile', authenticateToken, requireAuth, getProfile);

// ======================================
// SUPER ADMIN ONLY ROUTES
// ======================================

// @desc    Update user role
// @route   PATCH /auth/users/role
// @access  Private (Super Admin only)
router.patch(
  '/users/role',
  authenticateToken,
  requireAuth,
  requireRole('SUPER_ADMIN'),
  updateUserRole
);

// @desc    Get all users with optional filtering
// @route   GET /auth/users
// @access  Private (Super Admin only)
// @query   role, page, limit
router.get(
  '/users',
  authenticateToken,
  requireAuth,
  requireRole('SUPER_ADMIN'),
  getAllUsers
);

export default router;