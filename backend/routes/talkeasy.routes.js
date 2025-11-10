// routes/talkeasy.routes.js
import express from 'express';
import {
  sendMessage,
  getConversationHistory,
  deleteConversationHistory,
  getTalkEasyStats,
  getUserStats,
  getInsights,
  getTrainingDataStats,
  exportTrainingData,
  manualCleanup,
  aggregateAnalytics
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

// @desc    Get user's personal statistics
// @route   GET /talkeasy/my-stats
// @access  Private (Own stats only)
router.get('/my-stats', authenticateToken, requireAuth, getUserStats);

// ======================================
// ADMIN ROUTES (Super Admin Only)
// ======================================

// @desc    Get TalkEasy statistics (overview)
// @route   GET /talkeasy/admin/stats
// @access  Private (Super Admin only)
router.get('/admin/stats', authenticateToken, requireAuth, requireRole('SUPER_ADMIN'), getTalkEasyStats);

// @desc    Get insights and trends
// @route   GET /talkeasy/admin/insights
// @access  Private (Super Admin only)
// @query   period? (default: 30 days)
router.get('/admin/insights', authenticateToken, requireAuth, requireRole('SUPER_ADMIN'), getInsights);

// @desc    Get training dataset statistics
// @route   GET /talkeasy/admin/training-stats
// @access  Private (Super Admin only)
router.get('/admin/training-stats', authenticateToken, requireAuth, requireRole('SUPER_ADMIN'), getTrainingDataStats);

// @desc    Export training dataset
// @route   GET /talkeasy/admin/export-training-data
// @access  Private (Super Admin only)
// @query   minQuality? (default: 0.6), format? (json|jsonl)
router.get('/admin/export-training-data', authenticateToken, requireAuth, requireRole('SUPER_ADMIN'), exportTrainingData);

// @desc    Manual database cleanup
// @route   POST /talkeasy/admin/cleanup
// @access  Private (Super Admin only)
router.post('/admin/cleanup', authenticateToken, requireAuth, requireRole('SUPER_ADMIN'), manualCleanup);

// @desc    Manually aggregate analytics
// @route   POST /talkeasy/admin/aggregate-analytics
// @access  Private (Super Admin only)
// @body    { date?: string } (YYYY-MM-DD format, default: today)
router.post('/admin/aggregate-analytics', authenticateToken, requireAuth, requireRole('SUPER_ADMIN'), aggregateAnalytics);

// ======================================
// LEGACY ROUTE (for backward compatibility)
// ======================================

// @desc    Get TalkEasy statistics (legacy endpoint)
// @route   GET /talkeasy/stats
// @access  Private (Super Admin only)
// @note    Use /talkeasy/admin/stats instead
router.get('/stats', authenticateToken, requireAuth, requireRole('SUPER_ADMIN'), getTalkEasyStats);

export default router;