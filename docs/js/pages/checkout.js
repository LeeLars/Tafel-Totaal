/**
 * Tafel Totaal - Checkout Page JavaScript
 * Handles multi-step checkout flow and order placement
 */

import { checkoutAPI } from '../lib/api.js';
import { formatPrice, formatDateShort, showToast, isValidEmail, isValidPhone } from '../lib/utils.js';
import { getCart, clearCart } from '../services/cart.js';
import { getCurrentUser } from '../services/auth.js';
import { loadHeader } from '../components/header.js';

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

// Origin coordinates (Parkstraat 44, 8730 Beernem - exact location)
const ORIGIN_COORDS = [51.1372195, 3.3281456]; // [lat, lng] - precise geocoded coordinates

// OpenRouteService API key (free tier - 2000 requests/day)
const ORS_API_KEY = '5b3ce3597851110001cf6248a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'; // Public demo key

// Map variables
let deliveryMap = null;
let routeLayer = null;
let carMarker = null;
let animationFrame = null;

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
  // Load header first
  await loadHeader();
  
  const cart = getCart();
  
  if (!cart || cart.length === 0) {
    showEmptyCart();
    return;
  }

  checkoutData.items = cart;
  
  prefillUserData();
  renderSummary();
  populateEventDates();
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
  const vatField = document.getElementById('vat_number');
  if (vatField) vatField.value = user.vat_number || '';
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
            ${item.persons ? `${item.persons} pers.` : `${item.quantity}x`} | ${formatDateShort(item.start_date)} - ${formatDateShort(item.end_date)}
          </div>
        </div>
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
  const deliveryMethod = document.querySelector('input[name="delivery_method"]:checked')?.value || 'PICKUP';
  
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.line_total || (item.unit_price * item.quantity);
  });

  // Use calculated delivery cost from route calculation, or 0 for pickup
  let deliveryCost = 0;
  if (deliveryMethod === 'DELIVERY') {
    // Use the calculated delivery cost from checkDeliveryZone, default to 0 if not yet calculated
    deliveryCost = checkoutData.deliveryCost || 0;
  }

  console.log('updateTotals called:', {
    deliveryMethod,
    deliveryCostFromData: checkoutData.deliveryCost,
    finalDeliveryCost: deliveryCost,
    subtotal
  });

  // Damage Compensation (NOT paid upfront - only shown for reference)
  // Calculate based on per-item damage compensation, and group by amount
  const compensationGroups = new Map();
  let compensation = 0;
  cart.forEach(item => {
    const qty = item.quantity || 1;

    const perItem =
      (typeof item.damage_compensation_per_item === 'number' && !isNaN(item.damage_compensation_per_item))
        ? item.damage_compensation_per_item
        : null;

    const totalForItem =
      (typeof item.damage_compensation === 'number' && !isNaN(item.damage_compensation))
        ? item.damage_compensation
        : (perItem != null ? perItem * qty : 0);

    compensation += totalForItem;

    if (perItem != null && perItem > 0) {
      const key = perItem.toFixed(2);
      const entry = compensationGroups.get(key) || { perItem, names: [] };
      entry.names.push(qty > 1 ? `${item.name} (${qty}x)` : item.name);
      compensationGroups.set(key, entry);
    }
  });
  compensation = Math.round(compensation * 100) / 100;

  // Total does NOT include compensation as it's not paid upfront
  const total = subtotal + deliveryCost;

  document.getElementById('checkout-subtotal').textContent = formatPrice(subtotal);
  
  // Show delivery cost or appropriate message
  const deliveryEl = document.getElementById('checkout-delivery');
  if (deliveryMethod === 'PICKUP') {
    deliveryEl.textContent = 'Gratis (afhalen)';
    deliveryEl.style.color = '';
  } else if (deliveryCost === 0) {
    deliveryEl.textContent = 'GRATIS';
    deliveryEl.style.color = 'var(--color-success)';
  } else {
    deliveryEl.textContent = formatPrice(deliveryCost);
    deliveryEl.style.color = '';
  }
  
  const depositEl = document.getElementById('checkout-deposit');
  if (depositEl) {
    depositEl.textContent = formatPrice(compensation);

    const breakdownLines = Array.from(compensationGroups.values())
      .sort((a, b) => a.perItem - b.perItem)
      .map(group => `${group.names.join(' + ')}: ${formatPrice(group.perItem)}`);

    if (breakdownLines.length > 0) {
      depositEl.title = breakdownLines.join(' | ');

      const tooltipTextEl = document.querySelector('.checkout-summary__row--deposit .info-tooltip__text');
      if (tooltipTextEl) {
        tooltipTextEl.innerHTML = breakdownLines.join('<br>');
      }
    } else {
      depositEl.title = '';
    }
  }
  document.getElementById('checkout-total').textContent = formatPrice(total);

  // Store for order placement (don't overwrite deliveryCost if already set by route calculation)
  checkoutData.subtotal = subtotal;
  checkoutData.damageCompensation = compensation;
  checkoutData.total = total;
}

