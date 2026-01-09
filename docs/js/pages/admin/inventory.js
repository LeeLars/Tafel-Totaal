/**
 * Tafel Totaal - Admin Inventory Management
 */

import { adminAPI } from '../../lib/api.js';
import { formatPrice, showToast } from '../../lib/utils.js';
import { requireAdmin } from '../../lib/guards.js';

const API_BASE_URL = window.location.hostname.includes('github.io') 
  ? 'https://tafel-totaal-production.up.railway.app' 
  : 'http://localhost:3000';

let inventoryData = [];
let categories = [];
let currentView = 'table';

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAdmin();
  if (!user) return;

  initFilters();
  initModals();
  initViewToggle();
  await loadCategories();
  await loadInventory();
  updateStats();
});

/**
 * Initialize filters
 */
function initFilters() {
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const statusFilter = document.getElementById('status-filter');
  const locationFilter = document.getElementById('location-filter');

  let searchTimeout;
  
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(filterInventory, 300);
    });
  }

  [categoryFilter, statusFilter, locationFilter].forEach(filter => {
    if (filter) {
      filter.addEventListener('change', filterInventory);
    }
  });

  // Export button
  document.getElementById('export-inventory-btn')?.addEventListener('click', exportInventory);
}

/**
 * Initialize modals
 */
function initModals() {
  // Location modal
  const locationModal = document.getElementById('location-modal');
  const locationClose = document.getElementById('location-modal-close');
  
  if (locationModal && locationClose) {
    locationClose.addEventListener('click', () => locationModal.classList.remove('active'));
    locationModal.querySelector('.modal__backdrop')?.addEventListener('click', () => locationModal.classList.remove('active'));
  }

  // Stock adjustment modal
  const stockModal = document.getElementById('stock-modal');
  const stockClose = document.getElementById('stock-modal-close');
  const stockCancel = document.getElementById('stock-cancel-btn');
  const stockSave = document.getElementById('stock-save-btn');

  if (stockModal) {
    stockClose?.addEventListener('click', () => stockModal.classList.remove('active'));
    stockCancel?.addEventListener('click', () => stockModal.classList.remove('active'));
    stockModal.querySelector('.modal__backdrop')?.addEventListener('click', () => stockModal.classList.remove('active'));
    stockSave?.addEventListener('click', saveStockAdjustment);
  }
}

/**
 * Initialize view toggle
 */
function initViewToggle() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tableView = document.getElementById('inventory-table-view');
  const gridView = document.getElementById('inventory-grid-view');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      currentView = view;

      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (view === 'table') {
        tableView.style.display = 'block';
        gridView.style.display = 'none';
      } else {
        tableView.style.display = 'none';
        gridView.style.display = 'grid';
      }

      renderInventory();
    });
  });
}

/**
 * Load categories for filter
 */
async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    const result = await response.json();
    
    if (result.success) {
      categories = result.data || [];
      const categoryFilter = document.getElementById('category-filter');
      if (categoryFilter) {
        categories.forEach(cat => {
          const option = document.createElement('option');
          option.value = cat.id;
          option.textContent = cat.name;
          categoryFilter.appendChild(option);
        });
      }
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

/**
 * Load inventory data
 */
async function loadInventory() {
  const tbody = document.getElementById('inventory-tbody');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/inventory`, {
      credentials: 'include'
    });
    
    const result = await response.json();
    
    if (result.success) {
      inventoryData = result.data || [];
    } else {
      // Fallback to products API if inventory endpoint doesn't exist yet
      const productsResponse = await adminAPI.getProducts();
      inventoryData = (productsResponse.data?.products || []).map(p => ({
        ...p,
        available: p.stock_total - p.stock_buffer - (p.reserved || 0),
        rented: p.reserved || 0,
        location: 'warehouse'
      }));
    }
    
    renderInventory();
    updateStats();
  } catch (error) {
    console.error('Error loading inventory:', error);
    
    // Try fallback
    try {
      const productsResponse = await adminAPI.getProducts();
      inventoryData = (productsResponse.data?.products || []).map(p => ({
        ...p,
        available: p.stock_total - p.stock_buffer - (p.reserved || 0),
        rented: p.reserved || 0,
        location: 'warehouse'
      }));
      renderInventory();
      updateStats();
    } catch (e) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 40px; color: var(--color-error);">
            Kon voorraad niet laden
          </td>
        </tr>
      `;
    }
  }
}

/**
 * Filter inventory based on current filters
 */
function filterInventory() {
  const search = document.getElementById('search-input')?.value.toLowerCase() || '';
  const category = document.getElementById('category-filter')?.value || '';
  const status = document.getElementById('status-filter')?.value || '';
  const location = document.getElementById('location-filter')?.value || '';

  const filtered = inventoryData.filter(item => {
    // Search filter
    if (search && !item.name.toLowerCase().includes(search) && !item.sku?.toLowerCase().includes(search)) {
      return false;
    }

    // Category filter
    if (category && item.category_id !== category) {
      return false;
    }

    // Status filter
    if (status) {
      const available = item.available || (item.stock_total - item.stock_buffer - (item.rented || 0));
      if (status === 'available' && available <= 0) return false;
      if (status === 'low' && (available <= 0 || available > 10)) return false;
      if (status === 'out' && available > 0) return false;
    }

    // Location filter
    if (location && item.location !== location) {
      return false;
    }

    return true;
  });

  renderInventory(filtered);
}

