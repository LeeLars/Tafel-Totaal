/**
 * Tafel Totaal - Sitemap Page
 */

import { loadHeader } from '../components/header.js';
import { loadFooter } from '../components/footer.js';

const API_BASE_URL = window.location.hostname.includes('github.io')
  ? 'https://tafel-totaal-production.up.railway.app'
  : 'http://localhost:3000';

const FALLBACK_CITIES = [
  { name: 'Knokke-Heist', slug: 'knokke-heist' },
  { name: 'Brugge', slug: 'brugge' },
  { name: 'Gent', slug: 'gent' },
  { name: 'Oostende', slug: 'oostende' },
  { name: 'Kortrijk', slug: 'kortrijk' },
  { name: 'Aalst', slug: 'aalst' },
  { name: 'Roeselare', slug: 'roeselare' }
];

document.addEventListener('DOMContentLoaded', async () => {
  await loadHeader();
  await loadFooter();
  await loadLocations();
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
      const url = `/Tafel-Totaal/locaties/${encodeURIComponent(c.slug)}.html`;
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

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
