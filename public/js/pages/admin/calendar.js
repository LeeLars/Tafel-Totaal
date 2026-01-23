/**
 * Tafel Totaal - Admin Calendar
 * Rental schedule visualization
 */

import { adminAPI } from '../../lib/api.js';
import { formatPrice, showToast } from '../../lib/utils.js';
import { requireAdmin } from '../../lib/guards.js';

const API_BASE_URL = false 
  ? 'https://tafel-totaal-production.up.railway.app' 
  : 'http://localhost:3000';

let currentDate = new Date();
let currentView = 'month';
let events = [];

const MONTHS_NL = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
const DAYS_NL = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAdmin();
  if (!user) return;

  initControls();
  initModal();
  await loadEvents();
  renderCalendar();
  renderUpcomingEvents();
});

/**
 * Initialize calendar controls
 */
function initControls() {
  // Navigation
  document.getElementById('prev-month')?.addEventListener('click', () => {
    if (currentView === 'month') {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else if (currentView === 'week') {
      currentDate.setDate(currentDate.getDate() - 7);
    } else {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    renderCalendar();
  });

  document.getElementById('next-month')?.addEventListener('click', () => {
    if (currentView === 'month') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else if (currentView === 'week') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    renderCalendar();
  });

  document.getElementById('today-btn')?.addEventListener('click', () => {
    currentDate = new Date();
    renderCalendar();
  });

  // View toggle
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentView = btn.dataset.view;
      renderCalendar();
    });
  });

  // Add event button
  document.getElementById('add-event-btn')?.addEventListener('click', () => {
    showToast('Nieuwe reservering maken via Bestellingen pagina', 'info');
  });
}

/**
 * Initialize modal
 */
function initModal() {
  const modal = document.getElementById('event-modal');
  const closeBtn = document.getElementById('event-modal-close');
  const closeBtn2 = document.getElementById('event-close-btn');

  if (modal) {
    closeBtn?.addEventListener('click', () => modal.classList.remove('active'));
    closeBtn2?.addEventListener('click', () => modal.classList.remove('active'));
    modal.querySelector('.modal__backdrop')?.addEventListener('click', () => modal.classList.remove('active'));
  }
}

/**
 * Load events (orders) from API
 */
async function loadEvents() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/orders`, {
      credentials: 'include'
    });
    
    const result = await response.json();
    
    if (result.success) {
      const orders = result.data?.orders || result.data || [];
      
      // Convert orders to calendar events
      events = [];
      orders.forEach(order => {
        // Delivery event
        if (order.rental_start_date) {
          events.push({
            id: `${order.id}-delivery`,
            orderId: order.id,
            orderNumber: order.order_number,
            type: 'delivery',
            date: new Date(order.rental_start_date),
            title: `Levering ${order.order_number}`,
            customer: `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim(),
            status: order.status
          });
        }
        
        // Return event
        if (order.rental_end_date) {
          events.push({
            id: `${order.id}-return`,
            orderId: order.id,
            orderNumber: order.order_number,
            type: 'return',
            date: new Date(order.rental_end_date),
            title: `Retour ${order.order_number}`,
            customer: `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim(),
            status: order.status
          });
        }
      });
    }
  } catch (error) {
    console.error('Error loading events:', error);
  }
}

/**
 * Render calendar based on current view
 */
function renderCalendar() {
  updateTitle();
  
  if (currentView === 'month') {
    renderMonthView();
  } else if (currentView === 'week') {
    renderWeekView();
  } else {
    renderDayView();
  }
}

/**
 * Update calendar title
 */
function updateTitle() {
  const titleEl = document.getElementById('calendar-title');
  if (!titleEl) return;

  if (currentView === 'month') {
    titleEl.textContent = `${MONTHS_NL[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  } else if (currentView === 'week') {
    const weekStart = getWeekStart(currentDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    titleEl.textContent = `${weekStart.getDate()} ${MONTHS_NL[weekStart.getMonth()]} - ${weekEnd.getDate()} ${MONTHS_NL[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
  } else {
    titleEl.textContent = `${currentDate.getDate()} ${MONTHS_NL[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }
}

/**
 * Render month view
 */
function renderMonthView() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = lastDay.getDate();

  let html = `
    <div class="calendar-header">
      ${DAYS_NL.map(day => `<div class="calendar-header__day">${day}</div>`).join('')}
    </div>
    <div class="calendar-body">
  `;

  // Previous month days
  const prevMonth = new Date(year, month, 0);
  const prevMonthDays = prevMonth.getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    html += `<div class="calendar-day calendar-day--other">${day}</div>`;
  }

  // Current month days
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isToday = date.toDateString() === today.toDateString();
    const dayEvents = getEventsForDate(date);
    
    html += `
      <div class="calendar-day ${isToday ? 'calendar-day--today' : ''}" data-date="${date.toISOString()}">
        <span class="calendar-day__number">${day}</span>
        <div class="calendar-day__events">
          ${dayEvents.slice(0, 3).map(event => `
            <div class="calendar-event calendar-event--${event.type}" data-event-id="${event.id}">
              ${event.type === 'delivery' ? '📦' : '↩️'} ${event.orderNumber}
            </div>
          `).join('')}
          ${dayEvents.length > 3 ? `<div class="calendar-event calendar-event--more">+${dayEvents.length - 3} meer</div>` : ''}
        </div>
      </div>
    `;
  }

  // Next month days
  const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
  const nextMonthDays = totalCells - startDay - daysInMonth;
  for (let day = 1; day <= nextMonthDays; day++) {
    html += `<div class="calendar-day calendar-day--other">${day}</div>`;
  }

  html += '</div>';
  grid.innerHTML = html;

  // Add event listeners
  grid.querySelectorAll('.calendar-event').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const eventId = el.dataset.eventId;
      showEventModal(eventId);
    });
  });

  grid.querySelectorAll('.calendar-day:not(.calendar-day--other)').forEach(el => {
    el.addEventListener('click', () => {
      const date = new Date(el.dataset.date);
      currentDate = date;
      currentView = 'day';
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('.view-btn[data-view="day"]')?.classList.add('active');
      renderCalendar();
    });
  });
}

