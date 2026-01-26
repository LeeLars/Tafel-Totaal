/**
 * Tafel Totaal - Product Detail Page
 */

import { productsAPI } from '../lib/api.js';
import { formatPrice, calculateDays, getQueryParam, showToast, formatDateShort } from '../lib/utils.js';
import { loadHeader } from '../components/header.js';
import { addToCart, getLockedEventDate, isDateLocked } from '../services/cart.js';

let currentProduct = null;
let selectedQuantity = 1;
let startDate = null;
let endDate = null;
let eventType = 'single'; // 'single' or 'multi'
let billingDays = 1; // Actual usage days for pricing (1 for single-day events)

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await loadHeader();
  await loadFooter();
  await loadProduct();
  initEventTypeToggle();
  initQuantitySelector();
  initQuantityPresets();
  initDatePickers();
  initAddToCart();
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
    const basePath = '';
    const response = await fetch(`${basePath}/components/footer.html`);
    if (!response.ok) throw new Error('Failed to load footer');
    
    const html = await response.text();
    container.innerHTML = html;
  } catch (error) {
    console.error('Error loading footer:', error);
  }
}

/**
 * Load product data
 */
async function loadProduct() {
  const productId = getQueryParam('id');
  
  if (!productId) {
    showError();
    return;
  }

  try {
    const response = await productsAPI.getById(productId);
    
    if (!response.success || !response.data) {
      // Fallback to mock data if API fails (e.g., on GitHub Pages)
      console.warn('API failed, using mock product data');
      currentProduct = createMockProduct(productId);
      renderProduct(currentProduct);
      
      document.getElementById('product-loading').classList.add('hidden');
      document.getElementById('product-content').classList.remove('hidden');

      // Try to load related products as well (may still work if list endpoint is reachable)
      loadRelatedProducts(currentProduct);
      return;
    }

    currentProduct = response.data;
    renderProduct(currentProduct);
    
    // Hide loading, show content
    document.getElementById('product-loading').classList.add('hidden');
    document.getElementById('product-content').classList.remove('hidden');
    
    // Load related products
    loadRelatedProducts(currentProduct);
  } catch (error) {
    console.error('Error loading product:', error);
    // Fallback to mock data instead of showing error
    console.warn('API error, using mock product data');
    currentProduct = createMockProduct(productId);
    renderProduct(currentProduct);
    
    document.getElementById('product-loading').classList.add('hidden');
    document.getElementById('product-content').classList.remove('hidden');

    // Try to load related products as well
    loadRelatedProducts(currentProduct);
  }
}

/**
 * Create mock product for demo/fallback purposes
 */
