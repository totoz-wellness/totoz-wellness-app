/**
 * ============================================
 * AXIOS API CONFIGURATION
 * ============================================
 * @version     4.0.0
 * @author      ArogoClin
 * @updated     2025-01-02
 * @description Enhanced with automatic token refresh
 * ============================================
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from "axios";
import toast from 'react-hot-toast';
import { 
  getAccessToken, 
  getRefreshToken, 
  isTokenExpired, 
  clearAuth, 
  setAuthTokens 
} from '../utils/auth';

// Support both variable names for backward compatibility
const API_BASE_URL: string = 
  import.meta.env.VITE_API_BASE_URL || 
  import.meta.env.VITE_API_URL || 
  "http://localhost:5000";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get user-friendly action name from API endpoint
 */
const getActionFromEndpoint = (url: string = ''): string => {
  if (url.includes('/like')) return 'like this content';
  if (url.includes('/vote')) return 'vote';
  if (url.includes('/answer')) return 'post an answer';
  if (url.includes('/comment')) return 'comment';
  if (url.includes('/question')) return 'ask a question';
  if (url.includes('/story')) return 'share a story';
  if (url.includes('/moderation')) return 'moderate content';
  if (url.includes('/approve')) return 'approve content';
  if (url.includes('/reject')) return 'reject content';
  return 'perform this action';
};

/**
 * Redirect to login page (works with both SPA and traditional routing)
 */
const redirectToLogin = (delay: number = 500) => {
  setTimeout(() => {
    // Try SPA navigation first (if available via custom event)
    const event = new CustomEvent('navigate-to-login');
    window.dispatchEvent(event);
    
    // Fallback to traditional navigation if SPA doesn't handle it
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }, 100);
  }, delay);
};

// ============================================
// TOKEN REFRESH LOGIC
// ============================================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

/**
 * Refresh the access token using the refresh token
 */
const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken
    });

    const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data.data;
    
    // Store new tokens
    setAuthTokens(accessToken, newRefreshToken, expiresIn);
    
    return accessToken;
  } catch (error) {
    // Refresh failed - clear auth and redirect
    clearAuth();
    throw error;
  }
};

// ============================================
// REQUEST INTERCEPTOR
// ============================================

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip token check for refresh endpoint
    if (config.url?.includes('/auth/refresh')) {
      return config;
    }

    const token = getAccessToken();
    
    if (token) {
      // Check if token is expired
      if (isTokenExpired()) {
        if (!isRefreshing) {
          isRefreshing = true;
          
          try {
            const newToken = await refreshAccessToken();
            isRefreshing = false;
            processQueue(null, newToken);
            config.headers.Authorization = `Bearer ${newToken}`;
          } catch (error) {
            isRefreshing = false;
            processQueue(error, null);
            
            toast.error('⏱️ Your session has expired. Please login again.', {
              duration: 4000,
              icon: '🔐',
              position: 'top-center',
            });
            
            redirectToLogin(1000);
            return Promise.reject(error);
          }
        } else {
          // Wait for token refresh to complete
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            config.headers.Authorization = `Bearer ${token}`;
            return config;
          }).catch((error) => {
            return Promise.reject(error);
          });
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log request for debugging (only in development)
      if (import.meta.env.DEV) {
        console.log(`🌐 [${new Date().toISOString().slice(0, 19).replace('T', ' ')}] API Request:`, {
          method: config.method?.toUpperCase(),
          url: config.url,
          hasAuth: !!token
        });
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================

api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ [${new Date().toISOString().slice(0, 19).replace('T', ' ')}] API Response:`, {
        status: response.status,
        url: response.config.url,
        success: response.data?.success
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const url = originalRequest?.url || '';
    const errorData = error.response?.data as any;
    const errorMessage = errorData?.message || error.message;

    // Log error for debugging
    console.error(`❌ [${new Date().toISOString().slice(0, 19).replace('T', ' ')}] API Error:`, {
      status,
      url,
      message: errorMessage,
      user: 'ArogoClin'
    });

    // ============================================
    // 401 UNAUTHORIZED - Try token refresh
    // ============================================
    if (status === 401 && !originalRequest._retry && !url.includes('/auth/refresh')) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Wait for the refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        processQueue(null, newToken);
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        
        console.warn('🔒 Token refresh failed - clearing auth');
        clearAuth();
        
        toast.error('⏱️ Your session has expired. Please login again.', {
          duration: 4000,
          icon: '🔐',
          position: 'top-center',
          style: {
            background: '#FEE2E2',
            color: '#991B1B',
            fontWeight: 'bold',
            padding: '16px',
            borderRadius: '12px',
            border: '2px solid #FCA5A5'
          }
        });
        
        redirectToLogin(1000);
        return Promise.reject(refreshError);
      }
    }
    
    // ============================================
    // 403 FORBIDDEN - Insufficient permissions
    // ============================================
    else if (status === 403) {
      console.warn('⛔ Insufficient permissions for action');
      
      toast.error('⛔ You don\'t have permission to perform this action', {
        duration: 4000,
        icon: '🚫',
        position: 'top-center',
        style: {
          background: '#FEF3C7',
          color: '#92400E',
          fontWeight: 'bold',
          padding: '16px',
          borderRadius: '12px',
          border: '2px solid #FCD34D'
        }
      });
    }
    
    // ============================================
    // 404 NOT FOUND
    // ============================================
    else if (status === 404) {
      console.warn('🔍 Resource not found:', url);
      
      toast.error('🔍 The requested content was not found', {
        duration: 3000,
        position: 'top-center'
      });
    }
    
    // ============================================
    // 500 SERVER ERROR
    // ============================================
    else if (status === 500) {
      console.error('💥 Server error:', errorMessage);
      
      toast.error('💥 Server error. Our team has been notified.', {
        duration: 4000,
        position: 'top-center'
      });
    }
    
    // ============================================
    // NETWORK ERROR (No response)
    // ============================================
    else if (!error.response) {
      console.error('🌐 Network error - no response from server');
      
      toast.error('🌐 Network error. Please check your connection.', {
        duration: 4000,
        icon: '📡',
        position: 'top-center',
        style: {
          background: '#FEE2E2',
          color: '#991B1B',
          fontWeight: 'bold',
          padding: '16px',
          borderRadius: '12px'
        }
      });
    }
    
    // ============================================
    // TIMEOUT ERROR
    // ============================================
    else if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request timeout');
      
      toast.error('⏱️ Request timed out. Please try again.', {
        duration: 4000,
        position: 'top-center'
      });
    }
    
    // ============================================
    // OTHER ERRORS
    // ============================================
    else {
      console.error('❓ Unexpected error:', status, errorMessage);
      
      // Only show generic error toast if not already handled
      if (![400, 409].includes(status || 0)) {
        toast.error(errorMessage || 'An unexpected error occurred', {
          duration: 3000,
          position: 'top-center'
        });
      }
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// CUSTOM EVENT LISTENER FOR SPA NAVIGATION
// ============================================

// This allows App.tsx to listen for login redirects
if (typeof window !== 'undefined') {
  let navigationCallback: ((page: string) => void) | null = null;

  window.addEventListener('navigate-to-login', () => {
    if (navigationCallback) {
      navigationCallback('login');
    }
  });

  // Export method to set navigation callback
  (api as any).setNavigationCallback = (callback: (page: string) => void) => {
    navigationCallback = callback;
  };
}

export default api;