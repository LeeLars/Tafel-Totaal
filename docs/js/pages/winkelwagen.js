/**
 * Tafel Totaal - Shopping Cart Page JavaScript
 * Handles cart display, quantity updates, and removal
 */

import { formatPrice, formatDateShort, showToast } from '../lib/utils.js';
import { loadHeader } from '../components/header.js';
import { getCart, updateCartItem, removeFromCart, clearCart, subscribeToCart } from '../services/cart.js';
import { availabilityAPI } from '../lib/api.js';

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await loadHeader();
  await loadFooter();
  renderCart();
  initClearCartButton();
  
  // Subscribe to cart changes
  subscribeToCart(() => renderCart());
});

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
 * Render cart contents
 */
function renderCart() {
  const cart = getCart();
  
  const loadingEl = document.getElementById('cart-loading');
  const emptyEl = document.getElementById('cart-empty');
  const contentEl = document.getElementById('cart-content');
  
  // Hide loading
  loadingEl?.classList.add('hidden');

  if (!cart || cart.length === 0) {
    emptyEl?.classList.remove('hidden');
    contentEl?.classList.add('hidden');
    return;
  }

  emptyEl?.classList.add('hidden');
  contentEl?.classList.remove('hidden');

  // Update items count
  const itemsCount = document.getElementById('items-count');
  if (itemsCount) {
    itemsCount.textContent = cart.length;
  }

  // Render items
  const itemsList = document.getElementById('cart-items-list');
  if (itemsList) {
    itemsList.innerHTML = cart.map(item => createCartItemHTML(item)).join('');
    
    // Attach event listeners
    itemsList.querySelectorAll('.cart-item__remove').forEach(btn => {
      btn.addEventListener('click', handleRemoveItem);
    });
    
    itemsList.querySelectorAll('.quantity-control__btn').forEach(btn => {
      btn.addEventListener('click', handleQuantityChange);
    });
    
    itemsList.querySelectorAll('.quantity-control__value').forEach(input => {
      input.addEventListener('change', handleManualQuantityChange);
      input.addEventListener('blur', handleManualQuantityChange);
      input.addEventListener('input', handleQuantityInput);
    });
  }

  // Update summary
  updateSummary(cart);
}

/**
 * Create cart item HTML
 */