/**
 * Render week view
 */
function renderWeekView() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;

  const weekStart = getWeekStart(currentDate);
  const today = new Date();

  let html = `
    <div class="calendar-header">
      ${DAYS_NL.map((day, i) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        return `<div class="calendar-header__day">${day} ${date.getDate()}</div>`;
      }).join('')}
    </div>
    <div class="calendar-body calendar-body--week">
  `;

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const isToday = date.toDateString() === today.toDateString();
    const dayEvents = getEventsForDate(date);

    html += `
      <div class="calendar-day calendar-day--week ${isToday ? 'calendar-day--today' : ''}" data-date="${date.toISOString()}">
        <div class="calendar-day__events">
          ${dayEvents.map(event => `
            <div class="calendar-event calendar-event--${event.type}" data-event-id="${event.id}">
              <strong>${event.type === 'delivery' ? '📦 Levering' : '↩️ Retour'}</strong>
              <span>${event.orderNumber}</span>
              <span class="calendar-event__customer">${event.customer}</span>
            </div>
          `).join('')}
          ${dayEvents.length === 0 ? '<div class="calendar-day__empty">Geen events</div>' : ''}
        </div>
      </div>
    `;
  }

  html += '</div>';
  grid.innerHTML = html;

  // Add event listeners
  grid.querySelectorAll('.calendar-event').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      showEventModal(el.dataset.eventId);
    });
  });
}

/**
 * Render day view
 */
function renderDayView() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;

  const dayEvents = getEventsForDate(currentDate);
  const today = new Date();
  const isToday = currentDate.toDateString() === today.toDateString();

  let html = `
    <div class="calendar-day-view ${isToday ? 'calendar-day-view--today' : ''}">
      <div class="calendar-day-view__header">
        <h3>${DAYS_NL[(currentDate.getDay() + 6) % 7]}, ${currentDate.getDate()} ${MONTHS_NL[currentDate.getMonth()]}</h3>
        <span>${dayEvents.length} event${dayEvents.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="calendar-day-view__events">
        ${dayEvents.length === 0 ? `
          <div class="calendar-day-view__empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <p>Geen events gepland voor deze dag</p>
          </div>
        ` : dayEvents.map(event => `
          <div class="calendar-event-card calendar-event-card--${event.type}" data-event-id="${event.id}">
            <div class="calendar-event-card__icon">
              ${event.type === 'delivery' ? '📦' : '↩️'}
            </div>
            <div class="calendar-event-card__content">
              <h4>${event.type === 'delivery' ? 'Levering' : 'Retour'}</h4>
              <p class="calendar-event-card__order">${event.orderNumber}</p>
              <p class="calendar-event-card__customer">${event.customer}</p>
            </div>
            <div class="calendar-event-card__status">
              <span class="status-badge status-badge--${getStatusClass(event.status)}">
                <span class="status-badge__dot"></span>
                ${getStatusText(event.status)}
              </span>
            </div>
            <a href="order.html?id=${event.orderId}" class="btn btn--ghost btn--sm">Bekijken</a>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  grid.innerHTML = html;

  // Add event listeners
  grid.querySelectorAll('.calendar-event-card').forEach(el => {
    el.addEventListener('click', () => showEventModal(el.dataset.eventId));
  });
}

