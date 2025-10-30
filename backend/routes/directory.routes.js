import express from 'express';
import {
  createDirectory,
  getDirectories,
  getDirectory,
  updateDirectory,
  deleteDirectory,
  getDirectoryStats
} from '../controllers/directory.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

// ======================================
// ADMIN ROUTES (Must come BEFORE /:id route)
// ======================================

// @desc    Get directory statistics
// @route   GET /directory/stats
// @access  Private (Admin only)
router.get('/stats', 
  authenticateToken, 
  requireRole(['SUPER_ADMIN', 'CONTENT_LEAD']), 
  getDirectoryStats
);

// @desc    Create a new directory entry
// @route   POST /directory
// @access  Private (Admin only)
router.post('/', 
  authenticateToken, 
  requireRole(['SUPER_ADMIN', 'CONTENT_LEAD']), 
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
// @access  Private (Admin only)
router.put('/:id', 
  authenticateToken, 
  requireRole(['SUPER_ADMIN', 'CONTENT_LEAD']), 
  updateDirectory
);

// @desc    Delete a directory entry
// @route   DELETE /directory/:id
// @access  Private (Admin only)
router.delete('/:id', 
  authenticateToken, 
  requireRole(['SUPER_ADMIN', 'CONTENT_LEAD']), 
  deleteDirectory
);

export default router;