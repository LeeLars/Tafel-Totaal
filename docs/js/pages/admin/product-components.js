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
  modal.innerHTML = `
    <div class="modal__backdrop" onclick="this.closest('.modal').remove()"></div>
    <div class="modal__content" style="max-width: 600px;">
      <div class="modal__header">
        <h2>Component Toevoegen</h2>
        <button type="button" class="modal__close" onclick="this.closest('.modal').remove()">
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
            oninput="window.filterComponentProducts(this.value)"
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
  
  // Focus search input
  setTimeout(() => {
    document.getElementById('component-search')?.focus();
  }, 100);
}

/**
 * Render products list for selection
 */
function renderProductsList(products) {
  if (products.length === 0) {
    return '<div style="padding: var(--space-lg); text-align: center; color: var(--color-gray);">Geen producten gevonden</div>';
  }

  return products.map(product => `
    <div 
      class="product-select-item" 
      onclick="window.selectComponent('${product.id}', '${product.name}', '${product.sku}', ${product.stock_total})"
      style="padding: var(--space-md); border-bottom: 1px solid var(--color-light-gray); cursor: pointer; transition: background 0.2s;"
      onmouseover="this.style.background='var(--color-concrete)'"
      onmouseout="this.style.background=''"
    >
      <strong>${product.name}</strong>
      <div style="font-size: var(--font-size-sm); color: var(--color-gray); font-family: var(--font-mono);">
        ${product.sku} • Voorraad: ${product.stock_total}
      </div>
    </div>
  `).join('');
}

/**
 * Filter products in selector
 */
window.filterComponentProducts = function(searchTerm) {
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
};

/**
 * Select a component
 */
window.selectComponent = function(productId, name, sku, stockTotal) {
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

  renderComponents();
  
  // Close modal
  document.querySelector('.modal')?.remove();
  
  showToast('Component toegevoegd', 'success');
};

/**
 * Remove a component
 */
window.removeComponent = function(index) {
  currentComponents.splice(index, 1);
  renderComponents();
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
