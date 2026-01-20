/**
 * Tafel Totaal - Admin Order Picking Page
 */

import { adminAPI } from '../../lib/api.js';
import { formatPrice, formatDateShort, formatDateTime, showToast } from '../../lib/utils.js';
import { requireAdmin } from '../../lib/guards.js';

let currentPage = 1;
let currentPickingStatus = '';
let currentOrderStatus = '';

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
  const orderStatusFilter = document.getElementById('order-status-filter');
  
  if (pickingStatusFilter) {
    pickingStatusFilter.addEventListener('change', () => {
      currentPickingStatus = pickingStatusFilter.value;
      currentPage = 1;
      loadPickingOrders();
    });
  }
  
  if (orderStatusFilter) {
    orderStatusFilter.addEventListener('change', () => {
      currentOrderStatus = orderStatusFilter.value;
      currentPage = 1;
      loadPickingOrders();
    });
  }
}

/**
 * Load picking orders
 */
async function loadPickingOrders() {
  const tbody = document.getElementById('picking-table');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align: center; padding: 40px;">
        <div class="spinner"></div>
      </td>
    </tr>
  `;

  try {
    const filters = {
      page: currentPage,
      limit: 20
    };
    
    if (currentOrderStatus) {
      filters.status = currentOrderStatus;
    }

    const response = await adminAPI.getOrders(filters);
    let orders = response.data || [];
    
    // Filter by picking status if selected
    if (currentPickingStatus) {
      orders = orders.filter(order => {
        const pickingStatus = order.picking_status || 'not_started';
        return pickingStatus === currentPickingStatus;
      });
    }
    
    // Sort by deadline (orders with deadline first, then by date)
    orders.sort((a, b) => {
      if (a.preparation_deadline && !b.preparation_deadline) return -1;
      if (!a.preparation_deadline && b.preparation_deadline) return 1;
      if (a.preparation_deadline && b.preparation_deadline) {
        return new Date(a.preparation_deadline) - new Date(b.preparation_deadline);
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

    if (orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: var(--color-gray);">
            Geen orders gevonden
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = orders.map(order => createPickingRow(order)).join('');
  } catch (error) {
    console.error('Error loading picking orders:', error);
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--color-error);">
          Kon orders niet laden
        </td>
      </tr>
    `;
  }
}

/**
 * Create picking table row
 */
function createPickingRow(order) {
  const pickingStatus = order.picking_status || 'not_started';
  const pickingStatusInfo = getPickingStatusInfo(pickingStatus);
  const orderStatusInfo = getOrderStatusInfo(order.status);
  
  const deadline = order.preparation_deadline 
    ? formatDateTime(order.preparation_deadline)
    : '<span style="color: var(--color-gray); font-style: italic;">Niet ingesteld</span>';
  
  const location = order.preparation_location 
    ? order.preparation_location
    : '<span style="color: var(--color-gray); font-style: italic;">Niet ingesteld</span>';
  
  // Check if deadline is approaching (within 24 hours)
  const isUrgent = order.preparation_deadline && 
    (new Date(order.preparation_deadline) - new Date()) < 24 * 60 * 60 * 1000;
  
  return `
    <tr style="cursor: pointer;" data-order-id="${order.id}" onclick="window.location.href='/Tafel-Totaal/admin/order.html?id=${order.id}'">
      <td>
        <strong>${order.order_number}</strong>
        <br><small style="color: var(--color-gray);">${formatDateShort(order.created_at)}</small>
      </td>
      <td>
        <div class="admin-table__customer">
          <span class="admin-table__customer-name">${order.first_name} ${order.last_name}</span>
          <span class="admin-table__customer-email">${order.customer_email}</span>
        </div>
      </td>
      <td ${isUrgent ? 'style="background: rgba(239, 68, 68, 0.1);"' : ''}>
        ${isUrgent ? '⚠️ ' : ''}${deadline}
      </td>
      <td>${location}</td>
      <td>
        <span class="status-badge status-badge--${pickingStatusInfo.class}" style="background-color: ${pickingStatusInfo.bgColor}; color: ${pickingStatusInfo.color}; border-color: ${pickingStatusInfo.color};">
          <span class="status-badge__dot"></span>
          ${pickingStatusInfo.label}
        </span>
      </td>
      <td>
        <span class="status-badge status-badge--${orderStatusInfo.class}" style="background-color: ${orderStatusInfo.bgColor}; color: ${orderStatusInfo.color}; border-color: ${orderStatusInfo.color};">
          <span class="status-badge__dot"></span>
          ${orderStatusInfo.label}
        </span>
      </td>
      <td>
        <div class="admin-table__actions">
          <a href="/Tafel-Totaal/admin/order.html?id=${order.id}#picking" class="btn btn--primary btn--sm" onclick="event.stopPropagation();">
            Start Picking
          </a>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Get picking status display info with colors
 */
function getPickingStatusInfo(status) {
  const statusMap = {
    'not_started': { 
      label: 'Niet gestart', 
      class: 'pending',
      color: '#DC2626',
      bgColor: 'rgba(220, 38, 38, 0.1)'
    },
    'in_progress': { 
      label: 'Bezig', 
      class: 'preparing',
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    'completed': { 
      label: 'Klaar', 
      class: 'confirmed',
      color: '#16A34A',
      bgColor: 'rgba(22, 163, 74, 0.1)'
    }
  };
  return statusMap[status] || statusMap['not_started'];
}

/**
 * Get order status display info with colors
 */
function getOrderStatusInfo(status) {
  const statusMap = {
    'pending_payment': { 
      label: 'Wacht op betaling', 
      class: 'pending',
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    'confirmed': { 
      label: 'Bevestigd', 
      class: 'confirmed',
      color: '#16A34A',
      bgColor: 'rgba(22, 163, 74, 0.1)'
    },
    'preparing': { 
      label: 'In voorbereiding', 
      class: 'preparing',
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    'ready_for_delivery': { 
      label: 'Klaar voor levering', 
      class: 'confirmed',
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    },
    'delivered': { 
      label: 'Geleverd', 
      class: 'delivered',
      color: '#903D3E',
      bgColor: 'rgba(144, 61, 62, 0.1)'
    },
    'returned': { 
      label: 'Retour ontvangen', 
      class: 'confirmed',
      color: '#06B6D4',
      bgColor: 'rgba(6, 182, 212, 0.1)'
    },
    'completed': { 
      label: 'Afgerond', 
      class: 'completed',
      color: '#059669',
      bgColor: 'rgba(5, 150, 105, 0.15)'
    },
    'cancelled': { 
      label: 'Geannuleerd', 
      class: 'cancelled',
      color: '#DC2626',
      bgColor: 'rgba(220, 38, 38, 0.1)'
    }
  };
  return statusMap[status] || statusMap['pending_payment'];
}
