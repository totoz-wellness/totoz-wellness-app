/**
 * ============================================
 * PARENTCIRCLE API SERVICE (AXIOS VERSION)
 * ============================================
 * @version     2.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 08:37:45 UTC
 * @description Complete API integration using Axios (consistent with TalkEasy)
 * ============================================
 */

import api from '../config/api';

// ============================================
// CATEGORIES
// ============================================

export const getCategories = async () => {
  const response = await api.get('/parentcircle/categories');
  return response.data;
};

export const getCategoryById = async (id: number) => {
  const response = await api.get(`/parentcircle/categories/${id}`);
  return response.data;
};

// ============================================
// QUESTIONS
// ============================================

export const getQuestions = async (params?: {
  page?: number;
  limit?: number;
  categoryId?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  tags?: string[];
  isPinned?: boolean;
  isFeatured?: boolean;
}) => {
  const response = await api.get('/parentcircle/questions', { params });
  return response.data;
};

export const getQuestionById = async (id: number | string, incrementView = false) => {
  const response = await api.get(`/parentcircle/questions/${id}`, {
    params: { incrementView }
  });
  return response.data;
};

export const createQuestion = async (data: {
  title?: string;
  content: string;
  categoryId: number;
  tags?: string[];
  isAnonymous?: boolean;
  authorName?: string;
}) => {
  const response = await api.post('/parentcircle/questions', data);
  return response.data;
};

export const updateQuestion = async (id: number, data: {
  title?: string;
  content?: string;
  categoryId?: number;
  tags?: string[];
}) => {
  const response = await api.put(`/parentcircle/questions/${id}`, data);
  return response.data;
};

export const deleteQuestion = async (id: number) => {
  const response = await api.delete(`/parentcircle/questions/${id}`);
  return response.data;
};

export const voteQuestion = async (questionId: number, isHelpful: boolean) => {
  const response = await api.post(`/parentcircle/questions/${questionId}/vote`, { isHelpful });
  return response.data;
};

// ============================================
// STORIES
// ============================================

export const getStories = async (params?: {
  page?: number;
  limit?: number;
  categoryId?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  tags?: string[];
  isFeatured?: boolean;
}) => {
  const response = await api.get('/parentcircle/stories', { params });
  return response.data;
};

export const getStoryById = async (id: number | string, incrementView = false) => {
  const response = await api.get(`/parentcircle/stories/${id}`, {
    params: { incrementView }
  });
  return response.data;
};

export const createStory = async (data: {
  title?: string;
  content: string;
  categoryId?: number;
  tags?: string[];
  isAnonymous?: boolean;
  authorName?: string;
}) => {
  const response = await api.post('/parentcircle/stories', data);
  return response.data;
};

export const updateStory = async (id: number, data: {
  title?: string;
  content?: string;
  categoryId?: number;
  tags?: string[];
}) => {
  const response = await api.put(`/parentcircle/stories/${id}`, data);
  return response.data;
};

export const deleteStory = async (id: number) => {
  const response = await api.delete(`/parentcircle/stories/${id}`);
  return response.data;
};

export const likeStory = async (storyId: number) => {
  const response = await api.post(`/parentcircle/stories/${storyId}/like`);
  return response.data;
};

export const getLikeStatus = async (storyId: number) => {
  const response = await api.get(`/parentcircle/stories/${storyId}/like/status`);
  return response.data;
};

export const getFeaturedStories = async (limit = 10, categoryId?: number) => {
  const response = await api.get('/parentcircle/stories/featured', {
    params: { limit, categoryId }
  });
  return response.data;
};

export const getTrendingStories = async (limit = 10, days = 7) => {
  const response = await api.get('/parentcircle/stories/trending', {
    params: { limit, days }
  });
  return response.data;
};

// ============================================
// ANSWERS
// ============================================

export const getAnswersForQuestion = async (questionId: number, sortBy = 'best') => {
  const response = await api.get(`/parentcircle/questions/${questionId}/answers`, {
    params: { sortBy }
  });
  return response.data;
};

export const getAnswerStats = async (questionId: number) => {
  const response = await api.get(`/parentcircle/questions/${questionId}/answers/stats`);
  return response.data;
};

export const createAnswer = async (questionId: number, content: string) => {
  const response = await api.post(`/parentcircle/questions/${questionId}/answers`, { content });
  return response.data;
};

export const updateAnswer = async (answerId: number, content: string) => {
  const response = await api.put(`/parentcircle/answers/${answerId}`, { content });
  return response.data;
};

export const deleteAnswer = async (answerId: number) => {
  const response = await api.delete(`/parentcircle/answers/${answerId}`);
  return response.data;
};

export const markAnswerHelpful = async (answerId: number) => {
  const response = await api.post(`/parentcircle/answers/${answerId}/helpful`);
  return response.data;
};

// ============================================
// STORY COMMENTS
// ============================================

export const getCommentsForStory = async (storyId: number, params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
}) => {
  const response = await api.get(`/parentcircle/stories/${storyId}/comments`, { params });
  return response.data;
};

export const createComment = async (
  storyId: number,
  data: {
    content: string;
    isAnonymous?: boolean;
    authorName?: string;
  }
) => {
  const response = await api.post(`/parentcircle/stories/${storyId}/comments`, data);
  return response.data;
};

export const updateComment = async (commentId: number, content: string) => {
  const response = await api.put(`/parentcircle/stories/comments/${commentId}`, { content });
  return response.data;
};

export const deleteComment = async (commentId: number) => {
  const response = await api.delete(`/parentcircle/stories/comments/${commentId}`);
  return response.data;
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};