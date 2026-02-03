/**
 * Tafel Totaal - Product Components Management
 * Handles product sets/bundles (e.g., Theeset = Theekan + Melkkan + Suikerpot)
 */

import { showToast } from '../../lib/utils.js';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://tafel-totaal-production.up.railway.app';

let currentComponents = [];
let availableProducts = [];

let isInitialized = false;

/**
 * Initialize component management
 */
export async function initComponentManagement(productId) {
  const addBtn = document.getElementById('add-component-btn');
  
  // Only add event listener once
  if (addBtn && !isInitialized) {
    addBtn.addEventListener('click', () => openComponentSelector());
    isInitialized = true;
  }

  // Load available products for selection
  await loadAvailableProducts();

  // Load existing components if editing a product
  if (productId) {
    await loadProductComponents(productId);
  } else {
    currentComponents = [];
    renderComponents();
  }
}

/**
 * Load all products for component selection
 */
async function loadAvailableProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/products?limit=100&page=1`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Products API response:', result);
      
      // Handle both paginated and direct array responses
      if (result.data) {
        availableProducts = Array.isArray(result.data) ? result.data : (result.data.products || []);
      } else if (Array.isArray(result)) {
        availableProducts = result;
      } else {
        availableProducts = [];
      }
      
      console.log('Loaded products for components:', availableProducts.length);
    } else {
      console.error('Failed to load products:', response.status);
    }
  } catch (error) {
    console.error('Error loading products:', error);
    availableProducts = [];
  }
}

/**
 * Load components for a product
 */
async function loadProductComponents(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/product-components/${productId}/components`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      currentComponents = data.data || [];
      renderComponents();
    }
  } catch (error) {
    console.error('Error loading components:', error);
    currentComponents = [];
    renderComponents();
  }
}

/**
 * Render components list
 */
function renderComponents() {
  const container = document.getElementById('components-list');
  const noComponentsMsg = document.getElementById('no-components-message');
  
  if (!container || !noComponentsMsg) return;

  if (currentComponents.length === 0) {
    container.style.display = 'none';
    noComponentsMsg.style.display = 'block';
    return;
  }

  container.style.display = 'flex';
  noComponentsMsg.style.display = 'none';

  container.innerHTML = currentComponents.map((component, index) => `
    <div class="component-item" data-index="${index}" style="display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md); border: 1px solid var(--color-light-gray); background: var(--color-off-white);">
      <div style="flex: 1;">
        <strong>${component.name}</strong>
        <div style="font-size: var(--font-size-sm); color: var(--color-gray); font-family: var(--font-mono);">
          ${component.sku} • Voorraad: ${component.stock_total}
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: var(--space-sm);">
        <label style="font-size: var(--font-size-sm); color: var(--color-gray);">Aantal:</label>
        <input 
          type="number" 
          class="form-input" 
          value="${component.quantity}" 
          min="1" 
          data-component-id="${component.component_product_id}"
          style="width: 80px; padding: 4px 8px;"
          onchange="window.updateComponentQuantity('${component.component_product_id}', this.value)"
        >
      </div>
      <button 
        type="button" 
        class="btn btn--ghost btn--sm" 
        onclick="window.removeComponent(${index})"
        title="Verwijderen"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `).join('');
}

/**
 * Open component selector modal
 */
