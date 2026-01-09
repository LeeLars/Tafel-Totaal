/**
 * Tafel Totaal - Shopping Cart Page JavaScript
 * Handles cart display, quantity updates, and removal
 */

import { formatPrice, formatDateShort, showToast } from '../lib/utils.js';
import { loadHeader } from '../components/header.js';
import { getCart, updateCartItem, removeFromCart, clearCart, subscribeToCart } from '../services/cart.js';

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
  }

  // Update summary
  updateSummary(cart);
}

/**
 * Create cart item HTML
 */
function createCartItemHTML(item) {
  const imageUrl = item.image || '/images/packages/placeholder.jpg';
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
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            ${formatDateShort(item.start_date)} - ${formatDateShort(item.end_date)}
          </p>
        ` : ''}
      </div>
      <div class="cart-item__actions">
        <div class="cart-item__price">${formatPrice(item.line_total || item.unit_price * item.quantity)}</div>
        ${item.type === 'product' ? `
          <div class="quantity-control">
            <button class="quantity-control__btn" data-action="decrease" data-item-id="${item.id}" ${item.quantity <= 1 ? 'disabled' : ''}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <input type="text" class="quantity-control__value" value="${item.quantity}" readonly>
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
 * Update cart summary
 */
function updateSummary(cart) {
  let subtotal = 0;
  let deposit = 0;

  cart.forEach(item => {
    subtotal += item.line_total || (item.unit_price * item.quantity);
    deposit += item.deposit || 0;
  });

  // Estimate deposit if not provided (30% of subtotal)
  if (deposit === 0) {
    deposit = Math.round(subtotal * 0.3 * 100) / 100;
  }

  const total = subtotal + deposit;

  document.getElementById('summary-subtotal').textContent = formatPrice(subtotal);
  document.getElementById('summary-deposit').textContent = formatPrice(deposit);
  document.getElementById('summary-total').textContent = formatPrice(total);
}

/**
 * Handle quantity change
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
    btn.disabled = true;
    const result = await updateCartItem(itemId, newQuantity);
    btn.disabled = false;
    
    if (!result.success) {
      showToast(result.error || 'Kon hoeveelheid niet aanpassen', 'error');
    }
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

  clearBtn.addEventListener('click', async () => {
    if (!confirm('Weet je zeker dat je de hele winkelwagen wilt legen?')) {
      return;
    }

    clearBtn.disabled = true;
    clearBtn.textContent = 'Bezig...';

    const result = await clearCart();

    if (result.success) {
      showToast('Winkelwagen geleegd', 'success');
    } else {
      showToast(result.error || 'Kon winkelwagen niet legen', 'error');
      clearBtn.disabled = false;
      clearBtn.textContent = 'Winkelwagen legen';
    }
  });
}
