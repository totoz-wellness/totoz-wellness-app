import express from 'express';
import {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  voteQuestion,
  togglePinQuestion,
  toggleFeatureQuestion
} from '../controllers/question.controller.js';
import {
  createAnswer,
  getAnswersByQuestion,
  getAnswerStats
} from '../controllers/answer.controller.js';
import { authenticateToken, requireAuth, requireRole } from '../middleware/auth.middleware.js';
import {
  validateCreateQuestion,
  validateUpdateQuestion,
  validateQuestionVote,
  validatePagination,
  validateIdParam,
  validateCreateAnswer
} from '../middleware/validation.middleware.js';

const router = express.Router();

// ============================================
// QUESTION ROUTES
// Mounted on: /parentcircle/questions
// ============================================

// ======================================
// NESTED ANSWER ROUTES (must be before /:identifier)
// ======================================

// @desc    Get all answers for a question
// @route   GET /api/parentcircle/questions/:questionId/answers
// @access  Public
// @query   sortBy (best|newest|oldest|helpful|professional), filterType (professional|community)
router.get('/:questionId/answers', validateIdParam('questionId'), getAnswersByQuestion);

// @desc    Get answer statistics for a question
// @route   GET /api/parentcircle/questions/:questionId/answers/stats
// @access  Public
router.get('/:questionId/answers/stats', validateIdParam('questionId'), getAnswerStats);

// @desc    Create new answer to a question
// @route   POST /api/parentcircle/questions/:questionId/answers
// @access  Private (All authenticated users can answer)
// @body    { content }
// @note    Professionals get auto-verified, community members don't
router.post(
  '/:questionId/answers',
  validateIdParam('questionId'),
  validateCreateAnswer,
  authenticateToken,
  requireAuth,
  createAnswer
);

// ======================================
// PUBLIC ROUTES (No authentication required)
// ======================================

// @desc    Get all approved questions with filtering
// @route   GET /api/parentcircle/questions
// @access  Public (moderators see all statuses)
// @query   page, limit, status, categoryId, search, tags, sortBy, isPinned, isFeatured
router.get('/', validatePagination, authenticateToken, getAllQuestions);

// @desc    Get single question by ID or slug
// @route   GET /api/parentcircle/questions/:identifier
// @access  Public (only approved unless author/moderator)
// @query   incrementView=true (optional)
router.get('/:identifier', authenticateToken, getQuestionById);

// ======================================
// PROTECTED ROUTES (Authentication Required)
// ======================================

// @desc    Create new question
// @route   POST /api/parentcircle/questions
// @access  Public (authenticated or anonymous via optional auth)
// @body    { title?, content, categoryId, tags?, isAnonymous?, authorName? }
router.post('/', validateCreateQuestion, authenticateToken, createQuestion);

// @desc    Update question
// @route   PUT /api/parentcircle/questions/:id
// @access  Private (Author or Moderator)
// @body    { title?, content?, categoryId?, tags? }
router.put('/:id', validateUpdateQuestion, authenticateToken, requireAuth, updateQuestion);

// @desc    Delete question
// @route   DELETE /api/parentcircle/questions/:id
// @access  Private (Author or Moderator)
router.delete('/:id', validateIdParam('id'), authenticateToken, requireAuth, deleteQuestion);

// @desc    Vote on question (helpful/not helpful)
// @route   POST /api/parentcircle/questions/:id/vote
// @access  Private (Authenticated users)
// @body    { isHelpful: boolean }
router.post('/:id/vote', validateIdParam('id'), validateQuestionVote, authenticateToken, requireAuth, voteQuestion);

// ======================================
// MODERATOR ROUTES (Advanced permissions)
// ======================================

// @desc    Pin/Unpin question
// @route   PATCH /api/parentcircle/questions/:id/pin
// @access  Private (Moderator, Super Admin)
// @body    { isPinned: boolean }
router.patch(
  '/:id/pin',
  validateIdParam('id'),
  authenticateToken,
  requireAuth,
  requireRole('MODERATOR', 'SUPER_ADMIN'),
  togglePinQuestion
);

// @desc    Feature/Unfeature question
// @route   PATCH /api/parentcircle/questions/:id/feature
// @access  Private (Moderator, Super Admin)
// @body    { isFeatured: boolean }
router.patch(
  '/:id/feature',
  validateIdParam('id'),
  authenticateToken,
  requireAuth,
  requireRole('MODERATOR', 'SUPER_ADMIN'),
  toggleFeatureQuestion
);

export default router;