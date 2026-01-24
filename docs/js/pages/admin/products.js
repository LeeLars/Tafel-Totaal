/**
 * Tafel Totaal - Admin Products Page
 */

import { adminAPI } from '../../lib/api.js';
import { formatPrice, showToast } from '../../lib/utils.js';
import { requireAdmin } from '../../lib/guards.js';
import { initCSVUpload, initBulkActions, handleCheckboxChange, updateBulkToolbar } from './products-csv-bulk.js';
import { initImageUpload, setCurrentImages, getCurrentImages, clearImages } from './product-images.js';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000' 
  : 'https://tafel-totaal-production.up.railway.app';

let currentPage = 1;
let currentSearch = '';
let currentStatus = '';
let editingProduct = null;
let allProducts = []; // Store products for edit button access
let isNewProduct = false; // Track if we're creating a new product
let categories = [];
let subcategories = [];
let tagGroups = []; // Tag groups with their tags
let selectedTags = []; // Currently selected tag IDs for product being edited

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Products page initializing...');
  
  // Initialize UI components first (before auth check)
  initFilters();
  initModal();
  initCSVUpload();
  initBulkActions();
  initImageUpload();
  
  console.log('UI components initialized');
  
  // Then check authentication
  const user = await requireAdmin();
  if (!user) {
    console.log('User not authenticated or not admin, redirecting...');
    return;
  }
  
  console.log('User authenticated, loading data...');
  await loadCategories();
  await loadTagGroups();
  await loadProducts();
});

/**
 * Load categories and subcategories
 */
async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    const result = await response.json();
    
    if (result.success) {
      categories = result.data || [];
      populateCategoryDropdown();
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

/**
 * Populate category dropdown
 */
function populateCategoryDropdown() {
  const categorySelect = document.getElementById('edit-category');
  if (!categorySelect) return;
  
  // Clear existing options except first
  categorySelect.innerHTML = '<option value="">Selecteer categorie...</option>';
  
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.name;
    categorySelect.appendChild(option);
  });
}

/**
 * Load subcategories for a category
 */
async function loadSubcategories(categoryId) {
  const subcategorySelect = document.getElementById('edit-subcategory');
  if (!subcategorySelect) return;
  
  // Reset subcategory dropdown
  subcategorySelect.innerHTML = '<option value="">Geen subcategorie</option>';
  
  if (!categoryId) return;
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}/subcategories`);
    const result = await response.json();
    
    if (result.success) {
      const subs = result.data || [];
      subs.forEach(sub => {
        const option = document.createElement('option');
        option.value = sub.id;
        option.textContent = sub.name;
        subcategorySelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading subcategories:', error);
  }
}

/**
 * Load tag groups for product tagging
 */
async function loadTagGroups() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tags`);
    const result = await response.json();
    
    if (result.success) {
      tagGroups = result.data || [];
      renderTagCheckboxes();
    }
  } catch (error) {
    console.error('Error loading tags:', error);
  }
}

/**
 * Render tag checkboxes in the edit modal
 */
function renderTagCheckboxes() {
  tagGroups.forEach(group => {
    let containerId;
    if (group.slug === 'moment-beleving') {
      containerId = 'moment-tags';
    } else if (group.slug === 'stijl') {
      containerId = 'stijl-tags';
    } else {
      return;
    }
    
    const container = document.getElementById(containerId);
    if (!container || !group.tags) return;
    
    container.innerHTML = group.tags.map(tag => `
      <label style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; border: 1px solid var(--color-light-gray); cursor: pointer; font-size: var(--font-size-sm);">
        <input type="checkbox" class="tag-checkbox" value="${tag.id}" data-slug="${tag.slug}">
        ${tag.icon || ''} ${tag.name}
      </label>
    `).join('');
  });
}

/**
 * Set selected tags in checkboxes (when editing a product)
 */
function setSelectedTags(productTags) {
  selectedTags = productTags.map(t => t.id);
  
  // Uncheck all first
  document.querySelectorAll('.tag-checkbox').forEach(cb => {
    cb.checked = false;
  });
  
  // Check the ones that are selected
  productTags.forEach(tag => {
    const checkbox = document.querySelector(`.tag-checkbox[value="${tag.id}"]`);
    if (checkbox) checkbox.checked = true;
  });
}

/**
 * Get selected tag IDs from checkboxes
 */
function getSelectedTagIds() {
  const ids = [];
  document.querySelectorAll('.tag-checkbox:checked').forEach(cb => {
    ids.push(cb.value);
  });
  return ids;
}

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
    modal?.classList.remove('active');
    editingProduct = null;
    isNewProduct = false;
    clearImages();
  };

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);

  // New product button
  if (newProductBtn) {
    console.log('New product button found, attaching click handler');
    newProductBtn.addEventListener('click', (e) => {
      console.log('New product button clicked!');
      e.preventDefault();
      e.stopPropagation();
      isNewProduct = true;
      openNewProductModal();
    });
  } else {
    console.error('New product button not found!');
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveProduct();
  });

  // Category change handler to load subcategories
  const categorySelect = document.getElementById('edit-category');
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      loadSubcategories(e.target.value);
    });
  }
}

/**
 * Open modal for new product
 */
