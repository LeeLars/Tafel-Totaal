/**
 * Tafel Totaal - Route Guards
 * Authentication and authorization helpers
 */

import { authAPI } from './api.js';

let cachedUser = null;

function getSiteBasePath() {
  return '';
}

/**
 * Check if user is authenticated
 * Returns user data if authenticated, null otherwise
 */
export async function checkAuth() {
  if (cachedUser) return cachedUser;
  
  try {
    const response = await authAPI.me();
    if (response.success && response.data) {
      cachedUser = response.data;
      // Sync to localStorage
      localStorage.setItem('user', JSON.stringify(cachedUser));
      localStorage.setItem('isLoggedIn', 'true');
      return cachedUser;
    }
  } catch (error) {
    // API failed - try localStorage fallback
    const storedUser = localStorage.getItem('user');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (storedUser && isLoggedIn === 'true') {
      try {
        cachedUser = JSON.parse(storedUser);
        return cachedUser;
      } catch (e) {
        // Invalid JSON
      }
    }
    cachedUser = null;
  }
  return null;
}

/**
 * Clear cached user (call on logout)
 */
export function clearAuthCache() {
  cachedUser = null;
}

/**
 * Require authentication - returns user or null (NO AUTO REDIRECT to prevent loops)
 * @param {string} returnUrl - URL to return to after login (defaults to current page)
 * @param {boolean} autoRedirect - Whether to auto-redirect (default: false to prevent loops)
 */
export async function requireAuth(returnUrl = window.location.pathname + window.location.search, autoRedirect = false) {
  const user = await checkAuth();
  
  if (!user && autoRedirect) {
    const encodedReturn = encodeURIComponent(returnUrl);
    const base = getSiteBasePath();
    window.location.href = `${base}/login/?returnUrl=${encodedReturn}`;
    return null;
  }
  
  return user;
}

/**
 * Require admin role - redirects if not admin
 * @param {string} redirectUrl - URL to redirect to if not admin
 */
export async function requireAdmin(redirectUrl = '/') {
  const user = await checkAuth();
  
  if (!user) {
    const encodedReturn = encodeURIComponent(window.location.pathname);
    const base = getSiteBasePath();
    window.location.href = `${base}/login/?returnUrl=${encodedReturn}`;
    return null;
  }
  
  if (user.role !== 'admin') {
    window.location.href = redirectUrl;
    return null;
  }
  
  return user;
}

/**
 * Check if current user is admin
 */
export async function isAdmin() {
  const user = await checkAuth();
  return user?.role === 'admin';
}

/**
 * Get current user without redirecting
 */
export async function getCurrentUser() {
  return await checkAuth();
}