function createCartItemHTML(item) {
  const imageUrl = getItemImageUrl(item);
  const itemType = item.type === 'package' ? 'Pakket' : 'Product';
  const personsText = item.persons ? `${item.persons} personen` : '';
  
  return `
    <article class="cart-item" data-item-id="${item.id}">
      <div class="cart-item__image">
        <img src="${imageUrl}" alt="${item.name}" loading="lazy">
      </div>
      <div class="cart-item__info">
        <h3 class="cart-item__title">
          <a href="/${item.type === 'package' ? 'pakket' : 'product'}.html?id=${item.product_id || item.package_id}">${item.name}</a>
        </h3>
        <p class="cart-item__meta">${itemType}${personsText ? ` • ${personsText}` : ''}</p>
        ${item.start_date && item.end_date ? `
          <p class="cart-item__dates">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            ${formatDateShort(item.start_date)} - ${formatDateShort(item.end_date)}
          </p>
        ` : ''}
      </div>
      <div class="cart-item__actions">
        <div class="cart-item__price">${formatPrice(getItemTotal(item))}</div>
        ${item.type === 'product' ? `
          <div class="quantity-control">
            <button class="quantity-control__btn" data-action="decrease" data-item-id="${item.id}" ${item.quantity <= 1 ? 'disabled' : ''}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <input type="number" class="quantity-control__value" value="${item.quantity}" min="1" data-item-id="${item.id}">
            <button class="quantity-control__btn" data-action="increase" data-item-id="${item.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        ` : ''}
        <button class="cart-item__remove" data-item-id="${item.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          Verwijderen
        </button>
      </div>
    </article>
  `;
}

/**
 * Calculate item total from available data
 */
function getItemTotal(item) {
  if (item.line_total && !isNaN(item.line_total)) {
    return item.line_total;
  } else if (item.unit_price && !isNaN(item.unit_price)) {
    return item.unit_price * (item.quantity || 1);
  } else if (item.price_per_day && item.days) {
    return item.price_per_day * item.days * (item.quantity || 1);
  }
  return 0;
}

function getItemImageUrl(item) {
  // If item has a valid specific image, use it
  if (item.image && !item.image.includes('placeholder')) {
    return item.image;
  }

  // Use deterministic fallback from site images
  const fallbacks = [
    '/images/site/hero-table-setting.jpg',
    '/images/site/gala-theme.jpg',
    '/images/site/corporate-dinner.jpg',
    '/images/site/garden-dinner.jpg',
    '/images/site/hero-homepage.jpg'
  ];

  const key = String(item.id || item.product_id || item.package_id || item.name);
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return fallbacks[hash % fallbacks.length];
}

/**
 * Update cart summary
 */
function updateSummary(cart) {
  let subtotal = 0;
  let compensation = 0;
  const compensationItems = [];

  cart.forEach(item => {
    // Calculate line total from available data
    let itemTotal = 0;
    if (item.line_total && !isNaN(item.line_total)) {
      itemTotal = item.line_total;
    } else if (item.unit_price && !isNaN(item.unit_price)) {
      itemTotal = item.unit_price * (item.quantity || 1);
    } else if (item.price_per_day && item.days) {
      itemTotal = item.price_per_day * item.days * (item.quantity || 1);
    }
    
    subtotal += itemTotal;
    
    const itemCompensation = item.damage_compensation || 0;
    if (itemCompensation > 0) {
      const perItemAmount = item.damage_compensation_per_item || (itemCompensation / (item.quantity || 1));
      compensationItems.push({
        name: item.name,
        amount: itemCompensation,
        perItemAmount: perItemAmount,
        quantity: item.quantity || 1
      });
      compensation += itemCompensation;
    }
  });

  // Estimate compensation if not provided (30% of subtotal)
  // NOTE: This is NOT paid upfront, only shown for reference
  if (compensation === 0 && subtotal > 0) {
    compensation = Math.round(subtotal * 0.3 * 100) / 100;
  }

  // Total does NOT include compensation as it's not paid upfront
  const total = subtotal;

  document.getElementById('summary-subtotal').textContent = formatPrice(subtotal);
  
  // Build compensation breakdown - show per product
  const depositTotalEl = document.getElementById('summary-deposit-total');
  const depositBreakdownEl = document.getElementById('deposit-breakdown');
  
  if (depositTotalEl) {
    depositTotalEl.textContent = formatPrice(compensation);
  }
  
  if (depositBreakdownEl) {
    if (compensationItems.length > 0) {
      depositBreakdownEl.innerHTML = compensationItems
        .map(item => `
          <div class="cart-summary__deposit-item">
            <span class="deposit-item__name">${item.name}</span>
            <span class="deposit-item__amount">${item.quantity}x ${formatPrice(item.perItemAmount)}</span>
          </div>
        `)
        .join('');
    } else {
      depositBreakdownEl.innerHTML = '';
    }
  }
  
  document.getElementById('summary-total').textContent = formatPrice(total);
}

/**
 * Handle quantity change from buttons
 */
async function handleQuantityChange(e) {
  const btn = e.currentTarget;
  const itemId = btn.dataset.itemId;
  const action = btn.dataset.action;
  
  const cart = getCart();
  const item = cart.find(i => i.id === itemId);
  
  if (!item) return;

  let newQuantity = item.quantity;
  if (action === 'increase') {
    newQuantity++;
  } else if (action === 'decrease' && item.quantity > 1) {
    newQuantity--;
  }

  if (newQuantity !== item.quantity) {
    // For products, check availability before increasing
    if (action === 'increase' && item.type === 'product') {
      try {
        const availabilityCheck = await availabilityAPI.check(
          'product',
          item.product_id,
          newQuantity,
          item.start_date,
          item.end_date
        );
        
        if (availabilityCheck.success && !availabilityCheck.data.available) {
          const maxAvailable = availabilityCheck.data.availableQuantity || 0;
          showToast(`Maximaal ${maxAvailable} stuks beschikbaar voor deze datum`, 'error');
          return;
        }
      } catch (error) {
        console.error('Availability check failed:', error);
      }
    }
    
    btn.disabled = true;
    const result = await updateCartItem(itemId, newQuantity);
    btn.disabled = false;
    
    if (!result.success) {
      showToast(result.error || 'Kon hoeveelheid niet aanpassen', 'error');
    }
  }
}

/**
 * Handle quantity input validation (real-time)
 */
async function handleQuantityInput(e) {
  const input = e.currentTarget;
  const itemId = input.dataset.itemId;
  const newQuantity = parseInt(input.value, 10);
  
  if (isNaN(newQuantity) || newQuantity < 1) {
    return;
  }
  
  const cart = getCart();
  const item = cart.find(i => i.id === itemId);
  
  if (!item || item.type !== 'product') return;
  
  // Check availability for the new quantity
  try {
    const availabilityCheck = await availabilityAPI.check(
      'product',
      item.product_id,
      newQuantity,
      item.start_date,
      item.end_date
    );
    
    if (availabilityCheck.success && !availabilityCheck.data.available) {
      const maxAvailable = availabilityCheck.data.availableQuantity || 0;
      input.max = maxAvailable;
      
      if (newQuantity > maxAvailable) {
        input.value = maxAvailable;
        showToast(`Maximaal ${maxAvailable} stuks beschikbaar voor deze datum`, 'error');
      }
    }
  } catch (error) {
    console.error('Availability check failed:', error);
  }
}

/**
 * Handle manual quantity input change
 */
async function handleManualQuantityChange(e) {
  const input = e.currentTarget;
  const itemId = input.dataset.itemId;
  const newQuantity = parseInt(input.value, 10);
  
  if (isNaN(newQuantity) || newQuantity < 1) {
    input.value = 1;
    return;
  }
  
  const cart = getCart();
  const item = cart.find(i => i.id === itemId);
  
  if (!item || newQuantity === item.quantity) return;
  
  // For products, check availability before updating
  if (item.type === 'product') {
    try {
      const availabilityCheck = await availabilityAPI.check(
        'product',
        item.product_id,
        newQuantity,
        item.start_date,
        item.end_date
      );
      
      if (availabilityCheck.success && !availabilityCheck.data.available) {
        const maxAvailable = availabilityCheck.data.availableQuantity || 0;
        showToast(`Maximaal ${maxAvailable} stuks beschikbaar voor deze datum`, 'error');
        input.value = Math.min(newQuantity, maxAvailable);
        
        if (maxAvailable === item.quantity) {
          return;
        }
        
        // Update to max available if different from current
        if (maxAvailable !== item.quantity) {
          input.disabled = true;
          const result = await updateCartItem(itemId, maxAvailable);
          input.disabled = false;
          
          if (!result.success) {
            showToast(result.error || 'Kon hoeveelheid niet aanpassen', 'error');
            input.value = item.quantity;
          }
        }
        return;
      }
    } catch (error) {
      console.error('Availability check failed:', error);
    }
  }
  
  input.disabled = true;
  const result = await updateCartItem(itemId, newQuantity);
  input.disabled = false;
  
  if (!result.success) {
    showToast(result.error || 'Kon hoeveelheid niet aanpassen', 'error');
    input.value = item.quantity;
  }
}

/**
 * Handle remove item
 */
async function handleRemoveItem(e) {
  const btn = e.currentTarget;
  const itemId = btn.dataset.itemId;
  
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:14px;height:14px;"></div>';
  
  const result = await removeFromCart(itemId);
  
  if (result.success) {
    showToast('Item verwijderd uit winkelwagen', 'success');
  } else {
    showToast(result.error || 'Kon item niet verwijderen', 'error');
    btn.disabled = false;
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
      Verwijderen
    `;
  }
}