/**
 * Render inventory table/grid
 */
function renderInventory(data = inventoryData) {
  if (currentView === 'table') {
    renderTableView(data);
  } else {
    renderGridView(data);
  }
}

/**
 * Render table view
 */
function renderTableView(data) {
  const tbody = document.getElementById('inventory-tbody');
  if (!tbody) return;

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: var(--color-gray);">
          Geen producten gevonden
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = data.map(item => {
    const available = item.available ?? (item.stock_total - item.stock_buffer - (item.rented || 0));
    const rented = item.rented || 0;
    const statusClass = available <= 0 ? 'error' : available <= 10 ? 'warning' : 'success';
    const statusText = available <= 0 ? 'Niet beschikbaar' : available <= 10 ? 'Lage voorraad' : 'Beschikbaar';
    const locationText = getLocationText(item.location || 'warehouse');

    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: var(--space-sm);">
            <div style="width: 40px; height: 40px; background: var(--color-off-white); display: flex; align-items: center; justify-content: center;">
              ${item.images?.[0] ? `<img src="${item.images[0]}" alt="" style="width: 100%; height: 100%; object-fit: cover;">` : '📦'}
            </div>
            <strong>${item.name}</strong>
          </div>
        </td>
        <td style="font-family: var(--font-mono); font-size: 0.85rem;">${item.sku || '-'}</td>
        <td>${item.category_name || '-'}</td>
        <td><strong>${item.stock_total}</strong></td>
        <td class="text-${statusClass}"><strong>${available}</strong></td>
        <td>${rented}</td>
        <td>
          <button class="btn btn--ghost btn--sm location-btn" data-id="${item.id}" style="font-size: 0.75rem;">
            ${locationText}
          </button>
        </td>
        <td>
          <span class="status-badge status-badge--${statusClass === 'success' ? 'confirmed' : statusClass === 'warning' ? 'pending' : 'cancelled'}">
            <span class="status-badge__dot"></span>
            ${statusText}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: var(--space-xs);">
            <button class="btn btn--ghost btn--sm adjust-btn" data-id="${item.id}" title="Voorraad aanpassen">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="btn btn--ghost btn--sm history-btn" data-id="${item.id}" title="Geschiedenis">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Add event listeners
  tbody.querySelectorAll('.location-btn').forEach(btn => {
    btn.addEventListener('click', () => showLocationModal(btn.dataset.id));
  });

  tbody.querySelectorAll('.adjust-btn').forEach(btn => {
    btn.addEventListener('click', () => showStockModal(btn.dataset.id));
  });

  tbody.querySelectorAll('.history-btn').forEach(btn => {
    btn.addEventListener('click', () => showHistoryModal(btn.dataset.id));
  });
}

/**
 * Render grid view
 */
function renderGridView(data) {
  const grid = document.getElementById('inventory-grid-view');
  if (!grid) return;

  if (data.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--color-gray);">
        Geen producten gevonden
      </div>
    `;
    return;
  }

  grid.innerHTML = data.map(item => {
    const available = item.available ?? (item.stock_total - item.stock_buffer - (item.rented || 0));
    const statusClass = available <= 0 ? 'error' : available <= 10 ? 'warning' : 'success';

    return `
      <div class="inventory-card">
        <div class="inventory-card__image">
          ${item.images?.[0] ? `<img src="${item.images[0]}" alt="${item.name}">` : '<div class="placeholder">📦</div>'}
        </div>
        <div class="inventory-card__content">
          <h3 class="inventory-card__title">${item.name}</h3>
          <p class="inventory-card__sku">${item.sku || '-'}</p>
          <div class="inventory-card__stats">
            <div class="inventory-stat">
              <span class="inventory-stat__value">${item.stock_total}</span>
              <span class="inventory-stat__label">Totaal</span>
            </div>
            <div class="inventory-stat inventory-stat--${statusClass}">
              <span class="inventory-stat__value">${available}</span>
              <span class="inventory-stat__label">Beschikbaar</span>
            </div>
            <div class="inventory-stat">
              <span class="inventory-stat__value">${item.rented || 0}</span>
              <span class="inventory-stat__label">Verhuurd</span>
            </div>
          </div>
          <button class="btn btn--secondary btn--sm btn--full adjust-btn" data-id="${item.id}">
            Voorraad aanpassen
          </button>
        </div>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.adjust-btn').forEach(btn => {
    btn.addEventListener('click', () => showStockModal(btn.dataset.id));
  });
}

/**
 * Update stats cards
 */
function updateStats() {
  const totalProducts = inventoryData.length;
  let totalAvailable = 0;
  let totalRented = 0;
  let lowStock = 0;

  inventoryData.forEach(item => {
    const available = item.available ?? (item.stock_total - item.stock_buffer - (item.rented || 0));
    totalAvailable += Math.max(0, available);
    totalRented += item.rented || 0;
    if (available <= 10 && available > 0) lowStock++;
  });

  document.getElementById('stat-total-products').textContent = totalProducts;
  document.getElementById('stat-available').textContent = totalAvailable;
  document.getElementById('stat-rented').textContent = totalRented;
  document.getElementById('stat-low-stock').textContent = lowStock;
}

