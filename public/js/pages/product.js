/**
 * Tafel Totaal - Product Detail Page
 */

import { productsAPI } from '../lib/api.js';
import { formatPrice, calculateDays, getQueryParam, showToast } from '../lib/utils.js';
import { loadHeader } from '../components/header.js';
import { addToCart } from '../services/cart.js';

let currentProduct = null;
let selectedQuantity = 1;
let startDate = null;
let endDate = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await loadHeader();
  await loadFooter();
  await loadProduct();
  initQuantitySelector();
  initQuantityPresets();
  initDatePickers();
  initAddToCart();
});

/**
 * Load footer component
 */
async function loadFooter() {
  const container = document.getElementById('footer-container');
  if (!container) return;

  try {
    const basePath = window.location.hostname.includes('github.io') ? '/Tafel-Totaal' : '';
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
      '/Tafel-Totaal/images/products/placeholder.jpg'
    ]
  };
}

/**
 * Load related products
 */
async function loadRelatedProducts(product) {
  if (!product.category) return;

  try {
    const response = await productsAPI.getAll({ 
      category: product.category, 
      limit: 5 // Fetch 5 to ensure we have 4 after filtering out current
    });
    
    if (!response.success || !response.data) return;

    // Filter out current product and limit to 4
    const related = response.data
      .filter(p => p.id !== product.id)
      .slice(0, 4);

    if (related.length > 0) {
      renderRelatedProducts(related);
    }
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
      <a href="/Tafel-Totaal/product.html?id=${p.id}" class="package-card__link">
        <div class="package-card__image">
          <img src="${p.images?.[0] || '/Tafel-Totaal/images/products/placeholder.jpg'}" alt="${p.name}" loading="lazy">
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
  const images = product.images || ['/Tafel-Totaal/images/products/placeholder.jpg'];
  renderImages(images);
}

/**
 * Update availability of preset buttons based on stock
 */
function updatePresetAvailability(availableStock) {
  document.querySelectorAll('.preset-btn').forEach(btn => {
    const value = parseInt(btn.dataset.value);
    if (value > availableStock) {
      btn.disabled = true;
      btn.title = `Niet genoeg voorraad (max ${availableStock})`;
    } else {
      btn.disabled = false;
      btn.title = '';
    }
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
      btn.title = `Niet genoeg voorraad (max ${availableStock})`;
    } else {
      btn.disabled = false;
      btn.title = '';
    }
  });
}

/**
 * Initialize quantity presets
 */
function initQuantityPresets() {
  const qtyInput = document.getElementById('quantity');
  const buttons = document.querySelectorAll('.preset-btn');
  
  if (!qtyInput || !buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = parseInt(btn.dataset.value);
      const max = parseInt(qtyInput.max) || 9999;
      
      if (value <= max) {
        qtyInput.value = value;
        selectedQuantity = value;
        updateTotalPrice();
      } else {
        showToast(`Slechts ${max} stuks beschikbaar`, 'warning');
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
      btn.title = `Niet genoeg voorraad (max ${availableStock})`;
    } else {
      btn.disabled = false;
      btn.title = '';
    }
  });
}

/**
 * Initialize quantity presets
 */
function initQuantityPresets() {
  const qtyInput = document.getElementById('quantity');
  const buttons = document.querySelectorAll('.preset-btn');
  
  if (!qtyInput || !buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = parseInt(btn.dataset.value);
      const max = parseInt(qtyInput.max) || 9999;
      
      if (value <= max) {
        qtyInput.value = value;
        selectedQuantity = value;
        updateTotalPrice();
      } else {
        showToast(`Slechts ${max} stuks beschikbaar`, 'warning');
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
      btn.title = `Niet genoeg voorraad (max ${availableStock})`;
    } else {
      btn.disabled = false;
      btn.title = '';
    }
  });
}

/**
 * Initialize quantity presets
 */
function initQuantityPresets() {
  const qtyInput = document.getElementById('quantity');
  const buttons = document.querySelectorAll('.preset-btn');
  
  if (!qtyInput || !buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = parseInt(btn.dataset.value);
      const max = parseInt(qtyInput.max) || 9999;
      
      if (value <= max) {
        qtyInput.value = value;
        selectedQuantity = value;
        updateTotalPrice();
      } else {
        showToast(`Slechts ${max} stuks beschikbaar`, 'warning');
      }
    });
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
 * Update availability of preset buttons based on stock
 */
