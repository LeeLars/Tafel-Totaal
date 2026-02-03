/**
 * Tafel Totaal - Products Page JavaScript
 * Handles loading, filtering, and sorting of individual products
 */

import { productsAPI } from '../lib/api.js';
import { formatPrice, showToast, debounce, getQueryParam, setQueryParam } from '../lib/utils.js';
import { loadHeader } from '../components/header.js';

// API Base URL
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://tafel-totaal-production.up.railway.app';

// State
let products = [];
let filteredProducts = [];
let tagGroups = []; // Tag groups with their tags
let filters = {
  category: '',
  subcategory: '',
  priceRange: [],
  tags: [], // Selected tag slugs
  sort: 'name-asc'
};

// Subcategories mapping (matches database structure)
const SUBCATEGORIES = {
  'servies': [
    { slug: 'dinerborden', name: 'Dinerborden' },
    { slug: 'dessertborden', name: 'Dessertborden' },
    { slug: 'soepborden-pastaborden', name: 'Soepborden & Pastaborden' },
    { slug: 'broodbordjes-sideplates', name: 'Broodbordjes & Side Plates' },
    { slug: 'kommen-schalen', name: 'Kommen & Schalen' },
    { slug: 'theesets', name: 'Theesets' },
    { slug: 'serveerschalen-etageres', name: 'Serveerschalen & Etagères' }
  ],
  'bestek': [
    { slug: 'messen', name: 'Messen' },
    { slug: 'vorken', name: 'Vorken' },
    { slug: 'lepels', name: 'Lepels' },
    { slug: 'dessertbestek', name: 'Dessertbestek' },
    { slug: 'serveertangen-lepels', name: 'Serveertangen & -lepels' }
  ],
  'glaswerk': [
    { slug: 'wijnglazen', name: 'Wijnglazen' },
    { slug: 'champagneglazen', name: 'Champagneglazen' },
    { slug: 'cocktailglazen', name: 'Cocktailglazen' },
    { slug: 'water-frisdrankglazen', name: 'Water- & Frisdrankglazen' },
    { slug: 'bierglazen', name: 'Bierglazen' },
    { slug: 'koffie-theeglazen', name: 'Koffie- & Theeglazen' },
    { slug: 'karaffen-kannen', name: 'Karaffen & Kannen' }
  ],
  'decoratie': [
    { slug: 'tafellinnen', name: 'Tafellinnen' },
    { slug: 'kaarsen-houders', name: 'Kaarsen & Houders' },
    { slug: 'tafelaccessoires', name: 'Tafelaccessoires' },
    { slug: 'presentatie-aankleding', name: 'Presentatie & Aankleding' }
  ],
  'tafels-stoelen': [
    { slug: 'tafels', name: 'Tafels' },
    { slug: 'stoelen', name: 'Stoelen' },
    { slug: 'statafels', name: 'Statafels' },
    { slug: 'barkrukken', name: 'Barkrukken' }
  ]
};

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await loadHeader();
  await loadFooter();
  
  // Initialize UI
  initFilters();
  initMobileFilters();
  
  // Load tags first, then products
  await loadTagGroups();
  await loadProducts();
});

/**
 * Load footer component
 */
