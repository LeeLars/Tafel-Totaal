/**
 * Tafel Totaal - Package Detail Page JavaScript
 * Handles package configuration, availability check, and add to cart
 */

import { packagesAPI, availabilityAPI, checkoutAPI } from '../lib/api.js';
import { formatPrice, calculateDays, getQueryParam, showToast, formatDateShort } from '../lib/utils.js';
import { loadHeader } from '../components/header.js';
import { addToCart } from '../services/cart.js';

let currentPackage = null;
let selectedAddons = [];
let startDate = null;
let endDate = null;
let eventType = 'single'; // 'single' or 'multi'

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await loadHeader();
  await loadFooter();
  await loadPackage();
  initEventTypeToggle();
  initDatePickers();
  initPersonsSelector();
  initInfoTooltips();
});

/**
 * Initialize info tooltips (click to toggle on mobile)
 */
function initInfoTooltips() {
  document.querySelectorAll('.info-tooltip__btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const tooltip = btn.closest('.info-tooltip');
      
      // Close other tooltips
      document.querySelectorAll('.info-tooltip.active').forEach(t => {
        if (t !== tooltip) t.classList.remove('active');
      });
      
      // Toggle this tooltip
      tooltip.classList.toggle('active');
    });
  });

  // Close tooltips when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.info-tooltip')) {
      document.querySelectorAll('.info-tooltip.active').forEach(t => {
        t.classList.remove('active');
      });
    }
  });
}

/**
 * Load footer component
 */
async function loadFooter() {
  const container = document.getElementById('footer-container');
  if (!container) return;

  try {
    const response = await fetch('/Tafel-Totaal/components/footer.html');
    if (!response.ok) throw new Error('Failed to load footer');
    container.innerHTML = await response.text();
  } catch (error) {
    console.error('Error loading footer:', error);
  }
}

/**
 * Load package details from API
 */
async function loadPackage() {
  const packageId = getQueryParam('id');
  
  if (!packageId) {
    showError();
    return;
  }

  try {
    const response = await packagesAPI.getById(packageId);
    currentPackage = response.data;
    
    if (!currentPackage) {
      showError();
      return;
    }

    renderPackage();
    showContent();
  } catch (error) {
    console.error('Error loading package:', error);
    showError();
  }
}

/**
 * Show loading state
 */
function showLoading() {
  document.getElementById('package-loading')?.classList.remove('hidden');
  document.getElementById('package-error')?.classList.add('hidden');
  document.getElementById('package-content')?.classList.add('hidden');
}

/**
 * Show error state
 */
function showError() {
  document.getElementById('package-loading')?.classList.add('hidden');
  document.getElementById('package-error')?.classList.remove('hidden');
  document.getElementById('package-content')?.classList.add('hidden');
}

/**
 * Show content
 */
function showContent() {
  document.getElementById('package-loading')?.classList.add('hidden');
  document.getElementById('package-error')?.classList.add('hidden');
  document.getElementById('package-content')?.classList.remove('hidden');
}

/**
 * Render package details
 */
