/**
 * Tafel Totaal - Admin Order Detail Page
 */

import { adminAPI } from '../../lib/api.js';
import { formatPrice, formatDateShort, formatDate, getQueryParam, showToast } from '../../lib/utils.js';
import { requireAdmin } from '../../lib/guards.js';
import { loadHeader } from '../../components/header.js';

let currentOrder = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAdmin();
  if (!user) return;

  await loadHeader();
  await loadOrder();
  initStatusUpdate();
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