async function loadFooter() {
  const container = document.getElementById('footer-container');
  if (!container) return;

  try {
    const response = await fetch('/components/footer.html');
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
  // Category radio buttons
  document.querySelectorAll('input[name="category"]').forEach(radio => {
    radio.addEventListener('change', handleCategoryChange);
  });

  // Price checkbox filters
  document.querySelectorAll('input[name="price"]').forEach(checkbox => {
    checkbox.addEventListener('change', handlePriceChange);
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
    resetBtn.addEventListener('click', resetFilters);
  }

  // Check URL params for initial filters
  const categoryParam = getQueryParam('category');
  const subcategoryParam = getQueryParam('subcategory');
  
  if (categoryParam) {
    const radio = document.querySelector(`input[name="category"][value="${categoryParam}"]`);
    if (radio) {
      radio.checked = true;
      filters.category = categoryParam;
      renderSubcategories(categoryParam);
      
      // If subcategory param exists, select it after rendering
      if (subcategoryParam) {
        setTimeout(() => {
          const subRadio = document.querySelector(`input[name="subcategory"][value="${subcategoryParam}"]`);
          if (subRadio) {
            subRadio.checked = true;
            filters.subcategory = subcategoryParam;
          }
        }, 0);
      }
    }
  }
}

/**
 * Handle category change
 */
function handleCategoryChange(e) {
  const category = e.target.value;
  filters.category = category;
  filters.subcategory = ''; // Reset subcategory when category changes
  
  // Update URL
  if (category) {
    setQueryParam('category', category);
  } else {
    // Remove category param
    const url = new URL(window.location);
    url.searchParams.delete('category');
    url.searchParams.delete('subcategory');
    window.history.replaceState({}, '', url);
  }
  
  // Render subcategories for selected category
  renderSubcategories(category);
  applyFilters();
}

/**
 * Handle subcategory change
 */
function handleSubcategoryChange(e) {
  filters.subcategory = e.target.value;
  
  // Update URL
  if (filters.subcategory) {
    setQueryParam('subcategory', filters.subcategory);
  } else {
    const url = new URL(window.location);
    url.searchParams.delete('subcategory');
    window.history.replaceState({}, '', url);
  }
  
  applyFilters();
}

/**
 * Handle price filter change
 */
function handlePriceChange(e) {
  const { value, checked } = e.target;
  
  if (checked) {
    filters.priceRange.push(value);
  } else {
    filters.priceRange = filters.priceRange.filter(p => p !== value);
  }
  
  applyFilters();
}

/**
 * Render subcategories based on selected category
 */
function renderSubcategories(category) {
  const container = document.getElementById('subcategory-filters');
  const group = document.getElementById('subcategory-filter-group');
  
  if (!container || !group) return;
  
  // Hide if no category or category has no subcategories
  if (!category || !SUBCATEGORIES[category]) {
    group.style.display = 'none';
    container.innerHTML = '';
    return;
  }
  
  // Show subcategory filter group
  group.style.display = 'block';
  
  // Build subcategory options
  const subcats = SUBCATEGORIES[category];
  container.innerHTML = `
    <label class="filter-checkbox">
      <input type="radio" name="subcategory" value="" checked>
      <span class="filter-checkbox__mark"></span>
      <span class="filter-checkbox__label">Alle ${getCategoryName(category)}</span>
    </label>
    ${subcats.map(sub => `
      <label class="filter-checkbox">
        <input type="radio" name="subcategory" value="${sub.slug}">
        <span class="filter-checkbox__mark"></span>
        <span class="filter-checkbox__label">${sub.name}</span>
      </label>
    `).join('')}
  `;
  
  // Add event listeners to new radio buttons
  container.querySelectorAll('input[name="subcategory"]').forEach(radio => {
    radio.addEventListener('change', handleSubcategoryChange);
  });
}

/**
 * Get display name for category
 */
function getCategoryName(slug) {
  const names = {
    'servies': 'Servies',
    'bestek': 'Bestek',
    'glaswerk': 'Glaswerk',
    'decoratie': 'Decoratie',
    'tafels-stoelen': 'Tafels & Stoelen'
  };
  return names[slug] || slug;
}

/**
 * Reset all filters
 */
function resetFilters() {
  // Reset category
  const allProductsRadio = document.querySelector('input[name="category"][value=""]');
  if (allProductsRadio) allProductsRadio.checked = true;
  
  // Reset price checkboxes
  document.querySelectorAll('input[name="price"]').forEach(cb => cb.checked = false);
  
  // Reset tag checkboxes
  document.querySelectorAll('input[name="tag"]').forEach(cb => cb.checked = false);
  
  // Reset sort
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.value = 'name-asc';
  
  // Reset state
  filters = {
    category: '',
    subcategory: '',
    priceRange: [],
    tags: [],
    sort: 'name-asc'
  };
  
  // Hide subcategories
  const group = document.getElementById('subcategory-filter-group');
  if (group) group.style.display = 'none';
  
  // Clear URL params
  const url = new URL(window.location);
  url.searchParams.delete('category');
  url.searchParams.delete('subcategory');
  window.history.replaceState({}, '', url);
  
  applyFilters();
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
 * Load all products from API with retry logic
 */
async function loadProducts(retryCount = 0) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="tt-loader">
      <img src="/images/Group 39530.svg" alt="Loading..." class="spinner" style="width: 48px; height: 48px;">
      <div class="tt-loader__text">Producten laden...</div>
    </div>
  `;

  try {
    const response = await productsAPI.getAll();
    products = response.data || [];
    applyFilters();
  } catch (error) {
    console.error('Error loading products:', error);
    
    // Handle rate limit with retry
    if (error.message && error.message.includes('Too many requests') && retryCount < 2) {
      const delay = Math.pow(2, retryCount) * 2000; // 2s, 4s
      console.log(`Rate limited, retrying in ${delay}ms...`);
      grid.innerHTML = `
        <div class="tt-loader">
          <img src="/images/Group 39530.svg" alt="Loading..." class="spinner" style="width: 48px; height: 48px;">
          <div class="tt-loader__text">Even geduld, producten laden...</div>
        </div>
      `;
      setTimeout(() => loadProducts(retryCount + 1), delay);
      return;
    }
    
    grid.innerHTML = `
      <div class="packages-error">
        <p>Kon producten niet laden. ${error.message && error.message.includes('Too many requests') ? 'Te veel verzoeken, probeer het over een paar seconden opnieuw.' : 'Probeer het later opnieuw.'}</p>
        <button class="btn btn--secondary btn--sm" onclick="location.reload()">Opnieuw proberen</button>
      </div>
    `;
  }
}

/**
 * Load tag groups from API and render filter UI
 */
async function loadTagGroups() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tags`);
    
    // Handle rate limit
    if (response.status === 429) {
      console.warn('Rate limited on tags, hiding tag filters');
      const momentGroup = document.getElementById('moment-filter-group');
      const stijlGroup = document.getElementById('stijl-filter-group');
      if (momentGroup) momentGroup.style.display = 'none';
      if (stijlGroup) stijlGroup.style.display = 'none';
      return;
    }
    
    const result = await response.json();
    
    if (result.success) {
      tagGroups = result.data || [];
      renderTagFilters();
    }
  } catch (error) {
    console.error('Error loading tags:', error);
    // Hide tag filters on error
    const momentGroup = document.getElementById('moment-filter-group');
    const stijlGroup = document.getElementById('stijl-filter-group');
    if (momentGroup) momentGroup.style.display = 'none';
    if (stijlGroup) stijlGroup.style.display = 'none';
  }
}

