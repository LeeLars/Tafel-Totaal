/**
 * Tafel Totaal - Checkout Page JavaScript
 * Handles multi-step checkout flow and order placement
 */

import { checkoutAPI } from '../lib/api.js';
import { formatPrice, formatDateShort, showToast, isValidEmail, isValidPhone } from '../lib/utils.js';
import { getCart, clearCart } from '../services/cart.js';
import { getCurrentUser } from '../services/auth.js';

let currentStep = 1;
let checkoutData = {
  customer: {},
  delivery: {},
  items: []
};

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  const cart = getCart();
  
  if (!cart || cart.length === 0) {
    showEmptyCart();
    return;
  }

  checkoutData.items = cart;
  
  prefillUserData();
  renderSummary();
  initForms();
  initDeliveryToggle();
  initStepNavigation();
});

/**
 * Show empty cart state
 */
function showEmptyCart() {
  document.getElementById('checkout-empty')?.classList.remove('hidden');
  document.getElementById('checkout-layout')?.classList.add('hidden');
}

/**
 * Prefill form with logged-in user data
 */
function prefillUserData() {
  const user = getCurrentUser();
  if (!user) return;

  document.getElementById('first_name').value = user.first_name || '';
  document.getElementById('last_name').value = user.last_name || '';
  document.getElementById('email').value = user.email || '';
  document.getElementById('phone').value = user.phone || '';
  document.getElementById('company_name').value = user.company_name || '';
}

/**
 * Render order summary sidebar
 */
function renderSummary() {
  const itemsContainer = document.getElementById('summary-items');
  const cart = checkoutData.items;

  if (itemsContainer) {
    itemsContainer.innerHTML = cart.map(item => `
      <div class="checkout-summary__item">
        <div class="checkout-summary__item-image">
          <img src="${item.image || '/Tafel-Totaal/images/packages/placeholder.jpg'}" alt="${item.name}">
        </div>
        <div class="checkout-summary__item-info">
          <div class="checkout-summary__item-name">${item.name}</div>
          <div class="checkout-summary__item-meta">
            ${item.persons ? `${item.persons} pers.` : `${item.quantity}x`}
          </div>
        </div>
        <div class="delivery-option__header">
          <span class="delivery-option__title">Afhalen</span>
          <span class="delivery-option__price">Gratis</span>
        </div>
        <p class="delivery-option__desc">Haal je bestelling op in Beernem (Parkstraat 44).</p>
        <div class="checkout-summary__item-price">${formatPrice(item.line_total || item.unit_price * item.quantity)}</div>
      </div>
    `).join('');
  }

  updateTotals();
}

/**
 * Update totals in summary
 */
function updateTotals() {
  const cart = checkoutData.items;
  const deliveryMethod = document.querySelector('input[name="delivery_method"]:checked')?.value || 'DELIVERY';
  
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.line_total || (item.unit_price * item.quantity);
  });

  // Delivery cost (simplified - would come from API based on postal code)
  let deliveryCost = 0;
  if (deliveryMethod === 'DELIVERY') {
    deliveryCost = 25; // Default, would be calculated based on zone
  }

  // Damage Compensation (NOT paid upfront - only shown for reference)
  const compensation = Math.round(subtotal * 0.3 * 100) / 100;

  // Total does NOT include compensation as it's not paid upfront
  const total = subtotal + deliveryCost;

  document.getElementById('checkout-subtotal').textContent = formatPrice(subtotal);
  document.getElementById('checkout-delivery').textContent = deliveryMethod === 'PICKUP' ? 'Gratis' : formatPrice(deliveryCost);
  document.getElementById('checkout-deposit').textContent = formatPrice(compensation);
  document.getElementById('checkout-total').textContent = formatPrice(total);

  // Store for order placement
  checkoutData.subtotal = subtotal;
  checkoutData.deliveryCost = deliveryCost;
  checkoutData.damageCompensation = compensation;
  checkoutData.total = total;
}

/**
 * Initialize form submissions
 */
function initForms() {
  // Step 1: Customer form
  document.getElementById('customer-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const form = e.target;
    const firstName = form.first_name.value.trim();
    const lastName = form.last_name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();

    // Validation
    if (!firstName || !lastName) {
      showToast('Vul je voor- en achternaam in', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showToast('Vul een geldig e-mailadres in', 'error');
      return;
    }

    if (!isValidPhone(phone)) {
      showToast('Vul een geldig telefoonnummer in', 'error');
      return;
    }

    // Store data
    checkoutData.customer = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      company_name: form.company_name.value.trim(),
      create_account: form.create_account.checked
    };

    goToStep(2);
  });

  // Step 2: Delivery form
  document.getElementById('delivery-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const form = e.target;
    const deliveryMethod = document.querySelector('input[name="delivery_method"]:checked')?.value;

    checkoutData.delivery = {
      method: deliveryMethod,
      notes: form.notes.value.trim()
    };

    if (deliveryMethod === 'DELIVERY') {
      const street = form.street.value.trim();
      const houseNumber = form.house_number.value.trim();
      const postalCode = form.postal_code.value.trim();
      const city = form.city.value.trim();

      if (!street || !houseNumber || !postalCode || !city) {
        showToast('Vul alle adresgegevens in', 'error');
        return;
      }

      checkoutData.delivery.address = {
        street,
        house_number: houseNumber,
        postal_code: postalCode,
        city,
        country: 'België'
      };
    }

    renderOrderReview();
    goToStep(3);
  });

  // Step 3: Payment form
  document.getElementById('payment-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const acceptTerms = document.getElementById('accept_terms').checked;
    if (!acceptTerms) {
      showToast('Je moet akkoord gaan met de algemene voorwaarden', 'error');
      return;
    }

    await placeOrder();
  });
}

