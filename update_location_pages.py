#!/usr/bin/env python3
"""
Update all location pages:
1. Remove CTA section
2. Change hero button from 'Offerte Aanvragen' to 'Bekijk Losse Producten'
3. Load normal header.html instead of header-location.html
"""
import os
import re

def update_location_page(filepath):
    """Update a single location page"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changes_made = []
    
    # 1. Remove CTA section
    if '<!-- CTA Section -->' in content:
        content = re.sub(
            r'\s*<!-- CTA Section -->\s*<div id="cta-container"></div>',
            '',
            content
        )
        changes_made.append('Removed CTA section')
    
    # 2. Change hero button
    old_button = '<a href="/Tafel-Totaal/contact.html" class="btn btn--secondary btn--lg">Offerte Aanvragen</a>'
    new_button = '<a href="/Tafel-Totaal/producten.html" class="btn btn--secondary btn--lg">Bekijk Losse Producten</a>'
    
    if old_button in content:
        content = content.replace(old_button, new_button)
        changes_made.append('Updated hero button')
    
    # 3. Change header loading from header-location.html to header.html
    old_header_fetch = "const headerResponse = await fetch(`${basePath}/components/header-location.html`);"
    new_header_fetch = "const headerResponse = await fetch(`${basePath}/components/header.html`);"
    
    if old_header_fetch in content:
        content = content.replace(old_header_fetch, new_header_fetch)
        changes_made.append('Changed to normal header')
    
    # Write back if changes were made
    if changes_made:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ {os.path.basename(filepath)}: {', '.join(changes_made)}")
        return True
    else:
        print(f"○ {os.path.basename(filepath)}: No changes needed")
        return False

def main():
    locaties_dir = 'public/locaties'
    
    if not os.path.exists(locaties_dir):
        print(f"Error: {locaties_dir} directory not found")
        return
    
    html_files = [f for f in os.listdir(locaties_dir) if f.endswith('.html')]
    
    print(f"Found {len(html_files)} location pages")
    print("Updating pages...\n")
    
    updated_count = 0
    for filename in sorted(html_files):
        filepath = os.path.join(locaties_dir, filename)
        if update_location_page(filepath):
            updated_count += 1
    
    print(f"\n✅ Updated {updated_count} location pages")
    print(f"   Skipped {len(html_files) - updated_count} (no changes needed)")

if __name__ == '__main__':
    main()
