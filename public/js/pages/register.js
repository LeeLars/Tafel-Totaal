/**
 * Tafel Totaal - Register Page JavaScript
 */

import { authAPI } from '../lib/api.js';
import { showToast, getQueryParam, isValidEmail, isValidPhone } from '../lib/utils.js';
import { loadHeader } from '../components/header.js';

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await loadHeader();
  await loadFooter();
  initPasswordToggle();
  initRegisterForm();
  checkAlreadyLoggedIn();
});

/**
 * Load footer component
 */
async function loadFooter() {
  const container = document.getElementById('footer-container');
  if (!container) return;

  try {
    const response = await fetch('/Tafel-Totaal/components/footer.html');
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
      const returnUrl = getQueryParam('returnUrl') || '/Tafel-Totaal/account/overzicht.html';
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
 * Initialize register form
 */
function initRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const firstName = form.first_name.value.trim();
    const lastName = form.last_name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const password = form.password.value;
    const passwordConfirm = form.password_confirm.value;
    const acceptTerms = form.accept_terms.checked;
    const btn = document.getElementById('register-btn');

    // Validation
    if (!firstName || !lastName) {
      showToast('Vul je voor- en achternaam in', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showToast('Vul een geldig e-mailadres in', 'error');
      return;
    }

    if (phone && !isValidPhone(phone)) {
      showToast('Vul een geldig telefoonnummer in', 'error');
      return;
    }

    if (password.length < 8) {
      showToast('Wachtwoord moet minimaal 8 tekens zijn', 'error');
      return;
    }

    if (password !== passwordConfirm) {
      showToast('Wachtwoorden komen niet overeen', 'error');
      return;
    }

    if (!acceptTerms) {
      showToast('Je moet akkoord gaan met de voorwaarden', 'error');
      return;
    }

    // Submit
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;"></div> Account aanmaken...';

    try {
      const response = await authAPI.register({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || undefined,
        password
      });

      if (response.success) {
        showToast('Account succesvol aangemaakt!', 'success');
        
        // Redirect to return URL or account
        const returnUrl = getQueryParam('returnUrl') || '/Tafel-Totaal/account/overzicht.html';
        setTimeout(() => {
          window.location.href = returnUrl;
        }, 500);
      } else {
        showToast(response.error || 'Registratie mislukt', 'error');
        btn.disabled = false;
        btn.textContent = 'Account aanmaken';
      }
    } catch (error) {
      console.error('Register error:', error);
      showToast(error.message || 'Registratie mislukt. Probeer het opnieuw.', 'error');
      btn.disabled = false;
      btn.textContent = 'Account aanmaken';
    }
  });
}
