/**
 * Generate all location pages for West and Oost-Vlaanderen
 * Each page has unique content, animations, and product showcase
 */

const fs = require('fs');
const path = require('path');

const cities = {
  'west-vlaanderen': [
    { name: 'Brugge', slug: 'brugge', postal: '8000', province: 'West-Vlaanderen' },
    { name: 'Kortrijk', slug: 'kortrijk', postal: '8500', province: 'West-Vlaanderen' },
    { name: 'Oostende', slug: 'oostende', postal: '8400', province: 'West-Vlaanderen' },
    { name: 'Roeselare', slug: 'roeselare', postal: '8800', province: 'West-Vlaanderen' },
    { name: 'Waregem', slug: 'waregem', postal: '8790', province: 'West-Vlaanderen' },
    { name: 'Ieper', slug: 'ieper', postal: '8900', province: 'West-Vlaanderen' },
    { name: 'Menen', slug: 'menen', postal: '8930', province: 'West-Vlaanderen' },
    { name: 'Torhout', slug: 'torhout', postal: '8820', province: 'West-Vlaanderen' },
    { name: 'Izegem', slug: 'izegem', postal: '8870', province: 'West-Vlaanderen' },
    { name: 'Tielt', slug: 'tielt', postal: '8700', province: 'West-Vlaanderen' },
    { name: 'Knokke-Heist', slug: 'knokke-heist', postal: '8300', province: 'West-Vlaanderen' },
    { name: 'Blankenberge', slug: 'blankenberge', postal: '8370', province: 'West-Vlaanderen' },
    { name: 'Harelbeke', slug: 'harelbeke', postal: '8530', province: 'West-Vlaanderen' },
    { name: 'Wevelgem', slug: 'wevelgem', postal: '8560', province: 'West-Vlaanderen' },
    { name: 'Kuurne', slug: 'kuurne', postal: '8520', province: 'West-Vlaanderen' },
    { name: 'Deerlijk', slug: 'deerlijk', postal: '8540', province: 'West-Vlaanderen' },
    { name: 'Zwevegem', slug: 'zwevegem', postal: '8550', province: 'West-Vlaanderen' },
    { name: 'Poperinge', slug: 'poperinge', postal: '8970', province: 'West-Vlaanderen' },
    { name: 'Diksmuide', slug: 'diksmuide', postal: '8600', province: 'West-Vlaanderen' },
    { name: 'Oostkamp', slug: 'oostkamp', postal: '8020', province: 'West-Vlaanderen' },
    { name: 'Zedelgem', slug: 'zedelgem', postal: '8210', province: 'West-Vlaanderen' },
    { name: 'Lichtervelde', slug: 'lichtervelde', postal: '8810', province: 'West-Vlaanderen' },
    { name: 'Wervik', slug: 'wervik', postal: '8940', province: 'West-Vlaanderen' },
    { name: 'Wingene', slug: 'wingene', postal: '8750', province: 'West-Vlaanderen' },
    { name: 'Gistel', slug: 'gistel', postal: '8470', province: 'West-Vlaanderen' },
    { name: 'Moorslede', slug: 'moorslede', postal: '8890', province: 'West-Vlaanderen' },
    { name: 'Staden', slug: 'staden', postal: '8840', province: 'West-Vlaanderen' },
    { name: 'Kortemark', slug: 'kortemark', postal: '8610', province: 'West-Vlaanderen' },
    { name: 'Ardooie', slug: 'ardooie', postal: '8850', province: 'West-Vlaanderen' },
    { name: 'Anzegem', slug: 'anzegem', postal: '8570', province: 'West-Vlaanderen' }
  ],
  'oost-vlaanderen': [
    { name: 'Gent', slug: 'gent', postal: '9000', province: 'Oost-Vlaanderen' },
    { name: 'Aalst', slug: 'aalst', postal: '9300', province: 'Oost-Vlaanderen' },
    { name: 'Sint-Niklaas', slug: 'sint-niklaas', postal: '9100', province: 'Oost-Vlaanderen' },
    { name: 'Dendermonde', slug: 'dendermonde', postal: '9200', province: 'Oost-Vlaanderen' },
    { name: 'Lokeren', slug: 'lokeren', postal: '9160', province: 'Oost-Vlaanderen' },
    { name: 'Oudenaarde', slug: 'oudenaarde', postal: '9700', province: 'Oost-Vlaanderen' },
    { name: 'Ninove', slug: 'ninove', postal: '9400', province: 'Oost-Vlaanderen' },
    { name: 'Zottegem', slug: 'zottegem', postal: '9620', province: 'Oost-Vlaanderen' },
    { name: 'Geraardsbergen', slug: 'geraardsbergen', postal: '9500', province: 'Oost-Vlaanderen' },
    { name: 'Eeklo', slug: 'eeklo', postal: '9900', province: 'Oost-Vlaanderen' },
    { name: 'Deinze', slug: 'deinze', postal: '9800', province: 'Oost-Vlaanderen' },
    { name: 'Ronse', slug: 'ronse', postal: '9600', province: 'Oost-Vlaanderen' },
    { name: 'Wetteren', slug: 'wetteren', postal: '9230', province: 'Oost-Vlaanderen' },
    { name: 'Lebbeke', slug: 'lebbeke', postal: '9280', province: 'Oost-Vlaanderen' },
    { name: 'Merelbeke', slug: 'merelbeke', postal: '9820', province: 'Oost-Vlaanderen' },
    { name: 'Beveren', slug: 'beveren', postal: '9120', province: 'Oost-Vlaanderen' },
    { name: 'Lede', slug: 'lede', postal: '9340', province: 'Oost-Vlaanderen' },
    { name: 'Erpe-Mere', slug: 'erpe-mere', postal: '9420', province: 'Oost-Vlaanderen' },
    { name: 'Waasmunster', slug: 'waasmunster', postal: '9250', province: 'Oost-Vlaanderen' },
    { name: 'Temse', slug: 'temse', postal: '9140', province: 'Oost-Vlaanderen' },
    { name: 'Lochristi', slug: 'lochristi', postal: '9080', province: 'Oost-Vlaanderen' },
    { name: 'Evergem', slug: 'evergem', postal: '9940', province: 'Oost-Vlaanderen' },
    { name: 'Zelzate', slug: 'zelzate', postal: '9060', province: 'Oost-Vlaanderen' },
    { name: 'Destelbergen', slug: 'destelbergen', postal: '9070', province: 'Oost-Vlaanderen' },
    { name: 'Nazareth', slug: 'nazareth', postal: '9810', province: 'Oost-Vlaanderen' },
    { name: 'Maldegem', slug: 'maldegem', postal: '9990', province: 'Oost-Vlaanderen' },
    { name: 'Hamme', slug: 'hamme', postal: '9220', province: 'Oost-Vlaanderen' },
    { name: 'Assenede', slug: 'assenede', postal: '9960', province: 'Oost-Vlaanderen' },
    { name: 'Kaprijke', slug: 'kaprijke', postal: '9970', province: 'Oost-Vlaanderen' },
    { name: 'Sint-Lievens-Houtem', slug: 'sint-lievens-houtem', postal: '9520', province: 'Oost-Vlaanderen' }
  ]
};

