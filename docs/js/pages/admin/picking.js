/**
 * Tafel Totaal - Admin Order Picking Page
 * Visual card-based interface for order pickers
 */

import { adminAPI } from '../../lib/api.js';
import { formatPrice, formatDateShort, formatDateTime, showToast } from '../../lib/utils.js';
import { requireAdmin } from '../../lib/guards.js';

let allOrders = [];
let currentPickingStatus = '';
let currentSort = 'deadline';
let searchQuery = '';

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAdmin();
  if (!user) return;

  initFilters();
  await loadPickingOrders();
});

/**
 * Initialize filters
 */
function initFilters() {
  const pickingStatusFilter = document.getElementById('picking-status-filter');
  const sortFilter = document.getElementById('sort-filter');
  const searchInput = document.getElementById('search-input');
  
  if (pickingStatusFilter) {
    pickingStatusFilter.addEventListener('change', () => {
      currentPickingStatus = pickingStatusFilter.value;
      renderOrders();
    });
  }
  
  if (sortFilter) {
    sortFilter.addEventListener('change', () => {
      currentSort = sortFilter.value;
      renderOrders();
    });
  }
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderOrders();
    });
  }
}

/**
 * Load picking orders with full details
 */
async function loadPickingOrders() {
  const grid = document.getElementById('picking-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div style="text-align: center; padding: 60px 0;">
      <div class="spinner" style="margin: 0 auto 20px;"></div>
      <p style="color: var(--color-gray);">Orders laden...</p>
    </div>
  `;

  try {
    // Get all orders that need picking
    const response = await adminAPI.getOrders({ limit: 100 });
    const orders = response.data || [];
    
    // Filter orders that need picking (all orders except delivered, cancelled, completed)
    allOrders = orders.filter(order => {
      const status = order.status;
      // Exclude only final statuses
      return status !== 'delivered' && status !== 'cancelled' && status !== 'completed' && status !== 'refunded';
    });
    
    // Load detailed picking info for each order
    const ordersWithDetails = await Promise.all(
      allOrders.map(async (order) => {
        try {
          const detailsResponse = await adminAPI.getPickingDetails(order.id);
          return { ...order, items: detailsResponse.data?.items || [] };
        } catch (error) {
          console.error(`Error loading details for order ${order.id}:`, error);
          return { ...order, items: [] };
        }
      })
    );
    
    allOrders = ordersWithDetails;
    renderOrders();
  } catch (error) {
    console.error('Error loading picking orders:', error);
    grid.innerHTML = `
      <div style="text-align: center; padding: 60px 0;">
        <p style="color: var(--color-error); font-size: var(--font-size-lg);">Kon orders niet laden</p>
        <button class="btn btn--primary" onclick="location.reload()">Opnieuw proberen</button>
      </div>
    `;
  }
}

/**
 * Render filtered and sorted orders
 */
function renderOrders() {
  const grid = document.getElementById('picking-grid');
  if (!grid) return;
  
  // Filter orders
  let filtered = allOrders.filter(order => {
    // Filter by picking status
    if (currentPickingStatus) {
      const pickingStatus = order.picking_status || 'not_started';
      if (pickingStatus !== currentPickingStatus) return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const searchStr = `${order.order_number} ${order.first_name} ${order.last_name} ${order.customer_email}`.toLowerCase();
      if (!searchStr.includes(searchQuery)) return false;
    }
    
    return true;
  });
  
  // Sort orders
  filtered.sort((a, b) => {
    if (currentSort === 'deadline') {
      // Urgent first, then by deadline
      const aDeadline = a.preparation_deadline ? new Date(a.preparation_deadline) : null;
      const bDeadline = b.preparation_deadline ? new Date(b.preparation_deadline) : null;
      
      if (!aDeadline && !bDeadline) return 0;
      if (!aDeadline) return 1;
      if (!bDeadline) return -1;
      
      return aDeadline - bDeadline;
    } else if (currentSort === 'customer') {
      return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
    } else if (currentSort === 'order_number') {
      return a.order_number.localeCompare(b.order_number);
    }
    return 0;
  });
  
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="text-align: center; padding: 60px 0;">
        <p style="color: var(--color-gray); font-size: var(--font-size-lg);">Geen orders gevonden</p>
        <p style="color: var(--color-gray);">Pas de filters aan om meer resultaten te zien</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = filtered.map(order => createPickingCard(order)).join('');
  
  // Add click handlers for checkboxes
  attachCheckboxHandlers();
}

/**
 * Create picking card for an order
 */
function createPickingCard(order) {
  const pickingStatus = order.picking_status || 'not_started';
  const pickingStatusInfo = getPickingStatusInfo(pickingStatus);
  
  // Check if deadline is approaching (within 24 hours)
  const isUrgent = order.preparation_deadline && 
    (new Date(order.preparation_deadline) - new Date()) < 24 * 60 * 60 * 1000;
  
  const deadline = order.preparation_deadline 
    ? formatDateTime(order.preparation_deadline)
    : 'Niet ingesteld';
  
  // Group items by type (packages vs individual products)
  const packages = {};
  const individualProducts = [];
  
  (order.items || []).forEach(item => {
    // Handle expanded package products (from getPickingDetails)
    if (item.item_type === 'package_product' && item.package_id) {
      if (!packages[item.package_id]) {
        packages[item.package_id] = {
          name: item.package_name || `Pakket`,
          items: []
        };
      }
      packages[item.package_id].items.push(item);
    } else if (item.item_type === 'package' && item.package_id) {
      // Legacy format - package as single item
      if (!packages[item.package_id]) {
        packages[item.package_id] = {
          name: item.package_name || `Pakket`,
          items: []
        };
      }
      packages[item.package_id].items.push(item);
    } else if (item.item_type === 'product') {
      individualProducts.push(item);
    }
  });
  
  const totalItems = order.items?.length || 0;
  const pickedItems = order.items?.filter(item => item.picked).length || 0;
  const progressPercent = totalItems > 0 ? Math.round((pickedItems / totalItems) * 100) : 0;
  
  return `
    <div class="admin-card" style="border-left: 4px solid ${isUrgent ? '#DC2626' : pickingStatusInfo.color}; ${isUrgent ? 'background: rgba(220, 38, 38, 0.02);' : ''}">
      <!-- Card Header -->
      <div class="admin-card__header" style="border-bottom: 1px solid var(--color-light-gray); padding: var(--space-lg);">
        <div style="display: flex; justify-content: space-between; align-items: start; gap: var(--space-md); flex-wrap: wrap;">
          <div style="flex: 1; min-width: 200px;">
            <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-xs);">
              <h3 style="font-family: var(--font-display); font-size: var(--font-size-xl); margin: 0;">${order.order_number}</h3>
              <span class="status-badge" style="background-color: ${pickingStatusInfo.bgColor}; color: ${pickingStatusInfo.color}; border: 1px solid ${pickingStatusInfo.color}; font-size: var(--font-size-sm);">
                ${pickingStatusInfo.icon} ${pickingStatusInfo.label}
              </span>
            </div>
            <div style="color: var(--color-gray); font-size: var(--font-size-sm);">
              <strong>${order.first_name} ${order.last_name}</strong> • ${order.customer_email}
            </div>
          </div>
          
          <div style="text-align: right;">
            ${isUrgent ? '<div style="color: #DC2626; font-weight: 600; font-size: var(--font-size-sm); margin-bottom: var(--space-xs);">URGENT</div>' : ''}
            <div style="font-size: var(--font-size-sm); color: var(--color-gray);">
              <strong>Deadline:</strong> ${deadline}
            </div>
            ${order.preparation_location ? `<div style="font-size: var(--font-size-sm); color: var(--color-gray); margin-top: var(--space-xs);"><strong>Locatie:</strong> ${order.preparation_location}</div>` : ''}
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div style="margin-top: var(--space-md);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xs);">
            <span style="font-size: var(--font-size-sm); font-weight: 600;">Voortgang</span>
            <span style="font-size: var(--font-size-sm); color: var(--color-gray);">${pickedItems} / ${totalItems} items</span>
          </div>
          <div style="height: 8px; background: var(--color-light-gray); border: 1px solid var(--color-black); overflow: hidden;">
            <div style="height: 100%; background: ${progressPercent === 100 ? '#16A34A' : '#F59E0B'}; width: ${progressPercent}%; transition: width 0.3s ease;"></div>
          </div>
        </div>
      </div>
      
      <!-- Card Body: Products to Pick -->
      <div class="admin-card__body" style="padding: var(--space-lg);">
        ${Object.keys(packages).length > 0 ? `
          <div style="margin-bottom: var(--space-xl);">
            <h4 style="font-family: var(--font-display); text-transform: uppercase; font-size: var(--font-size-lg); margin-bottom: var(--space-md); border-bottom: 2px solid var(--color-black); padding-bottom: var(--space-sm);">PAKKETTEN</h4>
            ${Object.entries(packages).map(([packageId, pkg]) => `
              <div style="background: var(--color-concrete); border: 1px solid var(--color-black); padding: var(--space-md); margin-bottom: var(--space-md);">
                <div style="font-weight: 600; margin-bottom: var(--space-sm); font-size: var(--font-size-md);">${pkg.name}</div>
                <div style="display: grid; gap: var(--space-sm);">
                  ${pkg.items.map(item => createProductRow(item, order.id)).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${individualProducts.length > 0 ? `
          <div>
            <h4 style="font-family: var(--font-display); text-transform: uppercase; font-size: var(--font-size-lg); margin-bottom: var(--space-md); border-bottom: 2px solid var(--color-black); padding-bottom: var(--space-sm);">LOSSE PRODUCTEN</h4>
            <div style="display: grid; gap: var(--space-sm);">
              ${individualProducts.map(item => createProductRow(item, order.id)).join('')}
            </div>
          </div>
        ` : ''}
        
        ${totalItems === 0 ? '<p style="color: var(--color-gray); text-align: center; padding: var(--space-xl);">Geen items om te picken</p>' : ''}
      </div>
      
      <!-- Card Footer: Actions -->
      <div class="admin-card__footer" style="border-top: 1px solid var(--color-light-gray); padding: var(--space-lg); background: var(--color-off-white);">
        <div style="display: flex; gap: var(--space-md); justify-content: flex-end;">
          <a href="/admin/order?id=${order.id}" class="btn btn--ghost">Bekijk Order</a>
          ${progressPercent === 100 && pickingStatus !== 'completed' ? `
            <button class="btn btn--primary" onclick="markOrderComplete('${order.id}')">Markeer als Klaar</button>
          ` : progressPercent > 0 && progressPercent < 100 ? `
            <button class="btn btn--secondary" onclick="updatePickingStatus('${order.id}', 'in_progress')">Doorgaan met Picken</button>
          ` : `
            <button class="btn btn--primary" onclick="updatePickingStatus('${order.id}', 'in_progress')">Start Picking</button>
          `}
        </div>
      </div>
    </div>
  `;
}

/**
 * Create product row for picking
 */
function createProductRow(item, orderId) {
  const isPicked = item.picked || false;
  const location = item.warehouse_location || 'Niet ingesteld';
  
  return `
    <div style="display: flex; align-items: center; gap: var(--space-md); padding: var(--space-sm); background: ${isPicked ? 'rgba(22, 163, 74, 0.1)' : 'var(--color-white)'}; border: 1px solid ${isPicked ? '#16A34A' : 'var(--color-light-gray)'}; transition: all 0.2s;">
      <label style="display: flex; align-items: center; cursor: pointer; flex: 1; gap: var(--space-md);">
        <input 
          type="checkbox" 
          ${isPicked ? 'checked' : ''}
          data-order-id="${orderId}"
          data-item-id="${item.id}"
          style="width: 24px; height: 24px; cursor: pointer;"
        >
        <div style="flex: 1;">
          <div style="font-weight: 600; ${isPicked ? 'text-decoration: line-through; color: var(--color-gray);' : ''}">
            ${item.product_name || 'Product'}
          </div>
          <div style="font-size: var(--font-size-sm); color: var(--color-gray); margin-top: 2px;">
            <span style="background: var(--color-black); color: var(--color-white); padding: 2px 6px; font-family: var(--font-mono); font-size: 11px; margin-right: var(--space-xs);">${item.product_sku || 'N/A'}</span>
            <span>Locatie: ${location}</span>
          </div>
        </div>
        <div style="font-weight: 600; font-size: var(--font-size-lg); min-width: 60px; text-align: right;">
          ${item.quantity}x
        </div>
      </label>
    </div>
  `;
}

/**
 * Attach checkbox handlers
 */
function attachCheckboxHandlers() {
  document.querySelectorAll('input[type="checkbox"][data-item-id]').forEach(checkbox => {
    checkbox.addEventListener('change', async (e) => {
      const orderId = e.target.dataset.orderId;
      const itemId = e.target.dataset.itemId;
      const isPicked = e.target.checked;
      
      try {
        await adminAPI.updateItemPicked(orderId, itemId, isPicked);
        showToast(isPicked ? 'Item gepickt' : 'Item niet gepickt', 'success');
        
        // Reload to update progress
        await loadPickingOrders();
      } catch (error) {
        console.error('Error updating item:', error);
        showToast('Fout bij updaten item', 'error');
        e.target.checked = !isPicked; // Revert
      }
    });
  });
}

/**
 * Update picking status
 */
window.updatePickingStatus = async function(orderId, status) {
  try {
    await adminAPI.updatePickingStatus(orderId, { picking_status: status });
    showToast('Status bijgewerkt', 'success');
    await loadPickingOrders();
  } catch (error) {
    console.error('Error updating status:', error);
    showToast('Fout bij updaten status', 'error');
  }
};

/**
 * Mark order as complete
 */
window.markOrderComplete = async function(orderId) {
  if (!confirm('Order markeren als klaar voor levering?')) return;
  
  try {
    await adminAPI.updatePickingStatus(orderId, { picking_status: 'completed' });
    await adminAPI.updateOrderStatus(orderId, { status: 'ready_for_delivery' });
    showToast('Order klaar voor levering', 'success');
    await loadPickingOrders();
  } catch (error) {
    console.error('Error completing order:', error);
    showToast('Fout bij afronden order', 'error');
  }
};

/**
 * Get picking status display info with colors
 */
function getPickingStatusInfo(status) {
  const statusMap = {
    'not_started': { 
      label: 'Niet gestart',
      icon: '●',
      class: 'pending',
      color: '#DC2626',
      bgColor: 'rgba(220, 38, 38, 0.1)'
    },
    'in_progress': { 
      label: 'Bezig',
      icon: '●',
      class: 'preparing',
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    'completed': { 
      label: 'Klaar',
      icon: '●',
      class: 'confirmed',
      color: '#16A34A',
      bgColor: 'rgba(22, 163, 74, 0.1)'
    }
  };
  return statusMap[status] || statusMap['not_started'];
}

