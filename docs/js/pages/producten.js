/**
 * Tafel Totaal - Products Page JavaScript
 * Handles loading, filtering, and sorting of individual products
 */

import { productsAPI } from '../lib/api.js';
import { formatPrice, showToast, debounce, getQueryParam, setQueryParam } from '../lib/utils.js';
import { loadHeader } from '../components/header.js';

// State
let products = [];
let filteredProducts = [];
let filters = {
  categories: [],
  priceRange: [],
  sort: 'name'
};

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await loadHeader();
  await loadFooter();
  
  // Initialize UI
  initFilters();
  initMobileFilters();
  
  // Load data
  await loadProducts();
});

/**
 * Load footer component
 */
async function loadFooter() {
  const container = document.getElementById('footer-container');
  if (!container) return;

  try {
    const response = await fetch('/Tafel-Totaal/components/footer.html');
    if (!response.ok) throw new Error('Failed to load footer');
    container.innerHTML = await response.text();
  } catch (error) {
    console.error('Error loading footer:', error);
  }
}

/**
 * Initialize filters and event listeners
 */
function initFilters() {
  // Checkbox filters (categories & price)
  document.querySelectorAll('.filter-checkbox input').forEach(checkbox => {
    checkbox.addEventListener('change', handleFilterChange);
  });

  // Sort select
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      filters.sort = e.target.value;
      applyFilters();
    });
  }

  // Reset button
  const resetBtn = document.getElementById('reset-filters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      document.querySelectorAll('.filter-checkbox input').forEach(cb => cb.checked = false);
      if (sortSelect) sortSelect.value = 'name';
      
      filters = {
        categories: [],
        priceRange: [],
        sort: 'name'
      };
      
      applyFilters();
    });
  }

  // Check URL params for initial filters
  const categoryParam = getQueryParam('category');
  if (categoryParam) {
    const checkbox = document.querySelector(`input[name="category"][value="${categoryParam}"]`);
    if (checkbox) {
      checkbox.checked = true;
      filters.categories.push(categoryParam);
    }
  }
}

/**
 * Handle mobile filter toggle
 */
function initMobileFilters() {
  const toggleBtn = document.getElementById('filters-toggle');
  const overlay = document.getElementById('filters-overlay');
  const sidebar = document.querySelector('.filters');

  if (!toggleBtn || !overlay || !sidebar) return;

  function toggleFilters() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
  }

  toggleBtn.addEventListener('click', toggleFilters);
  overlay.addEventListener('click', toggleFilters);
}

/**
 * Handle filter changes
 */
function handleFilterChange(e) {
  const { name, value, checked } = e.target;

  if (name === 'category') {
    if (checked) {
      filters.categories.push(value);
    } else {
      filters.categories = filters.categories.filter(c => c !== value);
    }
  } else if (name === 'price') {
    if (checked) {
      filters.priceRange.push(value);
    } else {
      filters.priceRange = filters.priceRange.filter(p => p !== value);
    }
  }

  applyFilters();
}

/**
 * Load products from API
 */
async function loadProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  try {
    const response = await productsAPI.getAll();
    products = response.data || [];
    applyFilters();
  } catch (error) {
    console.error('Error loading products:', error);
    grid.innerHTML = `
      <div class="packages-error">
        <p>Kon producten niet laden. Probeer het later opnieuw.</p>
        <button class="btn btn--secondary btn--sm" onclick="location.reload()">Opnieuw proberen</button>
      </div>
    `;
  }
}

/**
 * Apply filters and sort
 */
function applyFilters() {
  filteredProducts = products.filter(product => {
    // Filter by category
    if (filters.categories.length > 0) {
      if (!filters.categories.includes(product.category_slug)) {
        return false;
      }
    }

    // Filter by price
    if (filters.priceRange.length > 0) {
      const price = product.price;
      const matchesPrice = filters.priceRange.some(range => {
        if (range === '0-1') return price <= 1;
        if (range === '1-2') return price > 1 && price <= 2;
        if (range === '2+') return price > 2;
        return false;
      });
      if (!matchesPrice) return false;
    }

    return true;
  });

  // Sort
  filteredProducts.sort((a, b) => {
    switch (filters.sort) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  renderProducts();
  updateResultsCount();
}

/**
 * Render products grid
 */
function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  if (filteredProducts.length === 0) {
    grid.innerHTML = `
      <div class="packages-empty">
        <h3>Geen producten gevonden</h3>
        <p>Probeer andere filters te selecteren.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
}

/**
 * Create product card HTML
 */
function createProductCard(product) {
  return `
    <article class="package-card product-card">
      <div class="package-card__image">
        <img src="${product.image_url || '/images/products/placeholder.jpg'}" 
             alt="${product.name}" 
             loading="lazy">
        <div class="package-card__badges">
          <span class="badge badge--category">${product.category}</span>
        </div>
      </div>
      <div class="package-card__content">
        <h3 class="package-card__title">${product.name}</h3>
        <p class="package-card__desc">${product.description || ''}</p>
        
        <div class="package-card__footer">
          <div class="package-card__price">
            <span class="price-amount">${formatPrice(product.price)}</span>
            <span class="price-period">per stuk / 3 dagen</span>
          </div>
          <button class="btn btn--primary btn--sm add-to-cart-btn" 
                  data-id="${product.id}"
                  onclick="addToCart('${product.id}')">
            Toevoegen
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * Update results count
 */
function updateResultsCount() {
  const countEl = document.getElementById('results-count');
  if (countEl) {
    countEl.textContent = filteredProducts.length;
  }
}

// Make addToCart available globally
window.addToCart = async (productId) => {
  try {
    // Import cart service dynamically to avoid circular dependencies
    const { addItem } = await import('../services/cart.js');
    
    await addItem({
      type: 'product',
      id: productId,
      quantity: 1
    });
    
    showToast('Product toegevoegd aan winkelwagen', 'success');
  } catch (error) {
    console.error('Add to cart error:', error);
    showToast('Kon product niet toevoegen', 'error');
  }
};
