#!/usr/bin/env python3
"""
Update all location pages to use standard CTA component and ensure header/footer
"""
import os
import re

def update_location_page(filepath):
    """Update a single location page"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Replace hardcoded statement-section with standard CTA container
    cta_pattern = r'<!-- Statement CTA -->.*?<section class="statement-section".*?</section>'
    new_cta = '<!-- CTA Section -->\n    <div id="cta-container"></div>'
    
    if '<div id="cta-container">' not in content:
        # Try to match the statement section if it exists
        if 'statement-section' in content:
            content = re.sub(cta_pattern, new_cta, content, flags=re.DOTALL)
        else:
            # If no statement section found, insert before main closing tag
            content = content.replace('</main>', '  <!-- CTA Section -->\n    <div id="cta-container"></div>\n  </main>')
    
    # 2. Ensure imports in script
    script_pattern = r'<script type="module">.*?</script>'
    
    script_match = re.search(script_pattern, content, flags=re.DOTALL)
    if script_match:
        script_content = script_match.group(0)
        
        # Add import if missing
        if 'import { loadCTA }' not in script_content:
            script_content = script_content.replace(
                "import { loadFooter } from '/Tafel-Totaal/js/components/footer.js';",
                "import { loadFooter } from '/Tafel-Totaal/js/components/footer.js';\n    import { loadCTA } from '/Tafel-Totaal/js/components/cta.js';"
            )
        
        # Add function call if missing
        if 'loadCTA();' not in script_content:
            script_content = script_content.replace(
                "loadFooter();",
                "loadFooter();\n    loadCTA();"
            )
            
        content = content.replace(script_match.group(0), script_content)
    
    # 3. Ensure Header container exists
    if '<div id="header-container"></div>' not in content:
        content = content.replace('<body>', '<body>\n  <!-- Header -->\n  <div id="header-container"></div>')
        
    # 4. Ensure Footer container exists
    if '<div id="footer-container"></div>' not in content:
        content = content.replace('</main>', '</main>\n\n  <!-- Footer -->\n  <div id="footer-container"></div>')

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
        
        if update_location_page(filepath):
            updated += 1
            print(f"✅ Updated: {filename}")
    
    print(f"\n📊 Summary: {updated} pages updated")

if __name__ == '__main__':
    main()