/**
 * Get events for a specific date
 */
function getEventsForDate(date) {
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.toDateString() === date.toDateString();
  });
}

/**
 * Get week start (Monday)
 */
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * Show event modal
 */
function showEventModal(eventId) {
  const event = events.find(e => e.id === eventId);
  if (!event) return;

  const modal = document.getElementById('event-modal');
  const title = document.getElementById('event-modal-title');
  const body = document.getElementById('event-modal-body');
  const viewBtn = document.getElementById('event-view-order-btn');

  title.textContent = event.type === 'delivery' ? '📦 Levering Details' : '↩️ Retour Details';
  
  body.innerHTML = `
    <div class="event-details">
      <div class="event-detail">
        <span class="event-detail__label">Bestelling</span>
        <span class="event-detail__value">${event.orderNumber}</span>
      </div>
      <div class="event-detail">
        <span class="event-detail__label">Klant</span>
        <span class="event-detail__value">${event.customer || 'Onbekend'}</span>
      </div>
      <div class="event-detail">
        <span class="event-detail__label">Datum</span>
        <span class="event-detail__value">${event.date.toLocaleDateString('nl-BE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
      <div class="event-detail">
        <span class="event-detail__label">Status</span>
        <span class="status-badge status-badge--${getStatusClass(event.status)}">
          <span class="status-badge__dot"></span>
          ${getStatusText(event.status)}
        </span>
      </div>
    </div>
  `;

  viewBtn.href = `order.html?id=${event.orderId}`;
  modal.classList.add('active');
}

/**
 * Render upcoming events sidebar
 */
function renderUpcomingEvents() {
  const container = document.getElementById('upcoming-events');
  if (!container) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = events
    .filter(e => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  if (upcoming.length === 0) {
    container.innerHTML = `
      <div class="event-item">
        <p style="color: var(--color-gray); text-align: center; padding: var(--space-lg);">
          Geen komende events
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = upcoming.map(event => {
    const date = new Date(event.date);
    return `
      <div class="event-item" data-event-id="${event.id}">
        <div class="event-item__date">
          <span class="event-item__day">${date.getDate()}</span>
          <span class="event-item__month">${MONTHS_NL[date.getMonth()].substring(0, 3)}</span>
        </div>
        <div class="event-item__content">
          <strong>${event.type === 'delivery' ? '📦 Levering' : '↩️ Retour'}</strong>
          <p>${event.orderNumber}</p>
          <span class="event-item__customer">${event.customer}</span>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.event-item').forEach(el => {
    el.addEventListener('click', () => showEventModal(el.dataset.eventId));
  });
}

/**
 * Get status class
 */
function getStatusClass(status) {
  const classes = {
    'pending_payment': 'pending',
    'confirmed': 'confirmed',
    'preparing': 'pending',
    'ready_for_delivery': 'confirmed',
    'delivered': 'confirmed',
    'returned': 'confirmed',
    'completed': 'confirmed',
    'cancelled': 'cancelled',
    'payment_failed': 'cancelled'
  };
  return classes[status] || 'pending';
}

/**
 * Get status text
 */
function getStatusText(status) {
  const texts = {
    'pending_payment': 'Wacht op betaling',
    'confirmed': 'Bevestigd',
    'preparing': 'In voorbereiding',
    'ready_for_delivery': 'Klaar voor levering',
    'delivered': 'Geleverd',
    'returned': 'Retour',
    'completed': 'Voltooid',
    'cancelled': 'Geannuleerd',
    'payment_failed': 'Betaling mislukt'
  };
  return texts[status] || status;
}
