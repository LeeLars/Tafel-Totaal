/**
 * Tafel Totaal - Packages Page JavaScript
 * Handles filtering, sorting, and loading packages
 */

import { packagesAPI } from '../lib/api.js';
import { formatPrice, getQueryParam, setQueryParam, debounce } from '../lib/utils.js';
import { loadHeader } from '../components/header.js';

let allPackages = [];
let filteredPackages = [];

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await loadHeader();
  await loadFooter();
  await loadPackages();
  initFilters();
  initMobileFilters();
  initSorting();
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
 * Load all packages from API
 */
async function loadPackages() {
  const grid = document.getElementById('packages-grid');
  if (!grid) return;

  try {
    const response = await packagesAPI.getAll();
    allPackages = response.data || [];
    filteredPackages = [...allPackages];
    
    applyFiltersFromURL();
    renderPackages();
  } catch (error) {
    console.error('Error loading packages:', error);
    grid.innerHTML = `
      <div class="packages-error">
        <p>Kon pakketten niet laden. Probeer het later opnieuw.</p>
        <button class="btn btn--secondary btn--sm" onclick="location.reload()">Opnieuw proberen</button>
      </div>
    `;
  }
}

/**
 * Render packages to grid
 */
function renderPackages() {
  const grid = document.getElementById('packages-grid');
  const countEl = document.getElementById('results-count');
  
  if (!grid) return;

  if (filteredPackages.length === 0) {
    grid.innerHTML = `
      <div class="packages-empty">
        <p>Geen pakketten gevonden met de huidige filters.</p>
        <button class="btn btn--secondary btn--sm" id="clear-filters-btn">Filters wissen</button>
      </div>
    `;
    document.getElementById('clear-filters-btn')?.addEventListener('click', resetFilters);
  } else {
    grid.innerHTML = filteredPackages.map(pkg => createPackageCard(pkg)).join('');
  }

  if (countEl) {
    countEl.textContent = filteredPackages.length;
  }
}

/**
 * Create package card HTML
 */
function createPackageCard(pkg) {
  const imageUrl = pkg.image_url || getPackageImageUrl(pkg);
  const isFeatured = pkg.is_featured;
  const productCount = pkg.items?.length || 0;
  
  return `
    <article class="package-card" data-animate="fade">
      <a href="/Tafel-Totaal/pakket.html?id=${pkg.id}" class="package-card__link">
        <div class="package-card__image">
          <img src="${imageUrl}" alt="${pkg.name}" loading="lazy">
          ${isFeatured ? `<span class="package-card__badge badge badge--primary">Populair</span>` : ''}
        </div>
        <div class="package-card__content">
          <h3 class="package-card__title">${pkg.name}</h3>
          <p class="package-card__description">${pkg.short_description || pkg.description?.substring(0, 120) + '...' || 'Bekijk dit pakket voor meer informatie'}</p>
          <div class="package-card__meta">
            <span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              ${pkg.persons || 10} personen
            </span>
            ${productCount > 0 ? `
            <span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <path d="M12 8v8"></path>
                <path d="M8 12h8"></path>
              </svg>
              ${productCount} producten
            </span>
            ` : ''}
          </div>
          <div class="package-card__footer">
            <div class="package-card__price">
              ${formatPrice(pkg.price_per_day)}
              <span>/ dag</span>
            </div>
            <span class="btn btn--primary btn--sm">Bekijk Details</span>
          </div>
        </div>
      </a>
    </article>
  `;
}

function getPackageImageUrl(pkg) {
  const direct = pkg.images?.[0];
  if (direct) return direct;

  const fallbacks = [
    '/Tafel-Totaal/images/site/hero-table-setting.jpg',
    '/Tafel-Totaal/images/site/gala-theme.jpg',
    '/Tafel-Totaal/images/site/corporate-dinner.jpg',
    '/Tafel-Totaal/images/site/garden-dinner.jpg',
    '/Tafel-Totaal/images/site/hero-homepage.jpg'
  ];

  const key = String(pkg.id || pkg.slug || pkg.name || 'package');
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return fallbacks[hash % fallbacks.length];
}

/**
 * Get badge text for service level
 */
function getServiceLevelBadge(serviceLevel) {
  const badges = {
    'basis': null,
    'standaard': 'Populair',
    'premium': 'Premium',
    'luxe': 'Luxe'
  };
  return badges[serviceLevel?.toLowerCase()] || null;
}

/**
 * Initialize filter checkboxes
 */