function createMockProduct(productId) {
  return {
    id: productId,
    name: 'Champagneflute Kristal',
    description: 'Elegante kristallen champagneflute voor een stijlvolle presentatie. Perfect voor bruiloften, galas en zakelijke evenementen.',
    price_per_day: 1.50,
    damage_compensation_per_item: 5.00,
    sku: 'CHAMP-KRIS-001',
    category: 'glaswerk',
    category_name: 'Glaswerk',
    stock_total: 250,
    stock_buffer: 50,
    images: [
      'https://res.cloudinary.com/dchrgzyb4/image/upload/v1767985412/tafel-totaal/products/f5vufoadhi58ff1ta52c.webp',
      '/images/products/placeholder.jpg'
    ]
  };
}

 function normalizeText(text) {
   return String(text || '')
     .toLowerCase()
     .normalize('NFD')
     .replace(/[\u0300-\u036f]/g, '');
 }

 function getFinishTags(product) {
   const text = `${product.name || ''} ${product.description || ''} ${product.category_name || ''} ${product.category || ''}`;
   const t = normalizeText(text);

   const tags = new Set();
   if (t.includes('goud') || t.includes('gold') || t.includes('gouden')) tags.add('gold');
   if (t.includes('zilver') || t.includes('silver')) tags.add('silver');
   if (t.includes('zwart') || t.includes('black') || t.includes('mat zwart')) tags.add('black');
   if (t.includes('wit') || t.includes('white')) tags.add('white');
   if (t.includes('koper') || t.includes('copper')) tags.add('copper');
   if (t.includes('rosegoud') || t.includes('rose gold') || t.includes('rosé')) tags.add('rose');
   if (t.includes('hout') || t.includes('wood')) tags.add('wood');

   return tags;
 }

 function getUtensilType(product) {
   const t = normalizeText(product.name);
   if (t.includes('mes')) return 'knife';
   if (t.includes('vork')) return 'fork';
   if (t.includes('lepel')) return 'spoon';
   if (t.includes('bord')) return 'plate';
   if (t.includes('glas') || t.includes('flute') || t.includes('beker')) return 'glass';
   return null;
 }

 function getBrandKey(product) {
   const sku = normalizeText(product.sku);
   if (sku && sku.includes('-')) {
     return sku.split('-')[0];
   }
   const name = normalizeText(product.name);
   const firstWord = name.split(/\s+/).find(Boolean);
   return firstWord || '';
 }

 function scoreRelatedProduct(current, candidate) {
   if (!candidate || candidate.id === current.id) return -Infinity;

   let score = 0;

   // Prefer same brand/line
   const brandA = getBrandKey(current);
   const brandB = getBrandKey(candidate);
   if (brandA && brandB && brandA === brandB) score += 6;

   // Prefer same finish/tone
   const finishA = getFinishTags(current);
   const finishB = getFinishTags(candidate);
   let sharedFinish = 0;
   finishA.forEach(tag => {
     if (finishB.has(tag)) sharedFinish++;
   });
   score += sharedFinish * 4;

   // Prefer same category as a baseline
   if (current.category && candidate.category && current.category === candidate.category) score += 2;
   if (current.category_name && candidate.category_name && current.category_name === candidate.category_name) score += 2;

   // Complementary pairing rules: knife -> fork/spoon/plate, fork -> knife/spoon/plate, spoon -> knife/fork/plate
   const typeA = getUtensilType(current);
   const typeB = getUtensilType(candidate);
   if (typeA && typeB) {
     const pairBoost = {
       knife: new Set(['fork', 'spoon', 'plate']),
       fork: new Set(['knife', 'spoon', 'plate']),
       spoon: new Set(['knife', 'fork', 'plate']),
       plate: new Set(['knife', 'fork', 'spoon']),
       glass: new Set(['glass'])
     };
     if (pairBoost[typeA]?.has(typeB)) score += 3;
   }

   // Keyword overlap (lightweight)
   const tokensA = new Set(normalizeText(`${current.name} ${current.description}`).split(/[^a-z0-9]+/).filter(w => w.length >= 4));
   const tokensB = new Set(normalizeText(`${candidate.name} ${candidate.description}`).split(/[^a-z0-9]+/).filter(w => w.length >= 4));
   let overlap = 0;
   tokensA.forEach(w => {
     if (tokensB.has(w)) overlap++;
   });
   score += Math.min(overlap, 6);

   return score;
 }

/**
 * Load related products
 */