// Unique descriptions for each city type
const cityDescriptions = {
  large: [
    'Een bruisende stad met een rijk cultureel erfgoed en moderne evenementlocaties.',
    'De perfecte combinatie van historische charme en eigentijdse faciliteiten voor uw feest.',
    'Een levendige stad waar traditie en innovatie samenkomen voor onvergetelijke evenementen.'
  ],
  medium: [
    'Een gezellige stad met prachtige locaties voor uw bijzondere momenten.',
    'De ideale setting voor intieme feesten en grootse celebraties.',
    'Een charmante stad met uitstekende mogelijkheden voor uw evenement.'
  ],
  small: [
    'Een pittoresk stadje met een warme, gastvrije sfeer voor uw feest.',
    'De perfecte locatie voor authentieke en persoonlijke evenementen.',
    'Een verborgen parel met unieke locaties voor uw viering.'
  ]
};

const eventTypes = [
  'bruiloften', 'communiefeesten', 'bedrijfsevents', 'verjaardagsfeesten', 
  'jubilea', 'babyborrels', 'tuinfeesten', 'familiebijeenkomsten'
];

function getCitySize(name) {
  const largeCities = ['Gent', 'Brugge', 'Aalst', 'Kortrijk', 'Oostende', 'Sint-Niklaas', 'Roeselare'];
  const mediumCities = ['Dendermonde', 'Lokeren', 'Oudenaarde', 'Ninove', 'Waregem', 'Ieper', 'Menen', 'Torhout'];
  
  if (largeCities.includes(name)) return 'large';
  if (mediumCities.includes(name)) return 'medium';
  return 'small';
}

