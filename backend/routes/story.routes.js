/**
 * ============================================
 * PARENTCIRCLE - STORY ROUTES
 * ============================================
 * @module      routes/parentcircle/story.routes
 * @description Routes for personal stories and community experiences
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-16 21:22:17 UTC
 * 
 * Features:
 * - Story CRUD operations (create, read, update, delete)
 * - Anonymous story posting
 * - Like/unlike stories
 * - Featured & trending stories
 * - Story comments (nested routes)
 * - Content moderation workflow
 * ============================================
 */

import express from 'express';

// Story Controllers
import {
  createStory,
  getAllStories,
  getStoryById,
  updateStory,
  deleteStory,
  toggleLikeStory,
  getLikeStatus,
  toggleFeatureStory,
  getFeaturedStories,
  getTrendingStories,
  getUserStories
} from '../controllers/story.controller.js';

// Comment Controllers
import {
  createComment,
  getCommentsByStory,
  updateComment,
  deleteComment,
  approveComment,
  rejectComment
} from '../controllers/story-comment.controller.js';

// Middleware
import { authenticateToken, requireAuth, requireRole } from '../middleware/auth.middleware.js';
import {
  validateCreateStory,
  validateUpdateStory,
  validatePagination,
  validateIdParam
} from '../middleware/validation.middleware.js';

const router = express.Router();

// ============================================
// NESTED COMMENT ROUTES
// Must be defined BEFORE /:identifier to avoid conflicts
// ============================================

/**
 * @route   GET /api/parentcircle/stories/:storyId/comments
 * @desc    Get all approved comments for a story
 * @access  Public (moderators see all)
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Results per page (default: 20)
 * @query   {string} sortBy - Sort order: newest|oldest (default: newest)
 */
router.get(
  '/:storyId/comments',
  validateIdParam('storyId'),
  validatePagination,
  getCommentsByStory
);

/**
 * @route   POST /api/parentcircle/stories/:storyId/comments
 * @desc    Create a new comment on a story
 * @access  Public (authenticated or anonymous)
 * @body    {string} content - Comment text (min: 3 chars)
 * @body    {boolean} [isAnonymous] - Post anonymously
 * @body    {string} [authorName] - Custom display name
 */
router.post(
  '/:storyId/comments',
  validateIdParam('storyId'),
  authenticateToken,
  createComment
);

// ============================================
// PUBLIC ROUTES
// No authentication required
// ============================================

/**
 * @route   GET /api/parentcircle/stories
 * @desc    Get all approved stories with advanced filtering
 * @access  Public (moderators can see all statuses)
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Results per page (default: 20, max: 100)
 * @query   {string} status - Filter by status (PENDING|APPROVED|REJECTED|ARCHIVED)
 * @query   {number} categoryId - Filter by category ID
 * @query   {string} search - Search in title and content
 * @query   {string[]} tags - Filter by tags
 * @query   {string} sortBy - Sort order: recent|popular|views (default: recent)
 * @query   {boolean} isFeatured - Filter featured stories only
 */
router.get('/', validatePagination, authenticateToken, getAllStories);

/**
 * @route   GET /api/parentcircle/stories/featured
 * @desc    Get curated featured stories
 * @access  Public
 * @query   {number} limit - Max results (default: 10)
 * @query   {number} categoryId - Filter by category
 */
router.get('/featured', validatePagination, getFeaturedStories);

/**
 * @route   GET /api/parentcircle/stories/trending
 * @desc    Get trending stories based on recent engagement
 * @access  Public
 * @query   {number} limit - Max results (default: 10)
 * @query   {number} days - Time window in days (default: 7)
 */
router.get('/trending', validatePagination, getTrendingStories);

/**
 * @route   GET /api/parentcircle/stories/:identifier
 * @desc    Get single story by ID or slug
 * @access  Public (only approved unless author/moderator)
 * @param   {string|number} identifier - Story ID or URL slug
 * @query   {boolean} incrementView - Increment view count (default: false)
 */
router.get('/:identifier', authenticateToken, getStoryById);

// ============================================
// AUTHENTICATED ROUTES
// Requires valid JWT token
// ============================================

/**
 * @route   POST /api/parentcircle/stories
 * @desc    Create a new personal story
 * @access  Public (authenticated or anonymous via optional auth)
 * @body    {string} [title] - Story title (optional)
 * @body    {string} content - Story content (min: 20 chars, max: 10000)
 * @body    {number} [categoryId] - Category ID (optional)
 * @body    {string[]} [tags] - Tags (max: 10, each 2-30 chars)
 * @body    {boolean} [isAnonymous] - Post anonymously (default: false)
 * @body    {string} [authorName] - Custom display name
 * @note    Story starts with status PENDING for moderation
 */
router.post('/', validateCreateStory, authenticateToken, createStory);

