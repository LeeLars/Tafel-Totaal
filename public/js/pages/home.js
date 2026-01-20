/**
 * Tafel Totaal - Homepage JavaScript
 * Loads featured packages and initializes page components
 */

import { packagesAPI } from '../lib/api.js';
import { formatPrice } from '../lib/utils.js';
import { loadHeader } from '../components/header.js';

const API_BASE_URL = window.location.hostname.includes('github.io')
  ? 'https://tafel-totaal-production.up.railway.app'
  : 'http://localhost:3000';

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await loadHeader();
  await loadFooter();
  await loadFeaturedPackages();
  await loadFeaturedLocations();
  // Animation library is loaded via script tag in index.html and auto-initializes
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
    
    const html = await response.text();
    container.innerHTML = html;
    
    // Re-initialize newsletter form listener if present
    const newsletterForm = container.querySelector('#newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        alert('Bedankt voor je aanmelding!');
        newsletterForm.reset();
      });
    }
  } catch (error) {
    console.error('Error loading footer:', error);
  }
}

/**
 * Load and render featured packages from API
 */
async function loadFeaturedPackages() {
  const container = document.getElementById('featured-packages');
  if (!container) return;

  try {
    const response = await packagesAPI.getAll({ featured: true, limit: 3 });
    const packages = response.data || [];

    if (packages.length === 0) {
      container.innerHTML = `
        <div class="featured__empty">
          <p>Geen pakketten beschikbaar op dit moment.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = packages.map(pkg => createPackageCard(pkg)).join('');
  } catch (error) {
    console.error('Error loading packages:', error);
    container.innerHTML = `
      <div class="featured__error">
        <p>Kon pakketten niet laden. Probeer het later opnieuw.</p>
        <button class="btn btn--secondary btn--sm" onclick="location.reload()">Opnieuw proberen</button>
      </div>
    `;
  }
}

/**
 * Create package card HTML
 */
function createPackageCard(pkg) {
  const imageUrl = getPackageImageUrl(pkg);
  const serviceLevelBadge = getServiceLevelBadge(pkg.service_level);
  
  return `
    <article class="package-card">
      <a href="/Tafel-Totaal/pakket.html?id=${pkg.id}" class="package-card__link">
        <div class="package-card__image">
          <img src="${imageUrl}" alt="${pkg.name}" loading="lazy">
          ${serviceLevelBadge ? `<span class="package-card__badge">${serviceLevelBadge}</span>` : ''}
        </div>
        <div class="package-card__content">
          <h3 class="package-card__title">${pkg.name}</h3>
          <p class="package-card__description">${pkg.short_description || pkg.description || ''}</p>
          <div class="package-card__footer">
            <div class="package-card__price">
              ${formatPrice(pkg.base_price)}
              <span>/ ${pkg.forfait_days || 3} dagen</span>
            </div>
            <span class="btn btn--primary btn--sm">Bekijk</span>
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
 * Load featured locations for home page
 */
async function loadFeaturedLocations() {
  const grid = document.getElementById('locations-grid');
  if (!grid) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/bezorgzones/cities`);
    const data = await response.json();

    if (data.success && data.data && data.data.length > 0) {
      // Show first 6 cities
      const featuredCities = data.data.slice(0, 6);
      renderLocations(featuredCities);
    } else {
      renderFallbackLocations();
    }
  } catch (error) {
    console.error('Error loading locations:', error);
    renderFallbackLocations();
  }
}

/**
 * Render location cards
 */
function renderLocations(cities) {
  const grid = document.getElementById('locations-grid');
  if (!grid) return;

  grid.innerHTML = cities.map(city => `
    <a href="/Tafel-Totaal/locatie.html?slug=${city.slug}" class="location-card">
      <div class="location-card__icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
      <h3 class="location-card__name">${city.name}</h3>
      <p class="location-card__province">${city.province}</p>
      <div class="location-card__info">
        <span>Gratis binnen ${city.free_delivery_radius_km || 15}km</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>
    </a>
  `).join('');
}

/**
 * Fallback locations if API fails
 */
function renderFallbackLocations() {
  const fallbackCities = [
    { name: 'Brugge', slug: 'brugge', province: 'West-Vlaanderen', free_delivery_radius_km: 15 },
    { name: 'Gent', slug: 'gent', province: 'Oost-Vlaanderen', free_delivery_radius_km: 15 },
    { name: 'Kortrijk', slug: 'kortrijk', province: 'West-Vlaanderen', free_delivery_radius_km: 15 },
    { name: 'Oostende', slug: 'oostende', province: 'West-Vlaanderen', free_delivery_radius_km: 15 },
    { name: 'Aalst', slug: 'aalst', province: 'Oost-Vlaanderen', free_delivery_radius_km: 15 },
    { name: 'Roeselare', slug: 'roeselare', province: 'West-Vlaanderen', free_delivery_radius_km: 15 }
  ];
  
  renderLocations(fallbackCities);
}
