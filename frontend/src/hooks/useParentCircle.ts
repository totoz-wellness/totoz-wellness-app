/**
 * ============================================
 * PARENTCIRCLE CUSTOM HOOKS (FIXED)
 * ============================================
 * @version     2.1.0
 * @author      ArogoClin
 * @updated     2025-11-23 08:48:32 UTC
 * @description PROPERLY optimized hooks with stable dependencies
 * ============================================
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as API from '../services/parentcircle.service';
import { requestCache } from './useApiRequest';
import type { Question, Story, Category, Answer, Comment } from '../types/parentcircle.types';

/**
 * Hook to fetch and manage questions
 */
export const useQuestions = (filters?: {
  categoryId?: number;
  search?: string;
  sortBy?: string;
  limit?: number;
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 🔥 FIX: Stabilize filters with useMemo to prevent re-renders
  const stableFilters = useMemo(() => filters, [
    filters?.categoryId,
    filters?.search,
    filters?.sortBy,
    filters?.limit
  ]);

  // 🔥 FIX: Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadQuestions = useCallback(async (pageNum = 1, append = false) => {
    // 🔥 FIX: Don't update state if component unmounted
    if (!isMountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      // Use request deduplication
      const response = await requestCache.deduplicate(
        `questions:${JSON.stringify({ ...stableFilters, page: pageNum })}`,
        () => API.getQuestions({
          page: pageNum,
          limit: stableFilters?.limit || 20,
          ...stableFilters
        }),
        append // Skip cache when loading more
      );

      // 🔥 FIX: Only update if still mounted
      if (!isMountedRef.current) return;

      if (response.success) {
        if (append) {
          setQuestions(prev => [...prev, ...response.data.questions]);
        } else {
          setQuestions(response.data.questions);
        }
        setHasMore(response.data.pagination.hasMore ?? false);
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;
      setError(err.message || 'Failed to load questions');
      console.error('Load questions error:', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [stableFilters]); // ← Now stable!

  // 🔥 FIX: Only run on mount or when filters actually change
  const hasLoadedRef = useRef(false);
  
  useEffect(() => {
    // Prevent double-loading in StrictMode
    if (hasLoadedRef.current) {
      hasLoadedRef.current = false; // Reset for next filter change
    }
    
    const timer = setTimeout(() => {
      if (!hasLoadedRef.current) {
        hasLoadedRef.current = true;
        loadQuestions(1, false);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [loadQuestions]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadQuestions(nextPage, true);
    }
  }, [page, hasMore, loading, loadQuestions]);

  const refresh = useCallback(() => {
    requestCache.clear('questions');
    setPage(1);
    hasLoadedRef.current = false;
    loadQuestions(1, false);
  }, [loadQuestions]);

  return { questions, loading, error, hasMore, loadMore, refresh };
};

/**
 * Hook to fetch and manage stories
 */
export const useStories = (filters?: {
  categoryId?: number;
  search?: string;
  sortBy?: string;
  limit?: number;
}) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 🔥 FIX: Stabilize filters
  const stableFilters = useMemo(() => filters, [
    filters?.categoryId,
    filters?.search,
    filters?.sortBy,
    filters?.limit
  ]);

  // 🔥 FIX: Track mount status
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadStories = useCallback(async (pageNum = 1, append = false) => {
    if (!isMountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const response = await requestCache.deduplicate(
        `stories:${JSON.stringify({ ...stableFilters, page: pageNum })}`,
        () => API.getStories({
          page: pageNum,
          limit: stableFilters?.limit || 20,
          ...stableFilters
        }),
        append
      );

      if (!isMountedRef.current) return;

      if (response.success) {
        if (append) {
          setStories(prev => [...prev, ...response.data.stories]);
        } else {
          setStories(response.data.stories);
        }
        setHasMore(response.data.pagination.hasMore ?? false);
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;
      setError(err.message || 'Failed to load stories');
      console.error('Load stories error:', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [stableFilters]);

  // 🔥 FIX: Prevent double-loading
  const hasLoadedRef = useRef(false);
  
  useEffect(() => {
    if (hasLoadedRef.current) {
      hasLoadedRef.current = false;
    }
    
    const timer = setTimeout(() => {
      if (!hasLoadedRef.current) {
        hasLoadedRef.current = true;
        loadStories(1, false);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [loadStories]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadStories(nextPage, true);
    }
  }, [page, hasMore, loading, loadStories]);

  const refresh = useCallback(() => {
    requestCache.clear('stories');
    setPage(1);
    hasLoadedRef.current = false;
    loadStories(1, false);
  }, [loadStories]);

  return { stories, loading, error, hasMore, loadMore, refresh };
};

/**
 * Hook to fetch categories
 */
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const loadCategories = async () => {
      // 🔥 FIX: Only load once
      if (hasLoadedRef.current) return;
      hasLoadedRef.current = true;

      try {
        setLoading(true);

        const response = await requestCache.deduplicate(
          'categories:all',
          () => API.getCategories()
        );

        if (response.success) {
          setCategories(response.data.categories);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load categories');
        console.error('Load categories error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return { categories, loading, error };
};

/**
 * Hook to fetch a single question with answers
 */
export const useQuestion = (id: number | string) => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const loadQuestion = useCallback(async () => {
    // 🔥 FIX: Only load once per ID
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    try {
      setLoading(true);
      setError(null);

      const [questionRes, answersRes] = await Promise.all([
        API.getQuestionById(id, true),
        API.getAnswersForQuestion(Number(id))
      ]);

      if (questionRes.success) {
        setQuestion(questionRes.data.question);
      }
      if (answersRes.success) {
        setAnswers(answersRes.data.answers);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load question');
      console.error('Load question error:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    hasLoadedRef.current = false; // Reset on ID change
    loadQuestion();
  }, [loadQuestion]);

  const refresh = useCallback(() => {
    hasLoadedRef.current = false;
    loadQuestion();
  }, [loadQuestion]);

  return { question, answers, loading, error, refresh };
};

/**
 * Hook to fetch a single story with comments
 */
export const useStory = (id: number | string) => {
  const [story, setStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const loadStory = useCallback(async () => {
    // 🔥 FIX: Only load once per ID
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    try {
      setLoading(true);
      setError(null);

      const [storyRes, commentsRes] = await Promise.all([
        API.getStoryById(id, true),
        API.getCommentsForStory(Number(id))
      ]);

      if (storyRes.success) {
        setStory(storyRes.data.story);
      }
      if (commentsRes.success) {
        setComments(commentsRes.data.comments);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load story');
      console.error('Load story error:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    hasLoadedRef.current = false; // Reset on ID change
    loadStory();
  }, [loadStory]);

  const refresh = useCallback(() => {
    hasLoadedRef.current = false;
    loadStory();
  }, [loadStory]);

  return { story, comments, loading, error, refresh };
};