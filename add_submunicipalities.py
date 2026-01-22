#!/usr/bin/env python3
"""
Add sub-municipalities section to all location pages
"""
import os
import json

def add_submunicipalities_section(filepath, city_slug):
    """Add sub-municipalities section to a location page"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if section already exists
    if 'id="submunicipalities-section"' in content:
        print(f"  ⏭️  Section already exists in {os.path.basename(filepath)}")
        return False
    
    # Add section before products section
    submunicipalities_html = '''
    <!-- Sub-municipalities Section -->
    <section id="submunicipalities-section" class="content-row" data-animate="fade-up" style="display: none;">
      <div class="content-label">
        <span class="content-number">06</span>
        <h2>Deelgemeenten</h2>
      </div>
      <div class="content-body">
        <p><strong>Wij leveren ook in de volgende deelgemeenten:</strong></p>
        <div id="submunicipalities-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--space-sm); margin-top: var(--space-md);">
          <!-- Will be loaded dynamically -->
        </div>
      </div>
    </section>

    <!-- Products Showcase (Dynamic) -->'''
    
    content = content.replace('    <!-- Products Showcase (Dynamic) -->', submunicipalities_html)
    
    # Add script to load sub-municipalities
    script_addition = f'''
    
    // Load sub-municipalities for this location
    async function loadSubMunicipalities() {{
      try {{
        const BASE_PATH = window.location.hostname.includes('github.io') ? '/Tafel-Totaal' : '';
        const response = await fetch(`${{BASE_PATH}}/data/all-locations.json`);
        const data = await response.json();
        
        // Flatten all locations
        const allLocations = [
          ...data['west-vlaanderen'],
          ...data['oost-vlaanderen']
        ];
        
        // Find sub-municipalities for this city
        const subMunicipalities = allLocations.filter(loc => 
          loc.slug === '{city_slug}' && loc.parent !== null
        );
        
        if (subMunicipalities.length > 0) {{
          const section = document.getElementById('submunicipalities-section');
          const list = document.getElementById('submunicipalities-list');
          
          list.innerHTML = subMunicipalities.map(sub => `
            <div style="padding: var(--space-sm); background: var(--color-concrete); border: 1px solid var(--color-light-gray);">
              <strong style="display: block; margin-bottom: 4px;">${{sub.name}}</strong>
              <span style="font-size: var(--font-size-sm); color: var(--color-gray);">${{sub.postal_codes.join(', ')}}</span>
            </div>
          `).join('');
          
          section.style.display = 'flex';
        }}
      }} catch (error) {{
        console.error('Error loading sub-municipalities:', error);
      }}
    }}
    
    loadSubMunicipalities();'''
    
    # Insert before the closing script tag
    content = content.replace('    // Initialize\n    loadProducts();', f'    // Initialize\n    loadProducts();{script_addition}')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

def main():
    base_dir = '/Users/larsleenders/Downloads/Tafel Totaal/public/locaties'
    
    if not os.path.exists(base_dir):
        print(f"❌ Directory not found: {base_dir}")
        return
    
    # Load all locations to get slugs
    json_path = '/Users/larsleenders/Downloads/Tafel Totaal/public/data/all-locations.json'
    with open(json_path, 'r', encoding='utf-8') as f:
        locations_data = json.load(f)
    
    # Get all unique slugs (main municipalities)
    all_locations = locations_data['west-vlaanderen'] + locations_data['oost-vlaanderen']
    main_cities = {}
    for loc in all_locations:
        if loc['parent'] is None:
            main_cities[loc['slug']] = loc['name']
    
    updated = 0
    
    for filename in sorted(os.listdir(base_dir)):
        if not filename.endswith('.html'):
            continue
        
        city_slug = filename.replace('.html', '')
        
        # Only process if this is a main city
        if city_slug not in main_cities:
            continue
        
        filepath = os.path.join(base_dir, filename)
        
        if add_submunicipalities_section(filepath, city_slug):
            updated += 1
            print(f"✅ Updated: {filename} ({main_cities[city_slug]})")
    
    print(f"\n📊 Summary: {updated} pages updated with sub-municipalities section")

if __name__ == '__main__':
    main()
