/**
 * Tafel Totaal - Admin Customers Page
 */

import { adminAPI } from '../../lib/api.js';
import { formatPrice, formatDateShort, showToast } from '../../lib/utils.js';
import { requireAdmin } from '../../lib/guards.js';
import { loadHeader } from '../../components/header.js';

let currentPage = 1;
let currentSearch = '';

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAdmin();
  if (!user) return;

  await loadHeader();
  initFilters();
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
 * Create customer table row
 */
function createCustomerRow(customer) {
  const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Onbekend';
  const initials = `${customer.first_name?.[0] || ''}${customer.last_name?.[0] || ''}`.toUpperCase() || '?';
  
  return `
    <tr>
      <td>
        <div class="admin-table__customer">
          <div class="admin-table__avatar">${initials}</div>
          <span class="admin-table__customer-name">${fullName}</span>
        </div>
      </td>
      <td>
        <a href="mailto:${customer.email}" style="color: var(--color-primary);">${customer.email}</a>
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
