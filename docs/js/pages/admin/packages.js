/**
 * Tafel Totaal - Admin Packages Page
 */

import { adminAPI } from '../../lib/api.js';
import { formatPrice, showToast } from '../../lib/utils.js';
import { requireAdmin } from '../../lib/guards.js';

const API_BASE_URL = false 
  ? 'https://tafel-totaal-production.up.railway.app' 
  : 'http://localhost:3000';

let currentPage = 1;
let currentSearch = '';
let currentStatus = '';
let currentFeatured = '';
let editingPackage = null;
let allPackages = [];
let isNewPackage = false;
let packageProducts = [];
let availableProducts = [];

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Packages page initializing...');
  
  // Initialize UI components first
  initFilters();
  initModal();
  initAddProductModal();
  
  console.log('UI components initialized');
  
  // Then check authentication
  const user = await requireAdmin();
  if (!user) {
    console.log('User not authenticated or not admin, redirecting...');
    return;
  }
  
  console.log('User authenticated, loading packages...');
  await loadPackages();
  await loadAvailableProducts();
});

/**
 * Initialize filters
 */
function initFilters() {
  const searchInput = document.getElementById('search-input');
  const statusFilter = document.getElementById('status-filter');
  const featuredFilter = document.getElementById('featured-filter');
  
  searchInput?.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    currentPage = 1;
    loadPackages();
  });

  statusFilter?.addEventListener('change', (e) => {
    currentStatus = e.target.value;
    currentPage = 1;
    loadPackages();
  });

  featuredFilter?.addEventListener('change', (e) => {
    currentFeatured = e.target.value;
    currentPage = 1;
    loadPackages();
  });
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
  const newPackageBtn = document.getElementById('new-package-btn');

  const closeModal = () => {
    modal?.classList.remove('active');
    editingPackage = null;
    isNewPackage = false;
    packageProducts = [];
  };

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);

  // New package button
  if (newPackageBtn) {
    console.log('New package button found, attaching click handler');
    newPackageBtn.addEventListener('click', (e) => {
      console.log('New package button clicked!');
      e.preventDefault();
      e.stopPropagation();
      isNewPackage = true;
      openNewPackageModal();
    });
  } else {
    console.error('New package button not found!');
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await savePackage();
  });

  // Initialize image upload
  initImageUpload();
}

/**
 * Initialize image upload functionality
 */
function initImageUpload() {
  const uploadBtn = document.getElementById('upload-image-btn');
  const fileInput = document.getElementById('image-upload');
  const removeBtn = document.getElementById('remove-image-btn');

  uploadBtn?.addEventListener('click', () => {
    fileInput?.click();
  });

  fileInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadImage(file);
    }
  });

  removeBtn?.addEventListener('click', () => {
    removeImage();
  });
}

/**
 * Upload image via backend (same as products)
 */
async function uploadImage(file) {
  // Validate file
  if (!file.type.startsWith('image/')) {
    showToast('Alleen afbeeldingen zijn toegestaan', 'error');
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    showToast('Afbeelding mag maximaal 5MB zijn', 'error');
    return;
  }

  const progressContainer = document.getElementById('upload-progress');
  const progressBar = document.getElementById('progress-bar');
  
  try {
    // Show progress
    if (progressContainer) {
      progressContainer.style.display = 'block';
    }
    if (progressBar) {
      progressBar.style.width = '30%';
    }

    // Create form data
    const formData = new FormData();
    formData.append('image', file);

    if (progressBar) {
      progressBar.style.width = '60%';
    }

    console.log('Uploading via backend:', {
      fileName: file.name,
      fileSize: file.size
    });

    // Upload via backend (same endpoint as products)
    const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error response:', errorText);
      throw new Error('Upload mislukt');
    }

    const data = await response.json();
    console.log('Upload successful:', data);
    
    if (progressBar) {
      progressBar.style.width = '100%';
    }

    if (!data.success || !data.data?.url) {
      throw new Error('Geen URL ontvangen van server');
    }

    // Set image URL
    const imageUrl = data.data.url;
    document.getElementById('edit-image-url').value = imageUrl;

    // Show preview
    showImagePreview(imageUrl);

    // Hide progress
    setTimeout(() => {
      if (progressContainer) {
        progressContainer.style.display = 'none';
      }
      if (progressBar) {
        progressBar.style.width = '0%';
      }
    }, 500);

    showToast('Afbeelding succesvol geüpload! ✓', 'success');
  } catch (error) {
    console.error('Upload error:', error);
    
    if (progressContainer) {
      progressContainer.style.display = 'none';
    }
    if (progressBar) {
      progressBar.style.width = '0%';
    }
    
    showToast(`Fout bij uploaden: ${error.message}`, 'error');
  }
}