function renderPackage() {
  if (!currentPackage) return;

  // Update page title
  document.title = `${currentPackage.name} | Tafel Totaal`;

  // Breadcrumb
  const breadcrumbName = document.getElementById('breadcrumb-name');
  if (breadcrumbName) breadcrumbName.textContent = currentPackage.name;

  // Badge
  const badge = document.getElementById('package-badge');
  if (badge) {
    const badgeText = getServiceLevelBadge(currentPackage.service_level);
    if (badgeText) {
      badge.textContent = badgeText;
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  }

  // Title & Description
  document.getElementById('package-title').textContent = currentPackage.name;
  document.getElementById('package-description').textContent = currentPackage.description || '';

  // Gallery
  renderGallery();

  // Persons selector
  renderPersonsOptions();

  // Add-ons
  renderAddons();

  // Package contents
  renderContents();

  // Initial price calculation
  updatePriceSummary();
}

/**
 * Render image gallery
 */
function renderGallery() {
  const mainImg = document.getElementById('gallery-main');
  const thumbsContainer = document.getElementById('gallery-thumbs');
  
  const images = currentPackage.images || ['/Tafel-Totaal/images/packages/placeholder.jpg'];
  
  if (mainImg) {
    mainImg.src = images[0];
    mainImg.alt = currentPackage.name;
  }

  if (thumbsContainer && images.length > 1) {
    thumbsContainer.innerHTML = images.map((img, index) => `
      <button class="package-gallery__thumb ${index === 0 ? 'active' : ''}" data-index="${index}">
        <img src="${img}" alt="${currentPackage.name} - Afbeelding ${index + 1}">
      </button>
    `).join('');

    // Thumbnail click handlers
    thumbsContainer.querySelectorAll('.package-gallery__thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const index = parseInt(thumb.dataset.index);
        mainImg.src = images[index];
        thumbsContainer.querySelectorAll('.package-gallery__thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  }
}

/**
 * Render persons dropdown options
 */
function renderPersonsOptions() {
  const select = document.getElementById('persons-select');
  if (!select) return;

  const min = currentPackage.min_persons || 1;
  const max = currentPackage.max_persons || 100;

  let options = '';
  for (let i = min; i <= max; i++) {
    options += `<option value="${i}">${i} ${i === 1 ? 'persoon' : 'personen'}</option>`;
  }

  select.innerHTML = options;
  select.addEventListener('change', () => {
    updatePriceSummary();
    checkAvailability();
  });
}

/**
 * Render add-ons
 */
function renderAddons() {
  const section = document.getElementById('addons-section');
  const list = document.getElementById('addons-list');
  
  if (!section || !list) return;

  const addons = currentPackage.addons || [];
  
  if (addons.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = '';
  list.innerHTML = addons.map(addon => `
    <div class="addon-item" data-addon-id="${addon.id}" data-addon-price="${addon.extra_price}">
      <div class="addon-item__info">
        <div class="addon-item__checkbox"></div>
        <span class="addon-item__name">${addon.name}</span>
      </div>
      <span class="addon-item__price">+${formatPrice(addon.extra_price)}</span>
    </div>
  `).join('');

  // Add-on click handlers
  list.querySelectorAll('.addon-item').forEach(item => {
    item.addEventListener('click', () => {
      const addonId = item.dataset.addonId;
      item.classList.toggle('selected');
      
      if (item.classList.contains('selected')) {
        selectedAddons.push(addonId);
      } else {
        selectedAddons = selectedAddons.filter(id => id !== addonId);
      }
      
      updatePriceSummary();
    });
  });
}

/**
 * Render package contents
 */
function renderContents() {
  const container = document.getElementById('package-contents');
  if (!container) return;

  const items = currentPackage.items || [];
  
  if (items.length === 0) {
    container.innerHTML = '<p class="text-center text-gray">Geen inhoud beschikbaar</p>';
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="package-content__item">
      <span class="package-content__name">${item.name}</span>
      <span class="package-content__quantity">${item.quantity}</span>
    </div>
  `).join('');
}

/**
 * Initialize event type selector
 */
function initEventTypeSelector() {
  const buttons = document.querySelectorAll('.type-btn');
  const singleContainer = document.getElementById('single-date-container');
  const rangeContainer = document.getElementById('range-date-container');
  
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update UI
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const type = btn.dataset.type;
      
      if (type === 'single') {
        singleContainer.classList.remove('hidden');
        rangeContainer.classList.add('hidden');
      } else {
        singleContainer.classList.add('hidden');
        rangeContainer.classList.remove('hidden');
      }
      
      updatePriceSummary();
      checkAvailability();
    });
  });
}

/**
 * Initialize date pickers
 */
function initDatePickers() {
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  const eventDateInput = document.getElementById('event-date');
  
  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  
  if (startDateInput) startDateInput.min = minDate;
  if (endDateInput) endDateInput.min = minDate;
  if (eventDateInput) eventDateInput.min = minDate;

  // Single Date Logic - for single day events, calculate rental period automatically
  if (eventDateInput) {
    eventDateInput.addEventListener('change', () => {
      const dateVal = eventDateInput.value;
      if (!dateVal) return;

      const eventDate = new Date(dateVal);
      
      // Start = 2 days before event (max pickup window)
      const start = new Date(eventDate);
      start.setDate(eventDate.getDate() - 2);
      
      // End = 2 days after event (48h return window)
      const end = new Date(eventDate);
      end.setDate(eventDate.getDate() + 2);
      
      startDate = start.toISOString().split('T')[0];
      endDate = end.toISOString().split('T')[0];
      
      updateRentalDaysHint();
      updatePriceSummary();
      checkAvailability();
    });
  }

  // Event listeners for range inputs (multi-day events)
  if (startDateInput) {
    startDateInput.addEventListener('change', () => {
      startDate = startDateInput.value;
      if (endDateInput) endDateInput.min = startDate;
      
      if (endDate && startDate > endDate) {
        endDate = null;
        if (endDateInput) endDateInput.value = '';
      }
      
      updateRentalDaysHint();
      updatePriceSummary();
      checkAvailability();
    });
  }

  if (endDateInput) {
    endDateInput.addEventListener('change', () => {
      endDate = endDateInput.value;
      
      updateRentalDaysHint();
      updatePriceSummary();
      checkAvailability();
    });
  }
}

/**
 * Initialize event type toggle (single/multi day)
 */
function initEventTypeToggle() {
  const typeButtons = document.querySelectorAll('.type-btn[data-type]');
  const singleDateContainer = document.getElementById('single-date-container');
  const rangeDateContainer = document.getElementById('range-date-container');
  
  if (!typeButtons.length) return;

  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      eventType = type;
      
      // Update active state
      typeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Toggle date containers
      if (type === 'single') {
        if (singleDateContainer) singleDateContainer.classList.remove('hidden');
        if (rangeDateContainer) rangeDateContainer.classList.add('hidden');
        // Reset
        startDate = null;
        endDate = null;
        const eventDateEl = document.getElementById('event-date');
        if (eventDateEl) eventDateEl.value = '';
      } else {
        if (singleDateContainer) singleDateContainer.classList.add('hidden');
        if (rangeDateContainer) rangeDateContainer.classList.remove('hidden');
        // Reset
        startDate = null;
        endDate = null;
        const startEl = document.getElementById('start-date');
        const endEl = document.getElementById('end-date');
        if (startEl) startEl.value = '';
        if (endEl) endEl.value = '';
      }
      
      updateRentalDaysHint();
      updatePriceSummary();
    });
  });
}

/**
 * Get next Friday date
 */
function getNextFriday() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + daysUntilFriday);
  return nextFriday;
}

/**
 * Update rental days hint text
 */
function updateRentalDaysHint() {
  const hint = document.getElementById('rental-days-hint');
  const startDate = document.getElementById('start-date')?.value;
  const endDate = document.getElementById('end-date')?.value;
  
  if (!hint || !startDate || !endDate) return;

  const days = calculateDays(startDate, endDate);
  const forfaitDays = currentPackage?.forfait_days || 3;
  
  if (days <= forfaitDays) {
    hint.textContent = `${days} ${days === 1 ? 'dag' : 'dagen'} (binnen forfait van ${forfaitDays} dagen)`;
  } else {
    const extraDays = days - forfaitDays;
    hint.textContent = `${days} dagen (${extraDays} extra ${extraDays === 1 ? 'dag' : 'dagen'} boven forfait)`;
  }
}

/**
 * Initialize persons selector
 */
function initPersonsSelector() {
  // Already handled in renderPersonsOptions
}

/**
 * Check availability for selected configuration
 */
async function checkAvailability() {
  const statusEl = document.getElementById('availability-status');
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  
  if (!statusEl || !currentPackage) return;

  const startDate = document.getElementById('start-date')?.value;
  const endDate = document.getElementById('end-date')?.value;
  const persons = parseInt(document.getElementById('persons-select')?.value) || 1;

  if (!startDate || !endDate) {
    statusEl.style.display = 'none';
    addToCartBtn.disabled = true;
    return;
  }

  // Show checking state
  statusEl.style.display = 'flex';
  statusEl.className = 'availability-status availability-status--checking';
  statusEl.querySelector('.availability-status__text').textContent = 'Beschikbaarheid controleren...';

  try {
    const response = await availabilityAPI.check(
      'package',
      currentPackage.id,
      1,
      startDate,
      endDate,
      persons
    );

    const isAvailable = response.data?.available !== false;

    if (isAvailable) {
      statusEl.className = 'availability-status availability-status--available';
      statusEl.querySelector('.availability-status__text').textContent = 'Beschikbaar voor deze periode';
      addToCartBtn.disabled = false;
    } else {
      statusEl.className = 'availability-status availability-status--unavailable';
      statusEl.querySelector('.availability-status__text').textContent = 'Niet beschikbaar voor deze periode';
      addToCartBtn.disabled = true;
    }
  } catch (error) {
    console.error('Availability check error:', error);
    // On error, assume available (will be checked again at checkout)
    statusEl.className = 'availability-status availability-status--available';
    statusEl.querySelector('.availability-status__text').textContent = 'Beschikbaarheid niet gecontroleerd';
    addToCartBtn.disabled = false;
  }
}

/**
 * Update price summary
 */
function updatePriceSummary() {
  if (!currentPackage) return;

  const persons = parseInt(document.getElementById('persons-select')?.value) || 1;
  const startDate = document.getElementById('start-date')?.value;
  const endDate = document.getElementById('end-date')?.value;
  
  const days = startDate && endDate ? calculateDays(startDate, endDate) : 0;
  const forfaitDays = currentPackage.forfait_days || 3;
  const extraDays = Math.max(0, days - forfaitDays);

  // Base price (per person)
  const basePrice = currentPackage.base_price * persons;
  
  // Extra days price
  const extraDayPrice = currentPackage.extra_day_price || 0;
  const extraDaysPrice = extraDayPrice * extraDays * persons;

  // Add-ons price
  let addonsPrice = 0;
  selectedAddons.forEach(addonId => {
    const addon = currentPackage.addons?.find(a => a.id === addonId);
    if (addon) {
      addonsPrice += addon.extra_price * persons;
    }
  });

  // Damage Compensation (NOT paid upfront - only shown for reference)
  const compensationPercentage = 0.3; // 30%
  const subtotal = basePrice + extraDaysPrice + addonsPrice;
  const compensation = Math.round(subtotal * compensationPercentage * 100) / 100;

  // Total (compensation is NOT included as it's not paid upfront)
  const total = subtotal;

  // Update UI
  document.getElementById('summary-persons').textContent = persons;
  document.getElementById('summary-base-price').textContent = formatPrice(basePrice);

  const extraDaysRow = document.getElementById('summary-extra-days-row');
  if (extraDays > 0) {
    extraDaysRow.style.display = 'flex';
    document.getElementById('summary-extra-days').textContent = extraDays;
    document.getElementById('summary-extra-days-price').textContent = formatPrice(extraDaysPrice);
  } else {
    extraDaysRow.style.display = 'none';
  }

  const addonsRow = document.getElementById('summary-addons-row');
  if (addonsPrice > 0) {
    addonsRow.style.display = 'flex';
    document.getElementById('summary-addons-price').textContent = formatPrice(addonsPrice);
  } else {
    addonsRow.style.display = 'none';
  }

  document.getElementById('summary-deposit').textContent = formatPrice(compensation);
  document.getElementById('summary-total').textContent = formatPrice(total);
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

/**
 * Handle add to cart
 */
document.getElementById('add-to-cart-btn')?.addEventListener('click', async () => {
  if (!currentPackage) return;

  const btn = document.getElementById('add-to-cart-btn');
  const startDate = document.getElementById('start-date')?.value;
  const endDate = document.getElementById('end-date')?.value;
  const persons = parseInt(document.getElementById('persons-select')?.value) || 1;

  if (!startDate || !endDate) {
    showToast('Selecteer eerst een verhuurperiode', 'error');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;"></div> Toevoegen...';

  try {
    const result = await addToCart({
      type: 'package',
      id: currentPackage.id,
      quantity: 1,
      persons: persons,
      startDate: startDate,
      endDate: endDate,
      addons: selectedAddons
    });

    if (result.success) {
      showToast('Pakket toegevoegd aan winkelwagen!', 'success');
      
      // Optional: redirect to cart
      // window.location.href = '/winkelwagen.html';
    } else {
      showToast(result.error || 'Kon niet toevoegen aan winkelwagen', 'error');
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    showToast('Er ging iets mis. Probeer het opnieuw.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      Toevoegen aan winkelwagen
    `;
  }
});
