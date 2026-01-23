/**
 * Tafel Totaal - Header Component
 * Handles mobile menu, sticky header, and user dropdown
 */

import { logout } from '../services/auth.js';

export function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  initStickyHeader(header);
  initMobileMenu(header);
  initUserDropdown(header);
  initLogoutButtons();
  setActiveNavLink();
  initDirectionAwareHover();
  initCartPreview();
}

/**
 * Sticky header shadow on scroll
 */
function initStickyHeader(header) {
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  }, { passive: true });
}

/**
 * Mobile hamburger menu toggle
 */
function initMobileMenu(header) {
  const hamburger = header.querySelector('.header__hamburger');
  const mobileNav = header.querySelector('.header__mobile-nav');
  
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('active');
    mobileNav.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when clicking a link
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

/**
 * User dropdown menu
 */
function initUserDropdown(header) {
  const dropdown = header.querySelector('.header__user-dropdown');
  if (!dropdown) return;

  const btn = dropdown.querySelector('.header__user-btn');
  
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdown.classList.contains('open')) {
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Logout button handlers
 */
function initLogoutButtons() {
  const logoutBtn = document.getElementById('logout-btn');
  const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Clear all local data first (before API call)
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear all cookies (including auth_token)
    document.cookie.split(';').forEach(c => {
      const name = c.split('=')[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/Tafel-Totaal`;
    });
    
    // Try API logout (but don't wait for success)
    try {
      await logout();
    } catch (error) {
      console.log('API logout failed (ignored):', error);
    }
    
    // Always redirect to homepage
    window.location.replace('/');
  };

  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener('click', handleLogout);
  }
}

/**
 * Direction-aware hover effect for category links
 * Detects if mouse enters from left or right and animates fill accordingly
 */
function initDirectionAwareHover() {
  const categoryLinks = document.querySelectorAll('.category-link');
  const categoryCards = document.querySelectorAll('.category-card');
  
  categoryLinks.forEach(link => {
    link.addEventListener('mouseenter', (e) => {
      const rect = link.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const fromLeft = x < rect.width / 2;
      
      // Set direction via CSS custom property (instant, no transition)
      link.style.setProperty('--fill-from', fromLeft ? '-101%' : '101%');
      
      // Force reflow so browser sees the new --fill-from value
      void link.offsetWidth;
      
      // Now add hover class to trigger animation to center
      link.classList.add('is-hovering');
    });
    
    link.addEventListener('mouseleave', (e) => {
      const rect = link.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const exitLeft = x < rect.width / 2;
      
      // Remove hover class - fill will animate back to --fill-from position
      link.classList.remove('is-hovering');
      
      // Update direction for exit animation
      link.style.setProperty('--fill-from', exitLeft ? '-101%' : '101%');
    });
  });

  // Track mouse movement globally for accurate direction detection
  let lastMouseX = 0;
  let lastMouseY = 0;
  let prevMouseX = 0;
  let prevMouseY = 0;
  
  document.addEventListener('pointermove', (e) => {
    prevMouseX = lastMouseX;
    prevMouseY = lastMouseY;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  }, { passive: true });

  categoryCards.forEach(card => {
    let isInside = false;
    
    card.addEventListener('pointerenter', (e) => {
      isInside = true;
      const rect = card.getBoundingClientRect();
      
      // Calculate movement vector (from previous position to current)
      const dx = lastMouseX - prevMouseX;
      const dy = lastMouseY - prevMouseY;
      
      // Determine entry direction from movement vector
      let direction;
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal movement dominant
        direction = dx > 0 ? 'left' : 'right';
      } else {
        // Vertical movement dominant
        direction = dy > 0 ? 'top' : 'bottom';
      }
      
      card.setAttribute('data-hover-from', direction);
      card.classList.add('is-hovering');
    });

    card.addEventListener('pointerleave', (e) => {
      isInside = false;
      const rect = card.getBoundingClientRect();
      
      // Calculate exit direction from mouse position relative to element
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const w = rect.width;
      const h = rect.height;
      
      // Determine which edge the mouse is closest to (exit point)
      const distTop = y;
      const distBottom = h - y;
      const distLeft = x;
      const distRight = w - x;
      
      const min = Math.min(distTop, distBottom, distLeft, distRight);
      
      let direction;
      if (min === distTop) direction = 'top';
      else if (min === distBottom) direction = 'bottom';
      else if (min === distLeft) direction = 'left';
      else direction = 'right';
      
      card.setAttribute('data-hover-from', direction);
      card.classList.remove('is-hovering');
    });
  });
}

/**
 * Set active state on current page nav link
 */
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  const currentCategory = urlParams.get('category');
  
  // Main Nav Links
  const navLinks = document.querySelectorAll('.header__link, .header__mobile-menu a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    // Simple path match
    if (href === currentPath || (currentPath === '/' && href === '/')) {
      link.classList.add('active');
    }
  });

  // Category Nav Links
  const categoryLinks = document.querySelectorAll('.category-link');
  if (categoryLinks.length > 0) {
    categoryLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      
      const linkUrl = new URL(href, window.location.origin);
      const linkCategory = linkUrl.searchParams.get('category');

      if (currentCategory && linkCategory === currentCategory) {
        link.classList.add('active');
      }
    });
  }
}

/**
 * Load header component into page
 * @param {string} containerId - Element ID to inject header into
 * @param {string} variant - Header variant to load ('default' or 'location')
 */
export async function loadHeader(containerId = 'header-container', variant = 'default') {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const basePath = '';
    const componentName = variant === 'location' ? 'header-location.html' : 'header.html';
    
    const response = await fetch(`${basePath}/components/${componentName}`);
    if (!response.ok) throw new Error('Failed to load header');
    
    const html = await response.text();
    container.innerHTML = html;
    
    // Wait for DOM to be ready before initializing
    await new Promise(resolve => setTimeout(resolve, 0));
    initHeader();
  } catch (error) {
    console.error('Error loading header:', error);
  }
}

/**
 * Convenience function to load location header
 */
export function loadLocationHeader(containerId = 'header-container') {
  return loadHeader(containerId, 'location');
}

/**
 * Initialize cart preview hover functionality
 */
function initCartPreview() {
  const cartWrapper = document.querySelector('.header__cart-wrapper');
  if (!cartWrapper) return;

  // Update cart preview on hover
  cartWrapper.addEventListener('mouseenter', updateCartPreview);
}

/**
 * Update cart preview with current cart items
 */
async function updateCartPreview() {
  try {
    // Primary source: cart service uses localStorage
    const cartData = localStorage.getItem('tafel_totaal_cart');
    if (cartData) {
      const cart = JSON.parse(cartData);
      if (Array.isArray(cart) && cart.length > 0) {
        renderCartItems(cart);
        return;
      }
    }

    // Fallback: legacy sessionStorage key
    const legacy = sessionStorage.getItem('cart');
    if (legacy) {
      const cart = JSON.parse(legacy);
      if (Array.isArray(cart) && cart.length > 0) {
        renderCartItems(cart);
        return;
      }
    }

    renderEmptyCart();
  } catch (error) {
    console.error('Error updating cart preview:', error);
    renderEmptyCart();
  }
}

/**
 * Render empty cart state
 */
function renderEmptyCart() {
  const itemsContainer = document.getElementById('cart-preview-items');
  const countEl = document.querySelector('.cart-preview__count');
  const totalEl = document.getElementById('cart-preview-total');

  if (itemsContainer) {
    itemsContainer.innerHTML = '<p style="text-align: center; color: var(--color-gray); padding: var(--space-lg);">Je winkelwagen is leeg</p>';
  }
  if (countEl) countEl.textContent = '0 items';
  if (totalEl) totalEl.textContent = '€0,00';
}

/**
 * Render cart items in preview
 */
function renderCartItems(cart) {
  const itemsContainer = document.getElementById('cart-preview-items');
  const countEl = document.querySelector('.cart-preview__count');
  const totalEl = document.getElementById('cart-preview-total');

  if (!itemsContainer) return;

  // Calculate total
  let total = 0;
  let itemCount = 0;

  const itemsHtml = cart.map(item => {
    const quantity = parseInt(item.quantity || 1, 10);

    const unitPrice = parseFloat(item.unit_price ?? item.price_per_day ?? item.price ?? 0) || 0;

    const computedLineTotal = (parseFloat(item.line_total) || 0) || (unitPrice * quantity);
    total += computedLineTotal;
    itemCount += quantity;

    const imageUrl = item.image || '/images/placeholder.jpg';
    const itemName = item.name || (item.type === 'package' ? 'Pakket' : 'Product');
    const details = [];
    if (item.type) details.push(item.type === 'package' ? 'Pakket' : 'Product');
    if (item.persons) details.push(`${item.persons} pers.`);
    if (item.start_date && item.end_date) {
      details.push(`${formatDateShort(item.start_date)} - ${formatDateShort(item.end_date)}`);
    }

    return `
      <div class="cart-preview__item">
        <img src="${imageUrl}" alt="${itemName}" class="cart-preview__item-image" onerror="this.src='/images/placeholder.jpg'">
        <div class="cart-preview__item-info">
          <div class="cart-preview__item-name">${itemName}</div>
          ${details.length > 0 ? `<div class="cart-preview__item-details">${details.join(' • ')}</div>` : ''}
          <div class="cart-preview__item-price">${quantity}x ${formatPrice(unitPrice)} = ${formatPrice(computedLineTotal)}</div>
        </div>
      </div>
    `;
  }).join('');

  itemsContainer.innerHTML = itemsHtml;
  if (countEl) countEl.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''}`;
  if (totalEl) totalEl.textContent = formatPrice(total);
}

/**
 * Format price helper
 */
function formatPrice(amount) {
  return new Intl.NumberFormat('nl-BE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

/**
 * Format date helper
 */
function formatDateShort(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit' });
}

// Auto-init if header already in DOM
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('site-header')) {
    initHeader();
  }
});
