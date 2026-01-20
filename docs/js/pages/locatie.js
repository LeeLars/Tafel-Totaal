/**
 * Tafel Totaal - Location Page
 * Dynamic city/location page with SEO optimization
 */

import { loadHeader } from '../components/header.js';
import { loadFooter } from '../components/footer.js';

const API_BASE_URL = window.location.hostname.includes('github.io')
  ? 'https://tafel-totaal-production.up.railway.app'
  : 'http://localhost:3000';

let currentCity = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await loadHeader();
  await loadFooter();
  await loadLocationData();
});

/**
 * Load location data from URL parameter
 */
async function loadLocationData() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  if (!slug) {
    showError('Geen locatie opgegeven');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/bezorgzones/cities/${slug}`);
    const data = await response.json();

    if (!data.success || !data.data) {
      showError('Locatie niet gevonden');
      return;
    }

    currentCity = data.data;
    renderLocationPage();
  } catch (error) {
    console.error('Error loading location:', error);
    showError('Kon locatie niet laden');
  }
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
    initializeMap();
    document.getElementById('map-section').style.display = 'block';
  }

  // Show postal codes
  if (currentCity.postal_codes && currentCity.postal_codes.length > 0) {
    renderPostalCodes();
  }

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
function initializeMap() {
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
