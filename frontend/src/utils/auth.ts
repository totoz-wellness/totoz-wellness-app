/**
 * ============================================
 * AUTH UTILITIES
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-01-02
 * @description Token management and refresh logic
 * ============================================
 */

export const TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const TOKEN_EXPIRATION_KEY = 'tokenExpiration';
export const USER_KEY = 'user';

/**
 * Store authentication tokens and expiration
 */
export const setAuthTokens = (accessToken: string, refreshToken: string, expiresIn: number) => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  
  const expirationTime = Date.now() + (expiresIn * 1000);
  localStorage.setItem(TOKEN_EXPIRATION_KEY, expirationTime.toString());
};

/**
 * Get access token
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get refresh token
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Check if access token is expired
 */
export const isTokenExpired = (): boolean => {
  const expiration = localStorage.getItem(TOKEN_EXPIRATION_KEY);
  if (!expiration) return true;
  
  // Add 30 second buffer to refresh before actual expiration
  return Date.now() > (parseInt(expiration) - 30000);
};

/**
 * Clear all authentication data
 */
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRATION_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem('isAdminAuthenticated');
};

/**
 * Store user data
 */
export const setUser = (user: any) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Get user data
 */
export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};