/**
 * Tafel Totaal - Admin Dashboard Page
 */

import { adminAPI } from '../../lib/api.js';
import { formatPrice, formatDateShort, showToast } from '../../lib/utils.js';
import { requireAdmin } from '../../lib/guards.js';

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAdmin();
  if (!user) return;

  await loadDashboardStats();
  await loadRecentOrders();
});

/**
 * Load dashboard statistics
 */
async function loadDashboardStats() {
  try {
    const response = await adminAPI.getDashboardStats();
    const stats = response.data;

    document.getElementById('stat-today').textContent = stats.todayOrders || 0;
    document.getElementById('stat-active').textContent = stats.activeRentals || 0;
    document.getElementById('stat-returns').textContent = stats.pendingReviews || 0;
    document.getElementById('stat-revenue').textContent = formatPrice(stats.monthlyRevenue || 0);
  } catch (error) {
    console.error('Error loading stats:', error);
    document.getElementById('stat-today').textContent = '-';
    document.getElementById('stat-active').textContent = '-';
    document.getElementById('stat-returns').textContent = '-';
    document.getElementById('stat-revenue').textContent = '-';
  }
}

/**
 * Load recent orders
 */
async function loadRecentOrders() {
  const tbody = document.getElementById('recent-orders');
  if (!tbody) return;

  try {
    const response = await adminAPI.getOrders({ limit: 5 });
    const orders = response.data || [];

    if (orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px; color: var(--color-gray);">
            Nog geen bestellingen
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = orders.map(order => createOrderRow(order)).join('');
  } catch (error) {
    console.error('Error loading orders:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: var(--color-error);">
          Kon bestellingen niet laden
        </td>
      </tr>
    `;
  }
}

/**
 * Create order table row
 */
function createOrderRow(order) {
  const statusInfo = getStatusInfo(order.status);
  
  return `
    <tr>
      <td>
        <strong>${order.order_number}</strong>
      </td>
      <td>
        <div class="admin-table__customer">
          <span class="admin-table__customer-name">${order.first_name} ${order.last_name}</span>
          <span class="admin-table__customer-email">${order.customer_email}</span>
        </div>
      </td>
      <td>${formatDateShort(order.created_at)}</td>
      <td>
        <span class="status-badge status-badge--${statusInfo.class}">
          <span class="status-badge__dot"></span>
          ${statusInfo.label}
        </span>
      </td>
      <td class="admin-table__amount">${formatPrice(order.total)}</td>
      <td>
        <a href="/Tafel-Totaal/admin/order.html?id=${order.id}" class="btn btn--ghost btn--sm">Details</a>
      </td>
    </tr>
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
