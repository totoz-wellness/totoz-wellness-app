import express from 'express';
import {
  createAnswer,
  getAnswersByQuestion,
  getAnswerStats
} from '../controllers/answer.controller.js';
import { authenticateToken, requireAuth } from '../middleware/auth.middleware.js';
import {
  validateCreateAnswer,
  validateIdParam
} from '../middleware/validation.middleware.js';

const router = express.Router({ mergeParams: true }); // Important: mergeParams to access :questionId

// ======================================
// QUESTION-SPECIFIC ANSWER ROUTES
// Mounted on /parentcircle/questions/:questionId/answers
// ======================================

// Get all answers for a question
router.get('/', getAnswersByQuestion);

// Get answer statistics for a question
router.get('/stats', getAnswerStats);

// Create new answer to a question
router.post(
  '/',
  validateCreateAnswer,
  authenticateToken, 
  requireAuth, 
  createAnswer
);

export default router;