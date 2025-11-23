/**
 * ============================================
 * USE API REQUEST HOOK
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 08:41:46 UTC
 * @description Prevents duplicate API requests with caching
 * ============================================
 */

import { useRef, useEffect } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class RequestCache {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private readonly CACHE_DURATION = 5000; // 5 seconds

  async deduplicate<T>(
    key: string,
    fetcher: () => Promise<T>,
    skipCache = false
  ): Promise<T> {
    // Return cached data if fresh and not skipped
    if (!skipCache) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }
    }

    // Return pending request if exists
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending;
    }

    // Create new request
    const promise = fetcher()
      .then((data) => {
        // Cache the result
        this.cache.set(key, {
          data,
          timestamp: Date.now()
        });
        this.pendingRequests.delete(key);
        return data;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  clear(pattern?: string) {
    if (pattern) {
      // Clear matching keys
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
          this.pendingRequests.delete(key);
        }
      }
    } else {
      // Clear all
      this.cache.clear();
      this.pendingRequests.clear();
    }
  }
}

// Singleton instance
export const requestCache = new RequestCache();

/**
 * Hook to get stable cache key for dependencies
 */
export const useCacheKey = (prefix: string, deps: any[]): string => {
  const depsJson = JSON.stringify(deps);
  return `${prefix}:${depsJson}`;
};

/**
 * Hook to cleanup cache on unmount
 */
export const useCacheCleanup = (pattern?: string) => {
  useEffect(() => {
    return () => {
      if (pattern) {
        requestCache.clear(pattern);
      }
    };
  }, [pattern]);
};