/**
 * Render tag filter checkboxes
 */
function renderTagFilters() {
  tagGroups.forEach(group => {
    let containerId;
    if (group.slug === 'moment-beleving') {
      containerId = 'moment-filters';
    } else if (group.slug === 'stijl') {
      containerId = 'stijl-filters';
    } else {
      return; // Unknown group
    }
    
    const container = document.getElementById(containerId);
    if (!container || !group.tags || group.tags.length === 0) return;
    
    container.innerHTML = group.tags.map(tag => `
      <label class="filter-checkbox">
        <input type="checkbox" name="tag" value="${tag.slug}" data-group="${group.slug}">
        <span class="filter-checkbox__mark"></span>
        <span class="filter-checkbox__label">${tag.name}</span>
      </label>
    `).join('');
    
    // Add event listeners
    container.querySelectorAll('input[name="tag"]').forEach(checkbox => {
      checkbox.addEventListener('change', handleTagChange);
    });
  });
}

/**
 * Handle tag filter change
 */
function handleTagChange(e) {
  const { value, checked } = e.target;
  
  if (checked) {
    if (!filters.tags.includes(value)) {
      filters.tags.push(value);
    }
  } else {
    filters.tags = filters.tags.filter(t => t !== value);
  }
  
  applyFilters();
}

