/**
 * ============================================
 * ARTICLES DATA HOOK (React Query)
 * ============================================
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';
import { Article } from '../components/LearnWell/ArticleCard';

interface ArticlesResponse {
  success: boolean;
  data: {
    articles: Article[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  message?: string;
}

interface UseArticlesParams {
  page?: number;
  limit?: number;
  category?: string;
  publishedOnly?: boolean;
}

export const useArticles = ({
  page = 1,
  limit = 9,
  category = '',
  publishedOnly = true
}: UseArticlesParams = {}) => {
  const queryClient = useQueryClient();

  const queryKey = ['articles', page, limit, category, publishedOnly];

  const { data, isLoading, error, refetch } = useQuery<ArticlesResponse>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        publishedOnly: publishedOnly.toString()
      });

      if (category) {
        params.append('category', category);
      }

      const response = await api.get(`/articles?${params. toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Prefetch next page
  const prefetchNextPage = () => {
    queryClient.prefetchQuery({
      queryKey: ['articles', page + 1, limit, category, publishedOnly],
      queryFn: async () => {
        const params = new URLSearchParams({
          page: (page + 1).toString(),
          limit: limit.toString(),
          publishedOnly: publishedOnly.toString()
        });

        if (category) {
          params. append('category', category);
        }

        const response = await api.get(`/articles?${params.toString()}`);
        return response.data;
      },
    });
  };

  return {
    articles: data?.data?.articles || [],
    pagination: data?.data?.pagination,
    totalPages: data?.data?.pagination?. totalPages || 1,
    isLoading,
    error: error as Error | null,
    refetch,
    prefetchNextPage
  };
};