/**
 * Show image preview
 */
function showImagePreview(url) {
  const preview = document.getElementById('image-preview');
  const img = document.getElementById('preview-img');
  
  if (preview && img) {
    img.src = url;
    preview.style.display = 'block';
  }
}

/**
 * Remove image
 * @param {boolean} showNotification - Whether to show toast notification (default: true)
 */
function removeImage(showNotification = true) {
  document.getElementById('edit-image-url').value = '';
  document.getElementById('image-preview').style.display = 'none';
  document.getElementById('preview-img').src = '';
  document.getElementById('image-upload').value = '';
  if (showNotification) {
    showToast('Afbeelding verwijderd', 'success');
  }
}

/**
 * Initialize add product modal
 */
function initAddProductModal() {
  const modal = document.getElementById('add-product-modal');
  const closeBtn = document.getElementById('add-product-close');
  const backdrop = modal?.querySelector('.modal__backdrop');
  const addBtn = document.getElementById('add-product-btn');
  const searchInput = document.getElementById('product-search');

  const closeModal = () => {
    modal?.classList.remove('active');
    searchInput.value = '';
    document.getElementById('product-results').innerHTML = '';
  };

  closeBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);

  addBtn?.addEventListener('click', () => {
    modal?.classList.add('active');
    selectedProductIds.clear(); // Reset selection when opening modal
    renderProductSearch();
  });

  searchInput?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    renderProductSearch(query);
  });
}

/**
 * Open modal for new package
 */
function openNewPackageModal() {
  console.log('openNewPackageModal called');
  editingPackage = null;
  packageProducts = [];
  
  // Update modal title
  const modalTitle = document.getElementById('modal-title');
  if (modalTitle) {
    modalTitle.textContent = 'Nieuw Pakket';
    console.log('Modal title set to Nieuw Pakket');
  }
  
  // Clear all fields
  document.getElementById('edit-id').value = '';
  document.getElementById('edit-name').value = '';
  document.getElementById('edit-slug').value = '';
  document.getElementById('edit-short-description').value = '';
  document.getElementById('edit-description').value = '';
  document.getElementById('edit-image-url').value = '';
  document.getElementById('edit-price').value = '';
  document.getElementById('edit-deposit').value = '0';
  document.getElementById('edit-persons').value = '1';
  document.getElementById('edit-category').value = '';
  document.getElementById('edit-featured').checked = false;
  document.getElementById('edit-active').checked = true;
  
  // Clear image preview (without notification)
  removeImage(false);
  
  // Clear products
  renderPackageProducts();
  
  const modal = document.getElementById('edit-modal');
  if (modal) {
    modal.classList.add('active');
    console.log('Modal opened for new package');
  } else {
    console.error('Modal element not found!');
  }
}

/**
 * Load packages with current filters
 */
async function loadPackages() {
  const tbody = document.getElementById('packages-table');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align: center; padding: 40px;">
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

    if (currentFeatured) {
      filters.is_featured = currentFeatured;
    }

    console.log('Loading packages with filters:', filters);
    const response = await adminAPI.getPackages(filters);
    console.log('Packages loaded successfully:', response);
    
    allPackages = response.data || [];
    const pagination = response.pagination;

    if (allPackages.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: var(--color-gray);">
            <div style="margin-bottom: var(--space-md);">📦</div>
            <div style="font-size: var(--font-size-lg); margin-bottom: var(--space-sm);">Geen pakketten gevonden</div>
            <p style="color: var(--color-gray); margin: 0;">Klik op "Nieuw Pakket" om je eerste pakket aan te maken</p>
          </td>
        </tr>
      `;
      renderPagination(null);
      return;
    }

    tbody.innerHTML = allPackages.map(pkg => createPackageRow(pkg)).join('');
    renderPagination(pagination);

    // Add edit button handlers
    const editButtons = tbody.querySelectorAll('.edit-btn');
    console.log('Found edit buttons:', editButtons.length);
    
    editButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Edit button clicked, package ID:', btn.dataset.id);
        const packageId = btn.dataset.id;
        const pkg = allPackages.find(p => p.id === packageId);
        console.log('Found package:', pkg);
        if (pkg) {
          isNewPackage = false;
          openEditModal(pkg);
        } else {
          console.error('Package not found in allPackages array');
        }
      });
    });

    // Add delete button handlers
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const packageId = btn.dataset.id;
        if (confirm('Weet je zeker dat je dit pakket wilt verwijderen?')) {
          await deletePackage(packageId);
        }
      });
    });
  } catch (error) {
    console.error('Error loading packages:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--color-error);">
          Fout bij laden van pakketten: ${error.message}
        </td>
      </tr>
    `;
  }
}

