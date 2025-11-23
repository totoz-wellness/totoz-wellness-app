/**
 * ============================================
 * AUTH INTERCEPTOR
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 09:59:55 UTC
 * @description Handles 401 errors gracefully with user-friendly redirects
 * ============================================
 */

import toast from 'react-hot-toast';

let authRedirectCallback: ((page: string) => void) | null = null;

/**
 * Set the callback function for navigation
 * Call this from App.tsx on mount
 */
export const setAuthRedirectCallback = (callback: (page: string) => void) => {
  authRedirectCallback = callback;
};

/**
 * Handle 401 Unauthorized errors
 * Shows friendly toast and redirects to login
 */
export const handle401Error = (context?: string) => {
  const isAuthenticated = !!localStorage.getItem('token');
  
  if (isAuthenticated) {
    // Token expired
    toast.error('⏱️ Your session has expired. Please login again.', {
      duration: 4000,
      icon: '🔒'
    });
    
    // Clear expired auth
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('isAdminAuthenticated');
  } else {
    // Not logged in
    const contextMessage = context || 'this action';
    toast.error(`🔐 Please login to ${contextMessage}`, {
      duration: 4000,
      icon: '👋'
    });
  }

  // Redirect to login
  if (authRedirectCallback) {
    setTimeout(() => {
      authRedirectCallback('login');
    }, 500);
  } else {
    // Fallback
    window.location.href = '/login';
  }
};

/**
 * Handle 403 Forbidden errors
 * User is logged in but doesn't have permission
 */
export const handle403Error = () => {
  toast.error('⛔ You don\'t have permission to perform this action', {
    duration: 4000
  });
};

/**
 * Get user-friendly action name from API endpoint
 */
export const getActionFromEndpoint = (url: string): string => {
  if (url.includes('/like')) return 'like this content';
  if (url.includes('/vote')) return 'vote';
  if (url.includes('/answer')) return 'post an answer';
  if (url.includes('/comment')) return 'comment';
  if (url.includes('/question')) return 'ask a question';
  if (url.includes('/story')) return 'share a story';
  return 'perform this action';
};