/**
 * Show location modal
 */
function showLocationModal(productId) {
  const product = inventoryData.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('location-modal');
  const body = document.getElementById('location-modal-body');

  body.innerHTML = `
    <div class="location-details">
      <h4>${product.name}</h4>
      <p style="color: var(--color-gray); margin-bottom: var(--space-lg);">SKU: ${product.sku || '-'}</p>
      
      <div class="location-breakdown">
        <div class="location-item">
          <div class="location-item__icon" style="background: var(--color-success);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
          </div>
          <div class="location-item__content">
            <span class="location-item__label">Magazijn</span>
            <span class="location-item__value">${product.stock_total - (product.rented || 0)} stuks</span>
          </div>
        </div>
        
        <div class="location-item">
          <div class="location-item__icon" style="background: var(--color-warning);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="location-item__content">
            <span class="location-item__label">Bij klanten (verhuurd)</span>
            <span class="location-item__value">${product.rented || 0} stuks</span>
          </div>
        </div>
        
        <div class="location-item">
          <div class="location-item__icon" style="background: var(--color-info);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
          <div class="location-item__content">
            <span class="location-item__label">Onderweg</span>
            <span class="location-item__value">0 stuks</span>
          </div>
        </div>
        
        <div class="location-item">
          <div class="location-item__icon" style="background: var(--color-error);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </div>
          <div class="location-item__content">
            <span class="location-item__label">Onderhoud/Reparatie</span>
            <span class="location-item__value">0 stuks</span>
          </div>
        </div>
      </div>
      
      <div style="margin-top: var(--space-xl); padding-top: var(--space-lg); border-top: 1px solid var(--color-light-gray);">
        <h5 style="margin-bottom: var(--space-md);">Actieve Verhuren</h5>
        <p style="color: var(--color-gray); font-size: 0.875rem;">Geen actieve verhuren voor dit product.</p>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

/**
 * Show stock adjustment modal
 */
function showStockModal(productId) {
  const product = inventoryData.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('stock-modal');
  document.getElementById('stock-product-id').value = productId;
  document.getElementById('stock-product-name').value = product.name;
  document.getElementById('stock-current').value = product.stock_total;
  document.getElementById('stock-amount').value = '';
  document.getElementById('stock-action').value = 'add';
  document.getElementById('stock-reason').value = 'purchase';
  document.getElementById('stock-note').value = '';

  modal.classList.add('active');
}

/**
 * Save stock adjustment
 */
async function saveStockAdjustment() {
  const productId = document.getElementById('stock-product-id').value;
  const action = document.getElementById('stock-action').value;
  const amount = parseInt(document.getElementById('stock-amount').value);
  const reason = document.getElementById('stock-reason').value;
  const note = document.getElementById('stock-note').value;

  if (!amount || amount < 0) {
    showToast('Voer een geldig aantal in', 'error');
    return;
  }

  const product = inventoryData.find(p => p.id === productId);
  if (!product) return;

  let newStock;
  if (action === 'add') {
    newStock = product.stock_total + amount;
  } else if (action === 'remove') {
    newStock = Math.max(0, product.stock_total - amount);
  } else {
    newStock = amount;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock_total: newStock })
    });

    const result = await response.json();

    if (result.success) {
      showToast('Voorraad aangepast', 'success');
      document.getElementById('stock-modal').classList.remove('active');
      await loadInventory();
    } else {
      showToast(result.error || 'Kon voorraad niet aanpassen', 'error');
    }
  } catch (error) {
    console.error('Stock adjustment error:', error);
    showToast('Kon voorraad niet aanpassen', 'error');
  }
}

/**
 * Show history modal (placeholder)
 */
function showHistoryModal(productId) {
  showToast('Voorraadgeschiedenis komt binnenkort', 'info');
}

/**
 * Export inventory
 */
function exportInventory() {
  const csv = [
    ['SKU', 'Product', 'Categorie', 'Totaal', 'Beschikbaar', 'Verhuurd', 'Status'].join(','),
    ...inventoryData.map(item => {
      const available = item.available ?? (item.stock_total - item.stock_buffer - (item.rented || 0));
      const status = available <= 0 ? 'Niet beschikbaar' : available <= 10 ? 'Lage voorraad' : 'Beschikbaar';
      return [
        item.sku || '',
        `"${item.name}"`,
        item.category_name || '',
        item.stock_total,
        available,
        item.rented || 0,
        status
      ].join(',');
    })
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `voorraad-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);

  showToast('Voorraad geëxporteerd', 'success');
}

/**
 * Get location text
 */
function getLocationText(location) {
  const locations = {
    warehouse: '📦 Magazijn',
    rented: '🏠 Bij klant',
    transit: '🚚 Onderweg',
    maintenance: '🔧 Onderhoud'
  };
  return locations[location] || location;
}
