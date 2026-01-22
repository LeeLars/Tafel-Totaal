#!/usr/bin/env python3
"""
Fix header and footer loading on all location pages
Replaces the module import approach with inline fetch approach
"""
import os
import re

def fix_location_page(filepath):
    """Fix header/footer loading in a location page"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already has the inline script approach
    # if 'async function loadLocationComponents()' in content:
    #    print(f"✓ {os.path.basename(filepath)} already fixed")
    #    return False
    
    # Find the script section
    script_pattern = r'(<script type="module">.*?</script>)'
    match = re.search(script_pattern, content, re.DOTALL)
    
    if not match:
        print(f"✗ {os.path.basename(filepath)} - No script section found")
        return False
    
    old_script = match.group(1)
    
    # 1. HTML Cleanup for sub-municipalities list
    # Replace inline style with class if present
    content = content.replace(
        '<div id="submunicipalities-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--space-sm); margin-top: var(--space-md);">',
        '<div id="submunicipalities-list" class="sub-municipalities-grid">'
    )

    # 2. Create new script with inline loading and improved sub-municipalities rendering
    new_script = '''<script type="module">
    import { formatPrice } from '/Tafel-Totaal/js/lib/utils.js';
    
    // Load header, footer and CTA components
    async function loadLocationComponents() {
      const basePath = window.location.hostname.includes('github.io') ? '/Tafel-Totaal' : '';
      
      // Load header
      try {
        const headerResponse = await fetch(`${basePath}/components/header-location.html`);
        if (headerResponse.ok) {
          document.getElementById('header-container').innerHTML = await headerResponse.text();
          
          // Initialize header after loading
          const headerScript = document.createElement('script');
          headerScript.type = 'module';
          headerScript.textContent = `
            import { initHeader } from '/Tafel-Totaal/js/components/header.js';
            initHeader();
          `;
          document.body.appendChild(headerScript);
        }
      } catch (error) {
        console.error('Error loading header:', error);
      }
      
      // Load footer
      try {
        const footerResponse = await fetch(`${basePath}/components/footer.html`);
        if (footerResponse.ok) {
          document.getElementById('footer-container').innerHTML = await footerResponse.text();
        }
      } catch (error) {
        console.error('Error loading footer:', error);
      }
      
      // Load CTA
      try {
        const ctaResponse = await fetch(`${basePath}/components/cta.html`);
        if (ctaResponse.ok) {
          const ctaContainer = document.getElementById('cta-container');
          if (ctaContainer) {
            ctaContainer.innerHTML = await ctaResponse.text();
          }
        }
      } catch (error) {
        console.error('Error loading CTA:', error);
      }
    }
    
    // Initialize on page load
    loadLocationComponents();
    
    // Load featured products
    async function loadProducts() {
      try {
        const API_BASE = window.location.hostname.includes('github.io')
          ? 'https://tafel-totaal-production.up.railway.app'
          : 'http://localhost:3000';
        
        const response = await fetch(`${API_BASE}/api/products?limit=4`);
        const data = await response.json();
        
        if (data.success && data.data) {
          renderProducts(data.data);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      }
    }
    
    function renderProducts(products) {
      const grid = document.getElementById('products-grid');
      if (!grid || !products.length) return;
      
      grid.innerHTML = products.map((product, i) => `
        <article class="product-card" data-animate="scale" style="animation-delay: ${i * 0.1}s;">
          <a href="/Tafel-Totaal/product.html?id=${product.id}" class="product-link">
            <div class="product-image">
              <img src="${product.images?.[0] || '/Tafel-Totaal/images/products/placeholder.jpg'}" 
                   alt="${product.name}" 
                   loading="lazy">
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
    
    // Initialize
    loadProducts();
    
    // Load sub-municipalities for this location
    async function loadSubMunicipalities() {
      try {
        const BASE_PATH = window.location.hostname.includes('github.io') ? '/Tafel-Totaal' : '';
        const response = await fetch(`${BASE_PATH}/data/all-locations.json`);
        const data = await response.json();
        
        // Flatten all locations
        const allLocations = [
          ...data['west-vlaanderen'],
          ...data['oost-vlaanderen']
        ];
        
        // Get current page slug from URL
        const pageSlug = window.location.pathname.split('/').pop().replace('.html', '');
        
        // Find sub-municipalities for this city
        const subMunicipalities = allLocations.filter(loc => 
          loc.slug === pageSlug && loc.parent !== null
        );
        
        if (subMunicipalities.length > 0) {
          const section = document.getElementById('submunicipalities-section');
          const list = document.getElementById('submunicipalities-list');
          
          list.innerHTML = subMunicipalities.map(sub => `
            <div class="sub-municipality-card">
              <span class="sub-municipality-name">${sub.name}</span>
              <span class="sub-municipality-zip">${sub.postal_codes.join(', ')}</span>
            </div>
          `).join('');
          
          section.style.display = 'grid'; // Uses grid layout from CSS class on parent content-row if needed, or just block
          // Actually content-row is grid, section is the row. 
          // We should just make sure it's visible. 
          section.style.display = ''; // Let CSS handle it (grid from content-row class) or block
          section.classList.remove('hidden'); // Ensure visibility
          section.style.display = 'grid'; // Force grid to match other content rows
        }
      } catch (error) {
        console.error('Error loading sub-municipalities:', error);
      }
    }
    
    loadSubMunicipalities();
    
    // Scroll animations observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    document.querySelectorAll('[data-animate]').forEach(el => {
      observer.observe(el);
    });
  </script>'''
    
    # Replace old script with new script
    content = content.replace(old_script, new_script)
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ {os.path.basename(filepath)} fixed")
    return True

def main():
    locaties_dir = 'public/locaties'
    
    if not os.path.exists(locaties_dir):
        print(f"Error: {locaties_dir} directory not found")
        return
    
    html_files = [f for f in os.listdir(locaties_dir) if f.endswith('.html')]
    
    print(f"Found {len(html_files)} location pages")
    print("Fixing header/footer loading...\n")
    
    fixed_count = 0
    for filename in sorted(html_files):
        filepath = os.path.join(locaties_dir, filename)
        if fix_location_page(filepath):
            fixed_count += 1
    
    print(f"\n✅ Fixed {fixed_count} location pages")
    print(f"   Skipped {len(html_files) - fixed_count} (already fixed)")

if __name__ == '__main__':
    main()
