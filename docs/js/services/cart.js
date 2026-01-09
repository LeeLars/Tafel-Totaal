/**
 * Tafel Totaal - Cart Service
 * Winkelwagen state via database (GEEN localStorage!)
 */

import { cartAPI } from '../lib/api.js';

let cartData = [];
let cartListeners = [];

export async function initCart() {
  try {
    const response = await cartAPI.get();
    cartData = response.data || [];
    notifyListeners();
    updateCartBadge();
  } catch (error) {
    console.error('Failed to load cart:', error);
    cartData = [];
  }
}

export async function addToCart(item) {
  try {
    const response = await cartAPI.addItem(item);
    cartData = response.data || [];
    notifyListeners();
    updateCartBadge();
    return { success: true };
  } catch (error) {
    console.error('Failed to add item:', error);
    return { success: false, error: error.message };
  }
}

export async function updateCartItem(itemId, quantity) {
  try {
    const response = await cartAPI.updateItem(itemId, quantity);
    cartData = response.data || [];
    notifyListeners();
    updateCartBadge();
    return { success: true };
  } catch (error) {
    console.error('Failed to update item:', error);
    return { success: false, error: error.message };
  }
}

export async function removeFromCart(itemId) {
  try {
    const response = await cartAPI.removeItem(itemId);
    cartData = response.data || [];
    notifyListeners();
    updateCartBadge();
    return { success: true };
  } catch (error) {
    console.error('Failed to remove item:', error);
    return { success: false, error: error.message };
  }
}

export async function clearCart() {
  try {
    await cartAPI.clear();
    cartData = [];
    notifyListeners();
    updateCartBadge();
    return { success: true };
  } catch (error) {
    console.error('Failed to clear cart:', error);
    return { success: false, error: error.message };
  }
}

export function getCart() {
  return [...cartData];
}

export function getCartCount() {
  return cartData.reduce((sum, item) => sum + item.quantity, 0);
}

export function subscribeToCart(listener) {
  cartListeners.push(listener);
  return () => {
    cartListeners = cartListeners.filter(l => l !== listener);
  };
}

function notifyListeners() {
  cartListeners.forEach(listener => listener(cartData));
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const count = getCartCount();
  
  badges.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

document.addEventListener('DOMContentLoaded', initCart);