/**
 * Initialize delivery method toggle
 */
function initDeliveryToggle() {
  const deliveryOptions = document.querySelectorAll('input[name="delivery_method"]');
  const addressSection = document.getElementById('delivery-address');

  deliveryOptions.forEach(option => {
    option.addEventListener('change', () => {
      if (option.value === 'DELIVERY') {
        addressSection.style.display = '';
        addressSection.querySelectorAll('input').forEach(input => input.required = true);
      } else {
        addressSection.style.display = 'none';
        addressSection.querySelectorAll('input').forEach(input => input.required = false);
      }
      updateTotals();
    });
  });

  // Postal code change - check delivery zone
  document.getElementById('postal_code')?.addEventListener('blur', checkDeliveryZone);
}

/**
 * Check delivery zone based on postal code
 */
async function checkDeliveryZone() {
  const postalCode = document.getElementById('postal_code')?.value.trim();
  const zoneInfo = document.getElementById('delivery-zone-info');
  
  if (!postalCode || postalCode.length < 4 || !zoneInfo) return;

  // Simplified zone check - would call API in production
  const zones = {
    '2000': { available: true, price: 25, name: 'Antwerpen' },
    '2018': { available: true, price: 25, name: 'Antwerpen' },
    '2020': { available: true, price: 30, name: 'Antwerpen rand' },
    '2100': { available: true, price: 35, name: 'Deurne' },
    '2600': { available: true, price: 35, name: 'Berchem' },
    '2610': { available: true, price: 40, name: 'Wilrijk' },
    '2800': { available: true, price: 45, name: 'Mechelen' },
    '9000': { available: true, price: 50, name: 'Gent' },
  };

  const zone = zones[postalCode.substring(0, 4)];

  if (zone && zone.available) {
    zoneInfo.style.display = 'flex';
    zoneInfo.className = 'delivery-zone-info delivery-zone-info--available';
    zoneInfo.querySelector('.delivery-zone-info__text').textContent = 
      `Bezorging mogelijk naar ${zone.name} - ${formatPrice(zone.price)}`;
    
    checkoutData.deliveryCost = zone.price;
    updateTotals();
  } else {
    zoneInfo.style.display = 'flex';
    zoneInfo.className = 'delivery-zone-info delivery-zone-info--unavailable';
    zoneInfo.querySelector('.delivery-zone-info__text').textContent = 
      'Bezorging niet beschikbaar voor deze postcode. Neem contact op voor mogelijkheden.';
  }
}

/**
 * Initialize step navigation buttons
 */
function initStepNavigation() {
  document.getElementById('back-to-step-1')?.addEventListener('click', () => goToStep(1));
  document.getElementById('back-to-step-2')?.addEventListener('click', () => goToStep(2));
}

/**
 * Navigate to step
 */
function goToStep(step) {
  currentStep = step;

  // Update step visibility
  document.querySelectorAll('.checkout-step').forEach(el => {
    el.classList.remove('active');
  });
  document.getElementById(`step-${step}`)?.classList.add('active');

  // Update progress indicators
  document.querySelectorAll('.progress-step').forEach(el => {
    const stepNum = parseInt(el.dataset.step);
    el.classList.remove('active', 'completed');
    
    if (stepNum === step) {
      el.classList.add('active');
    } else if (stepNum < step) {
      el.classList.add('completed');
    }
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Render order review in step 3
 */
function renderOrderReview() {
  const container = document.getElementById('order-review-items');
  if (!container) return;

  const cart = checkoutData.items;
  
  container.innerHTML = cart.map(item => `
    <div class="order-review__item">
      <div>
        <div class="order-review__item-name">${item.name}</div>
        <div class="order-review__item-meta">
          ${item.persons ? `${item.persons} personen` : `${item.quantity}x`}
          ${item.start_date ? ` • ${formatDateShort(item.start_date)} - ${formatDateShort(item.end_date)}` : ''}
        </div>
      </div>
      <div class="order-review__item-price">${formatPrice(item.line_total || item.unit_price * item.quantity)}</div>
    </div>
  `).join('');
}

/**
 * Place order and redirect to payment
 */
async function placeOrder() {
  const btn = document.getElementById('place-order-btn');
  
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;"></div> Bestelling verwerken...';

  try {
    // Prepare order data
    const orderData = {
      customer: checkoutData.customer,
      delivery_method: checkoutData.delivery.method,
      delivery_address: checkoutData.delivery.address || null,
      notes: checkoutData.delivery.notes,
      items: checkoutData.items.map(item => ({
        type: item.type,
        id: item.package_id || item.product_id,
        quantity: item.quantity,
        persons: item.persons,
        start_date: item.start_date,
        end_date: item.end_date,
        addons: item.addons || []
      }))
    };

    // Create order via API
    const response = await checkoutAPI.createOrder(orderData);

    if (response.data?.payment_url) {
      // Clear cart before redirect
      await clearCart();
      
      // Redirect to Mollie payment page
      window.location.href = response.data.payment_url;
    } else {
      throw new Error('Geen betaallink ontvangen');
    }
  } catch (error) {
    console.error('Order placement error:', error);
    showToast(error.message || 'Er ging iets mis bij het plaatsen van je bestelling', 'error');
    
    btn.disabled = false;
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      Bestelling plaatsen & betalen
    `;
  }
}