/**
 * Initialize form submissions
 */
function initForms() {
  // Prevent Enter key from submitting forms - move to next field instead
  document.querySelectorAll('.checkout-form input:not([type="checkbox"]):not([type="radio"]), .checkout-form select').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        
        // Get all focusable form elements
        const form = input.closest('form');
        if (!form) return;
        
        const focusableElements = Array.from(form.querySelectorAll(
          'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled]), button[type="submit"]'
        ));
        
        const currentIndex = focusableElements.indexOf(input);
        
        if (currentIndex > -1 && currentIndex < focusableElements.length - 1) {
          // Move to next field
          focusableElements[currentIndex + 1].focus();
        } else if (currentIndex === focusableElements.length - 1) {
          // Last field - submit the form
          form.requestSubmit();
        }
      }
    });
  });

  // Step 1: Customer form
  document.getElementById('customer-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const form = e.target;
    const firstName = form.first_name.value.trim();
    const lastName = form.last_name.value.trim();
    const email = form.email.value.trim();
    const vatNumber = form.vat_number?.value?.trim?.() || '';
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
      vat_number: vatNumber,
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

    // Validate delivery method selection
    if (!deliveryMethod) {
      showToast('Selecteer een leveringsmethode (Bezorgen of Afhalen)', 'error');
      return;
    }

    checkoutData.delivery = {
      method: deliveryMethod,
      notes: form.notes.value.trim()
    };

    if (deliveryMethod === 'DELIVERY') {
      const street = form.street.value.trim();
      const houseNumber = form.house_number.value.trim();
      const postalCode = form.postal_code.value.trim();
      const city = form.city.value.trim();
      const deliveryTime = form.delivery_time?.value;
      const pickupTime = form.pickup_time?.value;

      if (!street || !houseNumber || !postalCode || !city) {
        showToast('Vul alle adresgegevens in', 'error');
        return;
      }

      if (!deliveryTime) {
        showToast('Selecteer een gewenst levermoment', 'error');
        return;
      }

      if (!pickupTime) {
        showToast('Selecteer een gewenst ophaalmoment', 'error');
        return;
      }

      checkoutData.delivery.address = {
        street,
        house_number: houseNumber,
        postal_code: postalCode,
        city,
        country: 'België'
      };
      
      checkoutData.delivery.deliveryTime = deliveryTime;
      checkoutData.delivery.pickupTime = pickupTime;
    } else if (deliveryMethod === 'PICKUP') {
      const selfPickupTime = form.self_pickup_time?.value;
      const returnTime = form.return_time?.value;

      if (!selfPickupTime) {
        showToast('Selecteer een gewenst afhaalmoment', 'error');
        return;
      }

      if (!returnTime) {
        showToast('Selecteer een gewenst terugbrengmoment', 'error');
        return;
      }

      checkoutData.delivery.selfPickupTime = selfPickupTime;
      checkoutData.delivery.returnTime = returnTime;
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
 * Populate event dates from cart items
 */
function populateEventDates() {
  const cart = checkoutData.items;
  if (!cart || cart.length === 0) return;
  
  // Find the first item with an event_date (preferred) or start_date (fallback)
  const itemWithDate = cart.find(item => item.event_date || item.start_date);
  if (!itemWithDate) return;
  
  // Use event_date if available (actual event date), otherwise fall back to start_date
  const actualEventDate = itemWithDate.event_date || itemWithDate.start_date;
  if (!actualEventDate) return;
  
  const eventDate = new Date(actualEventDate);
  const formattedDate = formatDateShort(actualEventDate);
  
  console.log('Populating event dates with:', { 
    event_date: itemWithDate.event_date,
    start_date: itemWithDate.start_date,
    using: actualEventDate,
    formatted: formattedDate 
  });
  
  // Populate both delivery and pickup event date fields
  const deliveryEventDateField = document.getElementById('delivery-event-date');
  const pickupEventDateField = document.getElementById('pickup-event-date');
  
  if (deliveryEventDateField) {
    deliveryEventDateField.value = formattedDate;
  }
  if (pickupEventDateField) {
    pickupEventDateField.value = formattedDate;
  }
  
  // Store event date in checkout data (use actual event_date, not logistical start_date)
  checkoutData.eventDate = actualEventDate;
  
  // Generate date preset buttons
  generateDatePresets(eventDate);
}

/**
 * Generate date preset buttons for delivery/pickup scheduling
 */
function generateDatePresets(eventDate) {
  // Delivery date options (up to 2 days before event)
  const deliveryDateContainer = document.getElementById('delivery-date-options');
  const pickupDateContainer = document.getElementById('pickup-date-options');
  
  // Self-pickup date options (up to 2 days before event)
  const selfPickupDateContainer = document.getElementById('self-pickup-date-options');
  const returnDateContainer = document.getElementById('return-date-options');
  
  if (deliveryDateContainer) {
    const deliveryOptions = generateDateOptions(eventDate, -2, 0); // 2 days before to event day
    deliveryDateContainer.innerHTML = deliveryOptions.map(opt => 
      `<button type="button" class="date-preset-btn" data-date="${opt.value}">${opt.label}</button>`
    ).join('');
    
    // Add click handlers
    deliveryDateContainer.querySelectorAll('.date-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => selectDatePreset(btn, 'delivery-date-selected'));
    });
  }
  
  if (pickupDateContainer) {
    const pickupOptions = generateDateOptions(eventDate, 1, 2); // 1-2 days after event
    pickupDateContainer.innerHTML = pickupOptions.map(opt => 
      `<button type="button" class="date-preset-btn" data-date="${opt.value}">${opt.label}</button>`
    ).join('');
    
    // Add click handlers
    pickupDateContainer.querySelectorAll('.date-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => selectDatePreset(btn, 'pickup-date-selected'));
    });
  }
  
  if (selfPickupDateContainer) {
    const selfPickupOptions = generateDateOptions(eventDate, -2, 0); // 2 days before to event day
    selfPickupDateContainer.innerHTML = selfPickupOptions.map(opt => 
      `<button type="button" class="date-preset-btn" data-date="${opt.value}">${opt.label}</button>`
    ).join('');
    
    // Add click handlers
    selfPickupDateContainer.querySelectorAll('.date-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => selectDatePreset(btn, 'self-pickup-date-selected'));
    });
  }
  
  if (returnDateContainer) {
    const returnOptions = generateDateOptions(eventDate, 1, 2); // 1-2 days after event
    returnDateContainer.innerHTML = returnOptions.map(opt => 
      `<button type="button" class="date-preset-btn" data-date="${opt.value}">${opt.label}</button>`
    ).join('');
    
    // Add click handlers
    returnDateContainer.querySelectorAll('.date-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => selectDatePreset(btn, 'return-date-selected'));
    });
  }
}

