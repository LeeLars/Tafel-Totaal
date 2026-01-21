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

// Generate full HTML page
function generateFullPageHTML(city) {
  const content = generateCityContent(city);
  
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO Meta Tags -->
  <title>Servies & Tafelverhuur ${city.name} | Tafel Totaal</title>
  <meta name="description" content="Professionele servies- en tafelverhuur in ${city.name}. ${content.intro.substring(0, 150)}...">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://leelars.github.io/Tafel-Totaal/locaties/${city.slug}.html">
  
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Servies & Tafelverhuur ${city.name} | Tafel Totaal">
  <meta property="og:description" content="Professionele servies- en tafelverhuur in ${city.name}. Levering mogelijk!">
  <meta property="og:image" content="/Tafel-Totaal/images/site/Logo-T-T-Zwart-transparant.png">
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/Tafel-Totaal/images/site/Favicon-tafel-totaal.png">
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Righteous&family=Roboto+Mono:wght@400;500;600&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  
  <!-- Stylesheets -->
  <link rel="stylesheet" href="/Tafel-Totaal/css/variables.css">
  <link rel="stylesheet" href="/Tafel-Totaal/css/base.css">
  <link rel="stylesheet" href="/Tafel-Totaal/css/components.css">
  <link rel="stylesheet" href="/Tafel-Totaal/css/utilities.css">
  <link rel="stylesheet" href="/Tafel-Totaal/css/pages/location-detail.css">
</head>
<body>
  <!-- Header -->
  <div id="header-container"></div>

  <main>
    <!-- Marquee Section -->
    <div class="marquee-section">
      <div class="marquee-track">
        <div class="marquee-content">
          <span>LEVERING IN ${city.name.toUpperCase()}</span> <span class="separator">•</span>
          <span>GEEN AFWAS</span> <span class="separator">•</span>
          <span>SERVIES & MEUBILAIR</span> <span class="separator">•</span>
          <span>VOOR ELK EVENT</span> <span class="separator">•</span>
          <span>LEVERING IN ${city.name.toUpperCase()}</span> <span class="separator">•</span>
          <span>GEEN AFWAS</span> <span class="separator">•</span>
          <span>SERVIES & MEUBILAIR</span> <span class="separator">•</span>
          <span>VOOR ELK EVENT</span> <span class="separator">•</span>
        </div>
        <div class="marquee-content" aria-hidden="true">
          <span>LEVERING IN ${city.name.toUpperCase()}</span> <span class="separator">•</span>
          <span>GEEN AFWAS</span> <span class="separator">•</span>
          <span>SERVIES & MEUBILAIR</span> <span class="separator">•</span>
          <span>VOOR ELK EVENT</span> <span class="separator">•</span>
          <span>LEVERING IN ${city.name.toUpperCase()}</span> <span class="separator">•</span>
          <span>GEEN AFWAS</span> <span class="separator">•</span>
          <span>SERVIES & MEUBILAIR</span> <span class="separator">•</span>
          <span>VOOR ELK EVENT</span> <span class="separator">•</span>
        </div>
      </div>
    </div>

    <!-- Architectural Hero Grid -->
    <section class="hero-grid">
      <!-- Block 1: Main Title -->
      <div class="hero-cell hero-cell--title">
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a href="/Tafel-Totaal/">Home</a>
          <span>/</span>
          <a href="/Tafel-Totaal/locaties.html">Locaties</a>
          <span>/</span>
          <span class="active">${city.name}</span>
        </nav>
        
        <h1 class="hero-title" data-animate="fade-up">
          TAFELVERHUUR <br>
          <span class="text-stroke">${city.name.toUpperCase()}</span>
        </h1>
      </div>

      <!-- Block 2: Image/Visual -->
      <div class="hero-cell hero-cell--visual">
        <img src="/Tafel-Totaal/images/site/hero-table-setting.jpg" alt="Tafelverhuur ${city.name}" class="img-cover" loading="eager">
        <div class="hero-overlay"></div>
      </div>

      <!-- Block 3: Introduction -->
      <div class="hero-cell hero-cell--intro">
        <p class="hero-lead" data-animate="fade-up" class="delay-1">
          ${content.intro}
        </p>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-value">100%</span>
            <span class="stat-label">Service</span>
          </div>
          <div class="stat">
            <span class="stat-value">0%</span>
            <span class="stat-label">Afwas</span>
          </div>
        </div>
      </div>

      <!-- Block 4: CTA -->
      <div class="hero-cell hero-cell--cta">
        <a href="/Tafel-Totaal/pakketten.html" class="btn btn--primary btn--full btn--lg">
          Bekijk Pakketten
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
        <a href="/Tafel-Totaal/contact.html" class="btn btn--ghost btn--full">Offerte Aanvragen</a>
      </div>
    </section>

    <!-- USPs Grid -->
    <section class="usps-grid">
      <div class="usp-item" data-animate="scale" class="delay-1">
        <div class="usp-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <h3>Lokale Service</h3>
        <p>Wij kennen ${city.name} en leveren stipt op tijd op uw locatie.</p>
      </div>
      
      <div class="usp-item" data-animate="scale" class="delay-2">
        <div class="usp-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h3>Wij Doen de Afwas</h3>
        <p>Lever alles vuil in. Wij zorgen voor de professionele reiniging.</p>
      </div>

      <div class="usp-item" data-animate="scale" class="delay-3">
        <div class="usp-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        </div>
        <h3>Alles voor uw Event</h3>
        <p>Van borden en bestek tot tafels en stoelen.</p>
      </div>
    </section>

    <!-- Main Content (Architectural Layout) -->
    <div class="content-wrapper">
      ${content.sections.map((section, index) => `
      <section class="content-row" data-animate="fade-up">
        <div class="content-label">
          <span class="content-number">0${index + 1}</span>
          <h2>${section.title}</h2>
        </div>
        <div class="content-body">
          ${section.content.split('\n\n').map(para => {
            // Convert **text** to <strong>text</strong>
            const convertBold = (text) => text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            
            // Check if paragraph is a standalone heading (starts and ends with **)
            if (para.startsWith('**') && para.match(/^\*\*[^*]+\*\*$/)) {
              return '<h3>' + para.replace(/\*\*/g, '') + '</h3>';
            }
            // Check if it's a list (contains lines starting with -)
            else if (para.includes('\n- ') || para.startsWith('- ')) {
              const lines = para.split('\n');
              let html = '';
              let inList = false;
              
              lines.forEach(line => {
                if (line.startsWith('- ')) {
                  if (!inList) {
                    html += '<ul>';
                    inList = true;
                  }
                  html += '<li>' + convertBold(line.substring(2)) + '</li>';
                } else if (line.trim()) {
                  if (inList) {
                    html += '</ul>';
                    inList = false;
                  }
                  html += '<p>' + convertBold(line) + '</p>';
                }
              });
              
              if (inList) html += '</ul>';
              return html;
            }
            // Regular paragraph
            else {
              return '<p>' + convertBold(para) + '</p>';
            }
          }).join('')}
        </div>
      </section>
      `).join('')}
    </div>

    <!-- Products Showcase (Dynamic) -->
    <section class="products-section">
      <div class="section-header">
        <h2>Populair in ${city.name}</h2>
        <a href="/Tafel-Totaal/producten.html" class="btn-link">Bekijk Alles →</a>
      </div>
      
      <div id="products-grid" class="products-grid">
        <!-- Products will be loaded dynamically -->
        <div class="loading-placeholder">Producten laden...</div>
      </div>
    </section>

    <!-- Statement CTA -->
    <section class="statement-section" data-animate>
      <div class="statement-content">
        <h2 class="statement-title">
          KLAAR OM TE <br>
          <span class="text-stroke-white">FEESTEN?</span>
        </h2>
        <p class="statement-text">
          ${content.cta.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}
        </p>
        <div class="statement-actions">
          <a href="/Tafel-Totaal/contact.html" class="btn btn--white btn--xl">Offerte Aanvragen</a>
          <a href="/Tafel-Totaal/pakketten.html" class="btn btn--outline-white btn--xl">Bekijk Pakketten</a>
        </div>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <div id="footer-container"></div>

  <!-- Scripts -->
  <script type="module">
    import { loadHeader } from '/Tafel-Totaal/js/components/header.js';
    import { loadFooter } from '/Tafel-Totaal/js/components/footer.js';
    import { formatPrice } from '/Tafel-Totaal/js/lib/utils.js';
    
    // Load header and footer
    loadHeader();
    loadFooter();
    
    // Load featured products
    async function loadProducts() {
      try {
        const API_BASE = window.location.hostname.includes('github.io')
          ? 'https://tafel-totaal-production.up.railway.app'
          : 'http://localhost:3000';
        
        const response = await fetch(\`\${API_BASE}/api/products?limit=4\`);
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
      
      grid.innerHTML = products.map((product, i) => \`
        <article class="product-card" data-animate="scale" style="animation-delay: \${i * 0.1}s;">
          <a href="/Tafel-Totaal/product.html?id=\${product.id}" class="product-link">
            <div class="product-image">
              <img src="\${product.images?.[0] || '/Tafel-Totaal/images/products/placeholder.jpg'}" 
                   alt="\${product.name}" 
                   loading="lazy">
            </div>
            <div class="product-info">
              <span class="product-category">\${product.category_name || 'Product'}</span>
              <h3 class="product-title">\${product.name}</h3>
              <p class="product-price">\${formatPrice(product.price_per_day)} <span>/dag</span></p>
            </div>
          </a>
        </article>
      \`).join('');
    }
    
    // Initialize
    loadProducts();
    
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
  </script>
</body>
</html>`;
}

// Process all cities
console.log('🚀 Generating SEO content for 60 location pages...\n');

let successCount = 0;
let errorCount = 0;

cities.forEach(city => {
  try {
    const filePath = path.join(__dirname, '../public/locaties', `${city.slug}.html`);
    
    // Generate full page content
    const html = generateFullPageHTML(city);
    
    // Write full page
    fs.writeFileSync(filePath, html, 'utf8');
    
    console.log(`✅ ${city.name} - Full page generated`);
    successCount++;
    
  } catch (error) {
    console.error(`❌ Error processing ${city.name}:`, error.message);
    errorCount++;
  }
});

console.log(`\n✨ Done! ${successCount} pages generated, ${errorCount} errors`);
