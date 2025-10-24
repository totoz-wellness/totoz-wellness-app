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
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

// ======================================
// PUBLIC ROUTES
// ======================================

// @desc    Get all published articles with optional filtering
// @route   GET /articles
// @access  Public
// @query   page, limit, category, tags
router.get('/', getArticles);

// @desc    Get single article by ID (public)
// @route   GET /articles/:id
// @access  Public
router.get('/:id', getArticle);

// ======================================
// PROTECTED ROUTES (Content Writers & Above)
// ======================================

// @desc    Get single article by ID (admin - can see any status)
// @route   GET /articles/:id/admin
// @access  Private (Author or Admin)
router.get('/:id/admin', authenticateToken, getArticle);

// @desc    Create a new article
// @route   POST /articles
// @access  Private (Content Writers+)
router.post('/', authenticateToken, createArticle);

// @desc    Update an existing article
// @route   PUT /articles/:id
// @access  Private (Article Author)
router.put('/:id', authenticateToken, updateArticle);

// @desc    Delete an article
// @route   DELETE /articles/:id
// @access  Private (Article Author or Admin)
router.delete('/:id', authenticateToken, deleteArticle);

// @desc    Submit article for review
// @route   PATCH /articles/:id/submit
// @access  Private (Article Author)
router.patch('/:id/submit', authenticateToken, submitForReview);

// ======================================
// CONTENT LEAD ROUTES
// ======================================

// @desc    Review article (approve or reject)
// @route   PATCH /articles/:id/review
// @access  Private (Content Lead+)
// @body    { action: 'approve' | 'reject', feedback?: string }
router.patch('/:id/review', authenticateToken, requireRole(['CONTENT_LEAD', 'SUPER_ADMIN']), reviewArticle);

// @desc    Publish approved article
// @route   PATCH /articles/:id/publish
// @access  Private (Content Lead+)
router.patch('/:id/publish', authenticateToken, requireRole(['CONTENT_LEAD', 'SUPER_ADMIN']), publishArticle);

// @desc    Unpublish published article
// @route   PATCH /articles/:id/unpublish
// @access  Private (Content Lead+)
router.patch('/:id/unpublish', authenticateToken, requireRole(['CONTENT_LEAD', 'SUPER_ADMIN']), unpublishArticle);

export default router;