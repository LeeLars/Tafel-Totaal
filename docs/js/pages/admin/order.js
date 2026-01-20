/**
 * Tafel Totaal - Admin Order Detail Page
 */

import { adminAPI } from '../../lib/api.js';
import { formatPrice, formatDateShort, formatDate, getQueryParam, showToast } from '../../lib/utils.js';
import { requireAdmin } from '../../lib/guards.js';
import { loadHeader } from '../../components/header.js';

let currentOrder = null;
let pickingData = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAdmin();
  if (!user) return;

  await loadHeader();
  await loadOrder();
  initStatusUpdate();
  await loadPickingDetails();
  initPickingControls();
});

/**
 * Load order details
 */
async function loadOrder() {
  const orderId = getQueryParam('id');
  
  if (!orderId) {
    showError();
    return;
  }

  try {
    const response = await adminAPI.getOrderById(orderId);
    currentOrder = response.data;

    if (!currentOrder) {
      showError();
      return;
    }

    renderOrder();
    showContent();
  } catch (error) {
    console.error('Error loading order:', error);
    showError();
  }
}

/**
 * Show error state
 */
function showError() {
  document.getElementById('order-loading')?.classList.add('hidden');
  document.getElementById('order-error')?.classList.remove('hidden');
  document.getElementById('order-detail')?.classList.add('hidden');
}

/**
 * Show content
 */
function showContent() {
  document.getElementById('order-loading')?.classList.add('hidden');
  document.getElementById('order-error')?.classList.add('hidden');
  document.getElementById('order-detail')?.classList.remove('hidden');
}

/**
 * Render order details
 */
function renderOrder() {
  if (!currentOrder) return;

  // Update page title
  document.title = `Bestelling ${currentOrder.order_number} | Admin | Tafel Totaal`;

  // Header info
  document.getElementById('order-number').textContent = currentOrder.order_number;
  document.getElementById('order-title').textContent = `Bestelling ${currentOrder.order_number}`;
  document.getElementById('order-date').textContent = formatDate(currentOrder.created_at);
  
  const statusInfo = getStatusInfo(currentOrder.status);
  document.getElementById('order-status-text').textContent = statusInfo.label;

  // Set status select
  const statusSelect = document.getElementById('status-select');
  if (statusSelect) {
    statusSelect.value = currentOrder.status;
  }

  // PDF links
  document.getElementById('picking-list-btn').href = adminAPI.getPickingListUrl(currentOrder.id);
  document.getElementById('invoice-btn').href = adminAPI.getInvoiceUrl(currentOrder.id);

  // Customer info
  const customerInfo = `
    <strong>${currentOrder.first_name} ${currentOrder.last_name}</strong><br>
    ${currentOrder.customer_email}<br>
    ${currentOrder.phone || '-'}
  `;
  document.getElementById('customer-info').innerHTML = customerInfo;

  // Delivery info
  const deliveryMethod = currentOrder.delivery_method === 'PICKUP' ? 'Afhalen' : 'Bezorgen';
  let deliveryInfo = `<strong>${deliveryMethod}</strong>`;
  
  if (currentOrder.delivery_address) {
    const addr = currentOrder.delivery_address;
    deliveryInfo += `<br>${addr.street} ${addr.house_number}<br>${addr.postal_code} ${addr.city}`;
  }
  
  if (currentOrder.rental_start_date && currentOrder.rental_end_date) {
    deliveryInfo += `<br><br><strong>Verhuurperiode:</strong><br>${formatDate(currentOrder.rental_start_date)} t/m ${formatDate(currentOrder.rental_end_date)}`;
  }
  
  document.getElementById('delivery-info').innerHTML = deliveryInfo;

  // Items
  const items = currentOrder.items || [];
  const itemsHtml = items.map(item => `
    <tr>
      <td><strong>${item.name || (item.item_type === 'package' ? 'Pakket' : 'Product')}</strong></td>
      <td>${item.item_type === 'package' ? 'Pakket' : 'Product'}${item.persons ? ` (${item.persons} pers.)` : ''}</td>
      <td>${item.quantity}</td>
      <td>${formatPrice(item.unit_price)}</td>
      <td class="admin-table__amount">${formatPrice(item.line_total)}</td>
    </tr>
  `).join('');
  document.getElementById('order-items').innerHTML = itemsHtml || '<tr><td colspan="5">Geen items</td></tr>';

  // Summary
  const subtotal = currentOrder.subtotal || items.reduce((sum, item) => sum + (item.line_total || 0), 0);
  document.getElementById('summary-subtotal').textContent = formatPrice(subtotal);
  document.getElementById('summary-delivery').textContent = formatPrice(currentOrder.delivery_cost || 0);
  document.getElementById('summary-deposit').textContent = formatPrice(currentOrder.deposit_total || 0);
  document.getElementById('summary-total').textContent = formatPrice(currentOrder.total);

  // Notes
  if (currentOrder.notes) {
    document.getElementById('order-notes').textContent = currentOrder.notes;
    document.getElementById('order-notes').style.fontStyle = 'normal';
    document.getElementById('order-notes').style.color = 'var(--color-black)';
  }
}

