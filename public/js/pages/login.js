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
    // Use base path for GitHub Pages compatibility
    const basePath = '';
    const response = await fetch(`${basePath}/components/footer.html`);
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
  // Prevent redirect loops - if we came from an account page, don't auto-redirect back
  const returnUrl = getQueryParam('returnUrl') || getQueryParam('redirect');
  if (returnUrl && returnUrl.includes('/account/')) {
    // User was redirected here from account page - don't auto-redirect back
    // They need to actually log in
    console.log('Came from account page, not auto-redirecting');
    return;
  }

  try {
    const response = await authAPI.me();
    if (response.success && response.data) {
      // API confirms logged in, safe to redirect
      const redirectTo = returnUrl || '/account/overzicht/';
      window.location.href = redirectTo;
      return;
    }
  } catch (error) {
    // API failed - user is NOT logged in, clear any stale localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
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
    btn.innerHTML = '<div class="spinner spinner--sm"></div> Inloggen...';

    try {
      const response = await authAPI.login(email, password);
      console.log('[Login] Response:', response);
      console.log('[Login] Token in response:', response.token ? 'YES' : 'NO');

      if (response.success) {
        // Store user data and token in localStorage for cross-origin cookie issues
        if (response.data) {
          localStorage.setItem('user', JSON.stringify(response.data));
          localStorage.setItem('isLoggedIn', 'true');
        }
        // Store token for API Authorization header (cross-origin fallback)
        if (response.token) {
          localStorage.setItem('authToken', response.token);
          console.log('[Login] Token saved to localStorage');
        } else {
          console.warn('[Login] No token in response!');
        }
        
        showToast('Succesvol ingelogd!', 'success');
        
        // Redirect based on role
        let redirectUrl = getQueryParam('returnUrl');
        
        if (!redirectUrl) {
          // Default redirect based on user role
          if (response.data?.role === 'admin') {
            redirectUrl = '/admin/index.html';
          } else {
            redirectUrl = '/account/overzicht/';
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
