#!/usr/bin/env python3
"""
Update all location pages with new hero section
"""
import os
import re

# City data with provinces
CITIES = {
    # West-Vlaanderen
    'brugge': 'West-Vlaanderen', 'kortrijk': 'West-Vlaanderen', 'oostende': 'West-Vlaanderen',
    'roeselare': 'West-Vlaanderen', 'waregem': 'West-Vlaanderen', 'ieper': 'West-Vlaanderen',
    'menen': 'West-Vlaanderen', 'torhout': 'West-Vlaanderen', 'izegem': 'West-Vlaanderen',
    'tielt': 'West-Vlaanderen', 'knokke-heist': 'West-Vlaanderen', 'blankenberge': 'West-Vlaanderen',
    'harelbeke': 'West-Vlaanderen', 'wevelgem': 'West-Vlaanderen', 'kuurne': 'West-Vlaanderen',
    'deerlijk': 'West-Vlaanderen', 'zwevegem': 'West-Vlaanderen', 'poperinge': 'West-Vlaanderen',
    'diksmuide': 'West-Vlaanderen', 'oostkamp': 'West-Vlaanderen', 'zedelgem': 'West-Vlaanderen',
    'lichtervelde': 'West-Vlaanderen', 'wervik': 'West-Vlaanderen', 'wingene': 'West-Vlaanderen',
    'gistel': 'West-Vlaanderen', 'moorslede': 'West-Vlaanderen', 'staden': 'West-Vlaanderen',
    'kortemark': 'West-Vlaanderen', 'ardooie': 'West-Vlaanderen', 'anzegem': 'West-Vlaanderen',
    # Oost-Vlaanderen
    'gent': 'Oost-Vlaanderen', 'aalst': 'Oost-Vlaanderen', 'sint-niklaas': 'Oost-Vlaanderen',
    'dendermonde': 'Oost-Vlaanderen', 'lokeren': 'Oost-Vlaanderen', 'oudenaarde': 'Oost-Vlaanderen',
    'ninove': 'Oost-Vlaanderen', 'zottegem': 'Oost-Vlaanderen', 'geraardsbergen': 'Oost-Vlaanderen',
    'eeklo': 'Oost-Vlaanderen', 'deinze': 'Oost-Vlaanderen', 'ronse': 'Oost-Vlaanderen',
    'wetteren': 'Oost-Vlaanderen', 'lebbeke': 'Oost-Vlaanderen', 'merelbeke': 'Oost-Vlaanderen',
    'beveren': 'Oost-Vlaanderen', 'lede': 'Oost-Vlaanderen', 'erpe-mere': 'Oost-Vlaanderen',
    'waasmunster': 'Oost-Vlaanderen', 'temse': 'Oost-Vlaanderen', 'lochristi': 'Oost-Vlaanderen',
    'evergem': 'Oost-Vlaanderen', 'zelzate': 'Oost-Vlaanderen', 'destelbergen': 'Oost-Vlaanderen',
    'nazareth': 'Oost-Vlaanderen', 'maldegem': 'Oost-Vlaanderen', 'hamme': 'Oost-Vlaanderen',
    'assenede': 'Oost-Vlaanderen', 'kaprijke': 'Oost-Vlaanderen', 'sint-lievens-houtem': 'Oost-Vlaanderen'
}

# City display names
CITY_NAMES = {
    'brugge': 'Brugge', 'kortrijk': 'Kortrijk', 'oostende': 'Oostende', 'roeselare': 'Roeselare',
    'waregem': 'Waregem', 'ieper': 'Ieper', 'menen': 'Menen', 'torhout': 'Torhout',
    'izegem': 'Izegem', 'tielt': 'Tielt', 'knokke-heist': 'Knokke-Heist', 'blankenberge': 'Blankenberge',
    'harelbeke': 'Harelbeke', 'wevelgem': 'Wevelgem', 'kuurne': 'Kuurne', 'deerlijk': 'Deerlijk',
    'zwevegem': 'Zwevegem', 'poperinge': 'Poperinge', 'diksmuide': 'Diksmuide', 'oostkamp': 'Oostkamp',
    'zedelgem': 'Zedelgem', 'lichtervelde': 'Lichtervelde', 'wervik': 'Wervik', 'wingene': 'Wingene',
    'gistel': 'Gistel', 'moorslede': 'Moorslede', 'staden': 'Staden', 'kortemark': 'Kortemark',
    'ardooie': 'Ardooie', 'anzegem': 'Anzegem', 'gent': 'Gent', 'aalst': 'Aalst',
    'sint-niklaas': 'Sint-Niklaas', 'dendermonde': 'Dendermonde', 'lokeren': 'Lokeren',
    'oudenaarde': 'Oudenaarde', 'ninove': 'Ninove', 'zottegem': 'Zottegem',
    'geraardsbergen': 'Geraardsbergen', 'eeklo': 'Eeklo', 'deinze': 'Deinze', 'ronse': 'Ronse',
    'wetteren': 'Wetteren', 'lebbeke': 'Lebbeke', 'merelbeke': 'Merelbeke', 'beveren': 'Beveren',
    'lede': 'Lede', 'erpe-mere': 'Erpe-Mere', 'waasmunster': 'Waasmunster', 'temse': 'Temse',
    'lochristi': 'Lochristi', 'evergem': 'Evergem', 'zelzate': 'Zelzate', 'destelbergen': 'Destelbergen',
    'nazareth': 'Nazareth', 'maldegem': 'Maldegem', 'hamme': 'Hamme', 'assenede': 'Assenede',
    'kaprijke': 'Kaprijke', 'sint-lievens-houtem': 'Sint-Lievens-Houtem'
}

