#!/usr/bin/env python3
"""
Fix hero section on all location pages - add missing CTA and fix closing divs
"""
import os
import re

# City data with provinces
CITIES = {
    'brugge': ('Brugge', 'West-Vlaanderen'), 'kortrijk': ('Kortrijk', 'West-Vlaanderen'),
    'oostende': ('Oostende', 'West-Vlaanderen'), 'roeselare': ('Roeselare', 'West-Vlaanderen'),
    'waregem': ('Waregem', 'West-Vlaanderen'), 'ieper': ('Ieper', 'West-Vlaanderen'),
    'menen': ('Menen', 'West-Vlaanderen'), 'torhout': ('Torhout', 'West-Vlaanderen'),
    'izegem': ('Izegem', 'West-Vlaanderen'), 'tielt': ('Tielt', 'West-Vlaanderen'),
    'knokke-heist': ('Knokke-Heist', 'West-Vlaanderen'), 'blankenberge': ('Blankenberge', 'West-Vlaanderen'),
    'harelbeke': ('Harelbeke', 'West-Vlaanderen'), 'wevelgem': ('Wevelgem', 'West-Vlaanderen'),
    'kuurne': ('Kuurne', 'West-Vlaanderen'), 'deerlijk': ('Deerlijk', 'West-Vlaanderen'),
    'zwevegem': ('Zwevegem', 'West-Vlaanderen'), 'poperinge': ('Poperinge', 'West-Vlaanderen'),
    'diksmuide': ('Diksmuide', 'West-Vlaanderen'), 'oostkamp': ('Oostkamp', 'West-Vlaanderen'),
    'zedelgem': ('Zedelgem', 'West-Vlaanderen'), 'lichtervelde': ('Lichtervelde', 'West-Vlaanderen'),
    'wervik': ('Wervik', 'West-Vlaanderen'), 'wingene': ('Wingene', 'West-Vlaanderen'),
    'gistel': ('Gistel', 'West-Vlaanderen'), 'moorslede': ('Moorslede', 'West-Vlaanderen'),
    'staden': ('Staden', 'West-Vlaanderen'), 'kortemark': ('Kortemark', 'West-Vlaanderen'),
    'ardooie': ('Ardooie', 'West-Vlaanderen'), 'anzegem': ('Anzegem', 'West-Vlaanderen'),
    'gent': ('Gent', 'Oost-Vlaanderen'), 'aalst': ('Aalst', 'Oost-Vlaanderen'),
    'sint-niklaas': ('Sint-Niklaas', 'Oost-Vlaanderen'), 'dendermonde': ('Dendermonde', 'Oost-Vlaanderen'),
    'lokeren': ('Lokeren', 'Oost-Vlaanderen'), 'oudenaarde': ('Oudenaarde', 'Oost-Vlaanderen'),
    'ninove': ('Ninove', 'Oost-Vlaanderen'), 'zottegem': ('Zottegem', 'Oost-Vlaanderen'),
    'geraardsbergen': ('Geraardsbergen', 'Oost-Vlaanderen'), 'eeklo': ('Eeklo', 'Oost-Vlaanderen'),
    'deinze': ('Deinze', 'Oost-Vlaanderen'), 'ronse': ('Ronse', 'Oost-Vlaanderen'),
    'wetteren': ('Wetteren', 'Oost-Vlaanderen'), 'lebbeke': ('Lebbeke', 'Oost-Vlaanderen'),
    'merelbeke': ('Merelbeke', 'Oost-Vlaanderen'), 'beveren': ('Beveren', 'Oost-Vlaanderen'),
    'lede': ('Lede', 'Oost-Vlaanderen'), 'erpe-mere': ('Erpe-Mere', 'Oost-Vlaanderen'),
    'waasmunster': ('Waasmunster', 'Oost-Vlaanderen'), 'temse': ('Temse', 'Oost-Vlaanderen'),
    'lochristi': ('Lochristi', 'Oost-Vlaanderen'), 'evergem': ('Evergem', 'Oost-Vlaanderen'),
    'zelzate': ('Zelzate', 'Oost-Vlaanderen'), 'destelbergen': ('Destelbergen', 'Oost-Vlaanderen'),
    'nazareth': ('Nazareth', 'Oost-Vlaanderen'), 'maldegem': ('Maldegem', 'Oost-Vlaanderen'),
    'hamme': ('Hamme', 'Oost-Vlaanderen'), 'assenede': ('Assenede', 'Oost-Vlaanderen'),
    'kaprijke': ('Kaprijke', 'Oost-Vlaanderen'), 'sint-lievens-houtem': ('Sint-Lievens-Houtem', 'Oost-Vlaanderen')
}

def get_correct_hero(city_name, province):
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

def fix_location_page(filepath, city_slug):
    if city_slug not in CITIES:
        print(f"⚠️  Unknown city: {city_slug}")
        return False
    
    city_name, province = CITIES[city_slug]
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace entire hero section
    pattern = r'    <!-- New Split-Screen Hero -->.*?</section>'
    new_hero = get_correct_hero(city_name, province)
    
    content = re.sub(pattern, new_hero, content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

def main():
    base_dir = '/Users/larsleenders/Downloads/Tafel Totaal/public/locaties'
    
    updated = 0
    for filename in sorted(os.listdir(base_dir)):
        if not filename.endswith('.html'):
            continue
        
        city_slug = filename.replace('.html', '')
        filepath = os.path.join(base_dir, filename)
        
        if fix_location_page(filepath, city_slug):
            updated += 1
            print(f"✅ Fixed: {city_slug}")
    
    print(f"\n📊 Summary: {updated} pages fixed")

if __name__ == '__main__':
    main()