/**
 * Initialize status update
 */
function initStatusUpdate() {
  const statusSelect = document.getElementById('status-select');
  if (!statusSelect) return;

  statusSelect.addEventListener('change', async () => {
    const newStatus = statusSelect.value;
    const oldStatus = currentOrder.status;

    if (newStatus === oldStatus) return;

    statusSelect.disabled = true;

    try {
      await adminAPI.updateOrderStatus(currentOrder.id, newStatus);
      
      currentOrder.status = newStatus;
      const statusInfo = getStatusInfo(newStatus);
      document.getElementById('order-status-text').textContent = statusInfo.label;
      
      showToast(`Status bijgewerkt naar "${statusInfo.label}"`, 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Kon status niet bijwerken', 'error');
      statusSelect.value = oldStatus;
    } finally {
      statusSelect.disabled = false;
    }
  });
}

/**
 * Load picking details
 */
async function loadPickingDetails() {
  if (!currentOrder) return;

  try {
    const response = await adminAPI.getPickingDetails(currentOrder.id);
    pickingData = response.data;

    renderPickingSection();
  } catch (error) {
    console.error('Error loading picking details:', error);
  }
}

/**
 * Render picking section
 */
function renderPickingSection() {
  if (!pickingData) return;

  // Set picking status
  const pickingStatus = pickingData.picking_status || 'not_started';
  const pickingStatusSelect = document.getElementById('picking-status-select');
  if (pickingStatusSelect) {
    pickingStatusSelect.value = pickingStatus;
  }

  // Update status badge
  const statusInfo = getPickingStatusInfo(pickingStatus);
  const statusBadge = document.getElementById('picking-status-badge');
  if (statusBadge) {
    statusBadge.innerHTML = `
      <span class="status-badge status-badge--${statusInfo.class}">
        <span class="status-badge__dot"></span>
        <span>${statusInfo.label}</span>
      </span>
    `;
  }

  // Set deadline
  if (pickingData.preparation_deadline) {
    const deadline = new Date(pickingData.preparation_deadline);
    const deadlineInput = document.getElementById('preparation-deadline');
    if (deadlineInput) {
      deadlineInput.value = deadline.toISOString().slice(0, 16);
    }
  }

  // Set location
  if (pickingData.preparation_location) {
    const locationInput = document.getElementById('preparation-location');
    if (locationInput) {
      locationInput.value = pickingData.preparation_location;
    }
  }

  // Render picking items
  renderPickingItems();
}

/**
 * Render picking items checklist
 */
function renderPickingItems() {
  if (!pickingData || !pickingData.items) return;

  const container = document.getElementById('picking-items');
  if (!container) return;

  const items = pickingData.items.filter(item => item.id);
  
  if (items.length === 0) {
    container.innerHTML = '<p style="color: var(--color-gray); font-style: italic;">Geen items om te picken</p>';
    return;
  }

  container.innerHTML = items.map(item => {
    const isPicked = item.picked || false;
    const location = item.warehouse_location || 'Locatie niet ingesteld';
    
    return `
      <div class="picking-item" style="display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md); background: ${isPicked ? '#E8F5E9' : 'var(--color-off-white)'}; border: 1px solid ${isPicked ? '#81C784' : 'var(--border-color)'}; transition: all 0.2s;">
        <input 
          type="checkbox" 
          id="pick-${item.id}" 
          data-item-id="${item.id}"
          ${isPicked ? 'checked' : ''}
          style="width: 20px; height: 20px; cursor: pointer;"
        >
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-xs);">
            <strong style="font-size: var(--font-size-md);">${item.product_name || 'Product'}</strong>
            <span style="background: var(--color-primary); color: white; padding: 2px 8px; font-size: 0.75rem; font-weight: 600;">x${item.quantity}</span>
          </div>
          <div style="display: flex; align-items: center; gap: var(--space-md); font-size: var(--font-size-sm); color: var(--color-gray);">
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              ${location}
            </span>
            ${item.product_sku ? `<span>SKU: ${item.product_sku}</span>` : ''}
          </div>
        </div>
        ${isPicked ? `<span style="color: #2E7D32; font-weight: 600; font-size: var(--font-size-sm);">✓ Gepickt</span>` : ''}
      </div>
    `;
  }).join('');

  // Add event listeners to checkboxes
  items.forEach(item => {
    const checkbox = document.getElementById(`pick-${item.id}`);
    if (checkbox) {
      checkbox.addEventListener('change', async (e) => {
        await handleItemPicked(item.id, e.target.checked);
      });
    }
  });
}

/**
 * Handle item picked checkbox
 */
async function handleItemPicked(itemId, picked) {
  try {
    await adminAPI.updateItemPicked(currentOrder.id, itemId, picked);
    showToast(picked ? 'Item gepickt' : 'Item niet meer gepickt', 'success');
    await loadPickingDetails();
  } catch (error) {
    console.error('Error updating item picked:', error);
    showToast('Kon item status niet bijwerken', 'error');
    await loadPickingDetails();
  }
}

/**
 * Initialize picking controls
 */
function initPickingControls() {
  // Deadline save button
  const saveDeadlineBtn = document.getElementById('save-deadline-btn');
  if (saveDeadlineBtn) {
    saveDeadlineBtn.addEventListener('click', async () => {
      const deadlineInput = document.getElementById('preparation-deadline');
      if (!deadlineInput || !deadlineInput.value) return;

      try {
        await adminAPI.updatePickingStatus(currentOrder.id, {
          preparation_deadline: new Date(deadlineInput.value).toISOString()
        });
        showToast('Deadline opgeslagen', 'success');
        await loadPickingDetails();
      } catch (error) {
        console.error('Error saving deadline:', error);
        showToast('Kon deadline niet opslaan', 'error');
      }
    });
  }

  // Location save button
  const saveLocationBtn = document.getElementById('save-location-btn');
  if (saveLocationBtn) {
    saveLocationBtn.addEventListener('click', async () => {
      const locationInput = document.getElementById('preparation-location');
      if (!locationInput) return;

      try {
        await adminAPI.updatePickingStatus(currentOrder.id, {
          preparation_location: locationInput.value
        });
        showToast('Locatie opgeslagen', 'success');
        await loadPickingDetails();
      } catch (error) {
        console.error('Error saving location:', error);
        showToast('Kon locatie niet opslaan', 'error');
      }
    });
  }

  // Picking status select
  const pickingStatusSelect = document.getElementById('picking-status-select');
  if (pickingStatusSelect) {
    pickingStatusSelect.addEventListener('change', async () => {
      const newStatus = pickingStatusSelect.value;

      try {
        await adminAPI.updatePickingStatus(currentOrder.id, {
          picking_status: newStatus
        });
        const statusInfo = getPickingStatusInfo(newStatus);
        showToast(`Picking status bijgewerkt naar "${statusInfo.label}"`, 'success');
        await loadPickingDetails();
      } catch (error) {
        console.error('Error updating picking status:', error);
        showToast('Kon picking status niet bijwerken', 'error');
        await loadPickingDetails();
      }
    });
  }
}

/**
 * Get picking status display info
 */
function getPickingStatusInfo(status) {
  const statusMap = {
    'not_started': { label: 'Niet gestart', class: 'pending' },
    'in_progress': { label: 'Bezig', class: 'preparing' },
    'completed': { label: 'Klaar', class: 'confirmed' }
  };
  return statusMap[status] || { label: status, class: 'pending' };
}

/**
 * Get status display info
 */
function getStatusInfo(status) {
  const statusMap = {
    'pending_payment': { label: 'Wacht op betaling', class: 'pending' },
    'confirmed': { label: 'Bevestigd', class: 'confirmed' },
    'preparing': { label: 'In voorbereiding', class: 'preparing' },
    'ready_for_delivery': { label: 'Klaar voor levering', class: 'confirmed' },
    'delivered': { label: 'Geleverd', class: 'delivered' },
    'returned': { label: 'Retour ontvangen', class: 'confirmed' },
    'completed': { label: 'Afgerond', class: 'completed' },
    'cancelled': { label: 'Geannuleerd', class: 'cancelled' }
  };
  return statusMap[status] || { label: status, class: 'pending' };
}
