/**
 * Tafel Totaal - Admin Customers Page (CRM)
 */

import { adminAPI } from '../../lib/api.js';
import { formatPrice, formatDateShort, showToast } from '../../lib/utils.js';
import { requireAdmin } from '../../lib/guards.js';
import { loadHeader } from '../../components/header.js';

const API_BASE_URL = window.location.hostname.includes('github.io') 
  ? 'https://tafel-totaal-production.up.railway.app' 
  : 'http://localhost:3000';

let currentPage = 1;
let currentSearch = '';

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAdmin();
  if (!user) return;

  await loadHeader();
  initFilters();
  initModal();
  await loadCustomers();
});

/**
 * Initialize filters
 */
function initFilters() {
  const searchInput = document.getElementById('search-input');
  
  let searchTimeout;
  
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentSearch = searchInput.value;
        currentPage = 1;
        loadCustomers();
      }, 300);
    });
  }
}

/**
 * Load customers with current filters
 */
async function loadCustomers() {
  const tbody = document.getElementById('customers-table');
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
    
    if (currentSearch) {
      filters.search = currentSearch;
    }

    const response = await adminAPI.getCustomers(filters);
    const customers = response.data || [];
    const pagination = response.pagination;

    if (customers.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px; color: var(--color-gray);">
            Geen klanten gevonden
          </td>
        </tr>
      `;
      renderPagination(null);
      return;
    }

    tbody.innerHTML = customers.map(customer => createCustomerRow(customer)).join('');
    
    // Add click listeners for customer rows
    tbody.querySelectorAll('.customer-row').forEach(row => {
      row.addEventListener('click', () => {
        const customerId = row.dataset.customerId;
        showCustomerDetail(customerId);
      });
    });
    
    renderPagination(pagination);
  } catch (error) {
    console.error('Error loading customers:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: var(--color-error);">
          Kon klanten niet laden
        </td>
      </tr>
    `;
  }
}

/**
 * Initialize modal
 */
function initModal() {
  const modal = document.getElementById('customer-modal');
  const closeBtn = document.getElementById('customer-modal-close');

  if (modal) {
    closeBtn?.addEventListener('click', () => modal.classList.remove('open'));
    modal.querySelector('.modal__backdrop')?.addEventListener('click', () => modal.classList.remove('open'));
  }
}

/**
 * Create customer table row
 */
