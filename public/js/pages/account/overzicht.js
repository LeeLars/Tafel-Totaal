/**
 * Tafel Totaal - Account Overview Page
 */

import { ordersAPI, authAPI } from '../../lib/api.js';
import { formatPrice, formatDateShort, showToast } from '../../lib/utils.js';
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
  await loadStats();
  await loadRecentOrders();
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
  document.getElementById('welcome-name').textContent = currentUser.first_name;
}

/**
 * Load account stats
 */
async function loadStats() {
  try {
    const response = await ordersAPI.getMyOrders();
    const orders = response.data || [];
    
    // Total orders
    document.getElementById('stat-orders').textContent = orders.length;
    
    // Active rentals (delivered but not returned/completed)
    const activeStatuses = ['confirmed', 'preparing', 'ready_for_delivery', 'delivered'];
    const activeOrders = orders.filter(o => activeStatuses.includes(o.status));
    document.getElementById('stat-active').textContent = activeOrders.length;
    
  } catch (error) {
    console.error('Error loading stats:', error);
    document.getElementById('stat-orders').textContent = '-';
    document.getElementById('stat-active').textContent = '-';
  }
}

/**
 * Load recent orders (last 3)
 */
async function loadRecentOrders() {
  const container = document.getElementById('recent-orders');
  if (!container) return;

  try {
    const response = await ordersAPI.getMyOrders();
    const orders = (response.data || []).slice(0, 3);

    if (orders.length === 0) {
      container.innerHTML = `
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
          <a href="/Tafel-Totaal/pakketten.html" class="btn btn--primary">Bekijk Pakketten</a>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => createOrderItem(order)).join('');

  } catch (error) {
    console.error('Error loading orders:', error);
    container.innerHTML = `
      <div class="empty-state">
        <p>Kon bestellingen niet laden.</p>
        <button class="btn btn--secondary btn--sm" onclick="location.reload()">Opnieuw proberen</button>
      </div>
    `;
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
    <a href="/Tafel-Totaal/account/bestelling.html?id=${order.id}" class="order-item">
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
