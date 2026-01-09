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
    const result = await logout();
    if (result.success) {
      window.location.href = '/';
    }
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
 */
export async function loadHeader(containerId = 'header-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const response = await fetch('/components/header.html');
    if (!response.ok) throw new Error('Failed to load header');
    
    const html = await response.text();
    container.innerHTML = html;
    
    initHeader();
  } catch (error) {
    console.error('Error loading header:', error);
  }
}

// Auto-init if header already in DOM
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('site-header')) {
    initHeader();
  }
});