async function loadRelatedProducts(product) {
  try {
    // Try to fetch a broader set so we can match across related categories (e.g. mes -> vork/bord)
    const response = await productsAPI.getAll({ limit: 60 });
    if (!response.success || !Array.isArray(response.data)) return;

    const candidates = response.data.filter(p => p && p.id !== product.id);
    const ranked = candidates
      .map(p => ({ product: p, score: scoreRelatedProduct(product, p) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(x => x.product);

    if (ranked.length > 0) renderRelatedProducts(ranked);
  } catch (error) {
    console.error('Error loading related products:', error);
  }
}

/**
 * Render related products
 */
function renderRelatedProducts(products) {
  const container = document.getElementById('related-products-grid');
  const section = document.getElementById('related-products');
  
  if (!container || !section) return;

  container.innerHTML = products.map(p => `
    <article class="package-card">
      <a href="/product.html?id=${p.id}" class="package-card__link">
        <div class="package-card__image">
          <img src="${p.images?.[0] || '/images/products/placeholder.jpg'}" alt="${p.name}" loading="lazy">
          <span class="package-card__badge">${p.category_name || p.category || 'Overig'}</span>
        </div>
        <div class="package-card__content">
          <h3 class="package-card__title">${p.name}</h3>
          <p class="package-card__description">${p.description || ''}</p>
          <div class="package-card__footer">
            <div class="package-card__price">
              ${formatPrice(p.price_per_day)}
              <span>/ dag</span>
            </div>
            <span class="btn btn--primary btn--sm">Bekijk</span>
          </div>
        </div>
      </a>
    </article>
  `).join('');

  section.classList.remove('hidden');
}

/**
 * Render product details
 */
function renderProduct(product) {
  // Update page title
  document.title = `${product.name} | Tafel Totaal`;
  
  // Breadcrumb
  document.getElementById('breadcrumb-product').textContent = product.name;
  
  // Product info
  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-description').textContent = product.description || 'Geen beschrijving beschikbaar.';
  document.getElementById('product-price').textContent = formatPrice(product.price_per_day);
  document.getElementById('product-sku').textContent = product.sku || '-';
  document.getElementById('product-category-badge').textContent = product.category_name || product.category || 'Overig';
  document.getElementById('product-deposit').textContent = formatPrice(product.damage_compensation_per_item || 0);
  
  // Stock
  const availableStock = product.stock_total - product.stock_buffer;
  const stockEl = document.getElementById('product-stock');
  if (availableStock > 0) {
    stockEl.textContent = `${availableStock} stuks`;
    stockEl.style.color = 'var(--color-success)';
  } else {
    stockEl.textContent = 'Niet beschikbaar';
    stockEl.style.color = 'var(--color-error)';
    document.getElementById('add-to-cart-btn').disabled = true;
  }
  
  // Update quantity max
  document.getElementById('quantity').max = availableStock;
  
  // Update Presets Availability
  updatePresetAvailability(availableStock);

  // Images
  const images = product.images || ['/images/products/placeholder.jpg'];
  renderImages(images);
}

/**
 * Initialize event type toggle (single day vs multi-day)
 */
function initEventTypeToggle() {
  const typeButtons = document.querySelectorAll('.type-btn');
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
        // Reset dates
        startDate = null;
        endDate = null;
        document.getElementById('event-date').value = '';
      } else {
        if (singleDateContainer) singleDateContainer.classList.add('hidden');
        if (rangeDateContainer) rangeDateContainer.classList.remove('hidden');
        // Reset dates
        startDate = null;
        endDate = null;
        document.getElementById('start-date').value = '';
        document.getElementById('end-date').value = '';
      }
      
      updateTotalPrice();
    });
  });
}

/**
 * Initialize quantity selector (+/- buttons)
 */
function initQuantitySelector() {
  const qtyInput = document.getElementById('quantity');
  const minusBtn = document.getElementById('qty-minus');
  const plusBtn = document.getElementById('qty-plus');
  
  if (!qtyInput || !minusBtn || !plusBtn) return;

  minusBtn.addEventListener('click', () => {
    const current = parseInt(qtyInput.value) || 1;
    const min = parseInt(qtyInput.min) || 1;
    if (current > min) {
      qtyInput.value = current - 1;
      selectedQuantity = current - 1;
      updateTotalPrice();
    }
  });

  plusBtn.addEventListener('click', () => {
    const current = parseInt(qtyInput.value) || 1;
    const max = parseInt(qtyInput.max) || 9999;
    if (current < max) {
      qtyInput.value = current + 1;
      selectedQuantity = current + 1;
      updateTotalPrice();
    }
  });

  qtyInput.addEventListener('change', () => {
    let value = parseInt(qtyInput.value) || 1;
    const min = parseInt(qtyInput.min) || 1;
    const max = parseInt(qtyInput.max) || 9999;
    
    if (value < min) value = min;
    if (value > max) value = max;
    
    qtyInput.value = value;
    selectedQuantity = value;
    updateTotalPrice();
  });
}