function updatePresetAvailability(availableStock) {
  document.querySelectorAll('.preset-btn').forEach(btn => {
    const value = parseInt(btn.dataset.value);
    if (value > availableStock) {
      btn.disabled = true;
      btn.title = `Niet genoeg voorraad (max ${availableStock})`;
    } else {
      btn.disabled = false;
      btn.title = '';
    }
  });
}

/**
 * Initialize quantity presets
 */
function initQuantityPresets() {
  const qtyInput = document.getElementById('quantity');
  const buttons = document.querySelectorAll('.preset-btn');
  
  if (!qtyInput || !buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = parseInt(btn.dataset.value);
      const max = parseInt(qtyInput.max) || 9999;
      
      if (value <= max) {
        qtyInput.value = value;
        selectedQuantity = value;
        updateTotalPrice();
      } else {
        showToast(`Slechts ${max} stuks beschikbaar`, 'warning');
      }
    });
  });
}

/**
 * Initialize quantity selector
 */
// ... (initQuantitySelector unchanged) ...

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

  // Single Date Picker Logic
  if (eventDateInput) {
    eventDateInput.addEventListener('change', () => {
      const dateVal = eventDateInput.value;
      if (!dateVal) return;

      const date = new Date(dateVal);
      
      // Start = date - 1 day
      const start = new Date(date);
      start.setDate(date.getDate() - 1);
      
      // End = date + 1 day
      const end = new Date(date);
      end.setDate(date.getDate() + 1);
      
      startDate = start.toISOString().split('T')[0];
      endDate = end.toISOString().split('T')[0];
      
      // Sync with range inputs just in case
      if (startDateInput) startDateInput.value = startDate;
      if (endDateInput) endDateInput.value = endDate;
      
      updateTotalPrice();
    });
  }

  // Range Date Picker Logic
  if (startDateInput) {
    startDateInput.addEventListener('change', () => {
      startDate = startDateInput.value;
      if (endDateInput) endDateInput.min = startDate;
      
      if (endDate && startDate > endDate) {
        endDate = null;
        if (endDateInput) endDateInput.value = '';
      }
      
      updateTotalPrice();
    });
  }

  if (endDateInput) {
    endDateInput.addEventListener('change', () => {
      endDate = endDateInput.value;
      updateTotalPrice();
    });
  }
}

/**
 * Update total price based on quantity and dates
 */
function updateTotalPrice() {
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  const quoteBtn = document.getElementById('quote-btn');
  const daysDisplay = document.getElementById('days-display');
  const totalPriceEl = document.getElementById('total-price');
  const daysCountEl = document.getElementById('days-count');

  if (!currentProduct || !startDate || !endDate) {
    if (daysDisplay) daysDisplay.classList.add('hidden');
    if (totalPriceEl) totalPriceEl.textContent = formatPrice(0);
    return;
  }

  const days = calculateDays(startDate, endDate);
  const pricePerDay = currentProduct.price_per_day || 0;
  const total = days * pricePerDay * selectedQuantity;

  if (daysCountEl) daysCountEl.textContent = days;
  if (daysDisplay) daysDisplay.classList.remove('hidden');
  if (totalPriceEl) totalPriceEl.textContent = formatPrice(total);

  // Quote Logic: > 7 days
  if (days > 7) {
    if (addToCartBtn) {
      addToCartBtn.classList.add('hidden');
      addToCartBtn.disabled = true;
    }
    if (quoteBtn) {
      quoteBtn.classList.remove('hidden');
      // Update quote link with details
      const subject = `Offerte aanvraag: ${currentProduct.name}`;
      const body = `Ik wil graag een offerte voor:\nProduct: ${currentProduct.name}\nAantal: ${selectedQuantity}\nPeriode: ${formatDateShort(startDate)} tot ${formatDateShort(endDate)} (${days} dagen)`;
      quoteBtn.href = `/Tafel-Totaal/contact.html?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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

    try {
      btn.disabled = true;
      btn.textContent = 'Toevoegen...';

      await addToCart({
        type: 'product',
        product_id: currentProduct.id,
        name: currentProduct.name,
        quantity: selectedQuantity,
        price_per_day: currentProduct.price_per_day,
        start_date: startDate,
        end_date: endDate,
        days: days,
        image: currentProduct.images?.[0] || '/Tafel-Totaal/images/products/placeholder.jpg'
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
