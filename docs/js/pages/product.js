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
      showError();
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
    showError();
  }
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
    <a href="/Tafel-Totaal/product.html?id=${p.id}" class="product-card">
      <div class="product-card__image">
        <img src="${p.images?.[0] || '/Tafel-Totaal/images/products/placeholder.jpg'}" alt="${p.name}" loading="lazy">
      </div>
      <div class="product-card__content">
        <h3 class="product-card__title">${p.name}</h3>
        <p class="product-card__price">${formatPrice(p.price_per_day)}</p>
      </div>
    </a>
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
  document.getElementById('product-category').textContent = product.category_name || '-';
  document.getElementById('product-deposit').textContent = formatPrice(product.deposit_per_item || 0);
  
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
  
  // Images
  const images = product.images || ['/Tafel-Totaal/images/products/placeholder.jpg'];
  renderImages(images);
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
 * Initialize quantity selector
 */
function initQuantitySelector() {
  const qtyInput = document.getElementById('quantity');
  const minusBtn = document.getElementById('qty-minus');
  const plusBtn = document.getElementById('qty-plus');

  minusBtn.addEventListener('click', () => {
    const current = parseInt(qtyInput.value);
    if (current > 1) {
      qtyInput.value = current - 1;
      selectedQuantity = current - 1;
      updateTotalPrice();
    }
  });

  plusBtn.addEventListener('click', () => {
    const current = parseInt(qtyInput.value);
    const max = parseInt(qtyInput.max);
    if (current < max) {
      qtyInput.value = current + 1;
      selectedQuantity = current + 1;
      updateTotalPrice();
    }
  });

  qtyInput.addEventListener('change', () => {
    selectedQuantity = parseInt(qtyInput.value);
    updateTotalPrice();
  });
}

/**
 * Initialize date pickers
 */
function initDatePickers() {
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  
  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  startDateInput.min = today;
  endDateInput.min = today;

  startDateInput.addEventListener('change', () => {
    startDate = startDateInput.value;
    endDateInput.min = startDate;
    
    if (endDate && startDate > endDate) {
      endDate = null;
      endDateInput.value = '';
    }
    
    updateTotalPrice();
  });

  endDateInput.addEventListener('change', () => {
    endDate = endDateInput.value;
    updateTotalPrice();
  });
}

/**
 * Update total price based on quantity and dates
 */
function updateTotalPrice() {
  if (!currentProduct || !startDate || !endDate) {
    document.getElementById('days-display').classList.add('hidden');
    document.getElementById('total-price').textContent = formatPrice(0);
    return;
  }

  const days = calculateDays(startDate, endDate);
  const pricePerDay = currentProduct.price_per_day || 0;
  const total = days * pricePerDay * selectedQuantity;

  document.getElementById('days-count').textContent = days;
  document.getElementById('days-display').classList.remove('hidden');
  document.getElementById('total-price').textContent = formatPrice(total);
}

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