/**
 * Generate date options relative to event date
 */
function generateDateOptions(eventDate, startOffset, endOffset) {
  const options = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = startOffset; i <= endOffset; i++) {
    const date = new Date(eventDate);
    date.setDate(date.getDate() + i);
    
    // Skip dates in the past
    if (date < today) continue;
    
    const dayNames = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
    const dayName = dayNames[date.getDay()];
    const dateStr = formatDateShort(date.toISOString());
    
    let label = `${dayName} ${dateStr}`;
    if (i === 0) label += ' (Evenement)';
    else if (i === -2) label = `2 dagen voor`;
    else if (i === -1) label = `1 dag voor`;
    else if (i === 1) label = `1 dag na`;
    else if (i === 2) label = `2 dagen na`;
    
    options.push({
      value: date.toISOString().split('T')[0],
      label: label
    });
  }
  
  return options;
}

/**
 * Select a date preset button
 */
function selectDatePreset(button, hiddenFieldId) {
  // Remove active class from siblings
  const container = button.parentElement;
  container.querySelectorAll('.date-preset-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Add active class to selected button
  button.classList.add('active');
  
  // Set hidden field value
  const hiddenField = document.getElementById(hiddenFieldId);
  if (hiddenField) {
    hiddenField.value = button.dataset.date;
  }
}

/**
 * Initialize delivery method toggle
 */
function initDeliveryToggle() {
  const deliveryRadio = document.getElementById('delivery-radio');
  const pickupRadio = document.getElementById('pickup-radio');
  const addressSection = document.getElementById('delivery-address');
  const deliveryScheduling = document.getElementById('delivery-scheduling');
  const pickupScheduling = document.getElementById('pickup-scheduling');
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
    
    if (deliveryScheduling) {
      deliveryScheduling.style.display = 'none';
      deliveryScheduling.classList.add('hidden');
    }
    
    if (pickupScheduling) {
      pickupScheduling.style.display = 'block';
      pickupScheduling.classList.remove('hidden');
    }
    
    // Set required fields for pickup
    setSchedulingRequiredFields('PICKUP');
  } else {
    deliveryRadio.disabled = false;
    deliveryOption.classList.remove('disabled');
    deliveryOption.style.opacity = '1';
    deliveryOption.style.cursor = 'pointer';
    deliveryMinNotice?.classList.remove('hidden');
    deliveryDisabledNotice?.classList.add('hidden');
    
    // No default selection - user must choose
    // But check if one is already checked
    const selectedMethod = document.querySelector('input[name="delivery_method"]:checked')?.value;
    
    if (selectedMethod === 'DELIVERY') {
      addressSection.style.display = 'block';
      if (deliveryScheduling) {
        deliveryScheduling.style.display = 'block';
        deliveryScheduling.classList.remove('hidden');
      }
      if (pickupScheduling) {
        pickupScheduling.style.display = 'none';
        pickupScheduling.classList.add('hidden');
      }
      setSchedulingRequiredFields('DELIVERY');
    } else if (selectedMethod === 'PICKUP') {
      addressSection.style.display = 'none';
      if (deliveryScheduling) {
        deliveryScheduling.style.display = 'none';
        deliveryScheduling.classList.add('hidden');
      }
      if (pickupScheduling) {
        pickupScheduling.style.display = 'block';
        pickupScheduling.classList.remove('hidden');
      }
      setSchedulingRequiredFields('PICKUP');
    } else {
      // Nothing selected yet
      addressSection.style.display = 'none';
      if (deliveryScheduling) deliveryScheduling.style.display = 'none';
      if (pickupScheduling) pickupScheduling.style.display = 'none';
    }
  }

  // Handle delivery method change
  document.querySelectorAll('input[name="delivery_method"]').forEach(option => {
    option.addEventListener('change', () => {
      console.log('Delivery method changed to:', option.value);
      
      if (option.value === 'DELIVERY' && canDeliver) {
        addressSection.style.display = 'block';
        
        if (deliveryScheduling) {
          deliveryScheduling.style.display = 'block';
          deliveryScheduling.classList.remove('hidden');
        }
        
        if (pickupScheduling) {
          pickupScheduling.style.display = 'none';
          pickupScheduling.classList.add('hidden');
        }
        
        setSchedulingRequiredFields('DELIVERY');
        
        // Initialize map placeholder and check if address already filled
        initializeMapPlaceholder();
        checkDeliveryZone();
      } else if (option.value === 'PICKUP') {
        addressSection.style.display = 'none';
        
        if (deliveryScheduling) {
          deliveryScheduling.style.display = 'none';
          deliveryScheduling.classList.add('hidden');
        }
        
        if (pickupScheduling) {
          pickupScheduling.style.display = 'block';
          pickupScheduling.classList.remove('hidden');
        }
        
        setSchedulingRequiredFields('PICKUP');
      }
      updateTotals();
    });
  });

  // Address field changes - trigger route calculation
  const addressFields = ['street', 'house_number', 'postal_code', 'city'];
  addressFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('blur', checkDeliveryZone);
      field.addEventListener('input', debounce(checkDeliveryZone, 800));
    }
  });
}

