/**
 * Location Products Loader
 * Loads random products for location pages with fallback
 */

const API_BASE_URL = window.location.hostname.includes('github.io')
  ? 'https://tafel-totaal-production.up.railway.app'
  : 'http://localhost:3000';

// Fallback products voor als API niet beschikbaar is
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: 'Dinerbord Wit Classic',
    category_name: 'Servies',
    price_per_day: 0.50,
    images: ['/images/products/dinerbord-wit.jpg']
  },
  {
    id: 2,
    name: 'Wijnglas Elegance',
    category_name: 'Glaswerk',
    price_per_day: 0.40,
    images: ['/images/products/wijnglas-elegance.jpg']
  },
  {
    id: 3,
    name: 'Bestek Set Modern',
    category_name: 'Bestek',
    price_per_day: 0.35,
    images: ['/images/products/bestek-modern.jpg']
  },
  {
    id: 4,
    name: 'Champagneglas Flute',
    category_name: 'Glaswerk',
    price_per_day: 0.45,
    images: ['/images/products/champagneglas.jpg']
  },
  {
    id: 5,
    name: 'Dessertbord Elegant',
    category_name: 'Servies',
    price_per_day: 0.40,
    images: ['/images/products/dessertbord.jpg']
  },
  {
    id: 6,
    name: 'Waterglas Crystal',
    category_name: 'Glaswerk',
    price_per_day: 0.35,
    images: ['/images/products/waterglas.jpg']
  },
  {
    id: 7,
    name: 'Tafelkleed Wit Linnen',
    category_name: 'Decoratie',
    price_per_day: 3.50,
    images: ['/images/products/tafelkleed-wit.jpg']
  },
  {
    id: 8,
    name: 'Koffiekop & Schotel',
    category_name: 'Servies',
    price_per_day: 0.60,
    images: ['/images/products/koffiekop.jpg']
  }
];

/**
 * Get random products from array
 */
function getRandomProducts(products, count = 4) {
  const shuffled = [...products].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Format price
 */
function formatPrice(price) {
  return `€${parseFloat(price).toFixed(2)}`;
}

/**
 * Load and render products for location page
 */
export async function loadLocationProducts(limit = 4) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  try {
    // Try to load from API
    const response = await fetch(`${API_BASE_URL}/api/products?limit=${limit}`);
    const data = await response.json();
    
    if (data.success && data.data && data.data.length > 0) {
      renderProducts(data.data);
    } else {
      // Use fallback products
      const randomProducts = getRandomProducts(FALLBACK_PRODUCTS, limit);
      renderProducts(randomProducts);
    }
  } catch (error) {
    console.log('API niet beschikbaar, gebruik fallback producten');
    // Use fallback products
    const randomProducts = getRandomProducts(FALLBACK_PRODUCTS, limit);
    renderProducts(randomProducts);
  }
}

/**
 * Render products in grid
 */
function renderProducts(products) {
  const grid = document.getElementById('products-grid');
  if (!grid || !products.length) return;
  
  grid.innerHTML = products.map((product, i) => `
    <article class="product-card" data-animate="scale" style="animation-delay: ${i * 0.1}s;">
      <a href="/product/?id=${product.id}" class="product-link">
        <div class="product-image">
          <img src="${product.images?.[0] || '/images/products/placeholder.jpg'}" 
               alt="${product.name}" 
               loading="lazy"
               onerror="this.src='/images/products/placeholder.jpg'">
        </div>
        <div class="product-info">
          <span class="product-category">${product.category_name || 'Product'}</span>
          <h3 class="product-title">${product.name}</h3>
          <p class="product-price">${formatPrice(product.price_per_day)} <span>/dag</span></p>
        </div>
      </a>
    </article>
  `).join('');
}
