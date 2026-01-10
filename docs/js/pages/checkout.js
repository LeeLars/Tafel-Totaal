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

// Delivery constants
const MINIMUM_ORDER_FOR_DELIVERY = 150;
const PRICE_PER_KM = 0.50;
const FREE_DELIVERY_RADIUS_KM = 15;
const ORIGIN_ADDRESS = 'Parkstraat 44, 8730 Beernem, Belgium';

// Comprehensive postal code database with precise distances from Beernem (Parkstraat 44)
// Distances are calculated as driving distance in km
const POSTAL_CODE_DISTANCES = {
  // === GRATIS LEVERING ZONE (binnen 15km) ===
  // Beernem en deelgemeenten
  '8730': { name: 'Beernem', distance: 0 },
  '8731': { name: 'Oedelem', distance: 4 },
  '8732': { name: 'Sint-Joris (Beernem)', distance: 5 },
  
  // Oostkamp en deelgemeenten
  '8020': { name: 'Oostkamp', distance: 6 },
  '8021': { name: 'Ruddervoorde', distance: 9 },
  '8022': { name: 'Waardamme', distance: 8 },
  
  // Aalter en deelgemeenten
  '9880': { name: 'Aalter', distance: 10 },
  '9881': { name: 'Bellem', distance: 8 },
  '9910': { name: 'Knesselare', distance: 12 },
  
  // Zedelgem en deelgemeenten
  '8210': { name: 'Zedelgem', distance: 10 },
  '8211': { name: 'Aartrijke', distance: 12 },
  
  // Wingene
  '8750': { name: 'Wingene', distance: 12 },
  '8751': { name: 'Zwevezele', distance: 14 },
  
  // Ruiselede
  '8755': { name: 'Ruiselede', distance: 13 },
  
  // Loppem/Sint-Andries
  '8200': { name: 'Sint-Andries (Brugge)', distance: 10 },
  '8210': { name: 'Loppem', distance: 8 },
  
  // Hertsberge
  '8020': { name: 'Hertsberge', distance: 7 },
  
  // === BRUGGE EN OMGEVING (15-25km) ===
  '8000': { name: 'Brugge', distance: 16 },
  '8300': { name: 'Knokke-Heist', distance: 28 },
  '8301': { name: 'Knokke', distance: 30 },
  '8310': { name: 'Sint-Kruis (Brugge)', distance: 14 },
  '8340': { name: 'Damme', distance: 20 },
  '8370': { name: 'Blankenberge', distance: 22 },
  '8380': { name: 'Zeebrugge', distance: 24 },
  '8400': { name: 'Oostende', distance: 28 },
  '8420': { name: 'De Haan', distance: 24 },
  '8430': { name: 'Middelkerke', distance: 32 },
  '8450': { name: 'Bredene', distance: 26 },
  '8460': { name: 'Oudenburg', distance: 22 },
  '8470': { name: 'Gistel', distance: 20 },
  '8480': { name: 'Ichtegem', distance: 18 },
  '8490': { name: 'Jabbeke', distance: 14 },
  
  // === TIELT EN OMGEVING (15-25km) ===
  '8700': { name: 'Tielt', distance: 18 },
  '8710': { name: 'Wielsbeke', distance: 25 },
  '8720': { name: 'Dentergem', distance: 22 },
  '8740': { name: 'Pittem', distance: 16 },
  '8760': { name: 'Meulebeke', distance: 20 },
  '8770': { name: 'Ingelmunster', distance: 26 },
  '8780': { name: 'Oostrozebeke', distance: 28 },
  '8790': { name: 'Waregem', distance: 32 },
  
  // === ROESELARE EN OMGEVING (25-35km) ===
  '8800': { name: 'Roeselare', distance: 28 },
  '8810': { name: 'Lichtervelde', distance: 18 },
  '8820': { name: 'Torhout', distance: 15 },
  '8830': { name: 'Hooglede', distance: 22 },
  '8840': { name: 'Staden', distance: 30 },
  '8850': { name: 'Ardooie', distance: 24 },
  '8860': { name: 'Lendelede', distance: 30 },
  '8870': { name: 'Izegem', distance: 28 },
  '8880': { name: 'Ledegem', distance: 32 },
  '8890': { name: 'Moorslede', distance: 35 },
  
  // === KORTRIJK EN OMGEVING (35-50km) ===
  '8500': { name: 'Kortrijk', distance: 40 },
  '8501': { name: 'Heule', distance: 38 },
  '8510': { name: 'Marke', distance: 42 },
  '8511': { name: 'Aalbeke', distance: 45 },
  '8520': { name: 'Kuurne', distance: 36 },
  '8530': { name: 'Harelbeke', distance: 34 },
  '8540': { name: 'Deerlijk', distance: 36 },
  '8550': { name: 'Zwevegem', distance: 40 },
  '8560': { name: 'Wevelgem', distance: 42 },
  '8570': { name: 'Anzegem', distance: 38 },
  '8580': { name: 'Avelgem', distance: 45 },
  '8590': { name: 'Heestert', distance: 42 },
  
  // === IEPER EN OMGEVING (45-60km) ===
  '8900': { name: 'Ieper', distance: 48 },
  '8902': { name: 'Zillebeke', distance: 50 },
  '8904': { name: 'Boezinge', distance: 46 },
  '8906': { name: 'Elverdinge', distance: 45 },
  '8908': { name: 'Vlamertinge', distance: 47 },
  '8920': { name: 'Langemark-Poelkapelle', distance: 42 },
  '8930': { name: 'Menen', distance: 48 },
  '8940': { name: 'Wervik', distance: 52 },
  '8950': { name: 'Nieuwkerke', distance: 55 },
  '8970': { name: 'Poperinge', distance: 52 },
  '8980': { name: 'Zonnebeke', distance: 45 },
  
  // === VEURNE/DIKSMUIDE (35-55km) ===
  '8600': { name: 'Diksmuide', distance: 32 },
  '8610': { name: 'Kortemark', distance: 25 },
  '8620': { name: 'Nieuwpoort', distance: 35 },
  '8630': { name: 'Veurne', distance: 42 },
  '8640': { name: 'Oostvleteren', distance: 48 },
  '8647': { name: 'Lo-Reninge', distance: 45 },
  '8650': { name: 'Houthulst', distance: 38 },
  '8660': { name: 'De Panne', distance: 48 },
  '8670': { name: 'Koksijde', distance: 45 },
  '8680': { name: 'Koekelare', distance: 28 },
  '8690': { name: 'Alveringem', distance: 45 },
  
  // === GENT EN OMGEVING (35-50km) ===
  '9000': { name: 'Gent', distance: 42 },
  '9030': { name: 'Mariakerke (Gent)', distance: 40 },
  '9031': { name: 'Drongen', distance: 38 },
  '9032': { name: 'Wondelgem', distance: 42 },
  '9040': { name: 'Sint-Amandsberg', distance: 44 },
  '9041': { name: 'Oostakker', distance: 45 },
  '9042': { name: 'Desteldonk', distance: 48 },
  '9050': { name: 'Gentbrugge', distance: 44 },
  '9051': { name: 'Sint-Denijs-Westrem', distance: 40 },
  '9052': { name: 'Zwijnaarde', distance: 42 },
  
  // === EEKLO EN OMGEVING (25-40km) ===
  '9900': { name: 'Eeklo', distance: 28 },
  '9920': { name: 'Lovendegem', distance: 32 },
  '9921': { name: 'Vinderhoute', distance: 30 },
  '9930': { name: 'Zomergem', distance: 25 },
  '9931': { name: 'Oostwinkel', distance: 22 },
  '9940': { name: 'Evergem', distance: 35 },
  '9950': { name: 'Waarschoot', distance: 30 },
  '9960': { name: 'Assenede', distance: 38 },
  '9970': { name: 'Kaprijke', distance: 32 },
  '9980': { name: 'Sint-Laureins', distance: 28 },
  '9990': { name: 'Maldegem', distance: 18 },
  '9991': { name: 'Adegem', distance: 15 },
  '9992': { name: 'Middelburg', distance: 20 },
  
  // === DEINZE EN OMGEVING (25-35km) ===
  '9800': { name: 'Deinze', distance: 28 },
  '9810': { name: 'Nazareth', distance: 35 },
  '9820': { name: 'Merelbeke', distance: 40 },
  '9830': { name: 'Sint-Martens-Latem', distance: 35 },
  '9840': { name: 'De Pinte', distance: 38 },
  '9850': { name: 'Nevele', distance: 25 },
  '9860': { name: 'Oosterzele', distance: 42 },
  '9870': { name: 'Zulte', distance: 30 },
  
  // === AALST EN OMGEVING (55-70km) ===
  '9300': { name: 'Aalst', distance: 58 },
  '9308': { name: 'Hofstade', distance: 60 },
  '9310': { name: 'Moorsel', distance: 62 },
  '9320': { name: 'Erembodegem', distance: 56 },
  '9400': { name: 'Ninove', distance: 55 },
  '9420': { name: 'Erpe-Mere', distance: 58 },
  '9450': { name: 'Haaltert', distance: 55 },
  '9470': { name: 'Denderleeuw', distance: 52 },
  '9500': { name: 'Geraardsbergen', distance: 60 },
  
  // === DENDERMONDE EN OMGEVING (50-65km) ===
  '9200': { name: 'Dendermonde', distance: 55 },
  '9220': { name: 'Hamme', distance: 52 },
  '9230': { name: 'Wetteren', distance: 48 },
  '9240': { name: 'Zele', distance: 50 },
  '9250': { name: 'Waasmunster', distance: 52 },
  '9260': { name: 'Wichelen', distance: 50 },
  '9270': { name: 'Laarne', distance: 48 },
  '9280': { name: 'Lebbeke', distance: 55 },
  '9290': { name: 'Berlare', distance: 52 },
  
  // === LOKEREN/SINT-NIKLAAS (45-60km) ===
  '9100': { name: 'Sint-Niklaas', distance: 55 },
  '9111': { name: 'Belsele', distance: 52 },
  '9112': { name: 'Sinaai', distance: 50 },
  '9120': { name: 'Beveren', distance: 58 },
  '9130': { name: 'Kieldrecht', distance: 62 },
  '9140': { name: 'Temse', distance: 55 },
  '9150': { name: 'Kruibeke', distance: 60 },
  '9160': { name: 'Lokeren', distance: 48 },
  '9170': { name: 'Sint-Gillis-Waas', distance: 55 },
  '9180': { name: 'Moerbeke', distance: 45 },
  '9190': { name: 'Stekene', distance: 48 },
  
  // === OUDENAARDE EN OMGEVING (45-60km) ===
  '9600': { name: 'Ronse', distance: 55 },
  '9620': { name: 'Zottegem', distance: 52 },
  '9630': { name: 'Zwalm', distance: 50 },
  '9660': { name: 'Brakel', distance: 55 },
  '9680': { name: 'Maarkedal', distance: 52 },
  '9690': { name: 'Kluisbergen', distance: 50 },
  '9700': { name: 'Oudenaarde', distance: 48 },
  '9750': { name: 'Zingem', distance: 45 },
  '9770': { name: 'Kruishoutem', distance: 42 },
  '9790': { name: 'Wortegem-Petegem', distance: 45 },
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
  const deliveryRadio = document.getElementById('delivery-radio');
  const pickupRadio = document.getElementById('pickup-radio');
  const addressSection = document.getElementById('delivery-address');
  const deliveryOption = document.getElementById('delivery-option-delivery');
  const deliveryMinNotice = document.getElementById('delivery-min-notice');
  const deliveryDisabledNotice = document.getElementById('delivery-disabled-notice');

  // Check minimum order for delivery
  const subtotal = calculateSubtotal();
  const canDeliver = subtotal >= MINIMUM_ORDER_FOR_DELIVERY;

  if (!canDeliver) {
    // Disable delivery option
    deliveryRadio.disabled = true;
    deliveryOption.classList.add('disabled');
    deliveryOption.style.opacity = '0.5';
    deliveryOption.style.cursor = 'not-allowed';
    deliveryMinNotice?.classList.add('hidden');
    deliveryDisabledNotice?.classList.remove('hidden');
    
    // Force pickup selection
    pickupRadio.checked = true;
    addressSection.style.display = 'none';
  } else {
    deliveryRadio.disabled = false;
    deliveryOption.classList.remove('disabled');
    deliveryOption.style.opacity = '1';
    deliveryOption.style.cursor = 'pointer';
    deliveryMinNotice?.classList.remove('hidden');
    deliveryDisabledNotice?.classList.add('hidden');
  }

  // Handle delivery method change
  document.querySelectorAll('input[name="delivery_method"]').forEach(option => {
    option.addEventListener('change', () => {
      if (option.value === 'DELIVERY' && canDeliver) {
        addressSection.style.display = '';
        addressSection.querySelectorAll('input').forEach(input => input.required = true);
      } else {
        addressSection.style.display = 'none';
        addressSection.querySelectorAll('input').forEach(input => input.required = false);
      }
      updateTotals();
    });
  });

  // Initial state - hide address if pickup selected
  if (pickupRadio.checked) {
    addressSection.style.display = 'none';
  }

  // Postal code change - check delivery zone
  document.getElementById('postal_code')?.addEventListener('blur', checkDeliveryZone);
  document.getElementById('postal_code')?.addEventListener('input', debounce(checkDeliveryZone, 500));
}

