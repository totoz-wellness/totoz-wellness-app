/**
 * ============================================
 * PARENTCIRCLE MODERATION API SERVICE
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 08:58:08 UTC
 * @description API integration for ParentCircle content moderation
 * ============================================
 */

import api from '../config/api';

// ============================================
// MODERATION QUEUE
// ============================================

export const getPendingContent = async (params?: {
  page?: number;
  limit?: number;
  contentType?: 'QUESTION' | 'STORY';
  sortBy?: 'oldest' | 'newest';
}) => {
  const response = await api.get('/parentcircle/moderation/pending', { params });
  return response.data;
};

export const getModerationStats = async (period = 30) => {
  const response = await api.get('/parentcircle/moderation/stats', {
    params: { period }
  });
  return response.data;
};

export const getModerationLogs = async (params?: {
  page?: number;
  limit?: number;
  contentType?: string;
  action?: string;
  moderatorId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const response = await api.get('/parentcircle/moderation/logs', { params });
  return response.data;
};

// ============================================
// MODERATION ACTIONS
// ============================================

export const approveContent = async (data: {
  contentType: 'QUESTION' | 'STORY';
  contentId: number;
  notes?: string;
}) => {
  const response = await api.post('/parentcircle/moderation/approve', data);
  return response.data;
};

export const rejectContent = async (data: {
  contentType: 'QUESTION' | 'STORY';
  contentId: number;
  reason: string;
  notes?: string;
}) => {
  const response = await api.post('/parentcircle/moderation/reject', data);
  return response.data;
};

export const archiveContent = async (data: {
  contentType: 'QUESTION' | 'STORY';
  contentId: number;
  reason?: string;
}) => {
  const response = await api.post('/parentcircle/moderation/archive', data);
  return response.data;
};

export const restoreContent = async (data: {
  contentType: 'QUESTION' | 'STORY';
  contentId: number;
}) => {
  const response = await api.post('/parentcircle/moderation/restore', data);
  return response.data;
};

export const bulkApproveContent = async (items: Array<{
  contentType: 'QUESTION' | 'STORY';
  contentId: number;
}>) => {
  const response = await api.post('/parentcircle/moderation/bulk-approve', { items });
  return response.data;
};