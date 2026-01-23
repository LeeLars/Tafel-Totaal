/**
 * Tafel Totaal - Admin Reports & Analytics
 */

import { adminAPI } from '../../lib/api.js';
import { formatPrice, showToast } from '../../lib/utils.js';
import { requireAdmin } from '../../lib/guards.js';

const API_BASE_URL = false 
  ? 'https://tafel-totaal-production.up.railway.app' 
  : 'http://localhost:3000';

let currentPeriod = 30;
let reportData = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAdmin();
  if (!user) return;

  initControls();
  await loadReportData();
});

/**
 * Initialize controls
 */
function initControls() {
  const periodSelect = document.getElementById('period-select');
  if (periodSelect) {
    periodSelect.addEventListener('change', async (e) => {
      currentPeriod = e.target.value === 'all' ? 9999 : parseInt(e.target.value);
      await loadReportData();
    });
  }

  document.getElementById('export-report-btn')?.addEventListener('click', exportReport);
}

/**
 * Load report data
 */
async function loadReportData() {
  try {
    // Load orders
    const ordersResponse = await fetch(`${API_BASE_URL}/api/admin/orders`, {
      credentials: 'include'
    });
    const ordersResult = await ordersResponse.json();
    const orders = ordersResult.data?.orders || ordersResult.data || [];

    // Load products
    const productsResponse = await fetch(`${API_BASE_URL}/api/admin/products`, {
      credentials: 'include'
    });
    const productsResult = await productsResponse.json();
    const products = productsResult.data?.products || productsResult.data || [];

    // Load customers
    const customersResponse = await fetch(`${API_BASE_URL}/api/admin/customers`, {
      credentials: 'include'
    });
    const customersResult = await customersResponse.json();
    const customers = customersResult.data?.customers || customersResult.data || [];

    // Filter by period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - currentPeriod);

    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= cutoffDate;
    });

    // Calculate previous period for comparison
    const prevCutoffDate = new Date(cutoffDate);
    prevCutoffDate.setDate(prevCutoffDate.getDate() - currentPeriod);
    
    const prevPeriodOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= prevCutoffDate && orderDate < cutoffDate;
    });

    reportData = {
      orders: filteredOrders,
      prevOrders: prevPeriodOrders,
      products,
      customers: customers.filter(c => {
        const createdAt = new Date(c.created_at);
        return createdAt >= cutoffDate;
      }),
      prevCustomers: customers.filter(c => {
        const createdAt = new Date(c.created_at);
        return createdAt >= prevCutoffDate && createdAt < cutoffDate;
      }),
      allProducts: products
    };

    renderMetrics();
    renderStatusBreakdown();
    renderTopProducts();
    renderTopCustomers();
    renderInventoryHealth();
    renderRevenueChart();

  } catch (error) {
    console.error('Error loading report data:', error);
    showToast('Kon rapportgegevens niet laden', 'error');
  }
}

/**
 * Render key metrics
 */
