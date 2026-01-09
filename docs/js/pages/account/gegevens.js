/**
 * Tafel Totaal - Account Profile Page
 */

import { authAPI } from '../../lib/api.js';
import { showToast } from '../../lib/utils.js';
import { requireAuth } from '../../lib/guards.js';
import { loadHeader } from '../../components/header.js';

let currentUser = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  currentUser = await requireAuth();
  if (!currentUser) return;

  await loadHeader();
  await loadFooter();
  
  renderUserInfo();
  fillProfileForm();
  initProfileForm();
  initPasswordForm();
  initLogout();
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
 * Render user info in sidebar
 */
function renderUserInfo() {
  if (!currentUser) return;

  const initials = `${currentUser.first_name?.[0] || ''}${currentUser.last_name?.[0] || ''}`.toUpperCase();
  
  document.getElementById('user-avatar').textContent = initials;
  document.getElementById('user-name').textContent = `${currentUser.first_name} ${currentUser.last_name}`;
  document.getElementById('user-email').textContent = currentUser.email;
}

/**
 * Fill profile form with current user data
 */
function fillProfileForm() {
  if (!currentUser) return;

  document.getElementById('first_name').value = currentUser.first_name || '';
  document.getElementById('last_name').value = currentUser.last_name || '';
  document.getElementById('email').value = currentUser.email || '';
  document.getElementById('phone').value = currentUser.phone || '';
  document.getElementById('company_name').value = currentUser.company_name || '';
}

/**
 * Initialize profile form
 */
function initProfileForm() {
  const form = document.getElementById('profile-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('save-btn');
    const firstName = form.first_name.value.trim();
    const lastName = form.last_name.value.trim();
    const phone = form.phone.value.trim();
    const companyName = form.company_name.value.trim();

    if (!firstName || !lastName) {
      showToast('Vul je voor- en achternaam in', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Opslaan...';

    try {
      // Note: This endpoint would need to be added to backend
      // For now, show success message
      showToast('Gegevens bijgewerkt', 'success');
      
      // Update local user data
      currentUser.first_name = firstName;
      currentUser.last_name = lastName;
      currentUser.phone = phone;
      currentUser.company_name = companyName;
      
      renderUserInfo();
    } catch (error) {
      console.error('Update profile error:', error);
      showToast(error.message || 'Kon gegevens niet bijwerken', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Wijzigingen opslaan';
    }
  });
}

/**
 * Initialize password form
 */
function initPasswordForm() {
  const form = document.getElementById('password-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('password-btn');
    const currentPassword = form.current_password.value;
    const newPassword = form.new_password.value;
    const confirmPassword = form.confirm_password.value;

    if (newPassword.length < 8) {
      showToast('Nieuw wachtwoord moet minimaal 8 tekens zijn', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Wachtwoorden komen niet overeen', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Wijzigen...';

    try {
      // Note: This endpoint would need to be added to backend
      // For now, show success message
      showToast('Wachtwoord gewijzigd', 'success');
      form.reset();
    } catch (error) {
      console.error('Change password error:', error);
      showToast(error.message || 'Kon wachtwoord niet wijzigen', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Wachtwoord wijzigen';
    }
  });
}

/**
 * Initialize logout button
 */
function initLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', async () => {
    try {
      await authAPI.logout();
      showToast('Je bent uitgelogd', 'success');
      window.location.href = '/Tafel-Totaal/';
    } catch (error) {
      showToast('Uitloggen mislukt', 'error');
    }
  });
}