function getRandomDescription(size) {
  const descriptions = cityDescriptions[size];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function getRandomEvents() {
  const shuffled = [...eventTypes].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
}

function generateLocationPage(city) {
  const size = getCitySize(city.name);
  const description = getRandomDescription(size);
  const events = getRandomEvents();
  
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO Meta Tags -->
  <title>Servies & Tafelverhuur ${city.name} | Tafel Totaal</title>
  <meta name="description" content="Professionele servies- en tafelverhuur in ${city.name}. ${description} Levering mogelijk in heel ${city.name} en omgeving!">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://leelars.github.io/Tafel-Totaal/locaties/${city.slug}.html" id="canonical-link">
  
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
  
  <style>
    /* Location-specific animations */
    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-50px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(50px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    [data-animate="slide-left"] {
      opacity: 0;
      animation: slideInLeft 0.6s ease-out forwards;
    }
    
    [data-animate="slide-right"] {
      opacity: 0;
      animation: slideInRight 0.6s ease-out forwards;
    }
    
    [data-animate="fade-up"] {
      opacity: 0;
      animation: fadeInUp 0.6s ease-out forwards;
    }
    
    [data-animate="scale"] {
      opacity: 0;
      animation: scaleIn 0.6s ease-out forwards;
    }
    
    .delay-1 { animation-delay: 0.1s; }
    .delay-2 { animation-delay: 0.2s; }
    .delay-3 { animation-delay: 0.3s; }
    .delay-4 { animation-delay: 0.4s; }
    
    /* Product card hover effect */
    .product-card {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .product-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);
    }
    
    .product-card img {
      transition: transform 0.3s ease;
    }
    
    .product-card:hover img {
      transform: scale(1.05);
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div id="header-container"></div>

  <main>
    <!-- Breadcrumb -->
    <section style="padding: var(--space-lg) 0; background: var(--color-white); border-bottom: 1px solid var(--color-light-gray);">
      <div class="container">
        <nav aria-label="Breadcrumb" style="font-family: var(--font-mono); text-transform: uppercase; font-size: var(--font-size-xs); letter-spacing: 0.08em; color: var(--color-gray);">
          <a href="/Tafel-Totaal/" style="color: inherit; text-decoration: none;">Home</a>
          <span style="opacity: 0.6; margin: 0 var(--space-xs);">/</span>
          <a href="/Tafel-Totaal/locaties.html" style="color: inherit; text-decoration: none;">Locaties</a>
          <span style="opacity: 0.6; margin: 0 var(--space-xs);">/</span>
          <span style="color: var(--color-black);">${city.name}</span>
        </nav>
      </div>
    </section>

    <!-- Hero Section -->
    <section style="background: linear-gradient(135deg, var(--color-concrete) 0%, var(--color-off-white) 100%); padding: var(--space-5xl) 0; position: relative; overflow: hidden;">
      <div class="container">
        <div style="max-width: 900px; margin: 0 auto; text-align: center;">
          <h1 data-animate="fade-up" style="font-family: var(--font-display); font-size: clamp(2.5rem, 6vw, 5rem); text-transform: uppercase; margin-bottom: var(--space-lg); line-height: 1.1;">
            Servies & Tafelverhuur<br>
            <span style="color: var(--color-primary);">${city.name}</span>
          </h1>
          <p data-animate="fade-up" class="delay-1" style="font-size: var(--font-size-xl); color: var(--color-dark-gray); margin-bottom: var(--space-2xl); line-height: 1.6;">
            ${description}
          </p>
          <div data-animate="fade-up" class="delay-2" style="display: flex; gap: var(--space-md); justify-content: center; flex-wrap: wrap;">
            <a href="/Tafel-Totaal/pakketten.html" class="btn btn--primary btn--xl">Bekijk Pakketten</a>
            <a href="/Tafel-Totaal/producten/" class="btn btn--secondary btn--xl">Losse Producten</a>
          </div>
        </div>
      </div>
      
      <!-- Decorative element -->
      <div style="position: absolute; bottom: -50px; right: -50px; width: 300px; height: 300px; background: var(--color-primary); opacity: 0.05; border-radius: 50%; z-index: 0;"></div>
    </section>

    <!-- USP Section -->
    <section style="padding: var(--space-4xl) 0; background: var(--color-white);">
      <div class="container">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--space-xl);">
          <div data-animate="scale" class="delay-1" style="text-align: center; padding: var(--space-xl); border: 1px solid var(--color-light-gray); background: var(--color-off-white);">
            <div style="width: 64px; height: 64px; background: var(--color-primary); margin: 0 auto var(--space-md); display: flex; align-items: center; justify-content: center;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <h3 style="font-family: var(--font-display); text-transform: uppercase; margin-bottom: var(--space-sm); font-size: var(--font-size-lg);">Levering Mogelijk</h3>
            <p style="color: var(--color-gray); font-size: var(--font-size-sm);">In heel ${city.name} en omgeving</p>
          </div>
          
          <div data-animate="scale" class="delay-2" style="text-align: center; padding: var(--space-xl); border: 1px solid var(--color-light-gray); background: var(--color-off-white);">
            <div style="width: 64px; height: 64px; background: var(--color-success); margin: 0 auto var(--space-md); display: flex; align-items: center; justify-content: center;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3 style="font-family: var(--font-display); text-transform: uppercase; margin-bottom: var(--space-sm); font-size: var(--font-size-lg);">Topkwaliteit</h3>
            <p style="color: var(--color-gray); font-size: var(--font-size-sm);">Professioneel gereinigd servies</p>
          </div>
          
          <div data-animate="scale" class="delay-3" style="text-align: center; padding: var(--space-xl); border: 1px solid var(--color-light-gray); background: var(--color-off-white);">
            <div style="width: 64px; height: 64px; background: var(--color-info, #3B82F6); margin: 0 auto var(--space-md); display: flex; align-items: center; justify-content: center;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3 style="font-family: var(--font-display); text-transform: uppercase; margin-bottom: var(--space-sm); font-size: var(--font-size-lg);">Flexibel</h3>
            <p style="color: var(--color-gray); font-size: var(--font-size-sm);">Aangepast aan uw evenement</p>
          </div>
          
          <div data-animate="scale" class="delay-4" style="text-align: center; padding: var(--space-xl); border: 1px solid var(--color-light-gray); background: var(--color-off-white);">
            <div style="width: 64px; height: 64px; background: var(--color-warning, #F59E0B); margin: 0 auto var(--space-md); display: flex; align-items: center; justify-content: center;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3 style="font-family: var(--font-display); text-transform: uppercase; margin-bottom: var(--space-sm); font-size: var(--font-size-lg);">Betrouwbaar</h3>
            <p style="color: var(--color-gray); font-size: var(--font-size-sm);">Jarenlange ervaring</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Events Section -->
    <section style="padding: var(--space-4xl) 0; background: var(--color-concrete);">
      <div class="container">
        <div style="text-align: center; margin-bottom: var(--space-3xl);">
          <h2 data-animate="fade-up" style="font-family: var(--font-display); text-transform: uppercase; font-size: clamp(2rem, 4vw, 3rem); margin-bottom: var(--space-md);">
            Perfect voor uw evenement in ${city.name}
          </h2>
          <p data-animate="fade-up" class="delay-1" style="font-size: var(--font-size-lg); color: var(--color-gray); max-width: 700px; margin: 0 auto;">
            Wij leveren professioneel serviesgoed voor alle soorten evenementen
          </p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-lg);">
          ${events.map((event, i) => `
          <div data-animate="fade-up" class="delay-${i + 1}" style="padding: var(--space-xl); background: var(--color-white); border: 1px solid var(--color-black); text-align: center;">
            <h3 style="font-family: var(--font-display); text-transform: uppercase; font-size: var(--font-size-lg); margin-bottom: var(--space-sm);">
              ${event.charAt(0).toUpperCase() + event.slice(1)}
            </h3>
            <p style="color: var(--color-gray); font-size: var(--font-size-sm);">Professionele verhuur</p>
          </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Products Showcase -->
    <section style="padding: var(--space-4xl) 0; background: var(--color-white);">
      <div class="container">
        <div style="text-align: center; margin-bottom: var(--space-3xl);">
          <h2 data-animate="fade-up" style="font-family: var(--font-display); text-transform: uppercase; font-size: clamp(2rem, 4vw, 3rem); margin-bottom: var(--space-md);">
            Ons Assortiment
          </h2>
          <p data-animate="fade-up" class="delay-1" style="font-size: var(--font-size-lg); color: var(--color-gray);">
            Ontdek onze collectie serviesgoed en tafeldecoratie
          </p>
        </div>
        
        <div id="products-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-xl);">
          <!-- Products will be loaded dynamically -->
        </div>
        
        <div style="text-align: center; margin-top: var(--space-3xl);">
          <a href="/Tafel-Totaal/producten/" class="btn btn--primary btn--lg">Bekijk Alle Producten</a>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section style="padding: var(--space-5xl) 0; background: var(--color-black); color: var(--color-white); text-align: center; position: relative; overflow: hidden;">
      <div class="container" style="position: relative; z-index: 1;">
        <h2 data-animate="fade-up" style="font-family: var(--font-display); text-transform: uppercase; font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: var(--space-lg);">
          Klaar om te bestellen?
        </h2>
        <p data-animate="fade-up" class="delay-1" style="font-size: var(--font-size-xl); margin-bottom: var(--space-2xl); max-width: 700px; margin-left: auto; margin-right: auto; opacity: 0.9;">
          Reserveer vandaag nog uw serviesgoed voor uw evenement in ${city.name}
        </p>
        <div data-animate="fade-up" class="delay-2" style="display: flex; gap: var(--space-md); justify-content: center; flex-wrap: wrap;">
          <a href="/Tafel-Totaal/pakketten.html" class="btn btn--white btn--xl">Bekijk Pakketten</a>
          <a href="/Tafel-Totaal/contact.html" class="btn btn--ghost btn--xl" style="color: white; border-color: white;">Contact Opnemen</a>
        </div>
      </div>
      
      <!-- Decorative elements -->
      <div style="position: absolute; top: -100px; left: -100px; width: 400px; height: 400px; background: var(--color-primary); opacity: 0.1; border-radius: 50%;"></div>
      <div style="position: absolute; bottom: -150px; right: -150px; width: 500px; height: 500px; background: var(--color-primary); opacity: 0.1; border-radius: 50%;"></div>
    </section>
  </main>

  <!-- Footer -->
  <div id="footer-container"></div>

  <!-- Scripts -->
  <script type="module">
    import { loadHeader } from '/Tafel-Totaal/js/components/header.js';
    import { loadFooter } from '/Tafel-Totaal/js/components/footer.js';
    
    // Load header and footer
    await loadHeader();
    await loadFooter();
    
    // Load featured products
    async function loadProducts() {
      try {
        const API_BASE = window.location.hostname.includes('github.io')
          ? 'https://tafel-totaal-production.up.railway.app'
          : 'http://localhost:3000';
        
        const response = await fetch(\`\${API_BASE}/api/products?limit=6\`);
        const data = await response.json();
        
        if (data.success && data.data) {
          renderProducts(data.data.slice(0, 6));
        }
      } catch (error) {
        console.error('Error loading products:', error);
      }
    }
    
    function renderProducts(products) {
      const grid = document.getElementById('products-grid');
      if (!grid || !products.length) return;
      
      grid.innerHTML = products.map((product, i) => \`
        <article class="product-card" data-animate="scale" style="animation-delay: \${i * 0.1}s; border: 1px solid var(--color-light-gray); overflow: hidden; background: var(--color-white);">
          <a href="/Tafel-Totaal/product.html?id=\${product.id}" style="text-decoration: none; color: inherit;">
            <div style="aspect-ratio: 1; overflow: hidden; background: var(--color-concrete);">
              <img src="\${product.images?.[0] || '/Tafel-Totaal/images/products/placeholder.jpg'}" 
                   alt="\${product.name}" 
                   style="width: 100%; height: 100%; object-fit: cover;"
                   loading="lazy">
            </div>
            <div style="padding: var(--space-lg);">
              <div style="font-size: var(--font-size-xs); text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-primary); margin-bottom: var(--space-xs);">
                \${product.category_name || 'Product'}
              </div>
              <h3 style="font-family: var(--font-display); text-transform: uppercase; font-size: var(--font-size-lg); margin-bottom: var(--space-sm);">
                \${product.name}
              </h3>
              <p style="font-size: var(--font-size-xl); font-weight: bold; color: var(--color-primary);">
                €\${product.price_per_day?.toFixed(2) || '0.00'} /dag
              </p>
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
          entry.target.style.opacity = '1';
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

// Generate all pages
function generateAllPages() {
  const outputDir = path.join(__dirname, '..', 'public', 'locaties');
  
  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  let count = 0;
  
  // Generate West-Vlaanderen pages
  cities['west-vlaanderen'].forEach(city => {
    const html = generateLocationPage(city);
    const filePath = path.join(outputDir, `${city.slug}.html`);
    fs.writeFileSync(filePath, html, 'utf8');
    count++;
    console.log(`✅ Generated: ${city.slug}.html`);
  });
  
  // Generate Oost-Vlaanderen pages
  cities['oost-vlaanderen'].forEach(city => {
    const html = generateLocationPage(city);
    const filePath = path.join(outputDir, `${city.slug}.html`);
    fs.writeFileSync(filePath, html, 'utf8');
    count++;
    console.log(`✅ Generated: ${city.slug}.html`);
  });
  
  console.log(`\n🎉 Successfully generated ${count} location pages!`);
}

// Run the generator
generateAllPages();