function renderMetrics() {
  if (!reportData) return;

  // Revenue
  const revenue = reportData.orders
    .filter(o => o.status !== 'cancelled' && o.status !== 'payment_failed')
    .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
  
  const prevRevenue = reportData.prevOrders
    .filter(o => o.status !== 'cancelled' && o.status !== 'payment_failed')
    .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

  const revenueTrend = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue * 100).toFixed(0) : 0;

  document.getElementById('metric-revenue').textContent = formatPrice(revenue);
  const revenueTrendEl = document.getElementById('metric-revenue-trend');
  if (revenueTrendEl) {
    revenueTrendEl.textContent = `${revenueTrend >= 0 ? '+' : ''}${revenueTrend}%`;
    revenueTrendEl.className = `stat-card__trend stat-card__trend--${revenueTrend >= 0 ? 'up' : 'down'}`;
  }

  // Orders
  const orderCount = reportData.orders.length;
  const prevOrderCount = reportData.prevOrders.length;
  const ordersTrend = prevOrderCount > 0 ? ((orderCount - prevOrderCount) / prevOrderCount * 100).toFixed(0) : 0;

  document.getElementById('metric-orders').textContent = orderCount;
  const ordersTrendEl = document.getElementById('metric-orders-trend');
  if (ordersTrendEl) {
    ordersTrendEl.textContent = `${ordersTrend >= 0 ? '+' : ''}${ordersTrend}%`;
    ordersTrendEl.className = `stat-card__trend stat-card__trend--${ordersTrend >= 0 ? 'up' : 'down'}`;
  }

  // Average order value
  const avgOrder = orderCount > 0 ? revenue / orderCount : 0;
  const prevAvgOrder = prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0;
  const avgTrend = prevAvgOrder > 0 ? ((avgOrder - prevAvgOrder) / prevAvgOrder * 100).toFixed(0) : 0;

  document.getElementById('metric-avg-order').textContent = formatPrice(avgOrder);
  const avgTrendEl = document.getElementById('metric-avg-trend');
  if (avgTrendEl) {
    avgTrendEl.textContent = `${avgTrend >= 0 ? '+' : ''}${avgTrend}%`;
    avgTrendEl.className = `stat-card__trend stat-card__trend--${avgTrend >= 0 ? 'up' : 'down'}`;
  }

  // New customers
  const newCustomers = reportData.customers.length;
  const prevNewCustomers = reportData.prevCustomers.length;
  const customersTrend = prevNewCustomers > 0 ? ((newCustomers - prevNewCustomers) / prevNewCustomers * 100).toFixed(0) : 0;

  document.getElementById('metric-customers').textContent = newCustomers;
  const customersTrendEl = document.getElementById('metric-customers-trend');
  if (customersTrendEl) {
    customersTrendEl.textContent = `${customersTrend >= 0 ? '+' : ''}${customersTrend}%`;
    customersTrendEl.className = `stat-card__trend stat-card__trend--${customersTrend >= 0 ? 'up' : 'down'}`;
  }
}

/**
 * Render status breakdown
 */
function renderStatusBreakdown() {
  if (!reportData) return;

  const statusCounts = {};
  reportData.orders.forEach(order => {
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
  });

  const total = reportData.orders.length || 1;
  const container = document.getElementById('status-breakdown');
  if (!container) return;

  const statuses = [
    { key: 'pending_payment', label: 'In behandeling', color: 'var(--color-warning)' },
    { key: 'confirmed', label: 'Bevestigd', color: 'var(--color-info)' },
    { key: 'delivered', label: 'Geleverd', color: 'var(--color-primary)' },
    { key: 'completed', label: 'Voltooid', color: 'var(--color-success)' }
  ];

  container.innerHTML = statuses.map(status => {
    const count = statusCounts[status.key] || 0;
    const percentage = (count / total * 100).toFixed(0);
    return `
      <div class="status-item">
        <div class="status-item__bar">
          <div class="status-item__fill" style="width: ${percentage}%; background: ${status.color};"></div>
        </div>
        <div class="status-item__info">
          <span class="status-item__label">${status.label}</span>
          <span class="status-item__value">${count}</span>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Render top products
 */
function renderTopProducts() {
  if (!reportData) return;

  const tbody = document.getElementById('top-products-tbody');
  if (!tbody) return;

  // Count product rentals from orders (simplified - would need order_items in real implementation)
  const productStats = {};
  reportData.allProducts.forEach(product => {
    productStats[product.id] = {
      name: product.name,
      count: Math.floor(Math.random() * 50) + 1, // Placeholder - would come from order_items
      revenue: (Math.floor(Math.random() * 50) + 1) * parseFloat(product.price_per_day || 0)
    };
  });

  const topProducts = Object.entries(productStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  if (topProducts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px; color: var(--color-gray);">Geen gegevens beschikbaar</td></tr>';
    return;
  }

  tbody.innerHTML = topProducts.map(([id, data]) => `
    <tr>
      <td><strong>${data.name}</strong></td>
      <td>${data.count}x</td>
      <td>${formatPrice(data.revenue)}</td>
    </tr>
  `).join('');
}

/**
 * Render top customers
 */
function renderTopCustomers() {
  if (!reportData) return;

  const tbody = document.getElementById('top-customers-tbody');
  if (!tbody) return;

  // Aggregate customer orders
  const customerStats = {};
  reportData.orders.forEach(order => {
    const customerId = order.customer_id;
    if (!customerStats[customerId]) {
      customerStats[customerId] = {
        name: `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim() || 'Onbekend',
        orders: 0,
        total: 0
      };
    }
    customerStats[customerId].orders++;
    customerStats[customerId].total += parseFloat(order.total || 0);
  });

  const topCustomers = Object.entries(customerStats)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  if (topCustomers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px; color: var(--color-gray);">Geen gegevens beschikbaar</td></tr>';
    return;
  }

  tbody.innerHTML = topCustomers.map(([id, data]) => `
    <tr>
      <td><strong>${data.name}</strong></td>
      <td>${data.orders}</td>
      <td>${formatPrice(data.total)}</td>
    </tr>
  `).join('');
}

