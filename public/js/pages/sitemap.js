/**
 * Tafel Totaal - Sitemap Page
 * Dynamically loads all locations, packages, and products
 */

import { loadHeader } from '../components/header.js';
import { loadFooter } from '../components/footer.js';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://tafel-totaal-production.up.railway.app';

document.addEventListener('DOMContentLoaded', async () => {
  await loadHeader();
  await loadFooter();
  
  // Load all dynamic content in parallel
  await Promise.all([
    loadLocations(),
    loadPackages(),
    loadProducts()
  ]);
});

async function loadLocations() {
  const loadingEl = document.getElementById('sitemap-locations-loading');
  const grid = document.getElementById('sitemap-locations');

  if (!loadingEl || !grid) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/bezorgzones/cities`);
    const data = await response.json();
    const cities = (data && data.success && Array.isArray(data.data)) ? data.data : [];

    if (!cities.length) throw new Error('No cities');

    const sorted = [...cities]
      .filter(c => c && c.slug && c.name)
      .sort((a, b) => String(a.name).localeCompare(String(b.name), 'nl', { sensitivity: 'base' }));

    // Replace content with dynamic list
    grid.innerHTML = sorted.map(c => {
      const url = `/locaties/${encodeURIComponent(c.slug)}.html`;
      return `
        <li>
          <a href="${url}" class="sitemap-link">
            ${escapeHtml(c.name)}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </li>
      `;
    }).join('');

    loadingEl.style.display = 'none';
    grid.style.display = 'grid';
  } catch (e) {
    // On error, just hide loading and show the static fallback list
    console.warn('Could not load dynamic locations, showing fallback.', e);
    loadingEl.style.display = 'none';
    grid.style.display = 'grid';
  }
}

async function loadPackages() {
  const loadingEl = document.getElementById('sitemap-packages-loading');
  const grid = document.getElementById('sitemap-packages');

  if (!loadingEl || !grid) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/packages`);
    const data = await response.json();
    const packages = (data && data.success && Array.isArray(data.data)) ? data.data : [];

    if (!packages.length) throw new Error('No packages');

    const sorted = [...packages]
      .filter(p => p && p.slug && p.name && p.is_active)
      .sort((a, b) => String(a.name).localeCompare(String(b.name), 'nl', { sensitivity: 'base' }));

    grid.innerHTML = sorted.map(p => {
      const url = `/pakket.html?slug=${encodeURIComponent(p.slug)}`;
      return `
        <li>
          <a href="${url}" class="sitemap-link">
            ${escapeHtml(p.name)}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </li>
      `;
    }).join('');

    loadingEl.style.display = 'none';
    grid.style.display = 'grid';
  } catch (e) {
    console.warn('Could not load packages.', e);
    loadingEl.innerHTML = '<span style="color: var(--color-gray); font-size: var(--font-size-sm);">Kon pakketten niet laden</span>';
  }
}

async function loadProducts() {
  const loadingEl = document.getElementById('sitemap-products-loading');
  const grid = document.getElementById('sitemap-products');

  if (!loadingEl || !grid) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/products?limit=500`);
    const data = await response.json();
    const products = (data && data.success && Array.isArray(data.data)) ? data.data : [];

    if (!products.length) throw new Error('No products');

    // Group products by category
    const byCategory = {};
    products.forEach(p => {
      if (!p || !p.slug || !p.name || !p.is_active) return;
      const cat = p.category_name || 'Overig';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(p);
    });

    // Sort categories and products within each category
    const sortedCategories = Object.keys(byCategory).sort((a, b) => a.localeCompare(b, 'nl'));
    
    let html = '';
    sortedCategories.forEach(cat => {
      const prods = byCategory[cat].sort((a, b) => String(a.name).localeCompare(String(b.name), 'nl'));
      html += `<div style="margin-bottom: var(--space-lg);">
        <h4 style="font-family: var(--font-display); text-transform: uppercase; font-size: var(--font-size-sm); margin-bottom: var(--space-sm); color: var(--color-primary);">${escapeHtml(cat)}</h4>
        <ul class="sitemap-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-xs);">
          ${prods.map(p => {
            const url = `/product.html?slug=${encodeURIComponent(p.slug)}`;
            return `<li><a href="${url}" class="sitemap-link" style="font-size: var(--font-size-sm); padding: var(--space-xs) var(--space-sm);">${escapeHtml(p.name)}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a></li>`;
          }).join('')}
        </ul>
      </div>`;
    });

    grid.innerHTML = html;
    loadingEl.style.display = 'none';
    grid.style.display = 'block';
  } catch (e) {
    console.warn('Could not load products.', e);
    loadingEl.innerHTML = '<span style="color: var(--color-gray); font-size: var(--font-size-sm);">Kon producten niet laden</span>';
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
