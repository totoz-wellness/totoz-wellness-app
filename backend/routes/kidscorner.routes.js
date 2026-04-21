// ============================================
// KIDSCORNER ROUTES
// ============================================
// @version     1.0.0
// @author      ArogoClin
// @updated     2026-02-10
// @description API routes for KidsCorner multi-child support
// ============================================

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js'; // ← FIXED
import {
  // Child Management
  getChildren,
  createChild,
  updateChild,

  // Mood Tracking
  logMood,
  getMoodTrends,

  // Worry Box
  lockWorry,
  getWorryCount,

  // Buddy Chat
  buddyChat,
  getChatSummary,

  // Activity & Progress
  logActivity,
  getProgress
} from '../controllers/kidscorner.controller.js';

const router = express.Router();

// ============================================
// ALL ROUTES REQUIRE AUTHENTICATION
// ============================================

// ============================================
// CHILD MANAGEMENT ROUTES
// ============================================

/**
 * @route   GET /kidscorner/children
 * @desc    Get all children for logged-in parent
 * @access  Private (Authenticated parents)
 */
router.get('/children', authenticateToken, getChildren);

/**
 * @route   POST /kidscorner/children
 * @desc    Create a new child profile
 * @access  Private
 * @body    { name: string, age: number, avatarEmoji?: string }
 */
router.post('/children', authenticateToken, createChild);

/**
 * @route   PUT /kidscorner/children/:childId
 * @desc    Update child profile
 * @access  Private (Parent must own child)
 * @body    { name?: string, age?: number, avatarEmoji?: string, isActive?: boolean }
 */
router.put('/children/:childId', authenticateToken, updateChild);

// ============================================
// MOOD TRACKING ROUTES
// ============================================

/**
 * @route   POST /kidscorner/children/:childId/mood
 * @desc    Log a mood check-in for child
 * @access  Private
 * @body    { mood: 'happy' | 'calm' | 'sad' | 'angry' | 'silly' | 'worried' }
 */
router.post('/children/:childId/mood', authenticateToken, logMood);

/**
 * @route   GET /kidscorner/children/:childId/mood-trends
 * @desc    Get mood trends (aggregated for parent dashboard)
 * @access  Private
 * @query   days?: number (default: 7)
 */
router.get('/children/:childId/mood-trends', authenticateToken, getMoodTrends);

// ============================================
// WORRY BOX ROUTES (ENCRYPTED)
// ============================================

/**
 * @route   POST /kidscorner/children/:childId/worries
 * @desc    Lock a worry in the worry box (encrypted)
 * @access  Private
 * @body    { worryText: string }
 */
router.post('/children/:childId/worries', authenticateToken, lockWorry);

/**
 * @route   GET /kidscorner/children/:childId/worries/count
 * @desc    Get count of locked worries (parents see count, not content)
 * @access  Private
 */
router.get('/children/:childId/worries/count', authenticateToken, getWorryCount);

// ============================================
// BUDDY CHAT ROUTES (AI)
// ============================================

/**
 * @route   POST /kidscorner/children/:childId/buddy-chat
 * @desc    Chat with Buddy AI (secure backend proxy)
 * @access  Private
 * @body    { message: string, sessionId?: string }
 */
router.post('/children/:childId/buddy-chat', authenticateToken, buddyChat);

/**
 * @route   GET /kidscorner/children/:childId/buddy-chat/summary
 * @desc    Get AI-generated summary of chats for parents
 * @access  Private
 */
router.get('/children/:childId/buddy-chat/summary', authenticateToken, getChatSummary);

// ============================================
// ACTIVITY & PROGRESS ROUTES
// ============================================

/**
 * @route   POST /kidscorner/children/:childId/activity
 * @desc    Log activity completion and award sticker
 * @access  Private
 * @body    { activityType: string, activityName: string, zone: string, stickerEarned?: string, durationSeconds?: number }
 */
router.post('/children/:childId/activity', authenticateToken, logActivity);

/**
 * @route   GET /kidscorner/children/:childId/progress
 * @desc    Get child's progress (stickers, streak, stats)
 * @access  Private
 */
router.get('/children/:childId/progress', authenticateToken, getProgress);

// ============================================
// HEALTH CHECK
// ============================================

/**
 * @route   GET /kidscorner/health
 * @desc    Health check for KidsCorner API
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'KidsCorner API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: {
      multiChildSupport: 'active',
      moodTracking: 'active',
      encryptedWorries: 'active',
      buddyAI: 'partial (placeholder)',
      activityTracking: 'active',
      privacyFirst: 'enabled'
    }
  });
});

export default router;