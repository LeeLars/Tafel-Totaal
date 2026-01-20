/**
 * Tafel Totaal - Admin Orders Page
 */

import { adminAPI } from '../../lib/api.js';
import { formatPrice, formatDateShort, showToast } from '../../lib/utils.js';
import { requireAdmin } from '../../lib/guards.js';

let currentPage = 1;
let currentStatus = '';

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAdmin();
  if (!user) return;

  initFilters();
  initTableInteractions();
  await loadOrders();
});

function initTableInteractions() {
  const tbody = document.getElementById('orders-table');
  if (!tbody) return;

  tbody.addEventListener('click', async (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;

    if (target.closest('a, button, input, select, textarea')) return;

    const row = target.closest('tr');
    if (!row) return;

    const id = row.getAttribute('data-order-id');
    if (!id) return;

    window.location.href = `/Tafel-Totaal/admin/order.html?id=${id}`;
  });

  tbody.addEventListener('click', async (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;

    const cancelBtn = target.closest('[data-action="cancel-order"]');
    const deleteBtn = target.closest('[data-action="delete-order"]');
    if (!cancelBtn && !deleteBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const id = (cancelBtn || deleteBtn)?.getAttribute('data-order-id');
    if (!id) return;

    if (cancelBtn) {
      const ok = await showConfirmModal('Bestelling annuleren?', 'Wil je deze bestelling annuleren?');
      if (!ok) return;
      try {
        await adminAPI.updateOrderStatus(id, 'cancelled');
        showToast('Bestelling geannuleerd', 'success');
        await loadOrders();
      } catch (err) {
        console.error(err);
        showToast(err.message || 'Kon bestelling niet annuleren', 'error');
      }
      return;
    }

    if (deleteBtn) {
      const ok = await showConfirmModal('Bestelling verwijderen?', 'Deze actie kan niet ongedaan worden gemaakt. Wil je doorgaan?');
      if (!ok) return;
      try {
        await adminAPI.deleteOrder(id);
        showToast('Bestelling verwijderd', 'success');
        await loadOrders();
      } catch (err) {
        console.error(err);
        showToast(err.message || 'Kon bestelling niet verwijderen', 'error');
      }
    }
  });
}

function showConfirmModal(title, message) {
  return new Promise((resolve) => {
    if (!document.getElementById('admin-confirm-modal')) {
      const modalHtml = `
        <div id="admin-confirm-modal-backdrop" class="modal-backdrop"></div>
        <div id="admin-confirm-modal" class="modal">
          <div class="modal__header">
            <h3 class="modal__title" style="font-family: var(--font-display); text-transform: uppercase;">${title}</h3>
            <button class="modal__close" type="button" id="admin-confirm-close">&times;</button>
          </div>
          <div class="modal__body">
            <p id="admin-confirm-message">${message}</p>
          </div>
          <div class="modal__footer">
            <button class="btn btn--secondary" type="button" id="admin-confirm-cancel">Annuleren</button>
            <button class="btn btn--primary" type="button" id="admin-confirm-ok">Bevestigen</button>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    const backdrop = document.getElementById('admin-confirm-modal-backdrop');
    const modal = document.getElementById('admin-confirm-modal');
    const msg = document.getElementById('admin-confirm-message');
    const closeBtn = document.getElementById('admin-confirm-close');
    const cancelBtn = document.getElementById('admin-confirm-cancel');
    const okBtn = document.getElementById('admin-confirm-ok');
    const titleEl = modal?.querySelector('.modal__title');

    if (msg) msg.textContent = message;
    if (titleEl) titleEl.textContent = title;

    const cleanup = (value) => {
      backdrop?.classList.remove('active');
      modal?.classList.remove('active');
      closeBtn.onclick = null;
      cancelBtn.onclick = null;
      okBtn.onclick = null;
      resolve(value);
    };

    closeBtn.onclick = () => cleanup(false);
    cancelBtn.onclick = () => cleanup(false);
    okBtn.onclick = () => cleanup(true);
    backdrop.onclick = () => cleanup(false);

    modal?.offsetHeight;
    backdrop?.classList.add('active');
    modal?.classList.add('active');
  });
}

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

  const canCancel = order.status !== 'cancelled' && order.status !== 'completed';
  const canDelete = order.status === 'cancelled';
  
  return `
    <tr data-order-id="${order.id}" style="cursor: pointer;">
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
          <a href="/Tafel-Totaal/admin/order.html?id=${order.id}" class="btn btn--ghost btn--sm">Details</a>
          ${canCancel ? `<button type="button" class="btn btn--secondary btn--sm" data-action="cancel-order" data-order-id="${order.id}">Annuleren</button>` : ''}
          ${canDelete ? `<button type="button" class="btn btn--primary btn--sm" data-action="delete-order" data-order-id="${order.id}">Verwijderen</button>` : ''}
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
