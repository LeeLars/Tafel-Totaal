/**
 * Tafel Totaal - API Client
 * REST API wrapper met credentials (httpOnly cookies)
 */

const API_BASE_URL = 'https://api.tafeltotaal.be';

async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Geen verbinding met de server. Controleer je internetverbinding.');
    }
    throw error;
  }
}

export const authAPI = {
  login: (email, password) => 
    apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  
  register: (userData) => 
    apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
  
  logout: () => 
    apiCall('/api/auth/logout', { method: 'POST' }),
  
  me: () => 
    apiCall('/api/auth/me')
};

export const packagesAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiCall(`/api/packages${params ? `?${params}` : ''}`);
  },
  
  getById: (id) => 
    apiCall(`/api/packages/${id}`)
};

export const productsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiCall(`/api/products${params ? `?${params}` : ''}`);
  },
  
  getById: (id) => 
    apiCall(`/api/products/${id}`)
};

export const cartAPI = {
  get: () => 
    apiCall('/api/cart'),
  
  addItem: (item) => 
    apiCall('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify(item)
    }),
  
  updateItem: (itemId, quantity) => 
    apiCall(`/api/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity })
    }),
  
  removeItem: (itemId) => 
    apiCall(`/api/cart/items/${itemId}`, { method: 'DELETE' }),
  
  clear: () => 
    apiCall('/api/cart', { method: 'DELETE' })
};

export const checkoutAPI = {
  createOrder: (orderData) => 
    apiCall('/api/checkout', {
      method: 'POST',
      body: JSON.stringify(orderData)
    }),
  
  calculatePrice: (items, startDate, endDate, deliveryMethod) => 
    apiCall('/api/checkout/calculate', {
      method: 'POST',
      body: JSON.stringify({ items, startDate, endDate, deliveryMethod })
    })
};

export const ordersAPI = {
  getMyOrders: () => 
    apiCall('/api/orders'),
  
  getById: (id) => 
    apiCall(`/api/orders/${id}`)
};

export const availabilityAPI = {
  check: (type, id, quantity, startDate, endDate, persons) => 
    apiCall('/api/availability/check', {
      method: 'POST',
      body: JSON.stringify({ type, id, quantity, startDate, endDate, persons })
    })
};

export { apiCall };
