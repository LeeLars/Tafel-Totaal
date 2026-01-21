const fs = require('fs');
const path = require('path');

// All 60 cities with province info
const cities = [
  // West-Vlaanderen (30)
  { name: 'Brugge', slug: 'brugge', province: 'West-Vlaanderen', type: 'stad', size: 'groot' },
  { name: 'Kortrijk', slug: 'kortrijk', province: 'West-Vlaanderen', type: 'stad', size: 'groot' },
  { name: 'Oostende', slug: 'oostende', province: 'West-Vlaanderen', type: 'kuststad', size: 'groot' },
  { name: 'Roeselare', slug: 'roeselare', province: 'West-Vlaanderen', type: 'stad', size: 'middelgroot' },
  { name: 'Waregem', slug: 'waregem', province: 'West-Vlaanderen', type: 'stad', size: 'middelgroot' },
  { name: 'Ieper', slug: 'ieper', province: 'West-Vlaanderen', type: 'stad', size: 'middelgroot' },
  { name: 'Menen', slug: 'menen', province: 'West-Vlaanderen', type: 'stad', size: 'middelgroot' },
  { name: 'Torhout', slug: 'torhout', province: 'West-Vlaanderen', type: 'stad', size: 'klein' },
  { name: 'Izegem', slug: 'izegem', province: 'West-Vlaanderen', type: 'stad', size: 'klein' },
  { name: 'Tielt', slug: 'tielt', province: 'West-Vlaanderen', type: 'stad', size: 'klein' },
  { name: 'Knokke-Heist', slug: 'knokke-heist', province: 'West-Vlaanderen', type: 'kuststad', size: 'middelgroot' },
  { name: 'Blankenberge', slug: 'blankenberge', province: 'West-Vlaanderen', type: 'kuststad', size: 'klein' },
  { name: 'Harelbeke', slug: 'harelbeke', province: 'West-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Wevelgem', slug: 'wevelgem', province: 'West-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Kuurne', slug: 'kuurne', province: 'West-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Deerlijk', slug: 'deerlijk', province: 'West-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Zwevegem', slug: 'zwevegem', province: 'West-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Poperinge', slug: 'poperinge', province: 'West-Vlaanderen', type: 'stad', size: 'klein' },
  { name: 'Diksmuide', slug: 'diksmuide', province: 'West-Vlaanderen', type: 'stad', size: 'klein' },
  { name: 'Oostkamp', slug: 'oostkamp', province: 'West-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Zedelgem', slug: 'zedelgem', province: 'West-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Lichtervelde', slug: 'lichtervelde', province: 'West-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Wervik', slug: 'wervik', province: 'West-Vlaanderen', type: 'stad', size: 'klein' },
  { name: 'Wingene', slug: 'wingene', province: 'West-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Gistel', slug: 'gistel', province: 'West-Vlaanderen', type: 'stad', size: 'klein' },
  { name: 'Moorslede', slug: 'moorslede', province: 'West-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Staden', slug: 'staden', province: 'West-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Kortemark', slug: 'kortemark', province: 'West-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Ardooie', slug: 'ardooie', province: 'West-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Anzegem', slug: 'anzegem', province: 'West-Vlaanderen', type: 'gemeente', size: 'klein' },
  // Oost-Vlaanderen (30)
  { name: 'Gent', slug: 'gent', province: 'Oost-Vlaanderen', type: 'stad', size: 'groot' },
  { name: 'Aalst', slug: 'aalst', province: 'Oost-Vlaanderen', type: 'stad', size: 'groot' },
  { name: 'Sint-Niklaas', slug: 'sint-niklaas', province: 'Oost-Vlaanderen', type: 'stad', size: 'groot' },
  { name: 'Dendermonde', slug: 'dendermonde', province: 'Oost-Vlaanderen', type: 'stad', size: 'middelgroot' },
  { name: 'Lokeren', slug: 'lokeren', province: 'Oost-Vlaanderen', type: 'stad', size: 'middelgroot' },
  { name: 'Oudenaarde', slug: 'oudenaarde', province: 'Oost-Vlaanderen', type: 'stad', size: 'middelgroot' },
  { name: 'Ninove', slug: 'ninove', province: 'Oost-Vlaanderen', type: 'stad', size: 'middelgroot' },
  { name: 'Zottegem', slug: 'zottegem', province: 'Oost-Vlaanderen', type: 'stad', size: 'klein' },
  { name: 'Geraardsbergen', slug: 'geraardsbergen', province: 'Oost-Vlaanderen', type: 'stad', size: 'middelgroot' },
  { name: 'Eeklo', slug: 'eeklo', province: 'Oost-Vlaanderen', type: 'stad', size: 'klein' },
  { name: 'Deinze', slug: 'deinze', province: 'Oost-Vlaanderen', type: 'stad', size: 'middelgroot' },
  { name: 'Ronse', slug: 'ronse', province: 'Oost-Vlaanderen', type: 'stad', size: 'klein' },
  { name: 'Wetteren', slug: 'wetteren', province: 'Oost-Vlaanderen', type: 'gemeente', size: 'middelgroot' },
  { name: 'Lebbeke', slug: 'lebbeke', province: 'Oost-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Merelbeke', slug: 'merelbeke', province: 'Oost-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Beveren', slug: 'beveren', province: 'Oost-Vlaanderen', type: 'gemeente', size: 'middelgroot' },
  { name: 'Lede', slug: 'lede', province: 'Oost-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Erpe-Mere', slug: 'erpe-mere', province: 'Oost-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Waasmunster', slug: 'waasmunster', province: 'Oost-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Temse', slug: 'temse', province: 'Oost-Vlaanderen', type: 'gemeente', size: 'middelgroot' },
  { name: 'Lochristi', slug: 'lochristi', province: 'Oost-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Evergem', slug: 'evergem', province: 'Oost-Vlaanderen', type: 'gemeente', size: 'middelgroot' },
  { name: 'Zelzate', slug: 'zelzate', province: 'Oost-Vlaanderen', type: 'stad', size: 'klein' },
  { name: 'Destelbergen', slug: 'destelbergen', province: 'Oost-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Nazareth', slug: 'nazareth', province: 'Oost-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Maldegem', slug: 'maldegem', province: 'Oost-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Hamme', slug: 'hamme', province: 'Oost-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Assenede', slug: 'assenede', province: 'Oost-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Kaprijke', slug: 'kaprijke', province: 'Oost-Vlaanderen', type: 'gemeente', size: 'klein' },
  { name: 'Sint-Lievens-Houtem', slug: 'sint-lievens-houtem', province: 'Oost-Vlaanderen', type: 'gemeente', size: 'klein' }
];