/**
 * Initialize quantity presets (25, 75, 125 buttons)
 * Clicking multiple times adds to current quantity (additive/cumulative)
 */
function initQuantityPresets() {
  const qtyInput = document.getElementById('quantity');
  const buttons = document.querySelectorAll('.preset-btn');
  
  if (!qtyInput || !buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      
      const presetValue = parseInt(btn.dataset.value);
      const currentValue = parseInt(qtyInput.value) || 1;
      const newValue = currentValue + presetValue;
      const max = parseInt(qtyInput.max) || 9999;
      
      if (newValue <= max) {
        qtyInput.value = newValue;
        selectedQuantity = newValue;
        updateTotalPrice();
        
        // Visual feedback - flash the button
        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), 200);
        
        showToast(`+${presetValue} stuks toegevoegd (totaal: ${newValue})`, 'success');
      } else {
        showToast(`Maximaal ${max} stuks beschikbaar`, 'warning');
      }
    });
  });
}

/**
 * Update availability of preset buttons based on stock
 */
function updatePresetAvailability(availableStock) {
  document.querySelectorAll('.preset-btn').forEach(btn => {
    const value = parseInt(btn.dataset.value);
    if (value > availableStock) {
      btn.disabled = true;
      btn.classList.add('disabled');
      btn.title = `Niet genoeg voorraad (max ${availableStock})`;
    } else {
      btn.disabled = false;
      btn.classList.remove('disabled');
      btn.title = '';
    }
  });
}

/**
 * Render product images
 */
