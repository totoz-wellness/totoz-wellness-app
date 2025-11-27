// ============================================
// GROWTRACK ROUTES
// ============================================
// @version     2.0. 0
// @author      ArogoClin
// @updated     2025-11-27 07:50:00 UTC
// @description Complete routing for mood, behavior & trigger tracking
// ============================================

import express from 'express';
import {
  createEntry,
  getEntries,
  getInsights,
  getSummary,
  getTrackedChildren,
  updateEntry,
  deleteEntry,
  getOptions
} from '../controllers/growtrack.controller.js';
import { authenticateToken, requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @desc    Get available options (moods, behaviors, triggers, validation rules)
 * @route   GET /growtrack/options
 * @access  Public
 * @returns {Object} Available mood types, behavior examples, trigger examples, validation rules
 */
router.get('/options', getOptions);

// ============================================
// PROTECTED ROUTES (Authenticated Users Only)
// ============================================

/**
 * @desc    Create a new GrowTrack entry
 * @route   POST /growtrack/entries
 * @access  Private
 * @body    {
 *            mood: string (required),
 *            moodIntensity: number 1-10 (required),
 *            behaviors: string[] (required, min 1, max 10),
 *            triggers: string[] (required, min 1, max 10),
 *            notes: string (optional, max 2000 chars),
 *            trackedPersonType: 'SELF' | 'CHILD' (optional, default: SELF),
 *            trackedPersonName: string (required if trackedPersonType = CHILD)
 *          }
 * @example
 * {
 *   "mood": "Anxious",
 *   "moodIntensity": 7,
 *   "behaviors": ["Withdrawn", "Clingy"],
 *   "triggers": ["School stress", "Homework"],
 *   "notes": "Very worried about upcoming exams",
 *   "trackedPersonType": "CHILD",
 *   "trackedPersonName": "Emma"
 * }
 */
router.post(
  '/entries',
  authenticateToken,
  requireAuth,
  createEntry
);

/**
 * @desc    Get GrowTrack entries with filtering
 * @route   GET /growtrack/entries
 * @access  Private
 * @query   {
 *            period: 'week' | 'month' | 'year' (optional, default: week),
 *            trackedPersonType: 'SELF' | 'CHILD' (optional, filters by type),
 *            trackedPersonName: string (optional, filters by specific child)
 *          }
 * @example
 *   GET /growtrack/entries?period=month&trackedPersonType=CHILD&trackedPersonName=Emma
 */
router.get(
  '/entries',
  authenticateToken,
  requireAuth,
  getEntries
);

/**
 * @desc    Update a GrowTrack entry
 * @route   PUT /growtrack/entries/:id
 * @access  Private (Entry owner only)
 * @params  id - Entry ID
 * @body    {
 *            mood: string (optional),
 *            moodIntensity: number 1-10 (optional),
 *            behaviors: string[] (optional),
 *            triggers: string[] (optional),
 *            notes: string (optional)
 *          }
 */
router.put(
  '/entries/:id',
  authenticateToken,
  requireAuth,
  updateEntry
);

/**
 * @desc    Delete a GrowTrack entry
 * @route   DELETE /growtrack/entries/:id
 * @access  Private (Entry owner only)
 * @params  id - Entry ID
 */
router.delete(
  '/entries/:id',
  authenticateToken,
  requireAuth,
  deleteEntry
);

/**
 * @desc    Get AI-powered insights report
 * @route   GET /growtrack/insights
 * @access  Private
 * @query   {
 *            period: 'week' | 'month' | 'year' (optional, default: week),
 *            trackedPersonType: 'SELF' | 'CHILD' (optional),
 *            trackedPersonName: string (optional, for specific child)
 *          }
 * 
 * @description
 * This endpoint generates professional AI-powered insights based on mood,
 * behavior, and trigger data. The AI provides:
 * - Overall emotional and behavioral pattern analysis
 * - Mood trend identification (IMPROVING, STABLE, DECLINING)
 * - Behavior pattern insights
 * - Trigger analysis with impact assessment
 * - Actionable coping strategies tailored to specific triggers
 * - Encouraging validation for tracking efforts
 * 
 * NOTE: Raw mood entries, behaviors, and triggers are NEVER visible in 
 * logs or public reports.  Only AI-summarized insights are provided to the user.
 * 
 * @example
 *   GET /growtrack/insights?period=week&trackedPersonName=Emma
 * 
 * @returns {Object} {
 *   period: string,
 *   dateRange: { start: string, end: string },
 *   totalEntries: number,
 *   metrics: {
 *     averageMoodIntensity: number,
 *     predominantMood: string,
 *     moodTrend: string,
 *     topBehaviors: Array<{ behavior: string, frequency: number }>,
 *     topTriggers: Array<{ trigger: string, frequency: number }>
 *   },
 *   insights: string (AI-generated professional analysis),
 *   trackedPerson: { type: string, name: string | null },
 *   generatedAt: string (ISO date)
 * }
 */
router.get(
  '/insights',
  authenticateToken,
  requireAuth,
  getInsights
);

/**
 * @desc    Get summary statistics
 * @route   GET /growtrack/summary
 * @access  Private
 * @query   {
 *            period: 'week' | 'month' | 'year' (optional, default: week),
 *            trackedPersonType: 'SELF' | 'CHILD' (optional),
 *            trackedPersonName: string (optional)
 *          }
 * 
 * @description
 * Quick statistical summary without AI analysis.
 * Useful for dashboard widgets and quick overviews.
 * 
 * @returns {Object} {
 *   period: string,
 *   totalEntries: number,
 *   averageMoodIntensity: number,
 *   predominantMood: string,
 *   moodVariety: number,
 *   moodTrend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'INSUFFICIENT_DATA',
 *   topBehaviors: Array<{ behavior: string, frequency: number }>,
 *   topTriggers: Array<{ trigger: string, frequency: number }>,
 *   trackedPerson: { type: string, name: string | null }
 * }
 */
router.get(
  '/summary',
  authenticateToken,
  requireAuth,
  getSummary
);

/**
 * @desc    Get list of tracked children
 * @route   GET /growtrack/children
 * @access  Private
 * 
 * @description
 * Returns a list of all children that the user has tracked.
 * Useful for populating dropdowns and filters in the UI.
 * 
 * @returns {Object} {
 *   children: string[] (array of child names),
 *   count: number
 * }
 * 
 * @example Response:
 * {
 *   "success": true,
 *   "data": {
 *     "children": ["Emma", "Liam", "Noah"],
 *     "count": 3
 *   }
 * }
 */
router.get(
  '/children',
  authenticateToken,
  requireAuth,
  getTrackedChildren
);

// ============================================
// ROUTE HEALTH CHECK
// ============================================

/**
 * @desc    GrowTrack health check
 * @route   GET /growtrack/health
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'GrowTrack API is running',
    timestamp: new Date(). toISOString(),
    version: '2.0.0',
    features: {
      moodTracking: 'active',
      behaviorTracking: 'active',
      triggerTracking: 'active',
      aiInsights: 'active',
      childTracking: 'active',
      privacyFirst: 'enabled'
    }
  });
});

export default router;