/**
 * Set required fields based on delivery method
 */
function setSchedulingRequiredFields(method) {
  // Delivery scheduling fields
  const deliveryTimeField = document.getElementById('delivery-time');
  const pickupTimeField = document.getElementById('pickup-time');
  
  // Pickup scheduling fields
  const selfPickupTimeField = document.getElementById('self-pickup-time');
  const returnTimeField = document.getElementById('return-time');
  
  // Address fields
  const addressSection = document.getElementById('delivery-address');
  const addressInputs = addressSection?.querySelectorAll('input[required]') || [];
  
  if (method === 'DELIVERY') {
    // Delivery: require delivery-time, pickup-time, and address fields
    if (deliveryTimeField) deliveryTimeField.required = true;
    if (pickupTimeField) pickupTimeField.required = true;
    if (selfPickupTimeField) selfPickupTimeField.required = false;
    if (returnTimeField) returnTimeField.required = false;
    addressInputs.forEach(input => input.required = true);
  } else if (method === 'PICKUP') {
    // Pickup: require self-pickup-time and return-time
    if (deliveryTimeField) deliveryTimeField.required = false;
    if (pickupTimeField) pickupTimeField.required = false;
    if (selfPickupTimeField) selfPickupTimeField.required = true;
    if (returnTimeField) returnTimeField.required = true;
    addressInputs.forEach(input => input.required = false);
  }
}

/**
 * Initialize map with placeholder view (centered on Beernem)
 */
