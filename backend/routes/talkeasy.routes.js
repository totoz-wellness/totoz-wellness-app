import express from 'express';
import {
  sendMessage,
  getConversationHistory,
  deleteConversationHistory,
  getTalkEasyStats
} from '../controllers/talkeasy.controller.js';
import { authenticateToken, requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// ======================================
// PROTECTED ROUTES (Authentication Required)
// ======================================

// @desc    Send a message to TalkEasy chatbot
// @route   POST /talkeasy/chat
// @access  Private (All authenticated users)
// @body    { message: string, sessionId?: string }
router.post('/chat', authenticateToken, requireAuth, sendMessage);

// @desc    Get user's conversation history
// @route   GET /talkeasy/history
// @access  Private (Own history only)
// @query   sessionId?, limit?, page?
router.get('/history', authenticateToken, requireAuth, getConversationHistory);

// @desc    Delete user's conversation history
// @route   DELETE /talkeasy/history
// @access  Private (Own history only)
// @query   sessionId? (optional - deletes all if not provided)
router.delete('/history', authenticateToken, requireAuth, deleteConversationHistory);

// ======================================
// ADMIN ROUTES
// ======================================

// @desc    Get TalkEasy statistics
// @route   GET /talkeasy/stats
// @access  Private (Super Admin only)
router.get('/stats', authenticateToken, requireAuth, requireRole('SUPER_ADMIN'), getTalkEasyStats);

// @desc    Get user's personal statistics
// @route   GET /talkeasy/my-stats
// @access  Private
router.get('/my-stats', authenticateToken, requireAuth, getUserStats);

export default router;