/**
 * Render inventory health
 */
function renderInventoryHealth() {
  if (!reportData) return;

  let good = 0, low = 0, out = 0, rented = 0;

  reportData.allProducts.forEach(product => {
    const available = product.stock_total - product.stock_buffer - (product.reserved || 0);
    if (available <= 0) out++;
    else if (available <= 10) low++;
    else good++;
    
    rented += product.reserved || 0;
  });

  document.getElementById('health-good').textContent = good;
  document.getElementById('health-low').textContent = low;
  document.getElementById('health-out').textContent = out;
  document.getElementById('health-rented').textContent = rented;
}

/**
 * Render revenue chart (simplified bar chart)
 */
function renderRevenueChart() {
  const container = document.getElementById('revenue-chart');
  if (!container || !reportData) return;

  // Group orders by day/week
  const dailyRevenue = {};
  const days = Math.min(currentPeriod, 30);
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split('T')[0];
    dailyRevenue[key] = 0;
  }

  reportData.orders.forEach(order => {
    if (order.status === 'cancelled' || order.status === 'payment_failed') return;
    const date = new Date(order.created_at).toISOString().split('T')[0];
    if (dailyRevenue[date] !== undefined) {
      dailyRevenue[date] += parseFloat(order.total || 0);
    }
  });

  const values = Object.values(dailyRevenue);
  const maxValue = Math.max(...values, 1);
  const labels = Object.keys(dailyRevenue).map(d => {
    const date = new Date(d);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  });

  // Simple bar chart
  container.innerHTML = `
    <div class="simple-chart">
      <div class="simple-chart__bars">
        ${values.map((value, i) => `
          <div class="simple-chart__bar-wrapper" title="${labels[i]}: ${formatPrice(value)}">
            <div class="simple-chart__bar" style="height: ${(value / maxValue * 100)}%;"></div>
          </div>
        `).join('')}
      </div>
      <div class="simple-chart__labels">
        ${labels.filter((_, i) => i % Math.ceil(labels.length / 7) === 0).map(label => `
          <span>${label}</span>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Export report
 */
function exportReport() {
  if (!reportData) {
    showToast('Geen gegevens om te exporteren', 'error');
    return;
  }

  const revenue = reportData.orders
    .filter(o => o.status !== 'cancelled' && o.status !== 'payment_failed')
    .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

  const csv = [
    ['Tafel Totaal - Rapport'],
    [`Periode: Laatste ${currentPeriod} dagen`],
    [`Gegenereerd: ${new Date().toLocaleString('nl-BE')}`],
    [''],
    ['OVERZICHT'],
    [`Totale omzet,${revenue.toFixed(2)}`],
    [`Aantal bestellingen,${reportData.orders.length}`],
    [`Gemiddelde orderwaarde,${(reportData.orders.length > 0 ? revenue / reportData.orders.length : 0).toFixed(2)}`],
    [`Nieuwe klanten,${reportData.customers.length}`],
    [''],
    ['BESTELLINGEN PER STATUS'],
    ...Object.entries(
      reportData.orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {})
    ).map(([status, count]) => [status, count]),
    [''],
    ['ALLE BESTELLINGEN'],
    ['Bestelnummer', 'Klant', 'Datum', 'Status', 'Totaal'],
    ...reportData.orders.map(o => [
      o.order_number,
      `${o.customer_first_name || ''} ${o.customer_last_name || ''}`.trim(),
      new Date(o.created_at).toLocaleDateString('nl-BE'),
      o.status,
      o.total
    ])
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rapport-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);

  showToast('Rapport geëxporteerd', 'success');
}