function openNewProductModal() {
  console.log('openNewProductModal called');
  editingProduct = null;
  
  // Update modal title
  const modalTitle = document.getElementById('modal-title');
  if (modalTitle) {
    modalTitle.textContent = 'Nieuw Product';
    console.log('Modal title set to Nieuw Product');
  }
  
  // Clear all fields
  document.getElementById('edit-id').value = '';
  document.getElementById('edit-name').value = '';
  document.getElementById('edit-sku').value = '';
  document.getElementById('edit-description').value = '';
  document.getElementById('edit-category').value = '';
  document.getElementById('edit-subcategory').value = '';
  document.getElementById('edit-price').value = '';
  document.getElementById('edit-deposit').value = '0';
  document.getElementById('edit-stock').value = '';
  document.getElementById('edit-buffer').value = '0';
  document.getElementById('edit-turnaround').value = '1';
  document.getElementById('edit-active').checked = true;
  
  // Clear images
  clearImages();
  
  // Clear tags
  setSelectedTags([]);
  
  const modal = document.getElementById('edit-modal');
  if (modal) {
    modal.classList.add('active');
    console.log('Modal opened for new product');
  } else {
    console.error('Modal element not found!');
  }
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
        <td colspan="10" style="text-align: center; padding: 40px; color: var(--color-error);">
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
  // Calculate available stock: total - buffer - reserved
  const reservedQty = product.reserved_quantity || 0;
  const availableStock = product.stock_total - product.stock_buffer - reservedQty;
  const stockClass = availableStock <= 0 ? 'text-error' : availableStock < 10 ? 'text-warning' : '';
  
  // Get first image or use placeholder
  const imageUrl = product.images?.[0] || '/images/products/placeholder.jpg';
  const hasImage = product.images && product.images.length > 0;
  
  return `
    <tr>
      <td>
        <input type="checkbox" class="product-checkbox" data-id="${product.id}" style="cursor: pointer;">
      </td>
      <td>
        <div class="product-thumbnail" style="width: 60px; height: 60px; border: 1px solid var(--color-light-gray); display: flex; align-items: center; justify-content: center; overflow: hidden; background: ${hasImage ? 'transparent' : 'var(--color-off-white)'};">
          ${hasImage 
            ? `<img src="${imageUrl}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">` 
            : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-gray);">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>`
          }
        </div>
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
        ${reservedQty > 0 ? `<br><small style="color: var(--color-warning);">(${reservedQty} gereserveerd)</small>` : ''}
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
  document.getElementById('edit-category').value = product.category_id || '';
  document.getElementById('edit-price').value = product.price_per_day || 0;
  document.getElementById('edit-deposit').value = product.damage_compensation_per_item || 0;
  document.getElementById('edit-stock').value = product.stock_total || 0;
  document.getElementById('edit-buffer').value = product.stock_buffer || 0;
  document.getElementById('edit-turnaround').value = product.turnaround_days || 1;
  document.getElementById('edit-active').checked = product.is_active;
  
  // Load subcategories for the selected category, then set subcategory
  if (product.category_id) {
    loadSubcategories(product.category_id).then(() => {
      document.getElementById('edit-subcategory').value = product.subcategory_id || '';
    });
  } else {
    document.getElementById('edit-subcategory').value = '';
  }
  
  // Load existing images
  setCurrentImages(product.images || []);
  
  // Set product tags
  setSelectedTags(product.tags || []);
  
  const modal = document.getElementById('edit-modal');
  if (modal) {
    modal.classList.add('active');
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
  
  const categoryId = document.getElementById('edit-category').value;
  const subcategoryId = document.getElementById('edit-subcategory').value;
  
  if (!categoryId) {
    showToast('Categorie is verplicht', 'error');
    return;
  }
  
  const data = {
    name: name,
    sku: document.getElementById('edit-sku').value.trim() || undefined,
    description: document.getElementById('edit-description').value.trim() || undefined,
    category_id: categoryId,
    subcategory_id: subcategoryId || undefined,
    price_per_day: parseFloat(document.getElementById('edit-price').value) || 0,
    damage_compensation_per_item: parseFloat(document.getElementById('edit-deposit').value) || 0,
    stock_total: parseInt(document.getElementById('edit-stock').value) || 0,
    stock_buffer: parseInt(document.getElementById('edit-buffer').value) || 0,
    turnaround_days: parseInt(document.getElementById('edit-turnaround').value) || 1,
    is_active: document.getElementById('edit-active').checked,
    images: getCurrentImages()
  };
  
  try {
    let productId = id;
    
    if (isNewProduct) {
      // Create new product
      const result = await adminAPI.createProduct(data);
      productId = result.data?.id;
      showToast('Product aangemaakt', 'success');
    } else {
      // Update existing product
      await adminAPI.updateProduct(id, data);
      showToast('Product bijgewerkt', 'success');
    }
    
    // Save tags for the product
    const tagIds = getSelectedTagIds();
    if (productId) {
      try {
        await fetch(`${API_BASE_URL}/api/tags/product/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ tag_ids: tagIds })
        });
      } catch (tagError) {
        console.error('Error saving tags:', tagError);
      }
    }
    
    document.getElementById('edit-modal').classList.remove('active');
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
