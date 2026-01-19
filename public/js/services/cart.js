/**
 * Tafel Totaal - Cart Service
 * Hybride: localStorage (altijd werkend) + API sync (wanneer beschikbaar)
 */

import { cartAPI } from '../lib/api.js';

const CART_STORAGE_KEY = 'tafel_totaal_cart';
let cartData = [];
let cartListeners = [];
let useAPI = false; // Will be set to true if API is reachable

/**
 * Initialize cart - load from localStorage, then try API sync
 */
export async function initCart() {
  // Always load from localStorage first (instant)
  cartData = loadFromStorage();
  notifyListeners();
  updateCartBadge();
  
  // Try to sync with API (for logged-in users or when API is available)
  try {
    const response = await cartAPI.get();
    if (response.success && Array.isArray(response.data)) {
      useAPI = true;
      // Merge API cart with local cart if API has items
      if (response.data.length > 0) {
        cartData = response.data;
        saveToStorage(cartData);
      } else if (cartData.length > 0) {
        // Push local cart to API
        for (const item of cartData) {
          await cartAPI.addItem(item).catch(() => {});
        }
      }
      notifyListeners();
      updateCartBadge();
    }
  } catch (error) {
    console.log('Cart API not available, using localStorage only');
    useAPI = false;
  }
}

/**
 * Add item to cart
 */
export async function addToCart(item) {
  console.log('🛒 Adding item to cart:', item);
  
  // Generate a unique ID for the item if not present
  if (!item.id) {
    item.id = generateItemId(item);
  }
  
  console.log('🛒 Item ID:', item.id);
  
  // Check if item already exists (same product/package and dates)
  const existingIndex = cartData.findIndex(i => 
    i.type === item.type && 
    (i.product_id === item.product_id || i.package_id === item.package_id) &&
    i.start_date === item.start_date && 
    i.end_date === item.end_date
  );
  
  console.log('🛒 Existing item index:', existingIndex);
  
  if (existingIndex >= 0) {
    cartData[existingIndex].quantity += item.quantity;
    console.log('🛒 Updated existing item quantity:', cartData[existingIndex].quantity);
  } else {
    cartData.push(item);
    console.log('🛒 Added new item to cart');
  }
  
  console.log('🛒 Cart now has', cartData.length, 'items:', cartData);
  
  saveToStorage(cartData);
  notifyListeners();
  updateCartBadge();
  
  // Try API sync in background
  if (useAPI) {
    try {
      await cartAPI.addItem(item);
    } catch (error) {
      console.log('API sync failed, item saved locally');
    }
  }
  
  return { success: true };
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(itemId, quantity) {
  const itemIndex = cartData.findIndex(item => item.id === itemId);
  
  if (itemIndex === -1) {
    return { success: false, error: 'Item not found' };
  }
  
  if (quantity <= 0) {
    return removeFromCart(itemId);
  }
  
  cartData[itemIndex].quantity = quantity;
  
  // Recalculate line_total if unit_price exists
  if (cartData[itemIndex].unit_price) {
    cartData[itemIndex].line_total = cartData[itemIndex].unit_price * quantity;
  } else if (cartData[itemIndex].price_per_day && cartData[itemIndex].days) {
    cartData[itemIndex].unit_price = cartData[itemIndex].price_per_day * cartData[itemIndex].days;
    cartData[itemIndex].line_total = cartData[itemIndex].unit_price * quantity;
  }
  
  // Recalculate damage compensation if per-item value exists
  if (cartData[itemIndex].damage_compensation_per_item) {
    cartData[itemIndex].damage_compensation = cartData[itemIndex].damage_compensation_per_item * quantity;
  }
  
  saveToStorage(cartData);
  notifyListeners();
  updateCartBadge();
  
  // Try API sync in background
  if (useAPI) {
    try {
      await cartAPI.updateItem(itemId, quantity);
    } catch (error) {
      console.log('API sync failed, item updated locally');
    }
  }
  
  return { success: true };
}

/**
 * Remove item from cart
 */
export async function removeFromCart(itemId) {
  cartData = cartData.filter(item => item.id !== itemId);
  saveToStorage(cartData);
  notifyListeners();
  updateCartBadge();
  
  // Try API sync in background
  if (useAPI) {
    try {
      await cartAPI.removeItem(itemId);
    } catch (error) {
      console.log('API sync failed, item removed locally');
    }
  }
  
  return { success: true };
}

/**
 * Clear entire cart
 */
export async function clearCart() {
  cartData = [];
  saveToStorage(cartData);
  notifyListeners();
  updateCartBadge();
  
  // Try API sync in background
  if (useAPI) {
    try {
      await cartAPI.clear();
    } catch (error) {
      console.log('API sync failed, cart cleared locally');
    }
  }
  
  return { success: true };
}

/**
 * Get current cart data
 */
export function getCart() {
  return [...cartData];
}

/**
 * Get total item count
 */
export function getCartCount() {
  return cartData.reduce((sum, item) => sum + (item.quantity || 1), 0);
}

/**
 * Get the locked event date from cart (if any items exist)
 * Returns the event date from the first item, or null if cart is empty
 */
export function getLockedEventDate() {
  if (cartData.length === 0) return null;
  
  const firstItem = cartData[0];
  // Return the event_date if it exists, otherwise derive from start_date
  return firstItem.event_date || firstItem.start_date;
}

/**
 * Check if cart has items (date should be locked)
 */
export function isDateLocked() {
  return cartData.length > 0;
}

/**
 * Subscribe to cart changes
 */
export function subscribeToCart(listener) {
  cartListeners.push(listener);
  return () => {
    cartListeners = cartListeners.filter(l => l !== listener);
  };
}

/**
 * Load cart from localStorage
 */
function loadFromStorage() {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load cart from storage:', error);
    return [];
  }
}

/**
 * Save cart to localStorage
 */
function saveToStorage(data) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save cart to storage:', error);
  }
}

/**
 * Generate unique ID for cart item
 */
function generateItemId(item) {
  const base = `${item.type}-${item.product_id || item.package_id}-${item.start_date}-${item.end_date}`;
  return base + '-' + Date.now().toString(36);
}

/**
 * Notify all listeners of cart changes
 */
function notifyListeners() {
  cartListeners.forEach(listener => listener(cartData));
}

/**
 * Update cart badge in header
 */
function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const count = getCartCount();
  
  badges.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

// Initialize cart when DOM is ready
document.addEventListener('DOMContentLoaded', initCart);
