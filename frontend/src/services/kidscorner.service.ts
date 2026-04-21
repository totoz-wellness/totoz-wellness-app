// ============================================
// KIDSCORNER API SERVICE
// ============================================
// @version     1.0.0
// @author      ArogoClin
// @updated     2026-02-10
// @description Frontend API client for KidsCorner backend
// ============================================

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

// Axios instance with auth
const api = axios.create({
  baseURL: `${API_URL}/kidscorner`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// TYPES
// ============================================

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

export interface MoodLog {
  id: string;
  childId: string;
  mood: 'happy' | 'calm' | 'sad' | 'angry' | 'silly' | 'worried';
  timestamp: string;
}

export interface MoodTrends {
  summary: {
    totalEntries: number;
    predominantMood: string | null;
    moodDistribution: Record<string, number>;
  };
  period: string;
}

export interface BuddyChatResponse {
  response: string;
  sessionId: string;
  chatId: string;
  meta?: {
    isPlaceholder: boolean;
    sentiment: string;
  };
}

export interface ChatSummary {
  summary: {
    totalConversations: number;
    sentimentBreakdown: Record<string, number>;
    concerningTopics: number;
    flaggedReasons: string[];
  };
  message: string;
}

export interface ActivityLog {
  activityType: string;
  activityName: string;
  zone: string;
  stickerEarned?: string;
  durationSeconds?: number;
}

// ============================================
// CHILD MANAGEMENT
// ============================================

export const getChildren = async (): Promise<Child[]> => {
  const response = await api.get('/children');
  return response.data.data.children;
};

export const createChild = async (data: {
  name: string;
  age: number;
  avatarEmoji?: string;
}): Promise<Child> => {
  const response = await api.post('/children', data);
  return response.data.data.child;
};

export const updateChild = async (
  childId: string,
  data: {
    name?: string;
    age?: number;
    avatarEmoji?: string;
    isActive?: boolean;
  }
): Promise<Child> => {
  const response = await api.put(`/children/${childId}`, data);
  return response.data.data.child;
};

// ============================================
// MOOD TRACKING
// ============================================

export const logMood = async (
  childId: string,
  mood: 'happy' | 'calm' | 'sad' | 'angry' | 'silly' | 'worried'
): Promise<{ moodLog: MoodLog; progress: ChildProgress }> => {
  const response = await api.post(`/children/${childId}/mood`, { mood });
  return response.data.data;
};

export const getMoodTrends = async (
  childId: string,
  days: number = 7
): Promise<MoodTrends> => {
  const response = await api.get(`/children/${childId}/mood-trends`, {
    params: { days }
  });
  return response.data.data;
};

// ============================================
// WORRY BOX
// ============================================

export const lockWorry = async (
  childId: string,
  worryText: string
): Promise<void> => {
  await api.post(`/children/${childId}/worries`, { worryText });
};

export const getWorryCount = async (
  childId: string
): Promise<{ worryCount: number; message: string }> => {
  const response = await api.get(`/children/${childId}/worries/count`);
  return response.data.data;
};

// ============================================
// BUDDY CHAT
// ============================================

export const buddyChat = async (
  childId: string,
  message: string,
  sessionId?: string
): Promise<BuddyChatResponse> => {
  const response = await api.post(`/children/${childId}/buddy-chat`, {
    message,
    sessionId
  });
  return response.data.data;
};

export const getChatSummary = async (childId: string): Promise<ChatSummary> => {
  const response = await api.get(`/children/${childId}/buddy-chat/summary`);
  return response.data.data;
};

// ============================================
// ACTIVITY & PROGRESS
// ============================================

export const logActivity = async (
  childId: string,
  activity: ActivityLog
): Promise<{ activity: any; progress: ChildProgress | null }> => {
  const response = await api.post(`/children/${childId}/activity`, activity);
  return response.data.data;
};

export const getProgress = async (childId: string): Promise<{
  child: { id: string; name: string; avatarEmoji: string };
  progress: ChildProgress | null;
  stats: {
    moodCheckIns: number;
    activitiesCompleted: number;
    worriesLocked: number;
  };
}> => {
  const response = await api.get(`/children/${childId}/progress`);
  return response.data.data;
};

// ============================================
// HEALTH CHECK
// ============================================

export const healthCheck = async (): Promise<any> => {
  const response = await api.get('/health');
  return response.data;
};