/**
 * Initialize clear cart button
 */
function initClearCartButton() {
  const clearBtn = document.getElementById('clear-cart-btn');
  if (!clearBtn) return;

  clearBtn.addEventListener('click', () => {
    showClearCartModal();
  });
}

/**
 * Show custom modal for clear cart confirmation
 */
function showClearCartModal() {
  // Create modal if it doesn't exist
  if (!document.getElementById('clear-cart-modal')) {
    const modalHtml = `
      <div id="clear-cart-modal-backdrop" class="modal-backdrop"></div>
      <div id="clear-cart-modal" class="modal">
        <div class="modal__header">
          <h3 class="modal__title" style="font-family: var(--font-display); text-transform: uppercase;">Winkelwagen Legen?</h3>
          <button class="modal__close" onclick="closeClearCartModal()">&times;</button>
        </div>
        <div class="modal__body">
          <p>Weet je zeker dat je de hele winkelwagen wilt legen?</p>
        </div>
        <div class="modal__footer">
          <button class="btn btn--secondary" onclick="closeClearCartModal()">Annuleren</button>
          <button class="btn btn--primary" id="confirm-clear-cart-btn">
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
  const backdrop = document.getElementById('clear-cart-modal-backdrop');
  const modal = document.getElementById('clear-cart-modal');
  const confirmBtn = document.getElementById('confirm-clear-cart-btn');

  // Force reflow for animation
  modal.offsetHeight;

  backdrop.classList.add('active');
  modal.classList.add('active');

  // Handle confirm action
  confirmBtn.onclick = async () => {
    const clearBtn = document.getElementById('clear-cart-btn');
    
    if (clearBtn) {
      clearBtn.disabled = true;
      clearBtn.innerHTML = '<div class="spinner" style="width:14px;height:14px;"></div>';
    }

    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<div class="spinner" style="width:16px;height:16px;"></div> Legen...';

    const result = await clearCart();

    if (result.success) {
      showToast('Winkelwagen geleegd', 'success');
      closeClearCartModal();
    } else {
      showToast(result.error || 'Kon winkelwagen niet legen', 'error');
      if (clearBtn) {
        clearBtn.disabled = false;
        clearBtn.textContent = 'Winkelwagen legen';
      }
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = `
        Winkelwagen Legen
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18"></path>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      `;
    }
  };
}

// Global function to close modal (needed for inline onclick attributes)
window.closeClearCartModal = function() {
  const backdrop = document.getElementById('clear-cart-modal-backdrop');
  const modal = document.getElementById('clear-cart-modal');
  
  if (backdrop) backdrop.classList.remove('active');
  if (modal) modal.classList.remove('active');
};