// SEO content variations
const eventTypes = [
  'bruiloften', 'trouwfeesten', 'verjaardagsfeesten', 'communiefeesten', 
  'bedrijfsevents', 'recepties', 'jubileumfeesten', 'tuinfeesten',
  'familiefeesten', 'lentefeesten', 'kerstdiners', 'nieuwjaarsrecepties'
];

const productKeywords = [
  'borden huren', 'servies verhuur', 'tafeldekking', 'glaswerk huren',
  'bestek verhuur', 'champagneglazen', 'wijnglazen huren', 'dinerborden',
  'dessertborden', 'koffiekopjes', 'theekopjes', 'schalen huren',
  'tafellinnen', 'tafellakens', 'servetten', 'stoelhoezen'
];

// Generate unique content for each city
function generateCityContent(city) {
  const isCoastal = city.type === 'kuststad';
  const isLarge = city.size === 'groot';
  const isMedium = city.size === 'middelgroot';
  
  // Unique intro based on city characteristics
  let intro = '';
  if (isCoastal) {
    intro = `Organiseert u een feest aan de kust in ${city.name}? Tafel Totaal levert professioneel servies en tafeldekking voor uw strandreceptie, zomerfeest of kustbruiloft.`;
  } else if (isLarge) {
    intro = `In de bruisende stad ${city.name} organiseert u een onvergetelijk feest met de serviesverhuur van Tafel Totaal. Van intieme diners tot grote recepties, wij verzorgen uw complete tafeldekking.`;
  } else if (isMedium) {
    intro = `Voor uw feest in ${city.name} biedt Tafel Totaal hoogwaardige serviesverhuur en tafeldekking. Perfect voor bruiloften, communiefeesten en bedrijfsevents.`;
  } else {
    intro = `Tafel Totaal verzorgt professionele serviesverhuur in ${city.name} en omgeving. Ideaal voor familiefeesten, jubilea en andere bijzondere gelegenheden.`;
  }
  
  return {
    intro,
    sections: [
      {
        title: `Borden Huren in ${city.name}`,
        content: `Op zoek naar **borden huren** voor uw feest in ${city.name}? Tafel Totaal biedt een uitgebreid assortiment dinerborden, dessertborden en ontbijtborden. Of u nu een intiem diner organiseert of een groot trouwfeest, wij hebben de juiste borden voor elke gelegenheid. Onze borden worden professioneel gereinigd en geleverd in perfecte staat.

Ons bordassortiment omvat:
- **Dinerborden** (27cm) - Perfect voor hoofdgerechten
- **Dessertborden** (21cm) - Ideaal voor voorgerechten en desserts  
- **Ontbijtborden** (19cm) - Voor brunch en ontbijtbuffetten
- **Soepborden** - Diep model voor soepen en pasta's
- **Presentatieborden** - Voor stijlvolle tafeldekking

Alle borden zijn stapelbaar voor eenvoudige opslag en levering. Wij leveren en halen op in heel ${city.name} en omliggende gemeenten.`
      },
      {
        title: `Servies Verhuur ${city.name}`,
        content: `Tafel Totaal is uw specialist in **servies verhuur** voor ${city.name}. Ons complete servies omvat borden, kommen, schalen en serveermateriaal. Perfect voor:

**Bruiloften & Trouwfeesten**
Voor uw grote dag in ${city.name} bieden wij elegant servies dat past bij uw thema. Van klassiek wit porselein tot moderne designs, wij maken uw tafeldekking compleet.

**Communiefeesten & Lentefeesten**
Vier de eerste communie met stijlvol servies. Onze collectie is geschikt voor feesten van 20 tot 200+ gasten.

**Bedrijfsevents & Recepties**
Professioneel servies voor uw zakelijke evenement in ${city.name}. Wij leveren op tijd en zorgen voor een vlekkeloze presentatie.

**Verjaardagsfeesten & Jubilea**
Maak uw feest onvergetelijk met hoogwaardig servies. Van tuinfeesten tot formele diners, wij hebben het juiste materiaal.`
      },
      {
        title: `Tafeldekking & Glaswerk`,
        content: `Een perfecte **tafeldekking** maakt uw feest in ${city.name} compleet. Tafel Totaal biedt niet alleen servies, maar ook:

**Glaswerk Verhuur**
- Wijnglazen (rood & wit)
- Champagneglazen & flutes
- Waterglazen & tumbler glazen
- Cocktailglazen
- Bierglazen

**Bestek & Tafellinnen**
- Complete besteksets (mes, vork, lepel)
- Dessertbestek
- Tafellinnen en servetten
- Tafellakens in verschillende kleuren
- Stoelhoezen voor een stijlvolle uitstraling

**Serveermateriaal**
- Schalen en plateaus
- Koffie- en theeservies
- Suiker- en melkkannetjes
- Broodmanden
- Serveerbestekken

Al ons glaswerk wordt met de hand gepoetst voor een sprankelende glans. Perfect voor uw trouwfeest, receptie of gala in ${city.name}.`
      },
      {
        title: `Waarom Kiezen voor Tafel Totaal in ${city.name}?`,
        content: `**Lokale Service**
Wij kennen ${city.name} en omgeving. Snelle levering en persoonlijke service staan bij ons centraal.

**Topkwaliteit Servies**
Al ons servies wordt professioneel gereinigd volgens horeca-normen. Geen vlekken, geen beschadigingen.

**Flexibele Verhuurperiodes**
Huur voor één dag of een heel weekend. Wij passen ons aan uw planning aan.

**Gratis Offerte**
Vraag vrijblijvend een offerte aan voor uw feest in ${city.name}. Wij denken graag met u mee.

**Wij Doen de Afwas**
Na uw feest hoeft u het servies alleen maar in te laden. Wij zorgen voor de reiniging.

**Groot Assortiment**
Van 20 tot 500+ personen, wij hebben voldoende voorraad voor elk feest.`
      },
      {
        title: `Veelgestelde Vragen - Serviesverhuur ${city.name}`,
        content: `**Hoeveel kost borden huren in ${city.name}?**
Onze prijzen starten vanaf €0,50 per bord. Voor een complete offerte kunt u contact met ons opnemen.

**Leveren jullie ook in kleine dorpen rond ${city.name}?**
Ja, wij leveren in heel ${city.name} en omliggende gemeenten binnen een straal van 15km.

**Moet ik het servies schoonmaken na gebruik?**
Nee, u hoeft alleen grof vuil te verwijderen. Wij zorgen voor de professionele reiniging.

**Kan ik het servies een dag van tevoren ophalen?**
Ja, dat is mogelijk. Zo heeft u voldoende tijd om alles klaar te zetten voor uw feest.

**Wat als er iets breekt?**
Kleine breuk is inbegrepen in de huurprijs. Bij grote schade wordt dit in overleg afgehandeld.

**Hebben jullie ook servies voor kinderfeesten?**
Ja, wij hebben kindvriendelijk servies en plastic bekers beschikbaar.`
      }
    ],
    cta: `Klaar om uw feest in ${city.name} te organiseren? **Vraag vandaag nog een vrijblijvende offerte aan** voor borden huren, servies verhuur en complete tafeldekking. Bel ons of vul het contactformulier in. Wij helpen u graag!`
  };
}