function initializeMapPlaceholder() {
  const mapEl = document.getElementById('delivery-map');
  const mapPlaceholder = document.getElementById('map-placeholder');
  
  if (!mapEl) return;
  
  // Show placeholder, hide any existing map content
  if (mapPlaceholder) {
    mapPlaceholder.style.display = 'block';
  }
  
  // Reset price breakdown to placeholder state
  const deliveryCostEl = document.getElementById('delivery-cost-one-way');
  const pickupCostEl = document.getElementById('pickup-cost-one-way');
  const totalCostEl = document.getElementById('delivery-cost-total');
  
  if (deliveryCostEl) deliveryCostEl.textContent = '€--,--';
  if (pickupCostEl) pickupCostEl.textContent = '€--,--';
  if (totalCostEl) totalCostEl.textContent = '€--,--';
  
  // Reset route info
  document.getElementById('route-duration').innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px; margin-right: 4px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>-- min`;
  document.getElementById('route-km').innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px; margin-right: 4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>-- km`;
  document.getElementById('route-distance').textContent = '';
  
  // Clear any existing map
  if (deliveryMap) {
    if (routeLayer) {
      deliveryMap.removeLayer(routeLayer);
      routeLayer = null;
    }
    if (carMarker) {
      deliveryMap.removeLayer(carMarker);
      carMarker = null;
    }
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }
}

/**
 * Update the price breakdown display with separate delivery and pickup costs
 */
