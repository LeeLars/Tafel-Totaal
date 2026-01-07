# Locatie Hub Pagina (Stad Overzicht)

> **Bestand:** `public/verhuur/locatie/[stad].html`  
> **URL:** `/verhuur/locatie/brugge`, `/verhuur/locatie/gent`, etc.  
> **Status:** 📋 Planning (Ultra-Gedetailleerd)

---

## Doel van de pagina

Algemene SEO-landingspagina voor een specifieke stad. Fungeert als **hub** die doorlinkt naar alle categorie-pagina's binnen die stad.

**Zoekintentie:** "servies huren Brugge", "tafel verhuur Gent"  
**Conversie:** Medium (bezoeker moet nog categorie kiezen)

---

## Template Variabelen

| Variabele | Voorbeeld |
|-----------|-----------|
| `{stad}` | Brugge, Gent, Kortrijk |
| `{stad_slug}` | brugge, gent, kortrijk |
| `{provincie}` | West-Vlaanderen, Oost-Vlaanderen |

---

## 1. PAGE HEADER

### Layout & Afmetingen
- **Hoogte:** `50vh` desktop, `40vh` mobiel.
- **Achtergrond:** Sfeerbeeld van de stad (bv. Brugse reien) met overlay.
- **Overlay:** `rgba(26, 26, 26, 0.6)`.
- **Container:** `max-width: 800px`, gecentreerd.
- **Tekst uitlijning:** Gecentreerd.

### Typografie
| Element | Font | Grootte | Kleur | Extra |
|---------|------|---------|-------|-------|
| **H1** | Righteous | `clamp(2rem, 4vw, 3rem)` | `#FFFFFF` | `text-shadow: 0 2px 4px rgba(0,0,0,0.3)` |
| **Subtekst** | Roboto | 18px | `#FFFFFF` | `opacity: 0.9`, `margin-top: 16px` |

### Content
- **H1:** "Servies Huren in {Stad}"
- **Subtekst:** "Tafel Totaal bezorgt in heel {Stad}. Van bord tot glas, zonder de was!"

### Breadcrumbs
- **Content:** `Home > Verhuur > Locatie > {Stad}`
- **Stijl:** Roboto, 14px, kleur `rgba(255,255,255,0.8)`.

---

## 2. INTRO TEKST (SEO)

### Layout
- **Padding:** `48px 0`.
- **Achtergrond:** `#FFFFFF`.
- **Container:** `max-width: 800px`, gecentreerd.

### Content
- **Tekst:** 150-250 woorden unieke SEO-tekst per stad.
- **Font:** Roboto, 16px, kleur `#666666`, `line-height: 1.8`.

**Voorbeeld Brugge:**
> Op zoek naar servies verhuur in Brugge? Tafel Totaal levert compleet tafelservies, bestek en glazen voor jouw event in Brugge en omstreken. Of je nu een bruiloft organiseert in het historische centrum, een bedrijfsevent in de Brugse Ommeland of een verjaardagsfeest thuis - wij bezorgen en halen op. En het beste? Je brengt alles vuil terug, wij doen de afwas!

---

## 3. CATEGORIE GRID

### Layout
- **Padding:** `48px 0`.
- **Achtergrond:** `#F5F5F5`.
- **Container:** `max-width: 1200px`, gecentreerd.

### Sectie Header
| Element | Specificatie |
|---------|-------------|
| **H2** | Righteous, 28px, kleur `#1A1A1A`, "Wat wil je huren in {Stad}?" |
| **Margin-bottom** | `32px` |

### Categorie Cards Grid
- **Desktop:** 3 kolommen, `gap: 24px`.
- **Tablet:** 2 kolommen.
- **Mobiel:** 1 kolom.

### Per Categorie Card
| Element | Specificatie |
|---------|-------------|
| **Container** | Achtergrond `#FFFFFF`, `border-radius: 12px`, `overflow: hidden`, `box-shadow: 0 2px 8px rgba(0,0,0,0.06)` |
| **Afbeelding** | `aspect-ratio: 16/9`, `object-fit: cover` |
| **Content** | `padding: 20px` |
| **Titel** | Roboto Bold, 18px, kleur `#1A1A1A`, "Borden huren in {Stad}" |
| **Tekst** | Roboto, 14px, kleur `#666666`, korte beschrijving |
| **Link** | Hele card is klikbaar → `/verhuur/locatie/{stad}/{categorie}` |
| **Hover** | `transform: translateY(-4px)`, `box-shadow: 0 8px 24px rgba(0,0,0,0.12)` |

### Categorieën
| Categorie | Icon | Link |
|-----------|------|------|
| Borden | Circle | `/verhuur/locatie/{stad}/borden` |
| Glazen | Wine | `/verhuur/locatie/{stad}/glazen` |
| Bestek | Utensils | `/verhuur/locatie/{stad}/bestek` |
| Linnen | Shirt | `/verhuur/locatie/{stad}/linnen` |
| Buffetmateriaal | ChefHat | `/verhuur/locatie/{stad}/buffet` |
| Koffie & Thee | Coffee | `/verhuur/locatie/{stad}/koffie-thee` |

---

## 4. BEZORGGEBIED

### Layout
- **Padding:** `48px 0`.
- **Achtergrond:** `#FFFFFF`.
- **Container:** `max-width: 1200px`, gecentreerd.
- **Grid:** 2 kolommen (kaart + info), `gap: 48px`.

### Linker Kolom: Google Maps
| Element | Specificatie |
|---------|-------------|
| **Container** | `border-radius: 12px`, `overflow: hidden` |
| **Hoogte** | `400px` desktop, `300px` mobiel |
| **Kaart** | Google Maps embed met marker op {Stad} |

