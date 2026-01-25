/**
 * Tafel Totaal - Account Orders Page
 */

import { ordersAPI, authAPI } from '../../lib/api.js';
import { formatPrice, formatDateShort, showToast } from '../../lib/utils.js';
import { requireAuth } from '../../lib/guards.js';
import { loadHeader } from '../../components/header.js';

let currentUser = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await loadHeader();
  await loadFooter();
  
  currentUser = await requireAuth();
  if (!currentUser) {
    const content = document.querySelector('.account-content');
    if (content) {
      content.innerHTML = `
        <div class="account-card" style="text-align: center; padding: var(--space-2xl);">
          <h2>Je bent niet ingelogd</h2>
          <p style="margin: var(--space-md) 0;">Log in om je bestellingen te bekijken.</p>
          <a href="/login" class="btn btn--primary">Inloggen</a>
        </div>
      `;
    }
    return;
  }
  
  renderUserInfo();
  await loadOrders();
  initLogout();
});

/**
 * Load footer component
 */
async function loadFooter() {
  const container = document.getElementById('footer-container');
  if (!container) return;

  try {
    const response = await fetch('/components/footer.html');
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
 * Load all orders
 */
async function loadOrders() {
  const container = document.getElementById('orders-list');
  if (!container) return;

  const emptyStateHTML = `
    <div class="empty-state">
      <div class="empty-state__icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
      </div>
      <h3>Nog geen bestellingen</h3>
      <p>Je hebt nog geen bestellingen geplaatst.</p>
      <a href="/pakketten" class="btn btn--primary">Bekijk Pakketten</a>
    </div>
  `;

  try {
    const response = await ordersAPI.getMyOrders();
    const orders = response?.data || [];

    if (orders.length === 0) {
      container.innerHTML = emptyStateHTML;
      return;
    }

    container.innerHTML = orders.map(order => createOrderItem(order)).join('');

  } catch (error) {
    console.error('Error loading orders:', error);
    // Show empty state instead of error (better UX)
    container.innerHTML = emptyStateHTML;
  }
}

/**
 * Create order item HTML
 */
function createOrderItem(order) {
  const statusInfo = getStatusInfo(order.status);
  const rentalDates = order.rental_start_date && order.rental_end_date 
    ? `${formatDateShort(order.rental_start_date)} - ${formatDateShort(order.rental_end_date)}`
    : '';
  
  return `
    <a href="/account/bestelling?id=${order.id}" class="order-item">
      <div class="order-item__info">
        <div class="order-item__number">${order.order_number}</div>
        <div class="order-item__date">
          Besteld op ${formatDateShort(order.created_at)}
          ${rentalDates ? `<br>Verhuur: ${rentalDates}` : ''}
        </div>
      </div>
      <div class="order-item__status">
        <span class="status-badge status-badge--${statusInfo.class}">
          <span class="status-badge__dot"></span>
          ${statusInfo.label}
        </span>
      </div>
      <div class="order-item__total">${formatPrice(order.total)}</div>
      <div class="order-item__action">
        <span class="btn btn--ghost btn--sm">Details →</span>
      </div>
    </a>
  `;
}

/**
 * Get status display info
 */
function getStatusInfo(status) {
  const statusMap = {
    'pending_payment': { label: 'Wacht op betaling', class: 'pending' },
    'confirmed': { label: 'Bevestigd', class: 'confirmed' },
    'preparing': { label: 'In voorbereiding', class: 'preparing' },
    'ready_for_delivery': { label: 'Klaar voor levering', class: 'confirmed' },
    'delivered': { label: 'Geleverd', class: 'delivered' },
    'returned': { label: 'Retour ontvangen', class: 'confirmed' },
    'completed': { label: 'Afgerond', class: 'completed' },
    'cancelled': { label: 'Geannuleerd', class: 'cancelled' }
  };
  return statusMap[status] || { label: status, class: 'pending' };
}

/**
 * Initialize logout button
 */
function initLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    authAPI.logout().catch(() => {});
    window.location.replace('/');
  });
}
