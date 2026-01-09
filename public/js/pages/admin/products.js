/**
 * Tafel Totaal - Admin Products Page
 */

import { adminAPI } from '../../lib/api.js';
import { formatPrice, showToast } from '../../lib/utils.js';
import { requireAdmin } from '../../lib/guards.js';
import { initCSVUpload, initBulkActions, handleCheckboxChange, updateBulkToolbar } from './products-csv-bulk.js';
import { initImageUpload, setCurrentImages, getCurrentImages, clearImages } from './product-images.js';

let currentPage = 1;
let currentSearch = '';
let currentStatus = '';
let editingProduct = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAdmin();
  if (!user) return;

  initFilters();
  initModal();
  initCSVUpload();
  initBulkActions();
  initImageUpload();
  await loadProducts();
});

/**
 * Initialize filters
 */
function initFilters() {
  const searchInput = document.getElementById('search-input');
  const statusFilter = document.getElementById('status-filter');
  
  let searchTimeout;
  
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentSearch = searchInput.value;
        currentPage = 1;
        loadProducts();
      }, 300);
    });
  }
  
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      currentStatus = statusFilter.value;
      currentPage = 1;
      loadProducts();
    });
  }
}

/**
 * Initialize modal
 */
function initModal() {
  const modal = document.getElementById('edit-modal');
  const closeBtn = document.getElementById('modal-close');
  const cancelBtn = document.getElementById('cancel-edit');
  const form = document.getElementById('edit-form');
  const backdrop = modal?.querySelector('.modal__backdrop');

  const closeModal = () => {
    modal?.classList.remove('open');
    editingProduct = null;
    clearImages();
  };

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveProduct();
  });
}

/**
 * Load products with current filters
 */
async function loadProducts() {
  const tbody = document.getElementById('products-table');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="8" style="text-align: center; padding: 40px;">
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
    
    if (currentStatus) {
      filters.is_active = currentStatus;
    }

    const response = await adminAPI.getProducts(filters);
    const products = response.data || [];
    const pagination = response.pagination;

    if (products.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 40px; color: var(--color-gray);">
            Geen producten gevonden
          </td>
        </tr>
      `;
      renderPagination(null);
      return;
    }

    tbody.innerHTML = products.map(product => createProductRow(product)).join('');
    renderPagination(pagination);
    
    // Add edit button handlers
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.id;
        const product = products.find(p => p.id === productId);
        if (product) openEditModal(product);
      });
    });
    
    // Add checkbox handlers
    tbody.querySelectorAll('.product-checkbox').forEach(cb => {
      cb.addEventListener('change', () => handleCheckboxChange(cb));
    });
  } catch (error) {
    console.error('Error loading products:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: var(--color-error);">
          Kon producten niet laden
        </td>
      </tr>
    `;
  }
}

/**
 * Create product table row
 */
function createProductRow(product) {
  const availableStock = product.stock_total - product.stock_buffer;
  const stockClass = availableStock <= 0 ? 'text-error' : availableStock < 10 ? 'text-warning' : '';
  
  return `
    <tr>
      <td>
        <input type="checkbox" class="product-checkbox" data-id="${product.id}" style="cursor: pointer;">
      </td>
      <td>
        <strong>${product.name}</strong>
      </td>
      <td style="font-family: var(--font-mono); font-size: 0.85rem;">${product.sku || '-'}</td>
      <td>${product.category_name || '-'}</td>
      <td>${formatPrice(product.price_per_day)}</td>
      <td class="${stockClass}">
        <strong>${availableStock}</strong>
        <small style="color: var(--color-gray);">/ ${product.stock_total}</small>
      </td>
      <td>${product.stock_buffer}</td>
      <td>
        <span class="status-badge status-badge--${product.is_active ? 'confirmed' : 'cancelled'}">
          <span class="status-badge__dot"></span>
          ${product.is_active ? 'Actief' : 'Inactief'}
        </span>
      </td>
      <td>
        <button class="btn btn--ghost btn--sm edit-btn" data-id="${product.id}">Bewerken</button>
      </td>
    </tr>
  `;
}

/**
 * Open edit modal
 */
function openEditModal(product) {
  editingProduct = product;
  
  document.getElementById('edit-id').value = product.id;
  document.getElementById('edit-name').value = product.name;
  document.getElementById('edit-price').value = product.price_per_day || 0;
  document.getElementById('edit-deposit').value = product.deposit_per_item || 0;
  document.getElementById('edit-stock').value = product.stock_total || 0;
  document.getElementById('edit-buffer').value = product.stock_buffer || 0;
  document.getElementById('edit-turnaround').value = product.turnaround_days || 1;
  document.getElementById('edit-active').checked = product.is_active;
  
  // Load existing images
  setCurrentImages(product.images || []);
  
  document.getElementById('edit-modal').classList.add('open');
}

/**
 * Save product
 */
async function saveProduct() {
  if (!editingProduct) return;
  
  const id = document.getElementById('edit-id').value;
  const data = {
    price_per_day: parseFloat(document.getElementById('edit-price').value),
    deposit_per_item: parseFloat(document.getElementById('edit-deposit').value),
    stock_total: parseInt(document.getElementById('edit-stock').value),
    stock_buffer: parseInt(document.getElementById('edit-buffer').value),
    turnaround_days: parseInt(document.getElementById('edit-turnaround').value),
    is_active: document.getElementById('edit-active').checked,
    images: getCurrentImages()
  };
  
  try {
    await adminAPI.updateProduct(id, data);
    showToast('Product bijgewerkt', 'success');
    document.getElementById('edit-modal').classList.remove('open');
    editingProduct = null;
    clearImages();
    await loadProducts();
  } catch (error) {
    console.error('Error updating product:', error);
    showToast('Kon product niet bijwerken', 'error');
  }
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
    container.innerHTML = `<span class="pagination__info">${total} product${total !== 1 ? 'en' : ''}</span>`;
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
      loadProducts();
    });
  });
}