/**
 * Calculate subtotal from cart items
 */
function calculateSubtotal() {
  let subtotal = 0;
  checkoutData.items.forEach(item => {
    subtotal += item.line_total || (item.unit_price * item.quantity) || 0;
  });
  return subtotal;
}

/**
 * Simple debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check delivery zone based on postal code
 * Uses comprehensive postal code database with precise distances
 * Free delivery within 15km radius for orders over €150
 */
async function checkDeliveryZone() {
  const postalCode = document.getElementById('postal_code')?.value.trim();
  const zoneInfo = document.getElementById('delivery-zone-info');
  const deliveryPriceEl = document.getElementById('delivery-price');
  
  if (!postalCode || postalCode.length < 4 || !zoneInfo) return;

  // Look up exact postal code first, then try prefix matching
  let location = POSTAL_CODE_DISTANCES[postalCode];
  
  // If not found, try to find a nearby postal code (same first 3 digits)
  if (!location) {
    const prefix3 = postalCode.substring(0, 3);
    const prefix2 = postalCode.substring(0, 2);
    
    // Find closest match
    for (const [code, data] of Object.entries(POSTAL_CODE_DISTANCES)) {
      if (code.startsWith(prefix3)) {
        location = { ...data, name: data.name + ' (regio)', estimated: true };
        break;
      }
    }
    
    // If still not found, check if it's in West/Oost-Vlaanderen by prefix
    if (!location && (prefix2 === '80' || prefix2 === '81' || prefix2 === '82' || 
        prefix2 === '83' || prefix2 === '84' || prefix2 === '85' || prefix2 === '86' || 
        prefix2 === '87' || prefix2 === '88' || prefix2 === '89' || prefix2 === '90' || 
        prefix2 === '91' || prefix2 === '92' || prefix2 === '93' || prefix2 === '94' || 
        prefix2 === '95' || prefix2 === '96' || prefix2 === '97' || prefix2 === '98' || 
        prefix2 === '99')) {
      // Estimate distance based on prefix
      const estimatedDistances = {
        '80': 16, '81': 20, '82': 28, '83': 18, '84': 35, '85': 40, 
        '86': 48, '87': 5, '88': 35, '89': 25, '90': 42, '91': 45,
        '92': 58, '93': 55, '94': 50, '95': 60, '96': 55, '97': 28,
        '98': 50, '99': 48
      };
      location = { 
        name: 'Onbekende gemeente', 
        distance: estimatedDistances[prefix2] || 40,
        estimated: true 
      };
    }
  }

  if (location) {
    const distance = location.distance;
    let deliveryCost = 0;
    let deliveryMessage = '';
    
    // Check if within free delivery radius
    if (distance <= FREE_DELIVERY_RADIUS_KM) {
      deliveryCost = 0;
      deliveryMessage = `✓ GRATIS levering naar ${location.name} (${distance}km)`;
      
      if (deliveryPriceEl) {
        deliveryPriceEl.textContent = 'GRATIS';
        deliveryPriceEl.style.color = 'var(--color-success)';
      }
    } else {
      // Calculate cost: €0.50 per km beyond 15km (round trip)
      const chargeableKm = distance - FREE_DELIVERY_RADIUS_KM;
      deliveryCost = Math.round(chargeableKm * PRICE_PER_KM * 2 * 100) / 100; // x2 for round trip
      
      // Ensure minimum delivery cost of €5 for paid deliveries
      deliveryCost = Math.max(deliveryCost, 5);
      
      deliveryMessage = `✓ Bezorging naar ${location.name} (${distance}km) - ${formatPrice(deliveryCost)}`;
      if (location.estimated) {
        deliveryMessage += ' (geschat)';
      }
      
      if (deliveryPriceEl) {
        deliveryPriceEl.textContent = formatPrice(deliveryCost);
        deliveryPriceEl.style.color = '';
      }
    }
    
    zoneInfo.style.display = 'flex';
    zoneInfo.className = 'delivery-zone-info delivery-zone-info--available';
    zoneInfo.querySelector('.delivery-zone-info__text').textContent = deliveryMessage;
    
    // Show calculation breakdown for paid deliveries
    if (distance > FREE_DELIVERY_RADIUS_KM) {
      const breakdown = document.createElement('small');
      breakdown.style.display = 'block';
      breakdown.style.marginTop = '4px';
      breakdown.style.opacity = '0.8';
      breakdown.textContent = `Berekening: (${distance}km - ${FREE_DELIVERY_RADIUS_KM}km gratis) × €0,50 × 2 (heen+terug)`;
      
      const textEl = zoneInfo.querySelector('.delivery-zone-info__text');
      // Remove old breakdown if exists
      const oldBreakdown = textEl.querySelector('small');
      if (oldBreakdown) oldBreakdown.remove();
      textEl.appendChild(breakdown);
    }
    
    checkoutData.deliveryCost = deliveryCost;
    checkoutData.deliveryDistance = distance;
    checkoutData.deliveryLocation = location.name;
    updateTotals();
  } else {
    // Postal code not in West/Oost-Vlaanderen
    const isBelgian = postalCode.length === 4 && /^\d{4}$/.test(postalCode);
    
    zoneInfo.style.display = 'flex';
    zoneInfo.className = 'delivery-zone-info delivery-zone-info--unavailable';
    
    if (isBelgian) {
      zoneInfo.querySelector('.delivery-zone-info__text').textContent = 
        '✗ Bezorging enkel mogelijk in West- en Oost-Vlaanderen. Kies voor afhalen of neem contact op.';
    } else {
      zoneInfo.querySelector('.delivery-zone-info__text').textContent = 
        '✗ Voer een geldige Belgische postcode in (4 cijfers).';
    }
    
    // Reset delivery cost
    checkoutData.deliveryCost = 0;
    if (deliveryPriceEl) {
      deliveryPriceEl.textContent = 'Niet beschikbaar';
      deliveryPriceEl.style.color = '';
    }
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