def get_new_hero(city_slug, city_name, province):
    """Generate new hero HTML for a city"""
    return f'''    <!-- New Split-Screen Hero -->
    <section class="location-hero">
      <!-- Left: Content -->
      <div class="location-hero__content">
        <nav class="location-hero__breadcrumbs" aria-label="Breadcrumb">
          <a href="/Tafel-Totaal/">Home</a>
          <span>/</span>
          <a href="/Tafel-Totaal/locaties.html">Locaties</a>
          <span>/</span>
          <span class="active">{city_name}</span>
        </nav>

        <div class="location-hero__badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          {province}
        </div>

        <h1 class="location-hero__title">
          Tafelverhuur
          <span class="location-hero__title-highlight">{city_name}</span>
        </h1>

        <p class="location-hero__description">
          In de bruisende stad {city_name} organiseert u een onvergetelijk feest met de serviesverhuur van Tafel Totaal. Van intieme diners tot grote recepties, wij verzorgen uw complete tafeldekking.
        </p>

        <div class="location-hero__info">
          <div class="location-hero__info-item">
            <span class="location-hero__info-label">Prijzen</span>
            <span class="location-hero__info-value" style="font-size: var(--font-size-base); font-family: var(--font-body);">Bereken uw prijs in de checkout</span>
          </div>
        </div>

        <div class="location-hero__cta">
          <a href="/Tafel-Totaal/pakketten.html" class="btn btn--primary btn--lg">
            Bekijk Pakketten
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
          <a href="/Tafel-Totaal/contact.html" class="btn btn--secondary btn--lg">Offerte Aanvragen</a>
        </div>
      </div>

      <!-- Right: Visual with Stats -->
      <div class="location-hero__visual">
        <img src="/Tafel-Totaal/images/site/hero-table-setting.jpg" alt="Tafelverhuur {city_name}" class="location-hero__image" loading="eager">
        <div class="location-hero__overlay">
          <div class="location-hero__stats">
            <div class="location-hero__stat">
              <span class="location-hero__stat-value">500+</span>
              <span class="location-hero__stat-label">Events</span>
            </div>
            <div class="location-hero__stat">
              <span class="location-hero__stat-value">100%</span>
              <span class="location-hero__stat-label">Service</span>
            </div>
            <div class="location-hero__stat">
              <span class="location-hero__stat-value">0%</span>
              <span class="location-hero__stat-label">Afwas</span>
            </div>
          </div>
        </div>
      </div>
    </section>'''

def update_location_page(filepath, city_slug):
    """Update a single location page"""
    if city_slug not in CITIES:
        print(f"⚠️  Unknown city: {city_slug}")
        return False
    
    city_name = CITY_NAMES[city_slug]
    province = CITIES[city_slug]
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add new CSS if not present
    if 'location-hero-new.css' not in content:
        content = content.replace(
            '  <link rel="stylesheet" href="/Tafel-Totaal/css/pages/location-detail.css">',
            '  <link rel="stylesheet" href="/Tafel-Totaal/css/pages/location-detail.css">\n  <link rel="stylesheet" href="/Tafel-Totaal/css/pages/location-hero-new.css">'
        )
    
    # Replace old hero with new hero
    old_hero_pattern = r'    <!-- Architectural Hero Grid -->.*?</section>'
    new_hero = get_new_hero(city_slug, city_name, province)
    
    content = re.sub(old_hero_pattern, new_hero, content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

def main():
    base_dir = '/Users/larsleenders/Downloads/Tafel Totaal/public/locaties'
    
    if not os.path.exists(base_dir):
        print(f"❌ Directory not found: {base_dir}")
        return
    
    updated = 0
    skipped = 0
    
    for filename in sorted(os.listdir(base_dir)):
        if not filename.endswith('.html'):
            continue
        
        city_slug = filename.replace('.html', '')
        filepath = os.path.join(base_dir, filename)
        
        if update_location_page(filepath, city_slug):
            updated += 1
            print(f"✅ Updated: {city_slug}")
        else:
            skipped += 1
            print(f"⏭️  Skipped: {city_slug}")
    
    print(f"\n📊 Summary: {updated} updated, {skipped} skipped")

if __name__ == '__main__':
    main()
