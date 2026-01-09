/**
 * Load CTA component
 */
export async function loadCTA() {
  const container = document.getElementById('cta-container');
  if (!container) return;

  try {
    const response = await fetch('/components/cta.html');
    if (!response.ok) throw new Error('Failed to load CTA');
    container.innerHTML = await response.text();
  } catch (error) {
    console.error('Error loading CTA:', error);
  }
}
