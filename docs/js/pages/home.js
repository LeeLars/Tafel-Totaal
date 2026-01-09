/**
 * Tafel Totaal - Homepage JavaScript
 * Loads featured packages and initializes page components
 */

import { packagesAPI } from '../lib/api.js';
import { formatPrice } from '../lib/utils.js';
import { loadHeader } from '../components/header.js';

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await loadHeader();
  await loadFooter();
  await loadFeaturedPackages();
  // Animation library is loaded via script tag in index.html and auto-initializes
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
  const imageUrl = pkg.images?.[0] || '/images/packages/placeholder.jpg';
  const serviceLevelBadge = getServiceLevelBadge(pkg.service_level);
  
  return `
    <article class="package-card">
      <a href="/pakket.html?id=${pkg.id}" class="package-card__link">
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

