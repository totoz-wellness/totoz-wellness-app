import express from 'express';
import {
  createAnswer,
  getAnswersByQuestion,
  getAnswerById,
  updateAnswer,
  deleteAnswer,
  toggleVerifyAnswer,
  toggleAcceptAnswer,
  markAnswerHelpful,
  getAnswersByUser,
  getAnswerStats
} from '../controllers/answer.controller.js';
import { authenticateToken, requireAuth, requireRole } from '../middleware/auth.middleware.js';
import {
  validateCreateAnswer,
  validateUpdateAnswer,
  validatePagination,
  validateIdParam
} from '../middleware/validation.middleware.js';

const router = express.Router();

// ============================================
// ANSWER ROUTES
// Mounted on: /parentcircle/answers
// ============================================

// ======================================
// PUBLIC ROUTES (No authentication required)
// ======================================

// @desc    Get single answer by ID
// @route   GET /api/parentcircle/answers/:id
// @access  Public
router.get('/:id', validateIdParam('id'), getAnswerById);

// @desc    Get all answers by a specific user
// @route   GET /api/parentcircle/answers/users/:userId
// @access  Public
// @query   page, limit
router.get('/users/:userId', validatePagination, getAnswersByUser);

// ======================================
// PROTECTED ROUTES (Authentication Required)
// ======================================

// @desc    Update answer
// @route   PUT /api/parentcircle/answers/:id
// @access  Private (Author or Moderator)
// @body    { content?, isVerified?, isAccepted? }
router.put('/:id', validateUpdateAnswer, authenticateToken, requireAuth, updateAnswer);

// @desc    Delete answer
// @route   DELETE /api/parentcircle/answers/:id
// @access  Private (Author or Moderator)
router.delete('/:id', validateIdParam('id'), authenticateToken, requireAuth, deleteAnswer);

// @desc    Mark answer as helpful
// @route   POST /api/parentcircle/answers/:id/helpful
// @access  Private (Authenticated users)
router.post('/:id/helpful', validateIdParam('id'), authenticateToken, requireAuth, markAnswerHelpful);

// ======================================
// MODERATOR ROUTES (Advanced permissions)
// ======================================

// @desc    Verify/Unverify answer (for exceptional community answers)
// @route   PATCH /api/parentcircle/answers/:id/verify
// @access  Private (Moderator, Super Admin)
// @body    { isVerified: boolean }
router.patch(
  '/:id/verify',
  validateIdParam('id'),
  authenticateToken,
  requireAuth,
  requireRole('MODERATOR', 'SUPER_ADMIN'),
  toggleVerifyAnswer
);

// @desc    Accept/Unaccept answer as best answer
// @route   PATCH /api/parentcircle/answers/:id/accept
// @access  Private (Moderator, Super Admin)
// @body    { isAccepted: boolean }
router.patch(
  '/:id/accept',
  validateIdParam('id'),
  authenticateToken,
  requireAuth,
  requireRole('MODERATOR', 'SUPER_ADMIN'),
  toggleAcceptAnswer
);

export default router;