/**
 * Apply filters and sort
 */
function applyFilters() {
  filteredProducts = products.filter(product => {
    // Filter by category
    if (filters.category) {
      if (product.category_slug !== filters.category) {
        return false;
      }
    }

    // Filter by subcategory
    if (filters.subcategory) {
      if (product.subcategory_slug !== filters.subcategory) {
        return false;
      }
    }

    // Filter by price
    if (filters.priceRange.length > 0) {
      const price = product.price_per_day || product.price || 0;
      const matchesPrice = filters.priceRange.some(range => {
        if (range === '0-1') return price <= 1;
        if (range === '1-2') return price > 1 && price <= 2;
        if (range === '2-5') return price > 2 && price <= 5;
        if (range === '5+') return price > 5;
        return false;
      });
      if (!matchesPrice) return false;
    }

    // Filter by tags (product must have ALL selected tags)
    if (filters.tags.length > 0) {
      const productTags = product.tags || [];
      const productTagSlugs = productTags.map(t => t.slug || t);
      const hasAllTags = filters.tags.every(tagSlug => productTagSlugs.includes(tagSlug));
      if (!hasAllTags) return false;
    }

    return true;
  });

  // Sort
  filteredProducts.sort((a, b) => {
    const priceA = a.price_per_day || a.price || 0;
    const priceB = b.price_per_day || b.price || 0;
    
    switch (filters.sort) {
      case 'price-asc':
        return priceA - priceB;
      case 'price-desc':
        return priceB - priceA;
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'name-asc':
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
      <div class="products-empty">
        <h3>Geen producten gevonden</h3>
        <p>Probeer andere filters te selecteren.</p>
      </div>
    `;
    return;
  }

  const productsHTML = filteredProducts.map(product => createProductCard(product)).join('');
  const quoteCard = createQuoteCard();
  grid.innerHTML = productsHTML + quoteCard;
}

/**
 * Create product card HTML
 */
function createProductCard(product) {
  // Map backend category names to display names if needed
  const categoryName = product.category_name || product.category || 'Overig';
  const imageUrl = product.image_url || product.images?.[0] || '/images/products/placeholder.jpg';
  
  return `
    <article class="package-card">
      <a href="/product/?id=${product.id}" class="package-card__link">
        <div class="package-card__image">
          <img src="${imageUrl}" 
               alt="${product.name}" 
               loading="lazy">
          <span class="package-card__badge">${categoryName}</span>
        </div>
        <div class="package-card__content">
          <h3 class="package-card__title">${product.name}</h3>
          <p class="package-card__description">${product.description || ''}</p>
          
          <div class="package-card__footer">
            <div class="package-card__price">
              ${formatPrice(product.price_per_day || product.price)}
              <span>/ dag</span>
            </div>
            <span class="btn btn--primary btn--sm">Bekijk</span>
          </div>
        </div>
      </a>
    </article>
  `;
}

/**
 * Create quote card HTML for empty grid slots
 */
function createQuoteCard() {
  return `
    <article class="quote-card">
      <svg class="quote-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 21c3 0 7-1 7-8V5c0-2.25-1.75-4-4-4S2 2.75 2 5v12c0 2.25 1.75 4 4 4zm14 0c3 0 7-1 7-8V5c0-2.25-1.75-4-4-4s-4 1.75-4 4v12c0 2.25 1.75 4 4 4z"/>
      </svg>
      <div class="quote-card__quote">
        "Elegante tafels voor onvergetelijke momenten"
      </div>
      <div class="quote-card__attribution">
        — Tafel Totaal
      </div>
    </article>
  `;
}

/**
 * Update results count
 */
function updateResultsCount() {
  const countEl = document.getElementById('products-count');
  if (countEl) {
    countEl.innerHTML = `<span>${filteredProducts.length}</span> RESULTATEN`;
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
