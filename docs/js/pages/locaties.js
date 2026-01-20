/**
 * Tafel Totaal - Locations Overview Page
 */

import { loadHeader } from '../components/header.js';
import { loadFooter } from '../components/footer.js';

const API_BASE_URL = window.location.hostname.includes('github.io')
  ? 'https://tafel-totaal-production.up.railway.app'
  : 'http://localhost:3000';

let allCities = [];
let filteredCities = [];

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await loadHeader();
  await loadFooter();
  await loadCities();
  initFilters();
});

/**
 * Load all cities from API
 */
async function loadCities() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/bezorgzones/cities`);
    const data = await response.json();

    if (data.success && data.data) {
      allCities = data.data;
      filteredCities = [...allCities];
      renderCities();
    } else {
      showEmpty();
    }
  } catch (error) {
    console.error('Error loading cities:', error);
    showEmpty();
  }
}

/**
 * Initialize filter controls
 */
function initFilters() {
  const provinceFilter = document.getElementById('province-filter');
  if (provinceFilter) {
    provinceFilter.addEventListener('change', () => {
      const province = provinceFilter.value;
      if (province) {
        filteredCities = allCities.filter(city => city.province === province);
      } else {
        filteredCities = [...allCities];
      }
      renderCities();
    });
  }
}

/**
 * Render cities grid
 */
function renderCities() {
  const grid = document.getElementById('cities-grid');
  const loading = document.getElementById('loading-state');
  const empty = document.getElementById('empty-state');

  loading.style.display = 'none';

  if (filteredCities.length === 0) {
    grid.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  grid.style.display = 'grid';

  grid.innerHTML = filteredCities.map(city => createCityCard(city)).join('');
}

/**
 * Create city card HTML
 */
function createCityCard(city) {
  const postalCodesCount = Array.isArray(city.postal_codes) ? city.postal_codes.length : 0;
  const freeRadius = city.free_delivery_radius_km || 15;

  return `
    <a href="/Tafel-Totaal/locatie.html?slug=${city.slug}" class="city-card" style="
      display: block;
      padding: var(--space-xl);
      background: var(--color-white);
      border: 1px solid var(--color-black);
      text-decoration: none;
      color: inherit;
      transition: all 0.3s ease;
    " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='4px 4px 0 rgba(0,0,0,0.1)'" onmouseout="this.style.transform=''; this.style.boxShadow=''">
      <div style="display: flex; align-items: center; gap: var(--space-md); margin-bottom: var(--space-md);">
        <div style="width: 48px; height: 48px; background: var(--color-primary); display: flex; align-items: center; justify-content: center;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div style="flex: 1;">
          <h3 style="font-family: var(--font-display); text-transform: uppercase; font-size: var(--font-size-lg); margin: 0;">${city.name}</h3>
          <p style="font-size: var(--font-size-sm); color: var(--color-gray); margin: 4px 0 0;">${city.province}</p>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-sm); margin-bottom: var(--space-md);">
        <div style="display: flex; align-items: center; gap: var(--space-sm); font-size: var(--font-size-sm);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
          <span>Bezorging: ${formatPrice(city.delivery_fee)}</span>
        </div>
        <div style="display: flex; align-items: center; gap: var(--space-sm); font-size: var(--font-size-sm); color: var(--color-success);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>Gratis binnen ${freeRadius}km</span>
        </div>
        ${postalCodesCount > 0 ? `
          <div style="display: flex; align-items: center; gap: var(--space-sm); font-size: var(--font-size-sm); color: var(--color-gray);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
            <span>${postalCodesCount} postcode${postalCodesCount !== 1 ? 's' : ''}</span>
          </div>
        ` : ''}
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; padding-top: var(--space-md); border-top: 1px solid var(--color-light-gray);">
        <span style="font-weight: 600; text-transform: uppercase; font-size: var(--font-size-sm);">Meer info</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>
    </a>
  `;
}

/**
 * Show empty state
 */
function showEmpty() {
  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('cities-grid').style.display = 'none';
  document.getElementById('empty-state').style.display = 'block';
}

/**
 * Format price helper
 */
function formatPrice(amount) {
  return new Intl.NumberFormat('nl-BE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}
