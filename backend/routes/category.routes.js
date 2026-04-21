import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  reorderCategories
} from '../controllers/category.controller.js';
import { authenticateToken, requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// ======================================
// PUBLIC ROUTES (No authentication required)
// ======================================

// @desc    Get all categories with optional filtering
// @route   GET /api/parentcircle/categories
// @access  Public
// @query   type (QUESTION|STORY|BOTH), isActive, includeInactive
router.get('/', getAllCategories);

// @desc    Get single category by ID or slug
// @route   GET /api/parentcircle/categories/:identifier
// @access  Public
router.get('/:identifier', getCategoryById);

// ======================================
// PROTECTED ROUTES (Authentication Required)
// ======================================

// @desc    Create new category
// @route   POST /api/parentcircle/categories
// @access  Private (Moderator, Super Admin)
// @body    { name, description, type, icon, color, order }
router.post(
  '/', 
  authenticateToken, 
  requireAuth, 
  requireRole('MODERATOR', 'SUPER_ADMIN'), 
  createCategory
);

// @desc    Update category
// @route   PUT /api/parentcircle/categories/:id
// @access  Private (Moderator, Super Admin)
// @body    { name?, description?, type?, icon?, color?, order?, isActive? }
router.put(
  '/:id', 
  authenticateToken, 
  requireAuth, 
  requireRole('MODERATOR', 'SUPER_ADMIN'), 
  updateCategory
);

// @desc    Reorder categories
// @route   PATCH /api/parentcircle/categories/reorder
// @access  Private (Moderator, Super Admin)
// @body    { categoryOrders: [{ id, order }] }
router.patch(
  '/reorder', 
  authenticateToken, 
  requireAuth, 
  requireRole('MODERATOR', 'SUPER_ADMIN'), 
  reorderCategories
);

// @desc    Delete category (soft or hard delete)
// @route   DELETE /api/parentcircle/categories/:id
// @access  Private (Super Admin only for safety)
// @query   hardDelete=true (optional)
router.delete(
  '/:id', 
  authenticateToken, 
  requireAuth, 
  requireRole('SUPER_ADMIN'), 
  deleteCategory
);

export default router;