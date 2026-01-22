#!/usr/bin/env python3
"""
Remove prices from all location pages and replace with checkout reference
"""
import os
import re

def update_location_page(filepath):
    """Update a single location page to remove prices"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match the entire info section with both items
    pattern = r'<div class="location-hero__info">.*?</div>\s*</div>'
    
    # Replacement with single item
    replacement = '''<div class="location-hero__info">
          <div class="location-hero__info-item">
            <span class="location-hero__info-label">Prijzen</span>
            <span class="location-hero__info-value" style="font-size: var(--font-size-base); font-family: var(--font-body);">Bereken uw prijs in de checkout</span>
          </div>
        </div>'''
    
    # Replace using regex with DOTALL flag
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

def main():
    base_dir = '/Users/larsleenders/Downloads/Tafel Totaal/public/locaties'
    
    if not os.path.exists(base_dir):
        print(f"❌ Directory not found: {base_dir}")
        return
    
    updated = 0
    
    for filename in sorted(os.listdir(base_dir)):
        if not filename.endswith('.html'):
            continue
        
        filepath = os.path.join(base_dir, filename)
        city_slug = filename.replace('.html', '')
        
        if update_location_page(filepath):
            updated += 1
            print(f"✅ Updated: {city_slug}")
    
    print(f"\n📊 Summary: {updated} pages updated")

if __name__ == '__main__':
    main()
