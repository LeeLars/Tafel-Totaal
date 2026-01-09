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
let allProducts = []; // Store products for edit button access
let isNewProduct = false; // Track if we're creating a new product

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
  const newProductBtn = document.getElementById('new-product-btn');

  const closeModal = () => {
    modal?.classList.remove('open');
    editingProduct = null;
    isNewProduct = false;
    clearImages();
  };

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);

  // New product button
  newProductBtn?.addEventListener('click', () => {
    isNewProduct = true;
    openNewProductModal();
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveProduct();
  });
}

/**
 * Open modal for new product
 */
function openNewProductModal() {
  editingProduct = null;
  
  // Update modal title
  const modalTitle = document.getElementById('modal-title');
  if (modalTitle) modalTitle.textContent = 'Nieuw Product';
  
  // Clear all fields
  document.getElementById('edit-id').value = '';
  document.getElementById('edit-name').value = '';
  document.getElementById('edit-sku').value = '';
  document.getElementById('edit-description').value = '';
  document.getElementById('edit-price').value = '';
  document.getElementById('edit-deposit').value = '0';
  document.getElementById('edit-stock').value = '';
  document.getElementById('edit-buffer').value = '0';
  document.getElementById('edit-turnaround').value = '1';
  document.getElementById('edit-active').checked = true;
  
  // Clear images
  clearImages();
  
  document.getElementById('edit-modal').classList.add('open');
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
    allProducts = response.data || [];
    const pagination = response.pagination;

    if (allProducts.length === 0) {
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

    tbody.innerHTML = allProducts.map(product => createProductRow(product)).join('');
    renderPagination(pagination);
    
    // Add edit button handlers
    const editButtons = tbody.querySelectorAll('.edit-btn');
    console.log('Found edit buttons:', editButtons.length);
    
    editButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Edit button clicked, product ID:', btn.dataset.id);
        const productId = btn.dataset.id;
        const product = allProducts.find(p => p.id === productId);
        console.log('Found product:', product);
        if (product) {
          isNewProduct = false;
          openEditModal(product);
        } else {
          console.error('Product not found in allProducts array');
        }
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
  console.log('openEditModal called with product:', product);
  editingProduct = product;
  
  // Update modal title
  const modalTitle = document.getElementById('modal-title');
  if (modalTitle) {
    modalTitle.textContent = 'Product Bewerken';
    console.log('Modal title updated');
  }
  
  document.getElementById('edit-id').value = product.id;
  document.getElementById('edit-name').value = product.name;
  document.getElementById('edit-sku').value = product.sku || '';
  document.getElementById('edit-description').value = product.description || '';
  document.getElementById('edit-price').value = product.price_per_day || 0;
  document.getElementById('edit-deposit').value = product.deposit_per_item || 0;
  document.getElementById('edit-stock').value = product.stock_total || 0;
  document.getElementById('edit-buffer').value = product.stock_buffer || 0;
  document.getElementById('edit-turnaround').value = product.turnaround_days || 1;
  document.getElementById('edit-active').checked = product.is_active;
  
  // Load existing images
  setCurrentImages(product.images || []);
  
  const modal = document.getElementById('edit-modal');
  if (modal) {
    modal.classList.add('open');
    console.log('Modal opened');
  } else {
    console.error('Modal element not found');
  }
}

/**
 * Save product (create or update)
 */
async function saveProduct() {
  const id = document.getElementById('edit-id').value;
  const name = document.getElementById('edit-name').value.trim();
  
  if (!name) {
    showToast('Productnaam is verplicht', 'error');
    return;
  }
  
  const data = {
    name: name,
    sku: document.getElementById('edit-sku').value.trim() || undefined,
    description: document.getElementById('edit-description').value.trim() || undefined,
    price_per_day: parseFloat(document.getElementById('edit-price').value) || 0,
    deposit_per_item: parseFloat(document.getElementById('edit-deposit').value) || 0,
    stock_total: parseInt(document.getElementById('edit-stock').value) || 0,
    stock_buffer: parseInt(document.getElementById('edit-buffer').value) || 0,
    turnaround_days: parseInt(document.getElementById('edit-turnaround').value) || 1,
    is_active: document.getElementById('edit-active').checked,
    images: getCurrentImages()
  };
  
  try {
    if (isNewProduct) {
      // Create new product
      await adminAPI.createProduct(data);
      showToast('Product aangemaakt', 'success');
    } else {
      // Update existing product
      await adminAPI.updateProduct(id, data);
      showToast('Product bijgewerkt', 'success');
    }
    
    document.getElementById('edit-modal').classList.remove('open');
    editingProduct = null;
    isNewProduct = false;
    clearImages();
    await loadProducts();
  } catch (error) {
    console.error('Error saving product:', error);
    showToast(isNewProduct ? 'Kon product niet aanmaken' : 'Kon product niet bijwerken', 'error');
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
