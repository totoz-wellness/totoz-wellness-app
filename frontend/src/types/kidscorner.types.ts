// ============================================
// KIDSCORNER TYPES - Frontend
// ============================================
// @version     2.0.0
// @updated     2026-02-10
// @description Updated types for multi-child backend integration
// ============================================

// Mood types (matching backend)
export type Mood = 'happy' | 'calm' | 'sad' | 'angry' | 'silly' | 'worried';

// Child profile (from backend)
export interface Child {
  id: string;
  name: string;
  age: number;
  avatarEmoji: string;
  parentId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  progress?: ChildProgress;
  _count?: {
    moodLogs: number;
    worries: number;
    buddyChats: number;
    activityLogs: number;
  };
}

export interface ChildProgress {
  id: string;
  childId: string;
  stickers: string[];
  streak: number;
  lastActiveDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// Legacy type (for backward compatibility with old localStorage code)
export interface KidsData {
  stickers: string[];
  streak: number;
  worries: string[];
  lastMood?: Mood;
}

// Context state
export interface KidsCornerContextState {
  children: Child[];
  activeChild: Child | null;
  loading: boolean;
  error: string | null;
}