/**
 * Load available products for adding to package
 */
async function loadAvailableProducts() {
  try {
    // API has max limit of 100, so we need to fetch in batches if needed
    let allProducts = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const response = await adminAPI.getProducts({ 
        limit: 100,
        page: page,
        is_active: true 
      });
      
      const products = response.data || [];
      allProducts = [...allProducts, ...products];
      
      // Check if there are more pages
      hasMore = response.pagination && response.pagination.has_next;
      page++;
      
      // Safety limit to prevent infinite loops
      if (page > 20) break;
    }
    
    availableProducts = allProducts;
    console.log(`Loaded ${availableProducts.length} products`);
  } catch (error) {
    console.error('Error loading products:', error);
    showToast('Kon producten niet laden', 'error');
  }
}

/**
 * Create package row HTML
 */
function createPackageRow(pkg) {
  // Backend returns 'items' not 'products', and 'base_price' not 'price_per_day'
  const productCount = pkg.items?.length || 0;
  const price = pkg.base_price || pkg.price_per_day || 0;
  const imageUrl = pkg.images?.[0] || null;
  
  return `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: var(--space-sm);">
          ${imageUrl ? `<img src="${imageUrl}" alt="${pkg.name}" style="width: 40px; height: 40px; object-fit: cover; border: 1px solid var(--color-light-gray);">` : ''}
          <div>
            <strong>${pkg.name}</strong>
            ${pkg.slug ? `<br><small style="color: var(--color-gray);">${pkg.slug}</small>` : ''}
          </div>
        </div>
      </td>
      <td>${formatPrice(price)}</td>
      <td>${pkg.min_persons || pkg.persons || '-'}</td>
      <td>${productCount} product${productCount !== 1 ? 'en' : ''}</td>
      <td>
        <span class="badge ${pkg.is_featured ? 'badge--success' : 'badge--secondary'}">
          ${pkg.is_featured ? 'Ja' : 'Nee'}
        </span>
      </td>
      <td>
        <span class="badge ${pkg.is_active ? 'badge--success' : 'badge--secondary'}">
          ${pkg.is_active ? 'Actief' : 'Inactief'}
        </span>
      </td>
      <td>
        <div style="display: flex; gap: var(--space-xs);">
          <button class="btn btn--ghost btn--sm edit-btn" data-id="${pkg.id}">Bewerken</button>
          <button class="btn btn--ghost btn--sm delete-btn" data-id="${pkg.id}" style="color: var(--color-error);">Verwijderen</button>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Open edit modal
 */
function openEditModal(pkg) {
  console.log('openEditModal called with package:', pkg);
  editingPackage = pkg;
  // Backend returns 'items' array, not 'products'
  packageProducts = (pkg.items || []).map(item => ({
    id: item.id,
    product_id: item.product_id,
    product_name: item.product?.name || 'Onbekend product',
    quantity: item.quantity || 1,
    is_optional: item.is_optional || false
  }));
  
  // Update modal title
  const modalTitle = document.getElementById('modal-title');
  if (modalTitle) {
    modalTitle.textContent = 'Pakket Bewerken';
    console.log('Modal title updated');
  }
  
  document.getElementById('edit-id').value = pkg.id;
  document.getElementById('edit-name').value = pkg.name;
  document.getElementById('edit-slug').value = pkg.slug || '';
  document.getElementById('edit-short-description').value = pkg.short_description || '';
  document.getElementById('edit-description').value = pkg.description || '';
  document.getElementById('edit-image-url').value = pkg.image_url || '';
  document.getElementById('edit-price').value = pkg.price_per_day || 0;
  document.getElementById('edit-deposit').value = pkg.deposit_total || 0;
  document.getElementById('edit-persons').value = pkg.persons || 1;
  document.getElementById('edit-category').value = pkg.category || '';
  document.getElementById('edit-featured').checked = pkg.is_featured || false;
  document.getElementById('edit-active').checked = pkg.is_active;
  
  // Show image preview if exists
  if (pkg.image_url) {
    showImagePreview(pkg.image_url);
  } else {
    removeImage(false); // Reset without notification
  }
  
  // Render products
  renderPackageProducts();
  
  const modal = document.getElementById('edit-modal');
  if (modal) {
    modal.classList.add('active');
    console.log('Modal opened');
  } else {
    console.error('Modal element not found');
  }
}

/**
 * Render package products list
 */
function renderPackageProducts() {
  const container = document.getElementById('package-products');
  if (!container) return;

  if (packageProducts.length === 0) {
    container.innerHTML = '<p style="color: var(--color-gray); font-size: var(--font-size-sm);">Nog geen producten toegevoegd</p>';
    return;
  }

  // Separate required and optional products
  const requiredProducts = packageProducts.filter(p => !p.is_optional);
  const optionalProducts = packageProducts.filter(p => p.is_optional);

  let html = '';

  // Required products section
  if (requiredProducts.length > 0) {
    html += '<div style="margin-bottom: var(--space-lg);"><h4 style="font-size: var(--font-size-sm); text-transform: uppercase; color: var(--color-gray); margin-bottom: var(--space-sm);">Verplichte Producten</h4>';
    html += requiredProducts.map((item, index) => {
      const actualIndex = packageProducts.indexOf(item);
      return createProductItemHTML(item, actualIndex, false);
    }).join('');
    html += '</div>';
  }

  // Optional products section
  if (optionalProducts.length > 0) {
    html += '<div style="margin-bottom: var(--space-lg);"><h4 style="font-size: var(--font-size-sm); text-transform: uppercase; color: var(--color-gray); margin-bottom: var(--space-sm);">Optionele Producten</h4>';
    html += optionalProducts.map((item, index) => {
      const actualIndex = packageProducts.indexOf(item);
      return createProductItemHTML(item, actualIndex, true);
    }).join('');
    html += '</div>';
  }

  container.innerHTML = html;
}

/**
 * Create product item HTML
 */
function createProductItemHTML(item, index, isOptional) {
  return `
    <div class="package-product-item" style="display: grid; grid-template-columns: 1fr auto auto auto auto; gap: var(--space-sm); align-items: center; padding: var(--space-sm); border: 1px solid ${isOptional ? 'var(--color-primary)' : 'var(--color-light-gray)'}; margin-bottom: var(--space-xs); background: ${isOptional ? 'rgba(144, 61, 62, 0.05)' : 'transparent'};">
      <div>
        <strong>${item.product_name || item.name}</strong>
        ${isOptional ? '<br><small style="color: var(--color-primary);">Optioneel</small>' : ''}
      </div>
      <div style="display: flex; align-items: center; gap: var(--space-xs);">
        <label style="font-size: var(--font-size-xs); color: var(--color-gray);">Aantal:</label>
        <input type="number" class="form-input form-input--sm" value="${item.quantity || 1}" min="1" style="width: 70px;" onchange="updateProductQuantity(${index}, this.value)">
      </div>
      <div></div>
      <label class="checkbox-label" style="margin: 0;">
        <input type="checkbox" ${item.is_optional ? 'checked' : ''} onchange="toggleProductOptional(${index}, this.checked)">
        <span style="font-size: var(--font-size-xs);">Optioneel</span>
      </label>
      <button type="button" class="btn btn--ghost btn--sm" onclick="removeProduct(${index})" style="color: var(--color-error);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `;
}