function renderImages(images) {
  const mainImage = document.getElementById('main-image');
  const thumbsContainer = document.getElementById('image-thumbs');
  
  // Set main image
  mainImage.src = images[0];
  mainImage.alt = currentProduct.name;
  
  // Render thumbnails if multiple images
  if (images.length > 1) {
    thumbsContainer.innerHTML = images.map((img, index) => `
      <button class="package-gallery__thumb ${index === 0 ? 'active' : ''}" data-index="${index}">
        <img src="${img}" alt="${currentProduct.name} ${index + 1}">
      </button>
    `).join('');
    
    // Add click handlers
    thumbsContainer.querySelectorAll('.package-gallery__thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const index = parseInt(thumb.dataset.index);
        mainImage.src = images[index];
        
        // Update active state
        thumbsContainer.querySelectorAll('.package-gallery__thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  }
}

/**
 * Initialize date pickers
 */
function initDatePickers() {
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  const eventDateInput = document.getElementById('event-date');
  
  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  if (startDateInput) startDateInput.min = today;
  if (endDateInput) endDateInput.min = today;
  if (eventDateInput) eventDateInput.min = today;

  // Single Date Picker Logic - for single day events, calculate rental period automatically
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
      
      updateTotalPrice();
    });
  }

  // Range Date Picker Logic (for multi-day events)
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
      
      updateTotalPrice();
    });
  }

  if (endDateInput) {
    endDateInput.addEventListener('change', () => {
      endDate = endDateInput.value;
      
      // For multi-day events, billing days = actual rental days
      if (startDate && endDate) {
        billingDays = calculateDays(startDate, endDate);
      }
      
      updateTotalPrice();
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
 * Update total price based on quantity and dates
 */
function updateTotalPrice() {
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  const quoteBtn = document.getElementById('quote-btn');
  const rentalHint = document.getElementById('rental-days-hint');
  const totalPriceEl = document.getElementById('total-price');

  if (!currentProduct || !startDate || !endDate) {
    if (rentalHint) rentalHint.textContent = 'Selecteer je datums';
    if (totalPriceEl) totalPriceEl.textContent = formatPrice(0);
    return;
  }

  // Use billingDays for pricing (1 for single-day events, actual days for multi-day)
  const pricePerDay = currentProduct.price_per_day || 0;
  const total = billingDays * pricePerDay * selectedQuantity;

  // Update rental hint with billing days info
  if (rentalHint) {
    if (eventType === 'single') {
      rentalHint.textContent = '1 dag huur (eendaags evenement)';
    } else {
      rentalHint.textContent = `${billingDays} ${billingDays === 1 ? 'dag' : 'dagen'} huur`;
    }
    rentalHint.style.color = 'var(--color-primary)';
    rentalHint.style.fontWeight = '600';
  }
  if (totalPriceEl) totalPriceEl.textContent = formatPrice(total);

  // Quote Logic: > 7 days
  if (billingDays > 7) {
    if (addToCartBtn) {
      addToCartBtn.classList.add('hidden');
      addToCartBtn.disabled = true;
    }
    if (quoteBtn) {
      quoteBtn.classList.remove('hidden');
      // Update quote link with details
      const subject = `Offerte aanvraag: ${currentProduct.name}`;
      const body = `Ik wil graag een offerte voor:\nProduct: ${currentProduct.name}\nAantal: ${selectedQuantity}\nPeriode: ${formatDateShort(startDate)} tot ${formatDateShort(endDate)} (${billingDays} dagen)`;
      quoteBtn.href = `/contact.html?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  } else {
    if (addToCartBtn) {
      addToCartBtn.classList.remove('hidden');
      addToCartBtn.disabled = false;
    }
    if (quoteBtn) quoteBtn.classList.add('hidden');
  }
}

// ... (initAddToCart, showError unchanged) ...

/**
 * Initialize add to cart button
 */
function initAddToCart() {
  const btn = document.getElementById('add-to-cart-btn');
  
  btn.addEventListener('click', async () => {
    if (!currentProduct) return;
    
    if (!startDate || !endDate) {
      showToast('Selecteer eerst een start- en einddatum', 'error');
      return;
    }

    const days = calculateDays(startDate, endDate);
    if (days < 1) {
      showToast('Einddatum moet na startdatum liggen', 'error');
      return;
    }

    // Validate stock
    const availableStock = (currentProduct.stock_total || 0) - (currentProduct.stock_buffer || 0);
    if (selectedQuantity > availableStock) {
      showToast(`Slechts ${availableStock} stuks beschikbaar`, 'error');
      return;
    }

    try {
      btn.disabled = true;
      btn.textContent = 'Toevoegen...';

      const pricePerDay = currentProduct.price_per_day || 0;
      const unitPrice = pricePerDay * billingDays;
      const lineTotal = unitPrice * selectedQuantity;
      const damageCompensation = (currentProduct.damage_compensation_per_item || 0) * selectedQuantity;

      // Get the actual event date (for single-day events, this is the date user selected)
      const eventDateInput = document.getElementById('event-date');
      const actualEventDate = eventType === 'single' && eventDateInput ? eventDateInput.value : startDate;
      
      await addToCart({
        type: 'product',
        product_id: currentProduct.id,
        name: currentProduct.name,
        quantity: selectedQuantity,
        price_per_day: pricePerDay,
        unit_price: unitPrice,
        line_total: lineTotal,
        damage_compensation: damageCompensation,
        damage_compensation_per_item: currentProduct.damage_compensation_per_item || 0,
        start_date: startDate,
        end_date: endDate,
        event_date: actualEventDate,  // The actual event date (not logistical)
        event_type: eventType,        // 'single' or 'multi'
        billing_days: billingDays,    // Actual days charged (1 for single-day)
        days: days,
        image: currentProduct.images?.[0] || '/images/products/placeholder.jpg'
      });

      showToast('Product toegevoegd aan winkelwagen', 'success');
      
      // Reset button
      btn.disabled = false;
      btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        Toevoegen aan winkelwagen
      `;
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Kon product niet toevoegen aan winkelwagen', 'error');
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
}

/**
 * Show error state
 */
function showError() {
  document.getElementById('product-loading').classList.add('hidden');
  document.getElementById('product-error').classList.remove('hidden');
}

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
    // Import clearCart dynamically
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
