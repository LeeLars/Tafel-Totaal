/**
 * Tafel Totaal - Package Detail Page JavaScript
 * Handles package configuration, availability check, and add to cart
 */

import { packagesAPI, availabilityAPI, checkoutAPI } from '../lib/api.js';
import { formatPrice, calculateDays, getQueryParam, showToast, formatDateShort } from '../lib/utils.js';
import { loadHeader } from '../components/header.js';
import { addToCart, getLockedEventDate, isDateLocked } from '../services/cart.js';

let currentPackage = null;
let selectedAddons = [];
let startDate = null;
let endDate = null;
let eventType = 'single'; // 'single' or 'multi'
let billingDays = 1; // Actual usage days for pricing (1 for single-day events)

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
    const response = await fetch('/components/footer.html');
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
  
  // Support both old (images array) and new (image_url string) structure
  let images = [];
  if (currentPackage.image_url) {
    images = [currentPackage.image_url];
  } else if (currentPackage.images && currentPackage.images.length > 0) {
    images = currentPackage.images;
  } else {
    images = ['/images/packages/placeholder.jpg'];
  }
  
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
    renderContents(); // Update package contents with new quantities
    updatePriceSummary();
    checkAvailability();
  });
}

/**
 * Render add-ons (optional products)
 */
function renderAddons() {
  const section = document.getElementById('addons-section');
  const list = document.getElementById('addons-list');
  
  if (!section || !list) return;

  // Get optional items from package
  const items = currentPackage.items || [];
  const optionalItems = items.filter(item => item.is_optional);
  
  if (optionalItems.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = '';
  
  list.innerHTML = optionalItems.map(item => `
    <div class="addon-item" data-item-id="${item.id}" data-product-id="${item.product_id}">
      <div class="addon-item__info">
        <div class="addon-item__checkbox"></div>
        <span class="addon-item__name">${item.product?.name || item.name || 'Product'}</span>
      </div>
      <span class="addon-item__quantity">×${item.quantity || 1}</span>
    </div>
  `).join('');

  // Add-on click handlers
  list.querySelectorAll('.addon-item').forEach(item => {
    item.addEventListener('click', () => {
      const itemId = item.dataset.itemId;
      const isSelected = item.classList.contains('selected');
      
      if (!isSelected) {
        item.classList.add('selected');
        selectedAddons.push(itemId);
      } else {
        item.classList.remove('selected');
        selectedAddons = selectedAddons.filter(id => id !== itemId);
      }
      
      updatePriceSummary();
    });
  });
}

/**
 * Get quantity multiplier for an item based on its type
 * Some items scale per person (plates, cutlery), others don't (candles, decorations)
 */
function getQuantityMultiplier(item, persons) {
  const productName = (item.product?.name || item.name || '').toLowerCase();
  const baseQuantity = item.quantity || 1;
  
  // Items that DON'T scale with person count (shared items)
  const sharedItems = [
    'kaars', 'candle', 'kandelaar', 'candlestick',
    'vaas', 'vase', 'decoratie', 'decoration',
    'tafelkleed', 'tablecloth', 'tafelloper', 'runner',
    'serveerplank', 'serving board', 'schaal', 'bowl',
    'kan', 'pitcher', 'karaf', 'carafe'
  ];
  
  // Check if item is a shared item
  const isShared = sharedItems.some(keyword => productName.includes(keyword));
  
  if (isShared) {
    // Shared items: use base quantity (e.g., 1 candle for 4 people)
    return baseQuantity;
  } else {
    // Per-person items: multiply by person count (e.g., 1 plate × 4 people = 4 plates)
    return baseQuantity * persons;
  }
}

/**
 * Render package contents (required products)
 * Quantities update dynamically based on selected person count
 */
function renderContents() {
  const container = document.getElementById('package-contents');
  if (!container) return;

  const items = currentPackage.items || [];
  const requiredItems = items.filter(item => !item.is_optional);
  const persons = parseInt(document.getElementById('persons-select')?.value) || 1;
  
  if (requiredItems.length === 0) {
    container.innerHTML = '<p class="text-center text-gray">Geen inhoud beschikbaar</p>';
    return;
  }

  container.innerHTML = requiredItems.map(item => {
    // Get image from product
    const productImages = item.product?.images || [];
    // Handle both array of strings and string (legacy)
    let imageUrl = '/images/products/placeholder.jpg';
    
    if (Array.isArray(productImages) && productImages.length > 0) {
      imageUrl = productImages[0];
    } else if (typeof productImages === 'string' && productImages) {
      imageUrl = productImages;
    }

    // Calculate dynamic quantity based on person count
    const displayQuantity = getQuantityMultiplier(item, persons);

    return `
    <div class="package-content__item">
      <div class="package-content__image">
        <img src="${imageUrl}" alt="${item.product?.name || item.name}" loading="lazy">
      </div>
      <div class="package-content__info">
        <span class="package-content__name">${item.product?.name || item.name || 'Product'}</span>
        <span class="package-content__quantity" data-base-qty="${item.quantity || 1}">×${displayQuantity}</span>
      </div>
    </div>
  `}).join('');
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
  
  // Set min date to today (not tomorrow like before)
  const today = new Date().toISOString().split('T')[0];
  
  if (startDateInput) startDateInput.min = today;
  if (endDateInput) endDateInput.min = today;
  if (eventDateInput) eventDateInput.min = today;

  // Single Date Logic - for single day events, calculate rental period automatically
  // NOTE: Event listener must be added BEFORE we dispatch the change event for saved dates
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
      
      // For single-day events, billing is for 1 day only
      billingDays = 1;
      
      // Save event date for other products
      saveEventDate(dateVal);
      
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
      
      // For multi-day events, billing days = actual rental days
      if (startDate && endDate) {
        billingDays = calculateDays(startDate, endDate);
      }
      
      updateRentalDaysHint();
      updatePriceSummary();
      checkAvailability();
    });
  }

  if (endDateInput) {
    endDateInput.addEventListener('change', () => {
      endDate = endDateInput.value;
      
      // For multi-day events, billing days = actual rental days
      if (startDate && endDate) {
        billingDays = calculateDays(startDate, endDate);
      }
      
      updateRentalDaysHint();
      updatePriceSummary();
      checkAvailability();
    });
  }

  // Check if date should be locked (cart has items)
  const dateLocked = isDateLocked();
  const lockedDate = getLockedEventDate();
  
  if (dateLocked && lockedDate) {
    // Lock the date - disable inputs and set to locked date
    if (eventDateInput) {
      eventDateInput.value = lockedDate;
      eventDateInput.disabled = true;
      eventDateInput.style.cursor = 'not-allowed';
      eventDateInput.title = 'Datum is vergrendeld. Leeg eerst je winkelwagen om de datum te wijzigen.';
      // Trigger change to calculate prices
      eventDateInput.dispatchEvent(new Event('change'));
    }
    if (startDateInput) {
      startDateInput.disabled = true;
      startDateInput.style.cursor = 'not-allowed';
      startDateInput.title = 'Datum is vergrendeld. Leeg eerst je winkelwagen om de datum te wijzigen.';
    }
    if (endDateInput) {
      endDateInput.disabled = true;
      endDateInput.style.cursor = 'not-allowed';
      endDateInput.title = 'Datum is vergrendeld. Leeg eerst je winkelwagen om de datum te wijzigen.';
    }
    
    // Disable event type toggle
    document.querySelectorAll('.type-btn').forEach(btn => {
      btn.disabled = true;
      btn.style.cursor = 'not-allowed';
      btn.style.opacity = '0.5';
    });
    
    // Show info message with unlock link
    const dateContainer = eventDateInput?.closest('.form-group') || startDateInput?.closest('.form-group');
    if (dateContainer && !dateContainer.querySelector('.date-locked-info')) {
      const infoDiv = document.createElement('div');
      infoDiv.className = 'date-locked-info';
      infoDiv.style.cssText = 'margin-top: 8px; padding: 8px 12px; background: #fff3cd; border: 1px solid #ffc107; font-size: 14px; color: #856404;';
      infoDiv.innerHTML = 'Alle producten moeten dezelfde verhuurperiode hebben. <a href="#" class="unlock-date-link" style="color: #856404; font-weight: 600; text-decoration: underline;">Hier</a> kan je de datum aanpassen.';
      dateContainer.appendChild(infoDiv);
      
      // Add click handler for unlock link
      infoDiv.querySelector('.unlock-date-link').addEventListener('click', (e) => {
        e.preventDefault();
        unlockDateSelection();
      });
    }
  } else {
    // Auto-populate from saved event date if exists
    // This MUST be after event listeners are set up so the change event works
    const savedEventDate = getSavedEventDate();
    if (savedEventDate && savedEventDate >= today) {
      if (eventDateInput && eventType === 'single') {
        eventDateInput.value = savedEventDate;
        // Trigger the change event to calculate rental period and price
        eventDateInput.dispatchEvent(new Event('change'));
      }
    }
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
  
  if (!hint || !startDate || !endDate) return;

  const forfaitDays = currentPackage?.forfait_days || 3;
  
  // Use billingDays for display (1 for single-day events)
  if (eventType === 'single') {
    hint.textContent = '1 dag huur (eendaags evenement, binnen forfait)';
  } else if (billingDays <= forfaitDays) {
    hint.textContent = `${billingDays} ${billingDays === 1 ? 'dag' : 'dagen'} (binnen forfait van ${forfaitDays} dagen)`;
  } else {
    const extraDays = billingDays - forfaitDays;
    hint.textContent = `${billingDays} dagen (${extraDays} extra ${extraDays === 1 ? 'dag' : 'dagen'} boven forfait)`;
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

  const persons = parseInt(document.getElementById('persons-select')?.value) || 1;

  // Use global startDate/endDate variables (set by date pickers for both single and multi-day)
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
  
  // Use billingDays for pricing (1 for single-day events, actual days for multi-day)
  const forfaitDays = currentPackage.forfait_days || 3;
  const extraDays = Math.max(0, billingDays - forfaitDays);

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
  const persons = parseInt(document.getElementById('persons-select')?.value) || 1;

  // Use global startDate/endDate variables (set by date pickers for both single and multi-day)
  // NOT the DOM input values, because for single-day events those inputs are hidden/empty
  if (!startDate || !endDate) {
    showToast('Selecteer eerst een verhuurperiode', 'error');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;"></div> Toevoegen...';

  try {
    // Get the actual event date (for single-day events, this is the date user selected)
    const eventDateInput = document.getElementById('event-date');
    const actualEventDate = eventType === 'single' && eventDateInput ? eventDateInput.value : startDate;
    
    const result = await addToCart({
      type: 'package',
      package_id: currentPackage.id,
      name: currentPackage.name,
      quantity: 1,
      persons: persons,
      start_date: startDate,
      end_date: endDate,
      event_date: actualEventDate,  // The actual event date (not logistical)
      event_type: eventType,        // 'single' or 'multi'
      billing_days: billingDays,    // Actual days charged
      addons: selectedAddons,
      unit_price: calculatePackagePrice(),
      line_total: calculatePackagePrice(),
      image: currentPackage.images?.[0] || '/images/packages/placeholder.jpg'
    });

    if (result.success) {
      showToast('Pakket toegevoegd aan winkelwagen!', 'success');
      
      // Optional: redirect to cart
      // window.location.href = '/winkelwagen';
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

/**
 * Unlock date selection - clears cart and enables date inputs
 * Uses a custom modal instead of browser confirm
 */
function unlockDateSelection() {
  // Create modal if it doesn't exist
  if (!document.getElementById('unlock-modal')) {
    const modalHtml = `
      <div id="unlock-modal-backdrop" class="modal-backdrop"></div>
      <div id="unlock-modal" class="modal">
        <div class="modal__header">
          <h3 class="modal__title" style="font-family: var(--font-display); text-transform: uppercase;">Datum Wijzigen?</h3>
          <button class="modal__close" onclick="closeUnlockModal()">&times;</button>
        </div>
        <div class="modal__body">
          <p style="margin-bottom: var(--space-md);">Let op: als je de datum nu aanpast, wordt je winkelwagen geleegd omdat de beschikbaarheid per datum verschilt.</p>
          <div style="background-color: var(--color-concrete); padding: var(--space-md); border-left: 2px solid var(--color-primary);">
            <p style="font-weight: 500; margin-bottom: var(--space-xs);">Goed om te weten:</p>
            <p style="font-size: var(--font-size-sm); color: var(--color-dark-gray);">Je kunt de datum ook later in de <strong>checkout</strong> aanpassen. In dat geval wordt je winkelwagen <u>niet</u> geleegd.</p>
          </div>
          <p style="margin-top: var(--space-md);">Wil je toch doorgaan en je winkelwagen legen?</p>
        </div>
        <div class="modal__footer">
          <button class="btn btn--secondary" onclick="closeUnlockModal()">Annuleren</button>
          <button class="btn btn--primary" id="confirm-unlock-btn">
            Winkelwagen Legen
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  // Show modal
  const backdrop = document.getElementById('unlock-modal-backdrop');
  const modal = document.getElementById('unlock-modal');
  const confirmBtn = document.getElementById('confirm-unlock-btn');

  // Force reflow for animation
  modal.offsetHeight;

  backdrop.classList.add('active');
  modal.classList.add('active');

  // Handle confirm action
  const handleConfirm = () => {
    // Import clearCart dynamically to avoid circular dependency
    import('../services/cart.js').then(({ clearCart }) => {
      clearCart().then(() => {
        // Re-enable date inputs
        const eventDateInput = document.getElementById('event-date');
        const startDateInput = document.getElementById('start-date');
        const endDateInput = document.getElementById('end-date');
        
        if (eventDateInput) {
          eventDateInput.disabled = false;
          eventDateInput.style.cursor = '';
          eventDateInput.title = '';
        }
        if (startDateInput) {
          startDateInput.disabled = false;
          startDateInput.style.cursor = '';
          startDateInput.title = '';
        }
        if (endDateInput) {
          endDateInput.disabled = false;
          endDateInput.style.cursor = '';
          endDateInput.title = '';
        }
        
        // Re-enable event type toggle
        document.querySelectorAll('.type-btn').forEach(btn => {
          btn.disabled = false;
          btn.style.cursor = '';
          btn.style.opacity = '';
        });
        
        // Remove the info message
        const infoDiv = document.querySelector('.date-locked-info');
        if (infoDiv) infoDiv.remove();
        
        showToast('Winkelwagen geleegd. Je kan nu een nieuwe datum kiezen.', 'success');
        closeUnlockModal();
      });
    });
  };

  // Attach one-time event listener
  confirmBtn.onclick = handleConfirm;
}

// Global function to close modal (needed for inline onclick attributes)
window.closeUnlockModal = function() {
  const backdrop = document.getElementById('unlock-modal-backdrop');
  const modal = document.getElementById('unlock-modal');
  
  if (backdrop) backdrop.classList.remove('active');
  if (modal) modal.classList.remove('active');
  
  // Optional: remove from DOM after animation
  // setTimeout(() => modal.remove(), 300);
};

/**
 * Save event date to localStorage for auto-population on other product pages
 */
function saveEventDate(dateStr) {
  try {
    localStorage.setItem('tafel_totaal_event_date', dateStr);
  } catch (e) {
    console.warn('Could not save event date to localStorage:', e);
  }
}

/**
 * Get saved event date from localStorage
 */
function getSavedEventDate() {
  try {
    return localStorage.getItem('tafel_totaal_event_date');
  } catch (e) {
    console.warn('Could not read event date from localStorage:', e);
    return null;
  }
}