function updatePriceBreakdown(deliveryCost, pickupCost, totalCost) {
  const deliveryCostEl = document.getElementById('delivery-cost-one-way');
  const pickupCostEl = document.getElementById('pickup-cost-one-way');
  const totalCostEl = document.getElementById('delivery-cost-total');
  
  if (deliveryCostEl) {
    if (deliveryCost === 0 && totalCost === 0) {
      deliveryCostEl.textContent = 'GRATIS';
      deliveryCostEl.style.color = 'var(--color-success)';
    } else {
      deliveryCostEl.textContent = formatPrice(deliveryCost);
      deliveryCostEl.style.color = '';
    }
  }
  
  if (pickupCostEl) {
    if (pickupCost === 0 && totalCost === 0) {
      pickupCostEl.textContent = 'GRATIS';
      pickupCostEl.style.color = 'var(--color-success)';
    } else {
      pickupCostEl.textContent = formatPrice(pickupCost);
      pickupCostEl.style.color = '';
    }
  }
  
  if (totalCostEl) {
    if (totalCost === 0) {
      totalCostEl.textContent = 'GRATIS';
      totalCostEl.style.color = 'var(--color-success)';
    } else {
      totalCostEl.textContent = formatPrice(totalCost);
      totalCostEl.style.color = '';
    }
  }
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
 * Check delivery zone and calculate real route distance
 * Uses Nominatim for geocoding and OSRM for routing (both free, no API key needed)
 */
async function checkDeliveryZone() {
  const street = document.getElementById('street')?.value.trim();
  const houseNumber = document.getElementById('house_number')?.value.trim();
  const postalCode = document.getElementById('postal_code')?.value.trim();
  const city = document.getElementById('city')?.value.trim();
  const zoneInfo = document.getElementById('delivery-zone-info');
  const deliveryPriceEl = document.getElementById('delivery-price');
  const mapContainer = document.getElementById('route-map-container');
  
  // Need at least postal code and city for calculation
  if (!postalCode || postalCode.length < 4 || !zoneInfo) return;
  
  // Check if postal code is in delivery zone (West/Oost-Vlaanderen)
  const prefix2 = postalCode.substring(0, 2);
  const isInDeliveryZone = ['80', '81', '82', '83', '84', '85', '86', '87', '88', '89', 
                            '90', '91', '92', '93', '94', '95', '96', '97', '98', '99'].includes(prefix2);
  
  if (!isInDeliveryZone) {
    zoneInfo.style.display = 'flex';
    zoneInfo.className = 'delivery-zone-info delivery-zone-info--unavailable';
    zoneInfo.querySelector('.delivery-zone-info__text').textContent = 
      '✗ Bezorging enkel mogelijk in West- en Oost-Vlaanderen. Kies voor afhalen of neem contact op.';
    checkoutData.deliveryCost = 0;
    if (deliveryPriceEl) {
      deliveryPriceEl.textContent = 'Niet beschikbaar';
      deliveryPriceEl.style.color = '';
    }
    updatePriceBreakdown(0, 0, 0);
    return;
  }
  
  // Show loading state
  zoneInfo.style.display = 'flex';
  zoneInfo.className = 'delivery-zone-info delivery-zone-info--loading';
  zoneInfo.querySelector('.delivery-zone-info__text').textContent = '⏳ Route berekenen...';
  
  try {
    // Build address string for geocoding
    const addressParts = [];
    if (street && houseNumber) addressParts.push(`${street} ${houseNumber}`);
    addressParts.push(postalCode);
    if (city) addressParts.push(city);
    addressParts.push('Belgium');
    const fullAddress = addressParts.join(', ');
    
    // Geocode the destination address using Nominatim (free)
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&countrycodes=be`;
    const geocodeResponse = await fetch(geocodeUrl, {
      headers: { 'User-Agent': 'TafelTotaal/1.0' }
    });
    const geocodeData = await geocodeResponse.json();
    
    if (!geocodeData || geocodeData.length === 0) {
      // Fallback to postal code database if geocoding fails
      await fallbackToPostalCodeDistance(postalCode, zoneInfo, deliveryPriceEl, mapContainer);
      return;
    }
    
    const destCoords = [parseFloat(geocodeData[0].lat), parseFloat(geocodeData[0].lon)];
    const destName = geocodeData[0].display_name.split(',')[0];
    
    // Calculate route using OSRM (free, no API key)
    // OSRM expects coordinates as lon,lat (not lat,lon)
    const routeUrl = `https://router.project-osrm.org/route/v1/driving/${ORIGIN_COORDS[1]},${ORIGIN_COORDS[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`;
    
    console.log('Route calculation:', {
      origin: `${ORIGIN_COORDS[1]},${ORIGIN_COORDS[0]}`,
      destination: `${destCoords[1]},${destCoords[0]}`,
      url: routeUrl
    });
    const routeResponse = await fetch(routeUrl);
    const routeData = await routeResponse.json();
    
    if (routeData.code !== 'Ok' || !routeData.routes || routeData.routes.length === 0) {
      await fallbackToPostalCodeDistance(postalCode, zoneInfo, deliveryPriceEl, mapContainer);
      return;
    }
    
    const route = routeData.routes[0];
    const distanceKm = Math.round(route.distance / 1000 * 10) / 10; // Convert to km with 1 decimal
    const durationMin = Math.round(route.duration / 60); // Convert to minutes
    const routeCoordinates = route.geometry.coordinates.map(c => [c[1], c[0]]); // Swap to [lat, lng]
    
    // Calculate delivery cost
    // FREE if ≤15km, FULL distance cost if >15km (not just excess)
    let deliveryCost = 0;
    let deliveryMessage = '';
    
    // Calculate one-way cost
    const oneWayCost = Math.round(distanceKm * PRICE_PER_KM * 100) / 100;
    
    if (distanceKm <= FREE_DELIVERY_RADIUS_KM) {
      deliveryCost = 0;
      deliveryMessage = `✓ GRATIS levering naar ${city || destName} (${distanceKm}km - binnen gratis zone)`;
      
      if (deliveryPriceEl) {
        deliveryPriceEl.textContent = 'GRATIS';
        deliveryPriceEl.style.color = 'var(--color-success)';
      }
      
      // Update price breakdown (both free)
      updatePriceBreakdown(0, 0, 0);
    } else {
      // Pay for FULL distance (round trip), not just the excess over 15km
      deliveryCost = Math.round(distanceKm * PRICE_PER_KM * 2 * 100) / 100;
      deliveryCost = Math.max(deliveryCost, 5);
      
      // Calculate individual leg costs
      const deliveryLegCost = Math.round(oneWayCost * 100) / 100;
      const pickupLegCost = Math.round(oneWayCost * 100) / 100;
      
      deliveryMessage = `✓ Bezorging naar ${city || destName} (${distanceKm}km) - ${formatPrice(deliveryCost)}`;
      
      if (deliveryPriceEl) {
        deliveryPriceEl.textContent = formatPrice(deliveryCost);
        deliveryPriceEl.style.color = '';
      }
      
      // Update price breakdown with separate costs
      updatePriceBreakdown(deliveryLegCost, pickupLegCost, deliveryCost);
    }
    
    // Update zone info
    zoneInfo.className = 'delivery-zone-info delivery-zone-info--available';
    const textEl = zoneInfo.querySelector('.delivery-zone-info__text');
    textEl.innerHTML = deliveryMessage;
    
    // Update route info
    document.getElementById('route-distance').textContent = formatPrice(deliveryCost);
    document.getElementById('route-duration').innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px; margin-right: 4px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>${durationMin} min`;
    document.getElementById('route-km').innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px; margin-right: 4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>${distanceKm} km`;
    
    // Hide placeholder and show map
    const mapPlaceholder = document.getElementById('map-placeholder');
    if (mapPlaceholder) mapPlaceholder.style.display = 'none';
    
    // Initialize map with route
    await initializeMap(routeCoordinates, destCoords, city || destName);
    
    // Store data
    checkoutData.deliveryCost = deliveryCost;
    checkoutData.deliveryDistance = distanceKm;
    checkoutData.deliveryDuration = durationMin;
    checkoutData.deliveryLocation = city || destName;
    
    console.log('Delivery cost calculated:', {
      distance: distanceKm,
      cost: deliveryCost,
      location: city || destName
    });
    
    // Force update of totals
    updateTotals();
    
  } catch (error) {
    console.error('Route calculation error:', error);
    await fallbackToPostalCodeDistance(postalCode, zoneInfo, deliveryPriceEl, mapContainer);
  }
}

/**
 * Fallback to postal code database when route calculation fails
 */
async function fallbackToPostalCodeDistance(postalCode, zoneInfo, deliveryPriceEl, mapContainer) {
  let location = POSTAL_CODE_DISTANCES[postalCode];
  
  if (!location) {
    const prefix3 = postalCode.substring(0, 3);
    const prefix2 = postalCode.substring(0, 2);
    
    for (const [code, data] of Object.entries(POSTAL_CODE_DISTANCES)) {
      if (code.startsWith(prefix3)) {
        location = { ...data, name: data.name + ' (regio)', estimated: true };
        break;
      }
    }
    
    if (!location) {
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
  
  const distance = location.distance;
  let deliveryCost = 0;
  let deliveryMessage = '';
  
  // Calculate one-way cost
  const oneWayCost = Math.round(distance * PRICE_PER_KM * 100) / 100;
  
  if (distance <= FREE_DELIVERY_RADIUS_KM) {
    deliveryCost = 0;
    deliveryMessage = `✓ GRATIS levering naar ${location.name} (~${distance}km - binnen gratis zone)`;
    if (deliveryPriceEl) {
      deliveryPriceEl.textContent = 'GRATIS';
      deliveryPriceEl.style.color = 'var(--color-success)';
    }
    updatePriceBreakdown(0, 0, 0);
  } else {
    // Pay for FULL distance (round trip), not just the excess over 15km
    deliveryCost = Math.round(distance * PRICE_PER_KM * 2 * 100) / 100;
    deliveryCost = Math.max(deliveryCost, 5);
    deliveryMessage = `✓ Bezorging naar ${location.name} (~${distance}km) - ${formatPrice(deliveryCost)} (geschat)`;
    if (deliveryPriceEl) {
      deliveryPriceEl.textContent = formatPrice(deliveryCost);
      deliveryPriceEl.style.color = '';
    }
    updatePriceBreakdown(oneWayCost, oneWayCost, deliveryCost);
  }
  
  zoneInfo.className = 'delivery-zone-info delivery-zone-info--available';
  zoneInfo.querySelector('.delivery-zone-info__text').textContent = deliveryMessage;
  
  checkoutData.deliveryCost = deliveryCost;
  checkoutData.deliveryDistance = distance;
  checkoutData.deliveryLocation = location.name;
  updateTotals();
}

/**
 * Initialize Leaflet map with route and animated car
 */
async function initializeMap(routeCoordinates, destCoords, destName) {
  const mapEl = document.getElementById('delivery-map');
  if (!mapEl) return;
  
  console.log('Initializing map with:', {
    origin: ORIGIN_COORDS,
    destination: destCoords,
    routePoints: routeCoordinates.length,
    firstPoint: routeCoordinates[0],
    lastPoint: routeCoordinates[routeCoordinates.length - 1]
  });
  
  // Initialize map if not exists
  if (!deliveryMap) {
    deliveryMap = L.map('delivery-map', {
      zoomControl: true,
      scrollWheelZoom: false
    });
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(deliveryMap);
  }
  
  // Clear previous layers
  if (routeLayer) {
    deliveryMap.removeLayer(routeLayer);
  }
  if (carMarker) {
    deliveryMap.removeLayer(carMarker);
  }
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
  
  // Draw route
  routeLayer = L.layerGroup().addTo(deliveryMap);
  
  // Route line
  const routeLine = L.polyline(routeCoordinates, {
    color: '#903D3E',
    weight: 4,
    opacity: 0.8
  }).addTo(routeLayer);
  
  // Origin marker (Tafel Totaal - Parkstraat 44, Beernem)
  const originIcon = L.divIcon({
    className: 'custom-marker origin-marker',
    html: `<div style="background: #903D3E; color: white; padding: 6px 10px; border-radius: 0; font-size: 12px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px; margin-right: 4px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
      Parkstraat 44, Beernem
    </div>`,
    iconSize: [160, 30],
    iconAnchor: [80, 30]
  });
  L.marker(ORIGIN_COORDS, { icon: originIcon }).addTo(routeLayer);
  
  // Destination marker
  const destIcon = L.divIcon({
    className: 'custom-marker dest-marker',
    html: `<div style="background: #1B5E20; color: white; padding: 6px 10px; border-radius: 0; font-size: 12px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px; margin-right: 4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
      ${destName}
    </div>`,
    iconSize: [150, 30],
    iconAnchor: [75, 30]
  });
  L.marker(destCoords, { icon: destIcon }).addTo(routeLayer);
  
  // Fit map to route
  deliveryMap.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
  
  // Create car marker
  const carIcon = L.divIcon({
    className: 'car-marker',
    html: `<div style="font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🚚</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
  carMarker = L.marker(ORIGIN_COORDS, { icon: carIcon, zIndexOffset: 1000 }).addTo(routeLayer);
  
  // Animate car along route
  animateCarAlongRoute(routeCoordinates);
}

/**
 * Animate car marker along the route with smooth interpolation
 */
function animateCarAlongRoute(routeCoordinates) {
  if (!carMarker || routeCoordinates.length < 2) return;
  
  const totalPoints = routeCoordinates.length;
  const animationDuration = 8000; // 8 seconds for full route (slower, smoother)
  let startTime = null;
  
  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / animationDuration, 1);
    
    // Calculate exact position along route with smooth interpolation
    const exactIndex = progress * (totalPoints - 1);
    const currentIndex = Math.floor(exactIndex);
    const nextIndex = Math.min(currentIndex + 1, totalPoints - 1);
    const segmentProgress = exactIndex - currentIndex;
    
    // Interpolate between current and next point for smooth movement
    const currentPoint = routeCoordinates[currentIndex];
    const nextPoint = routeCoordinates[nextIndex];
    
    const lat = currentPoint[0] + (nextPoint[0] - currentPoint[0]) * segmentProgress;
    const lng = currentPoint[1] + (nextPoint[1] - currentPoint[1]) * segmentProgress;
    
    carMarker.setLatLng([lat, lng]);
    
    // Calculate rotation based on direction to next point
    if (currentIndex < totalPoints - 1) {
      const angle = Math.atan2(nextPoint[1] - currentPoint[1], nextPoint[0] - currentPoint[0]) * 180 / Math.PI;
      const carEl = carMarker.getElement();
      if (carEl) {
        carEl.style.transform = `rotate(${angle + 90}deg)`;
      }
    }
    
    if (progress < 1) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      // Reset and loop animation after pause
      setTimeout(() => {
        startTime = null;
        carMarker.setLatLng(ORIGIN_COORDS);
        animationFrame = requestAnimationFrame(animate);
      }, 2000);
    }
  }
  
  animationFrame = requestAnimationFrame(animate);
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
 * Place order and confirm reservation (no payment required)
 */
async function placeOrder() {
  const btn = document.getElementById('place-order-btn');
  
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;"></div> Reservering verwerken...';

  try {
    // Prepare order data
    const orderData = {
      customer: checkoutData.customer,
      deliveryMethod: checkoutData.delivery.method,
      deliveryAddress: checkoutData.delivery.address || null,
      notes: checkoutData.delivery.notes,
      event_date: checkoutData.eventDate,
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
    
    // Add scheduling information based on delivery method
    if (checkoutData.delivery.method === 'DELIVERY') {
      orderData.delivery_time = checkoutData.delivery.deliveryTime;
      orderData.pickup_time = checkoutData.delivery.pickupTime;
    } else if (checkoutData.delivery.method === 'PICKUP') {
      orderData.self_pickup_time = checkoutData.delivery.selfPickupTime;
      orderData.return_time = checkoutData.delivery.returnTime;
    }

    // Debug: Log the order data being sent
    console.log('Sending order data:', JSON.stringify(orderData, null, 2));

    // Create order via API
    const response = await checkoutAPI.createOrder(orderData);

    /*! PAYMENT INTEGRATION DISABLED - Invoice-based payment after return
    if (response.data?.payment_url) {
      // Clear cart before redirect
      await clearCart();
      
      // Redirect to Mollie payment page
      window.location.href = response.data.payment_url;
    } else {
      throw new Error('Geen betaallink ontvangen');
    }
    !*/
    
    // Clear cart and redirect to confirmation page
    if (response.data?.order_id) {
      await clearCart();
      
      // Redirect to order confirmation page
      window.location.href = `/Tafel-Totaal/bestelling-bevestigd.html?order=${response.data.order_id}`;
    } else {
      throw new Error('Reservering kon niet worden aangemaakt');
    }
  } catch (error) {
    console.error('Order placement error:', error);
    showToast(error.message || 'Er ging iets mis bij het plaatsen van je reservering', 'error');
    
    btn.disabled = false;
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      Reservering Bevestigen
    `;
  }
}
