/**
 * Tafel Totaal - Admin Orders Page
 */

import { adminAPI } from '../../lib/api.js';
import { formatPrice, formatDateShort, showToast } from '../../lib/utils.js';
import { requireAdmin } from '../../lib/guards.js';
import { loadHeader } from '../../components/header.js';

let currentPage = 1;
let currentStatus = '';

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAdmin();
  if (!user) return;

  await loadHeader();
  initFilters();
  await loadOrders();
});

/**
 * Initialize filters
 */
function initFilters() {
  const statusFilter = document.getElementById('status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      currentStatus = statusFilter.value;
      currentPage = 1;
      loadOrders();
    });
  }
}

/**
 * Load orders with current filters
 */
async function loadOrders() {
  const tbody = document.getElementById('orders-table');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="6" style="text-align: center; padding: 40px;">
        <div class="spinner"></div>
      </td>
    </tr>
  `;

  try {
    const filters = {
      page: currentPage,
      limit: 20
    };
    
    if (currentStatus) {
      filters.status = currentStatus;
    }

    const response = await adminAPI.getOrders(filters);
    const orders = response.data || [];
    const pagination = response.pagination;

    if (orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px; color: var(--color-gray);">
            Geen bestellingen gevonden
          </td>
        </tr>
      `;
      renderPagination(null);
      return;
    }

    tbody.innerHTML = orders.map(order => createOrderRow(order)).join('');
    renderPagination(pagination);
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
  const rentalPeriod = order.rental_start_date && order.rental_end_date
    ? `${formatDateShort(order.rental_start_date)} - ${formatDateShort(order.rental_end_date)}`
    : '-';
  
  return `
    <tr>
      <td>
        <strong>${order.order_number}</strong>
        <br><small style="color: var(--color-gray);">${formatDateShort(order.created_at)}</small>
      </td>
      <td>
        <div class="admin-table__customer">
          <span class="admin-table__customer-name">${order.first_name} ${order.last_name}</span>
          <span class="admin-table__customer-email">${order.customer_email}</span>
        </div>
      </td>
      <td>${rentalPeriod}</td>
      <td>
        <span class="status-badge status-badge--${statusInfo.class}">
          <span class="status-badge__dot"></span>
          ${statusInfo.label}
        </span>
      </td>
      <td class="admin-table__amount">${formatPrice(order.total)}</td>
      <td>
        <div class="admin-table__actions">
          <a href="/admin/order.html?id=${order.id}" class="btn btn--ghost btn--sm">Details</a>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Render pagination
 */
function renderPagination(pagination) {
  const container = document.getElementById('pagination');
  if (!container || !pagination) {
    if (container) container.innerHTML = '';
    return;
  }

  const { page, totalPages, total } = pagination;
  
  if (totalPages <= 1) {
    container.innerHTML = `<span class="pagination__info">${total} bestelling${total !== 1 ? 'en' : ''}</span>`;
    return;
  }

  let html = '';
  
  // Previous button
  html += `
    <button class="pagination__btn" ${page <= 1 ? 'disabled' : ''} data-page="${page - 1}">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
  `;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      html += `<button class="pagination__btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
    } else if (i === page - 2 || i === page + 2) {
      html += `<span class="pagination__info">...</span>`;
    }
  }

  // Next button
  html += `
    <button class="pagination__btn" ${page >= totalPages ? 'disabled' : ''} data-page="${page + 1}">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  `;

  container.innerHTML = html;

  // Add click handlers
  container.querySelectorAll('.pagination__btn:not(:disabled)').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page);
      loadOrders();
    });
  });
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