// Generate content sections HTML
function generateContentHTML(city) {
  const content = generateCityContent(city);
  
  return `
    <!-- Location Detail Page CSS -->
    <link rel="stylesheet" href="/Tafel-Totaal/css/pages/location-detail.css">

    <!-- Hero Section (Brutalist) -->
    <header class="location-hero">
      <div class="container">
        <div class="location-hero__content">
          <nav class="breadcrumbs" aria-label="Breadcrumb" style="background: transparent; border: none; padding: 0; margin-bottom: var(--space-xl);">
            <a href="/Tafel-Totaal/">Home</a>
            <span style="margin: 0 var(--space-xs);">/</span>
            <a href="/Tafel-Totaal/locaties.html">Locaties</a>
            <span style="margin: 0 var(--space-xs);">/</span>
            <span>${city.name}</span>
          </nav>
          
          <h1 class="location-hero__title" data-animate="fade-up">
            Servies Verhuur<br>
            <span style="color: var(--color-primary);">${city.name}</span>
          </h1>
          
          <p class="location-hero__subtitle" data-animate="fade-up" class="delay-1">
            ${content.intro}
          </p>
          
          <div data-animate="fade-up" class="delay-2" style="display: flex; gap: var(--space-md); flex-wrap: wrap;">
            <a href="/Tafel-Totaal/pakketten.html" class="btn btn--primary btn--lg">Bekijk Pakketten</a>
            <a href="/Tafel-Totaal/producten.html" class="btn btn--white btn--lg">Losse Producten</a>
          </div>
        </div>
      </div>
      
      <!-- Decorative Grid Lines -->
      <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 1px; background: var(--color-black);"></div>
      <div style="position: absolute; top: 0; right: 10%; width: 1px; height: 100%; background: var(--color-black); opacity: 0.1;"></div>
    </header>

    <!-- USPs (Bento Grid) -->
    <section class="content-section" style="background-color: var(--color-white);">
      <div class="container">
        <div class="bento-grid">
          <div class="bento-item bento-item--medium" data-animate="scale" class="delay-1">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <h3 class="section-title" style="font-size: var(--font-size-xl); margin-bottom: var(--space-sm);">Lokale Service</h3>
            <p style="color: var(--color-dark-gray);">Levering in heel ${city.name} en omgeving. Wij kennen de regio en leveren stipt op tijd.</p>
          </div>
          
          <div class="bento-item bento-item--medium" data-animate="scale" class="delay-2">
            <div class="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3 class="section-title" style="font-size: var(--font-size-xl); margin-bottom: var(--space-sm);">Wij Doen de Afwas</h3>
            <p style="color: var(--color-dark-gray);">Geen zorgen na het feest. U levert het servies vuil in, wij zorgen voor de professionele reiniging.</p>
          </div>

          <div class="bento-item bento-item--small" data-animate="scale" class="delay-3">
            <h3 class="section-title" style="font-size: var(--font-size-lg);">Groot Assortiment</h3>
            <ul style="list-style: none; padding: 0; margin: 0; color: var(--color-dark-gray);">
              <li style="margin-bottom: var(--space-xs); display: flex; align-items: center; gap: 8px;">
                <span style="width: 6px; height: 6px; background: var(--color-primary); display: block;"></span> Borden & Bestek
              </li>
              <li style="margin-bottom: var(--space-xs); display: flex; align-items: center; gap: 8px;">
                <span style="width: 6px; height: 6px; background: var(--color-primary); display: block;"></span> Glaswerk
              </li>
              <li style="margin-bottom: var(--space-xs); display: flex; align-items: center; gap: 8px;">
                <span style="width: 6px; height: 6px; background: var(--color-primary); display: block;"></span> Tafellinnen
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content Sections -->
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr; gap: 0;">
        
        ${content.sections.map((section, index) => `
        <section class="content-section" data-animate="fade-up">
          <div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: var(--space-xl);">
            <div style="grid-column: span 12; md:grid-column: span 4;">
              <h2 class="section-title" style="position: sticky; top: var(--space-2xl);">
                ${section.title}
              </h2>
            </div>
            <div style="grid-column: span 12; md:grid-column: span 8; font-size: var(--font-size-lg); line-height: 1.8;">
              ${section.content.split('\n\n').map(para => 
                para.startsWith('**') && para.endsWith('**') 
                  ? `<h3 style="font-family: var(--font-display); text-transform: uppercase; font-size: var(--font-size-xl); margin: var(--space-xl) 0 var(--space-md); color: var(--color-black);">${para.replace(/\*\*/g, '')}</h3>`
                  : para.startsWith('- ')
                    ? `<ul style="margin: var(--space-md) 0; padding-left: var(--space-xl); border-left: 2px solid var(--color-light-gray);">${para.split('\n').map(li => 
                        li.startsWith('- ') ? `<li style="margin-bottom: var(--space-sm); list-style: none;">${li.substring(2).replace(/\*\*/g, '<strong>').replace(/\*\*/g, '</strong>')}</li>` : ''
                      ).join('')}</ul>`
                    : `<p style="margin-bottom: var(--space-md);">${para.replace(/\*\*/g, '<strong>').replace(/\*\*/g, '</strong>')}</p>`
              ).join('')}
            </div>
          </div>
        </section>
        `).join('')}

      </div>
    </div>

    <!-- CTA Section (Brutalist) -->
    <section style="padding: var(--space-5xl) 0;">
      <div class="container">
        <div class="cta-box" data-animate="scale">
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 10px, transparent 10px, transparent 20px);"></div>
          
          <h2 class="cta-box__title">Vraag Uw Offerte Aan</h2>
          <p class="cta-box__text">
            ${content.cta}
          </p>
          <div style="position: relative; z-index: 2; display: flex; gap: var(--space-md); justify-content: center; flex-wrap: wrap;">
            <a href="/Tafel-Totaal/contact.html" class="btn btn--white btn--lg">Contacteer Ons</a>
            <a href="/Tafel-Totaal/pakketten.html" class="btn btn--ghost btn--lg" style="color: white; border-color: white;">Bekijk Pakketten</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

// Process all cities
console.log('🚀 Generating SEO content for 60 location pages...\n');

let successCount = 0;
let errorCount = 0;

cities.forEach(city => {
  try {
    const filePath = path.join(__dirname, '../public/locaties', `${city.slug}.html`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${city.name} - file doesn't exist`);
      errorCount++;
      return;
    }
    
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Find the insertion point (after product showcase, before CTA section)
    const insertMarker = '<!-- CTA Section -->';
    const insertIndex = html.indexOf(insertMarker);
    
    if (insertIndex === -1) {
      console.log(`⚠️  Warning: Could not find insertion point in ${city.name}`);
      errorCount++;
      return;
    }
    
    // Generate content
    const contentHTML = generateContentHTML(city);
    
    // Insert content before map section
    html = html.slice(0, insertIndex) + contentHTML + '\n    ' + html.slice(insertIndex);
    
    // Write back
    fs.writeFileSync(filePath, html, 'utf8');
    
    console.log(`✅ ${city.name} - SEO content added`);
    successCount++;
    
  } catch (error) {
    console.error(`❌ Error processing ${city.name}:`, error.message);
    errorCount++;
  }
});

console.log(`\n✨ Done! ${successCount} pages updated, ${errorCount} errors`);
