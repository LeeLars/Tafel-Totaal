/**
 * Tafel Totaal - Order Detail Page
 */

import { ordersAPI, authAPI } from '../../lib/api.js';
import { formatPrice, formatDateShort, formatDate, getQueryParam, showToast } from '../../lib/utils.js';
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
  await loadOrder();
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
 * Load order details
 */
async function loadOrder() {
  const orderId = getQueryParam('id');
  
  if (!orderId) {
    showError();
    return;
  }

  try {
    const response = await ordersAPI.getById(orderId);
    const order = response.data;

    if (!order) {
      showError();
      return;
    }

    renderOrder(order);
    showContent();

  } catch (error) {
    console.error('Error loading order:', error);
    showError();
  }
}

/**
 * Show loading state
 */
function showLoading() {
  document.getElementById('order-loading')?.classList.remove('hidden');
  document.getElementById('order-error')?.classList.add('hidden');
  document.getElementById('order-detail')?.classList.add('hidden');
}

/**
 * Show error state
 */
function showError() {
  document.getElementById('order-loading')?.classList.add('hidden');
  document.getElementById('order-error')?.classList.remove('hidden');
  document.getElementById('order-detail')?.classList.add('hidden');
}

/**
 * Show content
 */
function showContent() {
  document.getElementById('order-loading')?.classList.add('hidden');
  document.getElementById('order-error')?.classList.add('hidden');
  document.getElementById('order-detail')?.classList.remove('hidden');
}

/**
 * Render order details
 */
function renderOrder(order) {
  // Update page title
  document.title = `Bestelling ${order.order_number} | Tafel Totaal`;

  // Header info
  document.getElementById('order-number').textContent = order.order_number;
  document.getElementById('order-date').textContent = formatDate(order.created_at);

  // Status
  const statusInfo = getStatusInfo(order.status);
  document.getElementById('order-status').innerHTML = `
    <span class="status-badge status-badge--${statusInfo.class}">
      <span class="status-badge__dot"></span>
      ${statusInfo.label}
    </span>
  `;

  // Rental period
  if (order.rental_start_date && order.rental_end_date) {
    document.getElementById('rental-period').textContent = 
      `${formatDate(order.rental_start_date)} t/m ${formatDate(order.rental_end_date)}`;
  } else {
    document.getElementById('rental-period').textContent = 'Niet van toepassing';
  }

  // Items
  const items = order.items || [];
  const itemsHtml = items.map(item => `
    <tr>
      <td>${item.item_type === 'package' ? 'Pakket' : 'Product'}${item.persons ? ` (${item.persons} pers.)` : ''}</td>
      <td>${item.quantity}</td>
      <td>${formatPrice(item.unit_price)}</td>
      <td>${formatPrice(item.line_total)}</td>
    </tr>
  `).join('');
  document.getElementById('order-items').innerHTML = itemsHtml || '<tr><td colspan="4">Geen items</td></tr>';

  // Summary
  const subtotal = order.subtotal || items.reduce((sum, item) => sum + (item.line_total || 0), 0);
  document.getElementById('summary-subtotal').textContent = formatPrice(subtotal);
  document.getElementById('summary-delivery').textContent = formatPrice(order.delivery_cost || 0);
  document.getElementById('summary-deposit').textContent = formatPrice(order.damage_compensation_total || 0);
  document.getElementById('summary-total').textContent = formatPrice(order.total);

  // Delivery info
  const deliveryMethod = order.delivery_method === 'PICKUP' ? 'Afhalen' : 'Bezorgen';
  let deliveryText = deliveryMethod;
  
  if (order.delivery_address) {
    const addr = order.delivery_address;
    deliveryText += `<br>${addr.street} ${addr.house_number}<br>${addr.postal_code} ${addr.city}`;
  }
  
  document.getElementById('delivery-info').innerHTML = deliveryText;
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