function createCustomerRow(customer) {
  const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Onbekend';
  const initials = `${customer.first_name?.[0] || ''}${customer.last_name?.[0] || ''}`.toUpperCase() || '?';
  
  return `
    <tr class="customer-row" data-customer-id="${customer.id}" style="cursor: pointer;">
      <td>
        <div class="admin-table__customer">
          <div class="admin-table__avatar">${initials}</div>
          <span class="admin-table__customer-name">${fullName}</span>
        </div>
      </td>
      <td>
        <a href="mailto:${customer.email}" style="color: var(--color-primary);" onclick="event.stopPropagation();">${customer.email}</a>
      </td>
      <td>${customer.phone || '-'}</td>
      <td>
        <strong>${customer.order_count || 0}</strong>
      </td>
      <td class="admin-table__amount">${formatPrice(customer.total_spent || 0)}</td>
      <td>${formatDateShort(customer.created_at)}</td>
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
    container.innerHTML = `<span class="pagination__info">${total} klant${total !== 1 ? 'en' : ''}</span>`;
    return;
  }

  let html = '';
  
  html += `
    <button class="pagination__btn" ${page <= 1 ? 'disabled' : ''} data-page="${page - 1}">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      html += `<button class="pagination__btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
    } else if (i === page - 2 || i === page + 2) {
      html += `<span class="pagination__info">...</span>`;
    }
  }

  html += `
    <button class="pagination__btn" ${page >= totalPages ? 'disabled' : ''} data-page="${page + 1}">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  `;

  container.innerHTML = html;

  container.querySelectorAll('.pagination__btn:not(:disabled)').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page);
      loadCustomers();
    });
  });
}

/**
 * Show customer detail modal (CRM view)
 */
async function showCustomerDetail(customerId) {
  const modal = document.getElementById('customer-modal');
  const title = document.getElementById('customer-modal-title');
  const body = document.getElementById('customer-modal-body');

  if (!modal || !body) return;

  // Show loading state
  body.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <div class="spinner"></div>
      <p>Klantgegevens laden...</p>
    </div>
  `;
  modal.classList.add('open');

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/customers/${customerId}`, {
      credentials: 'include'
    });
    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error('Customer not found');
    }

    const customer = result.data;
    const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Onbekend';
    const initials = `${customer.first_name?.[0] || ''}${customer.last_name?.[0] || ''}`.toUpperCase() || '?';

    title.textContent = fullName;

    body.innerHTML = `
      <div class="customer-detail">
        <!-- Customer Info Section -->
        <div class="customer-detail__header">
          <div class="customer-detail__avatar">${initials}</div>
          <div class="customer-detail__info">
            <h4>${fullName}</h4>
            <p class="customer-detail__email">
              <a href="mailto:${customer.email}">${customer.email}</a>
            </p>
            ${customer.phone ? `<p class="customer-detail__phone">${customer.phone}</p>` : ''}
            ${customer.company_name ? `<p class="customer-detail__company">${customer.company_name}</p>` : ''}
          </div>
          <div class="customer-detail__stats">
            <div class="customer-stat">
              <span class="customer-stat__value">${customer.orders?.length || 0}</span>
              <span class="customer-stat__label">Bestellingen</span>
            </div>
            <div class="customer-stat">
              <span class="customer-stat__value">${formatPrice(customer.orders?.reduce((sum, o) => sum + parseFloat(o.total || 0), 0) || 0)}</span>
              <span class="customer-stat__label">Totaal besteed</span>
            </div>
          </div>
        </div>

        <!-- Contact Actions -->
        <div class="customer-detail__actions">
          <a href="mailto:${customer.email}" class="btn btn--secondary btn--sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            E-mail
          </a>
          ${customer.phone ? `
            <a href="tel:${customer.phone}" class="btn btn--secondary btn--sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Bellen
            </a>
          ` : ''}
        </div>

        <!-- Order History -->
        <div class="customer-detail__section">
          <h5>Bestelgeschiedenis</h5>
          ${customer.orders && customer.orders.length > 0 ? `
            <div class="customer-orders">
              ${customer.orders.map(order => `
                <a href="order.html?id=${order.id}" class="customer-order">
                  <div class="customer-order__info">
                    <span class="customer-order__number">${order.order_number}</span>
                    <span class="customer-order__date">${formatDateShort(order.created_at)}</span>
                  </div>
                  <div class="customer-order__details">
                    <span class="status-badge status-badge--${getStatusClass(order.status)}">
                      <span class="status-badge__dot"></span>
                      ${getStatusText(order.status)}
                    </span>
                    <span class="customer-order__total">${formatPrice(order.total)}</span>
                  </div>
                </a>
              `).join('')}
            </div>
          ` : `
            <p style="color: var(--color-gray); text-align: center; padding: var(--space-lg);">
              Geen bestellingen gevonden
            </p>
          `}
        </div>

        <!-- Customer Details -->
        <div class="customer-detail__section">
          <h5>Klantgegevens</h5>
          <div class="customer-detail__grid">
            <div class="detail-item">
              <span class="detail-item__label">Lid sinds</span>
              <span class="detail-item__value">${formatDateShort(customer.created_at)}</span>
            </div>
            ${customer.vat_number ? `
              <div class="detail-item">
                <span class="detail-item__label">BTW nummer</span>
                <span class="detail-item__value">${customer.vat_number}</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading customer detail:', error);
    body.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--color-error);">
        <p>Kon klantgegevens niet laden</p>
      </div>
    `;
  }
}

/**
 * Get status class for order status
 */
function getStatusClass(status) {
  const classes = {
    'pending_payment': 'pending',
    'confirmed': 'confirmed',
    'preparing': 'pending',
    'ready_for_delivery': 'confirmed',
    'delivered': 'confirmed',
    'returned': 'confirmed',
    'completed': 'confirmed',
    'cancelled': 'cancelled',
    'payment_failed': 'cancelled'
  };
  return classes[status] || 'pending';
}

/**
 * Get status text for order status
 */
function getStatusText(status) {
  const texts = {
    'pending_payment': 'Wacht op betaling',
    'confirmed': 'Bevestigd',
    'preparing': 'In voorbereiding',
    'ready_for_delivery': 'Klaar voor levering',
    'delivered': 'Geleverd',
    'returned': 'Retour',
    'completed': 'Voltooid',
    'cancelled': 'Geannuleerd',
    'payment_failed': 'Betaling mislukt'
  };
  return texts[status] || status;
}
