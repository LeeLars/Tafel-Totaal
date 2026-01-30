/**
 * Location Products Loader
 * Loads real products from CMS for location pages
 */

const API_BASE_URL = window.location.hostname.includes('github.io')
  ? 'https://tafel-totaal-production.up.railway.app'
  : 'http://localhost:3000';

/**
 * Format price
 */
function formatPrice(price) {
  return `€${parseFloat(price).toFixed(2)}`;
}

/**
 * Load and render products for location page
 */
export async function loadLocationProducts(limit = 3) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  try {
    // Load from API
    const response = await fetch(`${API_BASE_URL}/api/products?limit=${limit}`);
    const data = await response.json();
    
    if (data.success && data.data && data.data.length > 0) {
      renderProducts(data.data);
    } else {
      // Hide grid if no products
      grid.style.display = 'none';
    }
  } catch (error) {
    console.error('Error loading products:', error);
    // Hide grid if API fails
    grid.style.display = 'none';
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