// Track selected products for multi-select
let selectedProductIds = new Set();

/**
 * Render product search results with multi-select checkboxes
 */
function renderProductSearch(query = '') {
  const container = document.getElementById('product-results');
  if (!container) return;

  const filtered = query 
    ? availableProducts.filter(p => p.name.toLowerCase().includes(query))
    : availableProducts;

  // Filter out products already in package
  const existingIds = new Set(packageProducts.map(p => p.product_id));
  const available = filtered.filter(p => !existingIds.has(p.id));

  if (available.length === 0) {
    container.innerHTML = '<p style="color: var(--color-gray); padding: var(--space-md);">Geen producten gevonden of alle producten zijn al toegevoegd</p>';
    return;
  }

  // Show count of selected
  const selectedCount = selectedProductIds.size;
  const headerHtml = selectedCount > 0 
    ? `<div style="padding: var(--space-sm); background: var(--color-primary-subtle); border-bottom: 1px solid var(--color-primary); display: flex; justify-content: space-between; align-items: center;">
        <span><strong>${selectedCount}</strong> product${selectedCount !== 1 ? 'en' : ''} geselecteerd</span>
        <button type="button" class="btn btn--primary btn--sm" onclick="addSelectedProductsToPackage()">Toevoegen</button>
       </div>`
    : '';

  container.innerHTML = headerHtml + available.slice(0, 50).map(product => {
    const isSelected = selectedProductIds.has(product.id);
    return `
      <label class="product-result-item" style="padding: var(--space-sm); border-bottom: 1px solid var(--color-light-gray); cursor: pointer; display: flex; align-items: center; gap: var(--space-sm); ${isSelected ? 'background: var(--color-primary-subtle);' : ''}" onclick="event.stopPropagation();">
        <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleProductSelection('${product.id}', '${product.name.replace(/'/g, "\\'")}', this.checked)" style="width: 18px; height: 18px;">
        <div style="flex: 1;">
          <strong>${product.name}</strong>
          <br>
          <small style="color: var(--color-gray);">${product.category_name || 'Geen categorie'}</small>
        </div>
      </label>
    `;
  }).join('');
}

