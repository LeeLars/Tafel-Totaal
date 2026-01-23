/**
 * Billing Address Form Handler
 */

import { showToast } from '../../lib/utils.js';

const API_BASE_URL = false 
  ? 'https://tafel-totaal-production.up.railway.app' 
  : 'http://localhost:3000';

/**
 * Initialize billing address form
 */
export function initBillingAddressForm() {
  const form = document.getElementById('billing-address-form');
  if (!form) return;

  // Load existing billing address
  loadBillingAddress();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
      street: form.street.value.trim(),
      house_number: form.house_number.value.trim(),
      postal_code: form.postal_code.value.trim(),
      city: form.city.value.trim(),
      country: form.country.value
    };

    // Only save if at least street and city are filled
    if (!data.street && !data.city) {
      showToast('Vul minimaal straat en stad in', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/account/billing-address`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        showToast('Factuuradres opgeslagen', 'success');
      } else {
        showToast(result.error || 'Kon factuuradres niet opslaan', 'error');
      }
    } catch (error) {
      console.error('Save billing address error:', error);
      showToast('Kon factuuradres niet opslaan', 'error');
    }
  });
}

/**
 * Load existing billing address
 */
async function loadBillingAddress() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/account/billing-address`, {
      credentials: 'include'
    });

    const result = await response.json();

    if (result.success && result.data) {
      const address = result.data;
      document.getElementById('billing_street').value = address.street || '';
      document.getElementById('billing_house_number').value = address.house_number || '';
      document.getElementById('billing_postal_code').value = address.postal_code || '';
      document.getElementById('billing_city').value = address.city || '';
      document.getElementById('billing_country').value = address.country || 'BE';
    }
  } catch (error) {
    console.error('Load billing address error:', error);
  }
}
