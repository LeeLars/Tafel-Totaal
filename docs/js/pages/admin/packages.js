/**
 * Tafel Totaal - Admin Packages Page
 */

import { adminAPI } from '../../lib/api.js';
import { formatPrice, showToast } from '../../lib/utils.js';
import { requireAdmin } from '../../lib/guards.js';
import { getUploadUrl, validateImageFile, CLOUDINARY_CONFIG, isCloudinaryConfigured } from '../../config/cloudinary.js';

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
  
  // Check Cloudinary configuration
  if (!isCloudinaryConfigured()) {
    showCloudinaryWarning();
  }
  
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
 * Show Cloudinary configuration warning
 */
function showCloudinaryWarning() {
  const header = document.querySelector('.admin-content__header');
  if (!header) return;
  
  const warning = document.createElement('div');
  warning.style.cssText = `
    background: #FEF3C7;
    border: 2px solid #F59E0B;
    padding: var(--space-md);
    margin-top: var(--space-md);
    display: flex;
    align-items: start;
    gap: var(--space-md);
  `;
  
  warning.innerHTML = `
    <div style="font-size: 24px;">⚠️</div>
    <div style="flex: 1;">
      <strong style="display: block; margin-bottom: var(--space-xs);">Cloudinary niet geconfigureerd</strong>
      <p style="margin: 0 0 var(--space-sm); color: var(--color-dark-gray);">
        Image upload werkt niet totdat Cloudinary correct is ingesteld.
      </p>
      <a href="https://github.com/LeeLars/Tafel-Totaal/blob/main/CLOUDINARY_SETUP.md" 
         target="_blank" 
         class="btn btn--secondary btn--sm"
         style="display: inline-flex; align-items: center; gap: var(--space-xs);">
        📖 Bekijk Setup Instructies
      </a>
    </div>
  `;
  
  header.appendChild(warning);
}

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
 * Upload image to Cloudinary
 */