/**
 * @route   PUT /api/parentcircle/stories/:id
 * @desc    Update an existing story
 * @access  Private (Author or Moderator)
 * @param   {number} id - Story ID
 * @body    {string} [title] - Updated title
 * @body    {string} [content] - Updated content (min: 20 chars)
 * @body    {number} [categoryId] - Updated category
 * @body    {string[]} [tags] - Updated tags
 * @note    If approved story is edited by author, resets to PENDING
 */
router.put(
  '/:id',
  validateIdParam('id'),
  validateUpdateStory,
  authenticateToken,
  requireAuth,
  updateStory
);

/**
 * @route   DELETE /api/parentcircle/stories/:id
 * @desc    Delete a story (soft delete to ARCHIVED)
 * @access  Private (Author or Moderator)
 * @param   {number} id - Story ID
 */
router.delete(
  '/:id',
  validateIdParam('id'),
  authenticateToken,
  requireAuth,
  deleteStory
);

/**
 * @route   POST /api/parentcircle/stories/:id/like
 * @desc    Like or unlike a story (toggle)
 * @access  Private (Authenticated users)
 * @param   {number} id - Story ID
 * @returns {boolean} liked - New like status
 */
router.post(
  '/:id/like',
  validateIdParam('id'),
  authenticateToken,
  requireAuth,
  toggleLikeStory
);

/**
 * @route   GET /api/parentcircle/stories/:id/like/status
 * @desc    Check if current user has liked a story
 * @access  Private (Authenticated users)
 * @param   {number} id - Story ID
 * @returns {boolean} liked - Like status
 * @returns {string} [likedAt] - Timestamp of like
 */
router.get(
  '/:id/like/status',
  validateIdParam('id'),
  authenticateToken,
  requireAuth,
  getLikeStatus
);

/**
 * @route   GET /api/parentcircle/users/:userId/stories
 * @desc    Get all stories by a specific user
 * @access  Private (Author or Moderator)
 * @param   {string} userId - User ID (CUID)
 * @query   {number} page - Page number
 * @query   {number} limit - Results per page
 * @query   {string} status - Filter by status
 * @note    Users can only see their own stories unless moderator
 */
router.get(
  '/users/:userId/stories',
  validateIdParam('userId'),
  validatePagination,
  authenticateToken,
  requireAuth,
  getUserStories
);

// ============================================
// COMMENT MANAGEMENT ROUTES
// Direct comment operations (not nested)
// ============================================

/**
 * @route   PUT /api/parentcircle/stories/comments/:id
 * @desc    Update a comment
 * @access  Private (Comment author or Moderator)
 * @param   {number} id - Comment ID
 * @body    {string} content - Updated comment text (min: 3 chars)
 * @note    If approved comment is edited by author, resets to PENDING
 */
router.put(
  '/comments/:id',
  validateIdParam('id'),
  authenticateToken,
  requireAuth,
  updateComment
);

/**
 * @route   DELETE /api/parentcircle/stories/comments/:id
 * @desc    Delete a comment
 * @access  Private (Comment author or Moderator)
 * @param   {number} id - Comment ID
 */
router.delete(
  '/comments/:id',
  validateIdParam('id'),
  authenticateToken,
  requireAuth,
  deleteComment
);

// ============================================
// MODERATOR ROUTES
// Requires MODERATOR or SUPER_ADMIN role
// ============================================

/**
 * @route   PATCH /api/parentcircle/stories/:id/feature
 * @desc    Feature or unfeature a story
 * @access  Private (Moderator, Super Admin)
 * @param   {number} id - Story ID
 * @body    {boolean} isFeatured - Feature status
 * @note    Featured stories appear on homepage and get priority
 */
router.patch(
  '/:id/feature',
  validateIdParam('id'),
  authenticateToken,
  requireAuth,
  requireRole('MODERATOR', 'SUPER_ADMIN'),
  toggleFeatureStory
);

/**
 * @route   PATCH /api/parentcircle/stories/comments/:id/approve
 * @desc    Approve a pending comment
 * @access  Private (Moderator, Super Admin)
 * @param   {number} id - Comment ID
 * @note    Changes comment status from PENDING to APPROVED
 */
router.patch(
  '/comments/:id/approve',
  validateIdParam('id'),
  authenticateToken,
  requireAuth,
  requireRole('MODERATOR', 'SUPER_ADMIN'),
  approveComment
);

/**
 * @route   PATCH /api/parentcircle/stories/comments/:id/reject
 * @desc    Reject a pending comment
 * @access  Private (Moderator, Super Admin)
 * @param   {number} id - Comment ID
 * @note    Changes comment status from PENDING to REJECTED
 */
router.patch(
  '/comments/:id/reject',
  validateIdParam('id'),
  authenticateToken,
  requireAuth,
  requireRole('MODERATOR', 'SUPER_ADMIN'),
  rejectComment
);

export default router;