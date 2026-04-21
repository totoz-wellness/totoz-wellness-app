import express from 'express';
import {
  createDirectory,
  getDirectories,
  getDirectory,
  updateDirectory,
  deleteDirectory,
  getDirectoryStats
} from '../controllers/directory.controller.js';
// ✅ Import ALL middleware from auth.middleware.js
import { authenticateToken, requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// ======================================
// ADMIN ROUTES (Must come BEFORE /:id route)
// ======================================

// @desc    Get directory statistics
// @route   GET /directory/stats
// @access  Private (Content Lead and Super Admin only)
router.get('/stats', 
  authenticateToken,
  requireAuth,
  requireRole('CONTENT_LEAD', 'SUPER_ADMIN'),  // ✅ Changed from array to spread
  getDirectoryStats
);

// @desc    Create a new directory entry
// @route   POST /directory
// @access  Private (Content Lead and Super Admin only)
router.post('/', 
  authenticateToken,
  requireAuth,
  requireRole('CONTENT_LEAD', 'SUPER_ADMIN'),  // ✅ Changed from array to spread
  createDirectory
);

// ======================================
// PUBLIC ROUTES
// ======================================

// @desc    Get all directory entries with optional filtering
// @route   GET /directory
// @access  Public
// @query   page, limit, type, county, city, verified, featured, search
router.get('/', getDirectories);

// @desc    Get single directory entry by ID
// @route   GET /directory/:id
// @access  Public
// IMPORTANT: This must come AFTER /stats route
router.get('/:id', getDirectory);

// ======================================
// ADMIN UPDATE/DELETE ROUTES
// ======================================

// @desc    Update a directory entry
// @route   PUT /directory/:id
// @access  Private (Content Lead and Super Admin only)
router.put('/:id', 
  authenticateToken,
  requireAuth,
  requireRole('CONTENT_LEAD', 'SUPER_ADMIN'),  // ✅ Changed from array to spread
  updateDirectory
);

// @desc    Delete a directory entry
// @route   DELETE /directory/:id
// @access  Private (Content Lead and Super Admin only)
router.delete('/:id', 
  authenticateToken,
  requireAuth,
  requireRole('CONTENT_LEAD', 'SUPER_ADMIN'),  // ✅ Changed from array to spread
  deleteDirectory
);

export default router;