/**
 * Toggle product selection for multi-select
 */
window.toggleProductSelection = function(productId, productName, isChecked) {
  if (isChecked) {
    selectedProductIds.add(productId);
  } else {
    selectedProductIds.delete(productId);
  }
  // Re-render to update header count
  const searchInput = document.getElementById('product-search');
  renderProductSearch(searchInput?.value || '');
};

/**
 * Add all selected products to package
 */
window.addSelectedProductsToPackage = function() {
  if (selectedProductIds.size === 0) {
    showToast('Selecteer eerst producten', 'error');
    return;
  }

  selectedProductIds.forEach(productId => {
    const product = availableProducts.find(p => p.id === productId);
    if (product && !packageProducts.find(p => p.product_id === productId)) {
      packageProducts.push({
        product_id: productId,
        product_name: product.name,
        quantity: 1
      });
    }
  });

  const count = selectedProductIds.size;
  selectedProductIds.clear();
  renderPackageProducts();
  document.getElementById('add-product-modal').classList.remove('active');
  showToast(`${count} product${count !== 1 ? 'en' : ''} toegevoegd`, 'success');
};

/**
 * Add product to package
 */
window.addProductToPackage = function(productId, productName) {
  // Check if product already exists
  if (packageProducts.find(p => p.product_id === productId)) {
    showToast('Product is al toegevoegd', 'error');
    return;
  }

  packageProducts.push({
    product_id: productId,
    product_name: productName,
    quantity: 1
  });

  renderPackageProducts();
  document.getElementById('add-product-modal').classList.remove('active');
  showToast('Product toegevoegd', 'success');
};

/**
 * Update product quantity
 */
window.updateProductQuantity = function(index, quantity) {
  if (packageProducts[index]) {
    packageProducts[index].quantity = parseInt(quantity) || 1;
  }
};


/**
 * Toggle product optional flag
 */
window.toggleProductOptional = function(index, isOptional) {
  if (packageProducts[index]) {
    packageProducts[index].is_optional = isOptional;
    renderPackageProducts();
  }
};

/**
 * Remove product from package
 */
window.removeProduct = function(index) {
  packageProducts.splice(index, 1);
  renderPackageProducts();
  showToast('Product verwijderd', 'success');
};

/**
 * Save package (create or update)
 */
