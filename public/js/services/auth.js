/**
 * Tafel Totaal - Auth Service
 * Authenticatie via JWT in httpOnly cookies
 */

import { authAPI } from '../lib/api.js';

let currentUser = null;
let authListeners = [];

export async function initAuth() {
  try {
    const response = await authAPI.me();
    currentUser = response.data;
    notifyListeners();
    updateAuthUI();
  } catch (error) {
    currentUser = null;
    updateAuthUI();
  }
}

export async function login(email, password) {
  try {
    const response = await authAPI.login(email, password);
    currentUser = response.data;
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
    currentUser = null;
    notifyListeners();
    updateAuthUI();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
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
