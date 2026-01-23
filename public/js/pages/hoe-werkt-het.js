/**
 * Tafel Totaal - Hoe Werkt Het Page
 */

import { loadHeader } from '../components/header.js';
import { loadCTA } from '../components/cta.js';
import { initAnimations } from '../lib/animations.js';

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await loadHeader();
  await loadFooter();
  await loadCTA();
  initAnimations();
});

/**
 * Load footer component
 */
async function loadFooter() {
  const container = document.getElementById('footer-container');
  if (!container) return;

  try {
    const basePath = '';
    const response = await fetch(`${basePath}/components/footer.html`);
    if (!response.ok) throw new Error('Failed to load footer');
    
    const html = await response.text();
    container.innerHTML = html;
  } catch (error) {
    console.error('Error loading footer:', error);
  }
}
