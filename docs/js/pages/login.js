/**
 * Tafel Totaal - Login Page JavaScript
 */

import { authAPI } from '../lib/api.js';
import { showToast, getQueryParam, isValidEmail } from '../lib/utils.js';
import { loadHeader } from '../components/header.js';

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await loadHeader();
  await loadFooter();
  initPasswordToggle();
  initLoginForm();
  checkAlreadyLoggedIn();
});

/**
 * Load footer component
 */
async function loadFooter() {
  const container = document.getElementById('footer-container');
  if (!container) return;

  try {
    const response = await fetch('./components/footer.html');
    if (!response.ok) throw new Error('Failed to load footer');
    container.innerHTML = await response.text();
  } catch (error) {
    console.error('Error loading footer:', error);
  }
}

/**
 * Check if user is already logged in
 */
async function checkAlreadyLoggedIn() {
  try {
    const response = await authAPI.me();
    if (response.success && response.data) {
      // Already logged in, redirect
      const returnUrl = getQueryParam('returnUrl') || './account/overzicht.html';
      window.location.href = returnUrl;
    }
  } catch (error) {
    // Not logged in, stay on page
  }
}

/**
 * Initialize password visibility toggle
 */
function initPasswordToggle() {
  const toggles = document.querySelectorAll('.password-toggle');
  
  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const input = toggle.previousElementSibling;
      const isPassword = input.type === 'password';
      
      input.type = isPassword ? 'text' : 'password';
      toggle.classList.toggle('active', isPassword);
    });
  });
}

/**
 * Initialize login form
 */
function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = form.email.value.trim();
    const password = form.password.value;
    const btn = document.getElementById('login-btn');

    // Validation
    if (!isValidEmail(email)) {
      showToast('Vul een geldig e-mailadres in', 'error');
      return;
    }

    if (!password) {
      showToast('Vul je wachtwoord in', 'error');
      return;
    }

    // Submit
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;"></div> Inloggen...';

    try {
      const response = await authAPI.login(email, password);

      if (response.success) {
        showToast('Succesvol ingelogd!', 'success');
        
        // Redirect based on role
        let redirectUrl = getQueryParam('returnUrl');
        
        if (!redirectUrl) {
          // Default redirect based on user role
          if (response.data?.role === 'admin') {
            redirectUrl = './admin/index.html';
          } else {
            redirectUrl = './account/overzicht.html';
          }
        }
        
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 500);
      } else {
        showToast(response.error || 'Inloggen mislukt', 'error');
        btn.disabled = false;
        btn.textContent = 'Inloggen';
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast(error.message || 'Ongeldige inloggegevens', 'error');
      btn.disabled = false;
      btn.textContent = 'Inloggen';
    }
  });
}