async function savePackage() {
  const id = document.getElementById('edit-id').value;
  const name = document.getElementById('edit-name').value.trim();
  
  if (!name) {
    showToast('Naam is verplicht', 'error');
    return;
  }

  const packageData = {
    name,
    slug: document.getElementById('edit-slug').value.trim() || null,
    short_description: document.getElementById('edit-short-description').value.trim() || null,
    description: document.getElementById('edit-description').value.trim() || null,
    image_url: document.getElementById('edit-image-url').value.trim() || null,
    price_per_day: parseFloat(document.getElementById('edit-price').value) || 0,
    persons: parseInt(document.getElementById('edit-persons').value) || 1,
    is_featured: document.getElementById('edit-featured').checked,
    is_active: document.getElementById('edit-active').checked
  };

  try {
    let packageId = id;

    // Step 1: Create or update package
    if (isNewPackage) {
      const result = await adminAPI.createPackage(packageData);
      packageId = result.data.id;
      showToast('Pakket aangemaakt', 'success');
    } else {
      await adminAPI.updatePackage(id, packageData);
      showToast('Pakket bijgewerkt', 'success');
    }

    // Step 2: Sync product items
    await syncPackageItems(packageId);

    document.getElementById('edit-modal').classList.remove('active');
    await loadPackages();
  } catch (error) {
    console.error('Error saving package:', error);
    showToast(error.message || 'Fout bij opslaan', 'error');
  }
}

/**
 * Sync package items - delete removed, add new, update existing
 */
async function syncPackageItems(packageId) {
  // Get current items from server (if editing existing package)
  const existingItems = editingPackage?.items || [];
  const existingItemIds = new Set(existingItems.map(item => item.id));
  const currentProductIds = new Set(packageProducts.map(p => p.product_id));
  
  // Find items to delete (exist on server but not in current list)
  const itemsToDelete = existingItems.filter(item => !currentProductIds.has(item.product_id));
  
  // Find items to add (in current list but not on server)
  const existingProductIds = new Set(existingItems.map(item => item.product_id));
  const itemsToAdd = packageProducts.filter(p => !existingProductIds.has(p.product_id));
  
  // Find items to update (exist in both, check for changes)
  const itemsToUpdate = packageProducts.filter(p => {
    const existing = existingItems.find(item => item.product_id === p.product_id);
    if (!existing) return false;
    // Check if any field changed
    return existing.quantity !== p.quantity || 
           existing.is_optional !== p.is_optional;
  });

  console.log('Sync items:', { itemsToDelete, itemsToAdd, itemsToUpdate });

  // Delete removed items
  for (const item of itemsToDelete) {
    try {
      await adminAPI.deletePackageItem(packageId, item.id);
      console.log('Deleted item:', item.id);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  // Add new items
  for (const item of itemsToAdd) {
    try {
      await adminAPI.addPackageItem(packageId, {
        product_id: item.product_id,
        quantity: item.quantity || 1,
        is_optional: item.is_optional || false
      });
      console.log('Added item:', item.product_id);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  }

  // Update changed items
  for (const item of itemsToUpdate) {
    const existing = existingItems.find(e => e.product_id === item.product_id);
    if (existing) {
      try {
        await adminAPI.updatePackageItem(packageId, existing.id, {
          quantity: item.quantity || 1,
          is_optional: item.is_optional || false
        });
        console.log('Updated item:', existing.id);
      } catch (error) {
        console.error('Error updating item:', error);
      }
    }
  }
}

/**
 * Delete package
 */
async function deletePackage(id) {
  try {
    await adminAPI.deletePackage(id);
    showToast('Pakket verwijderd', 'success');
    await loadPackages();
  } catch (error) {
    console.error('Error deleting package:', error);
    showToast(error.message || 'Fout bij verwijderen', 'error');
  }
}

/**
 * Render pagination
 */
function renderPagination(pagination) {
  const container = document.getElementById('pagination');
  if (!container) return;

  if (!pagination || pagination.totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  const { currentPage: page, totalPages } = pagination;
  let html = '<div class="pagination__buttons">';

  // Previous button
  if (page > 1) {
    html += `<button class="pagination__btn" onclick="changePage(${page - 1})">Vorige</button>`;
  }

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
      html += `<button class="pagination__btn ${i === page ? 'pagination__btn--active' : ''}" onclick="changePage(${i})">${i}</button>`;
    } else if (i === page - 3 || i === page + 3) {
      html += '<span class="pagination__ellipsis">...</span>';
    }
  }

  // Next button
  if (page < totalPages) {
    html += `<button class="pagination__btn" onclick="changePage(${page + 1})">Volgende</button>`;
  }

  html += '</div>';
  container.innerHTML = html;
}

/**
 * Change page
 */
window.changePage = function(page) {
  currentPage = page;
  loadPackages();
};
