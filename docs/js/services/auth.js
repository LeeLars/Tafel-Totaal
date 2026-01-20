/**
 * Tafel Totaal - Auth Service
 * Authenticatie via JWT in httpOnly cookies + localStorage fallback
 */

import { authAPI } from '../lib/api.js';

let currentUser = null;
let authListeners = [];

export async function initAuth() {
  try {
    // First try API (cookie-based auth)
    const response = await authAPI.me();
    currentUser = response.data;
    // Sync to localStorage
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify(currentUser));
      localStorage.setItem('isLoggedIn', 'true');
    }
    notifyListeners();
    updateAuthUI();
  } catch (error) {
    // Fallback to localStorage if API fails (cross-origin cookie issue)
    const storedUser = localStorage.getItem('user');
    if (storedUser && localStorage.getItem('isLoggedIn') === 'true') {
      try {
        currentUser = JSON.parse(storedUser);
        notifyListeners();
        updateAuthUI();
        return;
      } catch (e) {
        // Invalid stored data
      }
    }
    currentUser = null;
    updateAuthUI();
  }
}

export async function login(email, password) {
  try {
    const response = await authAPI.login(email, password);
    currentUser = response.data;
    // Store in localStorage as fallback
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify(currentUser));
      localStorage.setItem('isLoggedIn', 'true');
    }
    notifyListeners();
    updateAuthUI();
    return { success: true, user: currentUser };
  } catch (error) {
    return { success: false, error: error.message || 'Login mislukt' };
  }
}

export async function register(userData) {
  try {
    const response = await authAPI.register(userData);
    currentUser = response.data;
    // Store in localStorage as fallback
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify(currentUser));
      localStorage.setItem('isLoggedIn', 'true');
    }
    notifyListeners();
    updateAuthUI();
    return { success: true, user: currentUser };
  } catch (error) {
    return { success: false, error: error.message || 'Registratie mislukt' };
  }
}

export async function logout() {
  try {
    await authAPI.logout();
  } catch (error) {
    // Ignore API errors - we'll clear local state anyway
    console.log('API logout failed (ignored):', error);
  }
  
  // Always clear local state
  currentUser = null;
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
  notifyListeners();
  updateAuthUI();
  return { success: true };
}

export function getCurrentUser() {
  return currentUser;
}

export function isLoggedIn() {
  return currentUser !== null;
}

export function subscribeToAuth(listener) {
  authListeners.push(listener);
  return () => {
    authListeners = authListeners.filter(l => l !== listener);
  };
}

function notifyListeners() {
  authListeners.forEach(listener => listener(currentUser));
}

function updateAuthUI() {
  const loggedInElements = document.querySelectorAll('[data-auth="logged-in"]');
  const loggedOutElements = document.querySelectorAll('[data-auth="logged-out"]');
  const userNameElements = document.querySelectorAll('[data-auth="user-name"]');

  if (currentUser) {
    loggedInElements.forEach(el => el.style.display = '');
    loggedOutElements.forEach(el => el.style.display = 'none');
    userNameElements.forEach(el => {
      el.textContent = `${currentUser.first_name} ${currentUser.last_name}`;
    });
  } else {
    loggedInElements.forEach(el => el.style.display = 'none');
    loggedOutElements.forEach(el => el.style.display = '');
    userNameElements.forEach(el => el.textContent = '');
  }
}

document.addEventListener('DOMContentLoaded', initAuth);
