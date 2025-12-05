import express from 'express';
import {
  createArticle,
  getArticles,
  getArticle,
  updateArticle,
  deleteArticle,
  submitForReview,
  reviewArticle,
  publishArticle,
  unpublishArticle
} from '../controllers/article.controller.js';
// ✅ Import ALL middleware from the SAME file (auth.middleware.js)
import { authenticateToken, requireAuth, requireRole, optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// ======================================
// PUBLIC ROUTES (No authentication required)
// ======================================

// @desc    Get all published articles with optional filtering
// @route   GET /articles
// @access  Public (or authenticated users see more based on role)
// @query   page, limit, category, tags, status, publishedOnly
router.get('/', optionalAuth, getArticles);

// @desc    Get single article by ID (public - only published)
// @route   GET /articles/:id
// @access  Public
router.get('/:id', optionalAuth, getArticle);

// ======================================
// PROTECTED ROUTES (Authentication Required)
// ======================================

// @desc    Get single article by ID (admin - can see any status)
// @route   GET /articles/:id/admin
// @access  Private (Author or Admin)
router.get('/:id/admin', authenticateToken, requireAuth, getArticle);

// @desc    Create a new article
// @route   POST /articles
// @access  Private (Content Writers+)
router.post('/', authenticateToken, requireAuth, requireRole('CONTENT_WRITER', 'CONTENT_LEAD', 'SUPER_ADMIN'), createArticle);

// @desc    Update an existing article
// @route   PUT /articles/:id
// @access  Private (Article Author or Content Lead/Super Admin)
router.put('/:id', authenticateToken, requireAuth, updateArticle);

// @desc    Delete an article
// @route   DELETE /articles/:id
// @access  Private (Article Author for drafts, Super Admin for all)
router.delete('/:id', authenticateToken, requireAuth, deleteArticle);

// @desc    Submit article for review
// @route   PATCH /articles/:id/submit
// @access  Private (Article Author)
router.patch('/:id/submit', authenticateToken, requireAuth, submitForReview);

// ======================================
// CONTENT LEAD ROUTES (Advanced permissions)
// ======================================

// @desc    Review article (approve or reject)
// @route   PATCH /articles/:id/review
// @access  Private (Content Lead+)
// @body    { action: 'approve' | 'reject', feedback?: string }
router.patch('/:id/review', authenticateToken, requireAuth, requireRole('CONTENT_LEAD', 'SUPER_ADMIN'), reviewArticle);

// @desc    Publish approved article
// @route   PATCH /articles/:id/publish
// @access  Private (Content Lead+)
router.patch('/:id/publish', authenticateToken, requireAuth, requireRole('CONTENT_LEAD', 'SUPER_ADMIN'), publishArticle);

// @desc    Unpublish published article
// @route   PATCH /articles/:id/unpublish
// @access  Private (Content Lead+)
router.patch('/:id/unpublish', authenticateToken, requireAuth, requireRole('CONTENT_LEAD', 'SUPER_ADMIN'), unpublishArticle);

export default router;