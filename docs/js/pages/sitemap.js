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
  const errorEl = document.getElementById('sitemap-locations-error');
  const fallbackEl = document.getElementById('sitemap-locations-fallback');
  const grid = document.getElementById('sitemap-locations');

  if (!loadingEl || !errorEl || !fallbackEl || !grid) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/bezorgzones/cities`);
    const data = await response.json();
    const cities = (data && data.success && Array.isArray(data.data)) ? data.data : [];

    if (!cities.length) throw new Error('No cities');

    const sorted = [...cities]
      .filter(c => c && c.slug && c.name)
      .sort((a, b) => String(a.name).localeCompare(String(b.name), 'nl', { sensitivity: 'base' }));

    grid.style.display = 'grid';
    grid.innerHTML = sorted.map(c => {
      const url = `/Tafel-Totaal/locaties/${encodeURIComponent(c.slug)}.html`;
      return `
        <a href="${url}" class="btn btn--secondary btn--sm" style="justify-content: space-between;">
          Tafelverhuur ${escapeHtml(c.name)}
          <span aria-hidden="true">→</span>
        </a>
      `;
    }).join('');

    loadingEl.style.display = 'none';
  } catch (e) {
    loadingEl.style.display = 'none';
    errorEl.style.display = 'block';

    fallbackEl.innerHTML = FALLBACK_CITIES.map(c => {
      const url = `/Tafel-Totaal/locaties/${encodeURIComponent(c.slug)}.html`;
      return `<a href="${url}" class="btn btn--secondary btn--sm">Tafelverhuur ${escapeHtml(c.name)}</a>`;
    }).join('');
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