### Rechter Kolom: Info
| Element | Specificatie |
|---------|-------------|
| **H3** | Righteous, 24px, "Bezorging in {Stad}" |
| **Tekst** | Roboto, 16px, kleur `#666666` |
| **Gemeenten Lijst** | Bullet list van 5-10 naburige gemeenten |
| **Bezorgkosten** | Roboto Bold, 18px, kleur `#903D3E`, "Vanaf €25" |

---

## 5. WAAROM TAFEL TOTAAL

### Layout
- **Padding:** `48px 0`.
- **Achtergrond:** `#F5F5F5`.

### USP Grid
- **Layout:** 4 kolommen desktop, 2 mobiel.
- **Gap:** `24px`.

### Per USP
| Element | Specificatie |
|---------|-------------|
| **Icon** | 40px, kleur `#903D3E` |
| **Titel** | Roboto Bold, 16px, kleur `#1A1A1A` |
| **Tekst** | Roboto, 14px, kleur `#666666` |

### USP Content
1. **Truck** → "Snelle bezorging in {Stad}"
2. **Sparkles** → "Geen afwas, wij doen het"
3. **Package** → "Pakket of losse producten"
4. **Award** → "X+ events in {Stad} verzorgd"

---

## 6. ANDERE STEDEN

### Layout
- **Padding:** `48px 0`.
- **Achtergrond:** `#FFFFFF`.

### Content
| Element | Specificatie |
|---------|-------------|
| **H3** | Righteous, 24px, "Ook actief in andere steden" |
| **Links** | Horizontale lijst van 5-8 naburige steden |
| **Link Stijl** | Roboto, 14px, kleur `#903D3E`, hover underline |

---

## 7. CTA BANNER

### Layout
- **Padding:** `64px 0`.
- **Achtergrond:** `#903D3E`.
- **Tekst uitlijning:** Gecentreerd.

### Content
| Element | Specificatie |
|---------|-------------|
| **H2** | Righteous, 28px, kleur `#FFFFFF`, "Servies nodig in {Stad}?" |
| **Buttons** | "Bekijk Pakketten" (wit) + "Contact" (outline wit), `gap: 16px` |

---

## 8. SEO & META

```html
<title>Servies Huren in {Stad} | Tafel Totaal</title>
<meta name="description" content="Servies, borden en glazen huren in {Stad}? Tafel Totaal bezorgt in {Stad} en omstreken. Geen afwas!">
<link rel="canonical" href="https://tafeltotaal.be/verhuur/locatie/{stad_slug}">
```

### Structured Data (LocalBusiness)
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Tafel Totaal - {Stad}",
  "description": "Servies verhuur in {Stad}",
  "areaServed": {
    "@type": "City",
    "name": "{Stad}"
  }
}
```

### Breadcrumbs Schema
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://tafeltotaal.be/"},
    {"@type": "ListItem", "position": 2, "name": "Verhuur", "item": "https://tafeltotaal.be/verhuur"},
    {"@type": "ListItem", "position": 3, "name": "Locatie", "item": "https://tafeltotaal.be/verhuur/locatie"},
    {"@type": "ListItem", "position": 4, "name": "{Stad}"}
  ]
}
```

---

## 9. JAVASCRIPT FUNCTIONALITEIT

| Functie | Beschrijving |
|---------|-------------|
| `loadCityData(slug)` | Haalt stad-specifieke data op (naam, gemeenten, bezorgkosten) |
| `initGoogleMap(city)` | Initialiseert Google Maps met marker |

---

## 10. STEDEN LIJST

### Prioriteit 1 (Top 15)
| Stad | Provincie | URL |
|------|-----------|-----|
| Brugge | West-Vlaanderen | `/verhuur/locatie/brugge` |
| Gent | Oost-Vlaanderen | `/verhuur/locatie/gent` |
| Kortrijk | West-Vlaanderen | `/verhuur/locatie/kortrijk` |
| Oostende | West-Vlaanderen | `/verhuur/locatie/oostende` |
| Roeselare | West-Vlaanderen | `/verhuur/locatie/roeselare` |
| Aalst | Oost-Vlaanderen | `/verhuur/locatie/aalst` |
| Sint-Niklaas | Oost-Vlaanderen | `/verhuur/locatie/sint-niklaas` |
| Dendermonde | Oost-Vlaanderen | `/verhuur/locatie/dendermonde` |
| Knokke-Heist | West-Vlaanderen | `/verhuur/locatie/knokke-heist` |
| Ieper | West-Vlaanderen | `/verhuur/locatie/ieper` |
| Waregem | West-Vlaanderen | `/verhuur/locatie/waregem` |
| Lokeren | Oost-Vlaanderen | `/verhuur/locatie/lokeren` |
| Eeklo | Oost-Vlaanderen | `/verhuur/locatie/eeklo` |
| Deinze | Oost-Vlaanderen | `/verhuur/locatie/deinze` |
| Tielt | West-Vlaanderen | `/verhuur/locatie/tielt` |

---

## 11. CHECKLIST VOOR BOUW

### HTML/CSS
- [ ] Hero met stadsafbeelding
- [ ] SEO intro tekst
- [ ] Categorie cards grid
- [ ] Bezorggebied met Google Maps
- [ ] USP sectie
- [ ] Andere steden links
- [ ] CTA banner
- [ ] Responsive design

### JavaScript
- [ ] Google Maps integratie
- [ ] Dynamische data loading

### Content Nodig (per stad)
- [ ] Unieke SEO tekst (150-250 woorden)
- [ ] Lijst naburige gemeenten (5-10)
- [ ] Bezorgkosten
- [ ] Stadsafbeelding (hero)

---

## 12. NOTITIES

_Ruimte voor extra ideeën of opmerkingen tijdens het bouwen._
