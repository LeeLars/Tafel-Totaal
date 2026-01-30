/**
 * Tafel Totaal - Location Page
 * Dynamic city/location page with SEO optimization
 */

import { loadLocationHeader } from '../components/header.js';
import { loadFooter } from '../components/footer.js';

const API_BASE_URL = false
  ? 'https://tafel-totaal-production.up.railway.app'
  : 'http://localhost:3000';

let currentCity = null;
let currentSlug = null;

const CITY_CACHE_PREFIX = 'tafel_totaal_city_cache_v1:';
const CITY_CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await loadLocationHeader();
  await loadFooter();
  await loadLocationData();
});

/**
 * Load location data from URL path
 * Supports both /locaties/brugge/ and ?slug=brugge formats
 */
async function loadLocationData() {
  // Extract slug from URL path: /locaties/brugge/ -> brugge
  let slug = null;
  const path = window.location.pathname;
  const match = path.match(/\/locaties\/([^\/]+)\/?$/);
  if (match) {
    slug = match[1];
  } else {
    // Fallback to query param for backwards compatibility
    const urlParams = new URLSearchParams(window.location.search);
    slug = urlParams.get('slug');
  }
  
  currentSlug = slug;

  if (!slug) {
    console.warn('Geen locatie slug gevonden');
    return;
  }

  const cached = getCachedCity(slug);
  if (cached) {
    currentCity = cached;
    renderLocationPage();
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/bezorgzones/cities/${slug}`);
    const data = await response.json();

    if (!data.success || !data.data) {
      if (!cached) console.warn('Locatie niet gevonden in API, tonen van statische content');
      return;
    }

    currentCity = data.data;
    setCachedCity(slug, currentCity);
    renderLocationPage();
  } catch (error) {
    console.error('Error loading location:', error);
    // Do not hide content on error, just log it. Static content is already visible.
  }
}

function setupLazyMap() {
  const mapSection = document.getElementById('map-section');
  if (!mapSection) return;

  const run = async () => {
    await ensureLeafletLoaded();
    await initializeMap();
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        io.disconnect();
        run();
      }
    }, { rootMargin: '200px' });
    io.observe(mapSection);
  } else {
    run();
  }
}

let leafletPromise = null;
function ensureLeafletLoaded() {
  if (window.L) return Promise.resolve();
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Leaflet'));
    document.head.appendChild(script);
  });

  return leafletPromise;
}

async function loadRelatedLocations() {
  const container = document.getElementById('related-locations-links');
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/bezorgzones/cities`);
    const data = await response.json();
    const cities = (data && data.success && Array.isArray(data.data)) ? data.data : [];
    const related = cities
      .filter(c => c && c.slug && c.slug !== currentSlug)
      .slice(0, 10);

    container.innerHTML = related.map(c => {
      return `<a class="btn btn--secondary btn--sm" href="/locaties/${encodeURIComponent(c.slug)}/">Tafelverhuur ${escapeHtml(c.name)}</a>`;
    }).join('');
  } catch {
    // ignore
  }
}

function injectJsonLd() {
  try {
    const existing = document.getElementById('city-jsonld');
    if (existing) existing.remove();

    const title = currentCity.meta_title || `Tafelverhuur ${currentCity.name} | Tafel Totaal`;
    const description = currentCity.meta_description || `Professionele tafelverhuur in ${currentCity.name}.`;
    const url = currentSlug ? `https://tafeltotaal.com/locaties/${encodeURIComponent(currentSlug)}/` : 'https://tafeltotaal.com/locaties/';

    const ld = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: title,
      description,
      areaServed: {
        '@type': 'City',
        name: currentCity.name,
        addressRegion: currentCity.province,
        addressCountry: 'BE'
      },
      provider: {
        '@type': 'Organization',
        name: 'Tafel Totaal',
        url: 'https://tafeltotaal.com/'
      },
      url
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'city-jsonld';
    script.textContent = JSON.stringify(ld);
    document.head.appendChild(script);
  } catch {
    // ignore
  }
}

