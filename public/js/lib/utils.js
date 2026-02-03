/**
 * Tafel Totaal - Utility Functions
 */

/**
 * Get base path for site
 */
export function getBasePath() {
  return '';
}

export function formatPrice(amount) {
  return new Intl.NumberFormat('nl-BE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('nl-BE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function formatDateShort(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('nl-BE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

export function formatDateTime(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('nl-BE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

export function setQueryParam(name, value) {
  const url = new URL(window.location);
  if (value) {
    url.searchParams.set(name, value);
  } else {
    url.searchParams.delete(name);
  }
  window.history.replaceState({}, '', url);
}

export function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function isValidPhone(phone) {
  const re = /^[\d\s\-\+\(\)]{9,}$/;
  return re.test(phone);
}

/**
 * Show custom alert modal (Tafel Totaal style)
 */
export function showAlert(message, title = 'Melding') {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'custom-modal-backdrop';
    
    const modal = document.createElement('div');
    modal.className = 'custom-modal custom-modal--alert';
    modal.innerHTML = `
      <div class="custom-modal__header">
        <h3 class="custom-modal__title">${title}</h3>
      </div>
      <div class="custom-modal__body">
        <p>${message}</p>
      </div>
      <div class="custom-modal__footer">
        <button class="btn btn--primary" id="alert-ok-btn">OK</button>
      </div>
    `;
    
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    
    const cleanup = () => {
      backdrop.remove();
      resolve();
    };
    
    const okBtn = modal.querySelector('#alert-ok-btn');
    okBtn.addEventListener('click', cleanup);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) cleanup();
    });
    
    // Keyboard support
    const handleKeydown = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        cleanup();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);
    
    // Focus OK button
    setTimeout(() => okBtn.focus(), 100);
  });
}

/**
 * Show custom confirm modal (Tafel Totaal style)
 */
export function showConfirm(message, title = 'Bevestiging', options = {}) {
  return new Promise((resolve) => {
    const {
      confirmText = 'Bevestigen',
      cancelText = 'Annuleren',
      destructive = false
    } = options;
    
    const backdrop = document.createElement('div');
    backdrop.className = 'custom-modal-backdrop';
    
    const modal = document.createElement('div');
    modal.className = 'custom-modal custom-modal--confirm';
    modal.innerHTML = `
      <div class="custom-modal__header">
        <h3 class="custom-modal__title">${title}</h3>
      </div>
      <div class="custom-modal__body">
        <p>${message}</p>
      </div>
      <div class="custom-modal__footer">
        <button class="btn btn--ghost" id="confirm-cancel-btn">${cancelText}</button>
        <button class="btn ${destructive ? 'btn--error' : 'btn--primary'}" id="confirm-ok-btn">${confirmText}</button>
      </div>
    `;
    
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    
    const cleanup = (value) => {
      backdrop.remove();
      document.removeEventListener('keydown', handleKeydown);
      resolve(value);
    };
    
    const cancelBtn = modal.querySelector('#confirm-cancel-btn');
    const okBtn = modal.querySelector('#confirm-ok-btn');
    
    cancelBtn.addEventListener('click', () => cleanup(false));
    okBtn.addEventListener('click', () => cleanup(true));
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) cleanup(false);
    });
    
    // Keyboard support
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        cleanup(false);
      } else if (e.key === 'Enter') {
        cleanup(true);
      }
    };
    document.addEventListener('keydown', handleKeydown);
    
    // Focus confirm button
    setTimeout(() => okBtn.focus(), 100);
  });
}