async function uploadImage(file) {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    showToast(validation.errors[0], 'error');
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
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
    formData.append('folder', CLOUDINARY_CONFIG.FOLDER);

    if (progressBar) {
      progressBar.style.width = '60%';
    }

    console.log('Uploading to Cloudinary:', {
      cloudName: CLOUDINARY_CONFIG.CLOUD_NAME,
      preset: CLOUDINARY_CONFIG.UPLOAD_PRESET,
      folder: CLOUDINARY_CONFIG.FOLDER,
      fileName: file.name,
      fileSize: file.size
    });

    // Upload to Cloudinary
    const response = await fetch(getUploadUrl(), {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary error response:', errorText);
      console.error('Response status:', response.status);
      console.error('Response statusText:', response.statusText);
      
      let errorMessage = 'Upload mislukt';
      try {
        const errorData = JSON.parse(errorText);
        console.error('Parsed error data:', errorData);
        
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
        
        // Check for specific Cloudinary errors
        if (errorText.includes('Invalid upload preset')) {
          errorMessage = 'Upload preset "packages" bestaat niet in Cloudinary. Maak deze eerst aan.';
        } else if (errorText.includes('Upload preset must be whitelisted')) {
          errorMessage = 'Upload preset moet "unsigned" zijn in Cloudinary instellingen.';
        }
      } catch (e) {
        console.error('Could not parse error response:', e);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Upload successful:', data);
    
    if (progressBar) {
      progressBar.style.width = '100%';
    }

    // Set image URL
    const imageUrl = data.secure_url;
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
    
    // Show detailed error message
    let errorMsg = 'Fout bij uploaden van afbeelding';
    
    if (error.message.includes('preset')) {
      errorMsg = 'Cloudinary upload preset niet gevonden. Controleer de configuratie.';
    } else if (error.message.includes('CORS')) {
      errorMsg = 'CORS fout. Controleer Cloudinary instellingen.';
    } else if (error.message) {
      errorMsg = `Upload fout: ${error.message}`;
    }
    
    showToast(errorMsg, 'error');
    
    // Show help message in console
    console.error('=== CLOUDINARY SETUP VEREIST ===');
    console.error('1. Ga naar https://cloudinary.com/console');
    console.error('2. Ga naar Settings > Upload > Upload Presets');
    console.error('3. Maak een nieuwe "unsigned" upload preset aan met naam: "packages"');
    console.error('4. Zet de folder op: "tafel-totaal/packages"');
    console.error('5. Schakel "Unique filename" en "Overwrite" in');
    console.error('6. Sla op en probeer opnieuw');
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
 */
function removeImage() {
  document.getElementById('edit-image-url').value = '';
  document.getElementById('image-preview').style.display = 'none';
  document.getElementById('preview-img').src = '';
  document.getElementById('image-upload').value = '';
  showToast('Afbeelding verwijderd', 'success');
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
  
  // Clear image preview
  removeImage();
  
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
  const productCount = pkg.products?.length || 0;
  
  return `
    <tr>
      <td>
        <strong>${pkg.name}</strong>
        ${pkg.slug ? `<br><small style="color: var(--color-gray);">${pkg.slug}</small>` : ''}
      </td>
      <td>${formatPrice(pkg.price_per_day)}</td>
      <td>${pkg.persons || '-'}</td>
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
  packageProducts = pkg.products || [];
  
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
    removeImage();
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
    html += '<div style="margin-bottom: var(--space-md);"><h4 style="font-size: var(--font-size-sm); text-transform: uppercase; color: var(--color-gray); margin-bottom: var(--space-sm);">Optionele Producten (Toggle Points)</h4>';
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
      ${isOptional ? `
        <div style="display: flex; align-items: center; gap: var(--space-xs);">
          <label style="font-size: var(--font-size-xs); color: var(--color-gray);">Points:</label>
          <input type="number" class="form-input form-input--sm" value="${item.toggle_points || 0}" min="0" style="width: 70px;" onchange="updateProductTogglePoints(${index}, this.value)">
        </div>
      ` : '<div></div>'}
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

/**
 * Render product search results
 */
function renderProductSearch(query = '') {
  const container = document.getElementById('product-results');
  if (!container) return;

  const filtered = query 
    ? availableProducts.filter(p => p.name.toLowerCase().includes(query))
    : availableProducts;

  if (filtered.length === 0) {
    container.innerHTML = '<p style="color: var(--color-gray); padding: var(--space-md);">Geen producten gevonden</p>';
    return;
  }

  container.innerHTML = filtered.slice(0, 20).map(product => `
    <div class="product-result-item" style="padding: var(--space-sm); border-bottom: 1px solid var(--color-light-gray); cursor: pointer;" onclick="addProductToPackage('${product.id}', '${product.name.replace(/'/g, "\\'")}')">
      <strong>${product.name}</strong>
      <br>
      <small style="color: var(--color-gray);">${product.category_name || 'Geen categorie'}</small>
    </div>
  `).join('');
}

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
 * Update product toggle points
 */
window.updateProductTogglePoints = function(index, points) {
  if (packageProducts[index]) {
    packageProducts[index].toggle_points = parseInt(points) || 0;
  }
};

/**
 * Toggle product optional flag
 */
window.toggleProductOptional = function(index, isOptional) {
  if (packageProducts[index]) {
    packageProducts[index].is_optional = isOptional;
    if (!isOptional) {
      // Reset toggle points when making product required
      packageProducts[index].toggle_points = 0;
    }
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

    // Step 2: Save product items
    if (packageProducts.length > 0) {
      // For now, we'll save products in the next phase when we have the backend endpoints
      // This is a placeholder for the product items sync
      console.log('Products to save:', packageProducts);
    }

    document.getElementById('edit-modal').classList.remove('active');
    await loadPackages();
  } catch (error) {
    console.error('Error saving package:', error);
    showToast(error.message || 'Fout bij opslaan', 'error');
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
