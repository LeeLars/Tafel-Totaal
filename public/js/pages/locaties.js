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
let currentProvince = '';
let currentSort = 'name_asc';
let currentQuery = '';

const CACHE_KEY = 'tafel_totaal_cities_cache_v1';
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

// Static fallback list of all 60 cities
const STATIC_CITIES = [
  // West-Vlaanderen
  { name: 'Brugge', slug: 'brugge', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Kortrijk', slug: 'kortrijk', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Oostende', slug: 'oostende', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Roeselare', slug: 'roeselare', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Waregem', slug: 'waregem', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Ieper', slug: 'ieper', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Menen', slug: 'menen', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Torhout', slug: 'torhout', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Izegem', slug: 'izegem', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Tielt', slug: 'tielt', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Knokke-Heist', slug: 'knokke-heist', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Blankenberge', slug: 'blankenberge', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Harelbeke', slug: 'harelbeke', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Wevelgem', slug: 'wevelgem', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Kuurne', slug: 'kuurne', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Deerlijk', slug: 'deerlijk', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Zwevegem', slug: 'zwevegem', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Poperinge', slug: 'poperinge', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Diksmuide', slug: 'diksmuide', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Oostkamp', slug: 'oostkamp', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Zedelgem', slug: 'zedelgem', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Lichtervelde', slug: 'lichtervelde', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Wervik', slug: 'wervik', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Wingene', slug: 'wingene', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Gistel', slug: 'gistel', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Moorslede', slug: 'moorslede', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Staden', slug: 'staden', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Kortemark', slug: 'kortemark', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Ardooie', slug: 'ardooie', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Anzegem', slug: 'anzegem', province: 'West-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  // Oost-Vlaanderen
  { name: 'Gent', slug: 'gent', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Aalst', slug: 'aalst', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Sint-Niklaas', slug: 'sint-niklaas', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Dendermonde', slug: 'dendermonde', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Lokeren', slug: 'lokeren', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Oudenaarde', slug: 'oudenaarde', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Ninove', slug: 'ninove', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Zottegem', slug: 'zottegem', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Geraardsbergen', slug: 'geraardsbergen', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Eeklo', slug: 'eeklo', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Deinze', slug: 'deinze', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Ronse', slug: 'ronse', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Wetteren', slug: 'wetteren', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Lebbeke', slug: 'lebbeke', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Merelbeke', slug: 'merelbeke', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Beveren', slug: 'beveren', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Lede', slug: 'lede', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Erpe-Mere', slug: 'erpe-mere', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Waasmunster', slug: 'waasmunster', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Temse', slug: 'temse', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Lochristi', slug: 'lochristi', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Evergem', slug: 'evergem', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Zelzate', slug: 'zelzate', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Destelbergen', slug: 'destelbergen', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Nazareth', slug: 'nazareth', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Maldegem', slug: 'maldegem', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Hamme', slug: 'hamme', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Assenede', slug: 'assenede', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Kaprijke', slug: 'kaprijke', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 },
  { name: 'Sint-Lievens-Houtem', slug: 'sint-lievens-houtem', province: 'Oost-Vlaanderen', delivery_fee: 25, free_delivery_radius_km: 15 }
];

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await loadHeader();
  await loadFooter();
  initFilters();
  // Start with static cities immediately for instant display
  allCities = STATIC_CITIES;
  applyFiltersAndRender();
  // Then try to load from cache and API
  loadCities({ preferCache: true });
  loadCities({ preferCache: false });
});

/**
 * Load all cities from API
 */
async function loadCities({ preferCache } = { preferCache: true }) {
  const cached = getCachedCities();
  if (preferCache && cached) {
    allCities = cached;
    applyFiltersAndRender();
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/bezorgzones/cities`, {
      headers: { 'Accept': 'application/json' }
    });
    const data = await response.json();

    if (data.success && Array.isArray(data.data)) {
      allCities = data.data;
      setCachedCities(allCities);
      applyFiltersAndRender();
    } else {
      if (!cached) showEmpty();
    }
  } catch (error) {
    console.error('Error loading cities:', error);
    if (!cached) showEmpty();
  }
}

/**
 * Initialize filter controls
 */
function initFilters() {
  const provinceFilter = document.getElementById('province-filter');
  const sortFilter = document.getElementById('sort-filter');
  const searchInput = document.getElementById('location-search');

  if (provinceFilter) {
    provinceFilter.addEventListener('change', () => {
      currentProvince = provinceFilter.value;
      applyFiltersAndRender();
    });
  }

  if (sortFilter) {
    sortFilter.addEventListener('change', () => {
      currentSort = sortFilter.value;
      applyFiltersAndRender();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentQuery = (searchInput.value || '').trim();
      applyFiltersAndRender();
    });
  }
}

function applyFiltersAndRender() {
  filteredCities = [...allCities];

  if (currentProvince) {
    filteredCities = filteredCities.filter(city => city.province === currentProvince);
  }

  if (currentQuery) {
    const q = currentQuery.toLowerCase();
    filteredCities = filteredCities.filter(city => {
      const name = (city.name || '').toLowerCase();
      const province = (city.province || '').toLowerCase();
      const slug = (city.slug || '').toLowerCase();
      return name.includes(q) || province.includes(q) || slug.includes(q);
    });
  }

  filteredCities.sort((a, b) => {
    const aName = (a.name || '').toLowerCase();
    const bName = (b.name || '').toLowerCase();
    const aProv = (a.province || '').toLowerCase();
    const bProv = (b.province || '').toLowerCase();

    if (currentSort === 'name_desc') return bName.localeCompare(aName);
    if (currentSort === 'province_asc') {
      const byProv = aProv.localeCompare(bProv);
      if (byProv !== 0) return byProv;
      return aName.localeCompare(bName);
    }
    return aName.localeCompare(bName);
  });

  renderCities();
}

/**
 * Render cities grid
 */
function renderCities() {
  const grid = document.getElementById('cities-grid');
  const loading = document.getElementById('loading-state');
  const empty = document.getElementById('empty-state');

  if (loading) loading.style.display = 'none';

  if (filteredCities.length === 0) {
    grid.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  grid.style.display = 'grid';

  grid.innerHTML = filteredCities.map(city => createCityCard(city)).join('');
}

function getCachedCities() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.data) || !parsed.ts) return null;
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function setCachedCities(cities) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: cities }));
  } catch {
    // ignore
  }
}

/**
 * Create city card HTML
 */
function createCityCard(city) {
  const postalCodesCount = Array.isArray(city.postal_codes) ? city.postal_codes.length : 0;
  const freeRadius = city.free_delivery_radius_km || 15;

  return `
    <a href="/Tafel-Totaal/locaties/${city.slug}.html" class="city-card" style="
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
