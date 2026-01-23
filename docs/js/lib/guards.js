/**
 * Tafel Totaal - Route Guards
 * Authentication and authorization helpers
 */

import { authAPI } from './api.js';

let cachedUser = null;

function getSiteBasePath() {
  // GitHub Pages project site is served from /<repo>/
  // For local dev / normal hosting, keep it root.
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
      return cachedUser;
    }
  } catch (error) {
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
 * Require authentication - redirects to login if not authenticated
 * @param {string} returnUrl - URL to return to after login (defaults to current page)
 */
export async function requireAuth(returnUrl = window.location.pathname + window.location.search) {
  const user = await checkAuth();
  
  if (!user) {
    const encodedReturn = encodeURIComponent(returnUrl);
    const base = getSiteBasePath();
    window.location.href = `${base}/login.html?returnUrl=${encodedReturn}`;
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
    window.location.href = `${base}/login.html?returnUrl=${encodedReturn}`;
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