async function openComponentSelector() {
  // Ensure products are loaded
  if (availableProducts.length === 0) {
    await loadAvailableProducts();
  }

  // Create a simple modal for selecting a product
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'component-selector-modal';
  modal.style.zIndex = '10001'; // Higher than product modal (10000)
  modal.innerHTML = `
    <div class="modal__backdrop"></div>
    <div class="modal__content" style="max-width: 600px;">
      <div class="modal__header">
        <div style="flex: 1;">
          <h2>Component Toevoegen</h2>
          <p id="component-counter" style="font-size: var(--font-size-sm); color: var(--color-gray); margin: 4px 0 0 0;">
            ${currentComponents.length} component${currentComponents.length !== 1 ? 'en' : ''} toegevoegd
          </p>
        </div>
        <button type="button" class="btn btn--primary btn--sm" id="component-done-btn" style="margin-right: var(--space-sm);">
          Klaar
        </button>
        <button type="button" class="modal__close" id="component-close-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal__body">
        <div class="form-group">
          <label class="form-label">Zoek product (min. 2 tekens)</label>
          <input 
            type="text" 
            id="component-search" 
            class="form-input" 
            placeholder="Typ om te zoeken..."
          >
        </div>
        <div class="form-group">
          <label class="form-label">Aantal</label>
          <input 
            type="number" 
            id="component-quantity" 
            class="form-input" 
            value="1" 
            min="1"
          >
        </div>
        <div id="component-products-list" style="max-height: 300px; overflow-y: auto; border: 1px solid var(--color-light-gray); margin-top: var(--space-md);">
          <div style="padding: var(--space-lg); text-align: center; color: var(--color-gray);">Typ minimaal 2 tekens om te zoeken...</div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Setup event listeners with proper event handling
  const backdrop = modal.querySelector('.modal__backdrop');
  const modalContent = modal.querySelector('.modal__content');
  const closeBtn = modal.querySelector('#component-close-btn');
  const doneBtn = modal.querySelector('#component-done-btn');
  const searchInput = modal.querySelector('#component-search');
  
  // Prevent clicks inside modal content from closing the modal
  modalContent?.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  // Close modal handlers
  const closeModal = () => {
    modal.remove();
  };
  
  backdrop?.addEventListener('click', closeModal);
  closeBtn?.addEventListener('click', closeModal);
  doneBtn?.addEventListener('click', closeModal);
  
  // Search input handler
  searchInput?.addEventListener('input', (e) => {
    filterComponentProducts(e.target.value);
  });
  
  // Setup product selection handlers (event delegation)
  setupProductSelectionHandlers();
  
  // Focus search input
  setTimeout(() => {
    searchInput?.focus();
  }, 100);
}

/**
 * Render products list for selection
 */
function renderProductsList(products) {
  if (products.length === 0) {
    return '<div style="padding: var(--space-lg); text-align: center; color: var(--color-gray);">Geen producten gevonden</div>';
  }

  return products.map(product => {
    // Escape quotes in product name for data attribute
    const escapedName = product.name.replace(/'/g, "&apos;");
    return `
      <div 
        class="product-select-item" 
        data-product-id="${product.id}"
        data-product-name="${escapedName}"
        data-product-sku="${product.sku}"
        data-product-stock="${product.stock_total}"
        style="padding: var(--space-md); border-bottom: 1px solid var(--color-light-gray); cursor: pointer; transition: background 0.2s;"
      >
        <strong>${product.name}</strong>
        <div style="font-size: var(--font-size-sm); color: var(--color-gray); font-family: var(--font-mono);">
          ${product.sku} • Voorraad: ${product.stock_total}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Filter products in selector
 */
function filterComponentProducts(searchTerm) {
  const list = document.getElementById('component-products-list');
  if (!list) return;

  // Require at least 2 characters
  if (searchTerm.length < 2) {
    list.innerHTML = '<div style="padding: var(--space-lg); text-align: center; color: var(--color-gray);">Typ minimaal 2 tekens om te zoeken...</div>';
    return;
  }

  console.log('Searching for:', searchTerm);
  console.log('Available products:', availableProducts.length);

  const searchLower = searchTerm.toLowerCase();
  const filtered = availableProducts.filter(p => {
    const nameMatch = p.name && p.name.toLowerCase().includes(searchLower);
    const skuMatch = p.sku && p.sku.toLowerCase().includes(searchLower);
    return nameMatch || skuMatch;
  });
  
  console.log('Filtered results:', filtered.length);
  list.innerHTML = renderProductsList(filtered);
}

/**
 * Select a component
 */
function selectComponent(productId, name, sku, stockTotal) {
  const quantityInput = document.getElementById('component-quantity');
  const quantity = parseInt(quantityInput?.value || 1);

  // Check if already added
  if (currentComponents.some(c => c.component_product_id === productId)) {
    showToast('Dit product is al toegevoegd als component', 'error');
    return;
  }

  // Add to current components
  currentComponents.push({
    component_product_id: productId,
    name,
    sku,
    stock_total: stockTotal,
    quantity
  });

  // Update component list in product modal
  renderComponents();
  
  // Close the component selector modal
  const selectorModal = document.getElementById('component-selector-modal');
  if (selectorModal) {
    selectorModal.remove();
  }
  
  // Scroll to components list in product modal after a short delay
  setTimeout(() => {
    scrollToComponentsList();
  }, 100);
  
  showToast(`Component toegevoegd`, 'success');
}

/**
 * Remove a component
 */
window.removeComponent = function(index) {
  currentComponents.splice(index, 1);
  renderComponents();
  updateComponentCounter();
  showToast('Component verwijderd', 'success');
};

/**
 * Update component quantity
 */
window.updateComponentQuantity = function(componentId, newQuantity) {
  const component = currentComponents.find(c => c.component_product_id === componentId);
  if (component) {
    component.quantity = parseInt(newQuantity);
    console.log('Updated component quantity:', componentId, newQuantity);
  }
};

/**
 * Get current components for saving
 */
export function getCurrentComponents() {
  return currentComponents;
}

/**
 * Clear components
 */
export function clearComponents() {
  currentComponents = [];
  renderComponents();
}

/**
 * Update component counter in selector modal
 */
function updateComponentCounter() {
  const counter = document.getElementById('component-counter');
  if (counter) {
    counter.textContent = `${currentComponents.length} component${currentComponents.length !== 1 ? 'en' : ''} toegevoegd`;
  }
}

/**
 * Scroll to components list in product modal
 */
function scrollToComponentsList() {
  const componentsList = document.getElementById('components-list');
  if (componentsList && componentsList.style.display !== 'none') {
    // Scroll to the components section in the modal
    componentsList.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Highlight the last added component briefly
    const componentItems = componentsList.querySelectorAll('.component-item');
    if (componentItems.length > 0) {
      const lastItem = componentItems[componentItems.length - 1];
      lastItem.style.transition = 'background 0.3s ease';
      lastItem.style.background = 'var(--color-primary-light)';
      setTimeout(() => {
        lastItem.style.background = 'var(--color-off-white)';
      }, 800);
    }
  }
}

/**
 * Setup product selection click handlers
 */
function setupProductSelectionHandlers() {
  const productsList = document.getElementById('component-products-list');
  if (!productsList) return;
  
  // Use event delegation for dynamically added product items
  productsList.addEventListener('click', (e) => {
    const productItem = e.target.closest('.product-select-item');
    if (!productItem) return;
    
    const productId = productItem.getAttribute('data-product-id');
    const name = productItem.getAttribute('data-product-name')?.replace(/&apos;/g, "'") || '';
    const sku = productItem.getAttribute('data-product-sku') || '';
    const stockTotal = parseInt(productItem.getAttribute('data-product-stock') || '0');
    
    if (productId) {
      selectComponent(productId, name, sku, stockTotal);
    }
  });
  
  // Add hover effect
  productsList.addEventListener('mouseover', (e) => {
    const productItem = e.target.closest('.product-select-item');
    if (productItem) {
      productItem.style.background = 'var(--color-concrete)';
    }
  });
  
  productsList.addEventListener('mouseout', (e) => {
    const productItem = e.target.closest('.product-select-item');
    if (productItem) {
      productItem.style.background = '';
    }
  });
}

/**
 * Save components to backend
 */
export async function saveComponents(productId) {
  if (!productId) {
    console.log('No product ID, skipping component save');
    return;
  }

  try {
    // Get existing components
    const existingResponse = await fetch(`${API_BASE_URL}/api/product-components/${productId}/components`, {
      credentials: 'include'
    });
    
    const existingData = await existingResponse.json();
    const existingComponents = existingData.data || [];

    // Remove components that are no longer in the list
    for (const existing of existingComponents) {
      if (!currentComponents.some(c => c.component_product_id === existing.component_product_id)) {
        await fetch(`${API_BASE_URL}/api/product-components/${productId}/components/${existing.component_product_id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
      }
    }

    // Add or update components
    for (const component of currentComponents) {
      console.log('Saving component:', component);
      const response = await fetch(`${API_BASE_URL}/api/product-components/${productId}/components`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          component_product_id: component.component_product_id,
          quantity: component.quantity
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to save component:', errorData);
        throw new Error(`Failed to save component: ${errorData.error || response.statusText}`);
      }
      
      console.log('Component saved:', component.name);
    }

    console.log('All components saved successfully');
  } catch (error) {
    console.error('Error saving components:', error);
    throw error;
  }
}