function getCachedCity(slug) {
  try {
    const raw = localStorage.getItem(`${CITY_CACHE_PREFIX}${slug}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.ts || !parsed.data) return null;
    if (Date.now() - parsed.ts > CITY_CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function setCachedCity(slug, data) {
  try {
    localStorage.setItem(`${CITY_CACHE_PREFIX}${slug}`, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // ignore
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Render location page with city data
 */
function renderLocationPage() {
  if (!currentCity) return;

  // Update SEO meta tags
  updateMetaTags();

  // Update hero section
  document.getElementById('hero-title').textContent = 
    currentCity.hero_title || `Tafelverhuur ${currentCity.name}`;
  document.getElementById('hero-subtitle').textContent = 
    currentCity.hero_subtitle || `Professionele verhuur voor uw evenement in ${currentCity.name} en omgeving`;

  // Update delivery info
  document.getElementById('delivery-fee').textContent = formatPrice(currentCity.delivery_fee);
  document.getElementById('free-delivery-radius').textContent = 
    `Binnen ${currentCity.free_delivery_radius_km || 15}km`;
  document.getElementById('province-name').textContent = currentCity.province;

  // Show description if available
  if (currentCity.description) {
    const descSection = document.getElementById('description-section');
    const descContent = document.getElementById('description-content');
    descContent.innerHTML = `<div class="content-text">${currentCity.description}</div>`;
    descSection.style.display = 'block';
  }

  // Show map if coordinates available
  if (currentCity.latitude && currentCity.longitude) {
    setupLazyMap();
    document.getElementById('map-section').style.display = 'block';
  }

  // Show postal codes
  if (currentCity.postal_codes && currentCity.postal_codes.length > 0) {
    renderPostalCodes();
  }

  // Breadcrumb
  const bc = document.getElementById('breadcrumb-current');
  if (bc) bc.textContent = currentCity.name;

  // Related locations
  loadRelatedLocations();

  // Structured data
  injectJsonLd();

  // Show content, hide loading
  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('location-content').style.display = 'block';
}

/**
 * Update meta tags for SEO
 */
function updateMetaTags() {
  const title = currentCity.meta_title || `Tafelverhuur ${currentCity.name} | Tafel Totaal`;
  const description = currentCity.meta_description || 
    `Professionele tafelverhuur in ${currentCity.name}. Gratis levering binnen ${currentCity.free_delivery_radius_km || 15}km. Bestel online!`;

  document.title = title;

  // Canonical
  const canonical = document.getElementById('canonical-link');
  if (canonical && currentSlug) {
    canonical.setAttribute('href', `https://tafeltotaal.com/locaties/${encodeURIComponent(currentSlug)}/`);
  }
  
  // Update meta description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', description);
  }

  // Update Open Graph tags
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', title);
  }

  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) {
    ogDesc.setAttribute('content', description);
  }
}

/**
 * Initialize map with city location
 */
async function initializeMap() {
  const mapEl = document.getElementById('location-map');
  if (!mapEl || !window.L) return;

  const lat = parseFloat(currentCity.latitude);
  const lng = parseFloat(currentCity.longitude);

  const map = L.map('location-map').setView([lat, lng], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  // Add marker
  const marker = L.marker([lat, lng]).addTo(map);
  marker.bindPopup(`<strong>${currentCity.name}</strong><br>Leveringsgebied`).openPopup();

  // Add circle for free delivery radius
  const radiusKm = currentCity.free_delivery_radius_km || 15;
  L.circle([lat, lng], {
    color: '#16A34A',
    fillColor: '#16A34A',
    fillOpacity: 0.1,
    radius: radiusKm * 1000 // Convert to meters
  }).addTo(map).bindPopup(`Gratis levering binnen ${radiusKm}km`);
}

/**
 * Render postal codes list
 */
function renderPostalCodes() {
  const container = document.getElementById('postal-codes-list');
  if (!container) return;

  const postalCodes = Array.isArray(currentCity.postal_codes) 
    ? currentCity.postal_codes 
    : [];

  if (postalCodes.length === 0) {
    document.getElementById('postal-codes-section').style.display = 'none';
    return;
  }

  container.innerHTML = postalCodes.map(code => `
    <span style="
      display: inline-block;
      padding: var(--space-xs) var(--space-md);
      background: var(--color-off-white);
      border: 1px solid var(--color-light-gray);
      font-family: var(--font-mono);
      font-size: var(--font-size-sm);
      font-weight: 600;
    ">${code}</span>
  `).join('');
}

/**
 * Show error state
 */
function showError(message) {
  document.getElementById('loading-state').style.display = 'none';
  const errorState = document.getElementById('error-state');
  errorState.style.display = 'block';
  
  const errorTitle = errorState.querySelector('h1');
  if (errorTitle && message) {
    errorTitle.textContent = message;
  }
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
