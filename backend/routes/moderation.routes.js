import express from 'express';
import {
  getPendingContent,
  approveContent,
  rejectContent,
  archiveContent,
  restoreContent,
  getModerationLogs,
  getModerationStats,
  bulkApproveContent
} from '../controllers/moderation.controller.js';
import { authenticateToken, requireAuth, requireRole } from '../middleware/auth.middleware.js';

import {
  validateModerationApprove,
  validateModerationReject,
  validateModerationArchive,
  validateBulkApprove,
  validatePagination
} from '../middleware/validation.middleware.js'; // 🆕 Import validators


const router = express.Router();

// ======================================
// MODERATION ROUTES
// All routes require MODERATOR or SUPER_ADMIN
// ======================================

// @desc    Get all pending content for moderation
// @route   GET /api/parentcircle/moderation/pending
// @access  Private (Moderator, Super Admin)
// @query   page, limit, contentType (QUESTION|STORY), sortBy (oldest|newest)
router.get(
  '/pending',
  validatePagination,
  authenticateToken,
  requireAuth,
  requireRole('MODERATOR', 'SUPER_ADMIN'),
  getPendingContent
);

// @desc    Approve content (question or story)
// @route   POST /api/parentcircle/moderation/approve
// @access  Private (Moderator, Super Admin)
// @body    { contentType: 'QUESTION'|'STORY', contentId: number, notes?: string }
router.post(
  '/approve',
  validateModerationApprove,
  authenticateToken,
  requireAuth,
  requireRole('MODERATOR', 'SUPER_ADMIN'),
  approveContent
);

// @desc    Reject content (question or story)
// @route   POST /api/parentcircle/moderation/reject
// @access  Private (Moderator, Super Admin)
// @body    { contentType: 'QUESTION'|'STORY', contentId: number, reason: string, notes?: string }
router.post(
  '/reject',
  validateModerationReject,
  authenticateToken,
  requireAuth,
  requireRole('MODERATOR', 'SUPER_ADMIN'),
  rejectContent
);

// @desc    Archive content
// @route   POST /api/parentcircle/moderation/archive
// @access  Private (Moderator, Super Admin)
// @body    { contentType: 'QUESTION'|'STORY', contentId: number, reason?: string }
router.post(
  '/archive',
  validateModerationArchive,
  authenticateToken,
  requireAuth,
  requireRole('MODERATOR', 'SUPER_ADMIN'),
  archiveContent
);

// @desc    Restore archived content
// @route   POST /api/parentcircle/moderation/restore
// @access  Private (Moderator, Super Admin)
// @body    { contentType: 'QUESTION'|'STORY', contentId: number }
router.post(
  '/restore',
  validateModerationApprove,
  authenticateToken,
  requireAuth,
  requireRole('MODERATOR', 'SUPER_ADMIN'),
  restoreContent
);

// @desc    Bulk approve multiple items
// @route   POST /api/parentcircle/moderation/bulk-approve
// @access  Private (Moderator, Super Admin)
// @body    { items: [{ contentType, contentId }] }
router.post(
  '/bulk-approve',
  validateBulkApprove,
  authenticateToken,
  requireAuth,
  requireRole('MODERATOR', 'SUPER_ADMIN'),
  bulkApproveContent
);

// @desc    Get moderation logs/history
// @route   GET /api/parentcircle/moderation/logs
// @access  Private (Moderator, Super Admin)
// @query   page, limit, contentType, action, moderatorId, startDate, endDate
router.get(
  '/logs',
  validatePagination,
  authenticateToken,
  requireAuth,
  requireRole('MODERATOR', 'SUPER_ADMIN'),
  getModerationLogs
);

// @desc    Get moderation statistics
// @route   GET /api/parentcircle/moderation/stats
// @access  Private (Moderator, Super Admin)
// @query   period (days, default: 30)
router.get(
  '/stats',
  authenticateToken,
  requireAuth,
  requireRole('MODERATOR', 'SUPER_ADMIN'),
  getModerationStats
);

export default router;