function initFilters() {
  const filterCheckboxes = document.querySelectorAll('.filter-checkbox input');
  const resetBtn = document.getElementById('reset-filters');

  filterCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', debounce(() => {
      applyFilters();
    }, 100));
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', resetFilters);
  }
}

/**
 * Apply filters from URL params on page load
 */
function applyFiltersFromURL() {
  const serviceLevel = getQueryParam('service_level');
  const persons = getQueryParam('persons');
  const price = getQueryParam('price');

  if (serviceLevel) {
    serviceLevel.split(',').forEach(val => {
      const checkbox = document.querySelector(`input[name="service_level"][value="${val}"]`);
      if (checkbox) checkbox.checked = true;
    });
  }

  if (persons) {
    persons.split(',').forEach(val => {
      const checkbox = document.querySelector(`input[name="persons"][value="${val}"]`);
      if (checkbox) checkbox.checked = true;
    });
  }

  if (price) {
    price.split(',').forEach(val => {
      const checkbox = document.querySelector(`input[name="price"][value="${val}"]`);
      if (checkbox) checkbox.checked = true;
    });
  }

  applyFilters(false);
}

/**
 * Apply current filters
 */
function applyFilters(updateURL = true) {
  const serviceLevels = getCheckedValues('service_level');
  const persons = getCheckedValues('persons');
  const prices = getCheckedValues('price');

  filteredPackages = allPackages.filter(pkg => {
    // Service level filter
    if (serviceLevels.length > 0) {
      if (!serviceLevels.includes(pkg.service_level?.toLowerCase())) {
        return false;
      }
    }

    // Persons filter
    if (persons.length > 0) {
      const maxPersons = pkg.max_persons || 100;
      const matchesPersons = persons.some(range => {
        if (range === '1-10') return maxPersons >= 1 && maxPersons <= 10;
        if (range === '11-25') return maxPersons >= 11 && maxPersons <= 25;
        if (range === '26-50') return maxPersons >= 26 && maxPersons <= 50;
        if (range === '50+') return maxPersons > 50;
        return false;
      });
      if (!matchesPersons) return false;
    }

    // Price filter (per person approximation)
    if (prices.length > 0) {
      const pricePerPerson = pkg.base_price / (pkg.min_persons || 1);
      const matchesPrice = prices.some(range => {
        if (range === '0-10') return pricePerPerson <= 10;
        if (range === '10-20') return pricePerPerson > 10 && pricePerPerson <= 20;
        if (range === '20+') return pricePerPerson > 20;
        return false;
      });
      if (!matchesPrice) return false;
    }

    return true;
  });

  // Apply current sort
  applySorting();

  if (updateURL) {
    setQueryParam('service_level', serviceLevels.join(',') || null);
    setQueryParam('persons', persons.join(',') || null);
    setQueryParam('price', prices.join(',') || null);
  }

  renderPackages();
}

/**
 * Get checked values for a filter group
 */
function getCheckedValues(name) {
  const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
  return Array.from(checkboxes).map(cb => cb.value);
}

/**
 * Reset all filters
 */
function resetFilters() {
  const checkboxes = document.querySelectorAll('.filter-checkbox input');
  checkboxes.forEach(cb => cb.checked = false);
  
  filteredPackages = [...allPackages];
  
  setQueryParam('service_level', null);
  setQueryParam('persons', null);
  setQueryParam('price', null);
  
  renderPackages();
}

/**
 * Initialize mobile filter toggle
 */
function initMobileFilters() {
  const toggle = document.getElementById('filters-toggle');
  const filters = document.querySelector('.filters');
  const overlay = document.getElementById('filters-overlay');

  if (!toggle || !filters || !overlay) return;

  toggle.addEventListener('click', () => {
    filters.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  overlay.addEventListener('click', closeMobileFilters);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && filters.classList.contains('open')) {
      closeMobileFilters();
    }
  });

  function closeMobileFilters() {
    filters.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Initialize sorting
 */
function initSorting() {
  const sortSelect = document.getElementById('sort-select');
  if (!sortSelect) return;

  sortSelect.addEventListener('change', () => {
    applySorting();
    renderPackages();
  });
}

/**
 * Apply current sort option
 */
function applySorting() {
  const sortSelect = document.getElementById('sort-select');
  if (!sortSelect) return;

  const sortValue = sortSelect.value;

  filteredPackages.sort((a, b) => {
    switch (sortValue) {
      case 'price-asc':
        return a.base_price - b.base_price;
      case 'price-desc':
        return b.base_price - a.base_price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'popular':
      default:
        // Featured/popular first, then by name
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return a.name.localeCompare(b.name);
    }
  });
}
