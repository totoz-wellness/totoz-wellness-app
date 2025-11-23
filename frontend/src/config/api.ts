/**
 * ============================================
 * AXIOS API CONFIGURATION
 * ============================================
 * @version     3.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 10:02:53 UTC
 * @description Enhanced error handling with user-friendly UX
 * ============================================
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from "axios";
import toast from 'react-hot-toast';

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
 * Clear authentication data
 */
const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("isAdminAuthenticated");
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
// REQUEST INTERCEPTOR
// ============================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
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
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
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
    // 401 UNAUTHORIZED - Not logged in or token invalid
    // ============================================
    if (status === 401) {
      const isAuthenticated = !!localStorage.getItem('token');
      
      if (isAuthenticated) {
        // Token expired or invalid
        console.warn('🔒 Token expired or invalid - clearing auth');
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
      } else {
        // Not logged in at all
        const action = getActionFromEndpoint(url);
        console.warn(`🔐 Authentication required to ${action}`);
        
        toast.error(`🔐 Please login to ${action}`, {
          duration: 4000,
          icon: '👋',
          position: 'top-center',
          style: {
            background: '#DBEAFE',
            color: '#1E40AF',
            fontWeight: 'bold',
            padding: '16px',
            borderRadius: '12px',
            border: '2px solid #93C5FD'
          }
        });
        
        redirectToLogin(500);
      }
    }
    
    // ============================================
    // 403 FORBIDDEN - Insufficient permissions
    // ============================================
    else if (status === 403) {
      // Check for specific forbidden reasons
      if (errorMessage === 'Token expired' || errorMessage === 'Invalid token') {
        console.warn('🔒 Token validation failed - clearing auth');
        clearAuth();
        
        toast.error('⏱️ Your session has expired. Please login again.', {
          duration: 4000,
          icon: '🔐',
          position: 'top-center'
        });
        
        redirectToLogin(1000);
      } else {
        // Permission denied (user is logged in but lacks permission)
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