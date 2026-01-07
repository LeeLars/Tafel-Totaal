# Locatie + Categorie Pagina (Stad + Producten)

> **Bestand:** `public/verhuur/locatie/[stad]/[categorie].html`  
> **URL:** `/verhuur/locatie/brugge/borden`, `/verhuur/locatie/gent/glazen`, etc.  
> **Status:** 📋 Planning (Ultra-Gedetailleerd)

---

## Doel van de pagina

De **krachtigste SEO-pagina**: combineert lokale SEO-tekst met direct het productgrid. Bezoeker ziet meteen wat hij kan huren.

**Zoekintentie:** Zeer specifiek ("borden huren Brugge", "glazen huren Gent")  
**Conversie:** Hoogst (bezoeker weet precies wat hij wil + waar)

---

## Template Variabelen

| Variabele | Voorbeeld |
|-----------|-----------|
| `{categorie}` | Borden, Glazen, Bestek |
| `{categorie_slug}` | borden, glazen, bestek |
| `{stad}` | Brugge, Gent, Kortrijk |
| `{stad_slug}` | brugge, gent, kortrijk |

---

## 1. PAGE HEADER

### Layout & Afmetingen
- **Padding:** `48px 0 24px 0`.
- **Achtergrond:** `#FFFFFF`.
- **Container:** `max-width: 1200px`, gecentreerd.

### Breadcrumbs
- **Content:** `Home > Verhuur > Locatie > {Stad} > {Categorie}`
- **Stijl:** Roboto, 14px, kleur `#666666`.
- **Links:** Elke stap is klikbaar.

### Typografie
| Element | Font | Grootte | Kleur | Extra |
|---------|------|---------|-------|-------|
| **H1** | Righteous | `clamp(1.75rem, 3vw, 2.5rem)` | `#1A1A1A` | - |
| **Subtekst** | Roboto | 16px | `#666666` | `margin-top: 12px`, `max-width: 600px` |

### Content
- **H1:** "{Categorie} Huren in {Stad}"
- **Subtekst:** "Tafel Totaal levert {categorie} in {Stad} en omstreken. Snel, betrouwbaar, geen afwas!"

---

## 2. SEO INTRO TEKST

### Layout
- **Padding:** `0 0 32px 0`.
- **Container:** `max-width: 800px`.

### Content
- **Tekst:** 100-200 woorden unieke SEO-tekst per combinatie.
- **Font:** Roboto, 15px, kleur `#666666`, `line-height: 1.7`.

**Voorbeeld Borden in Brugge:**
> Op zoek naar **borden huren in Brugge**? Tafel Totaal levert een compleet assortiment dinerborden, dessertborden en soepborden in Brugge en omstreken (Damme, Zedelgem, Jabbeke). Of je nu een bruiloft organiseert in het historische centrum of een bedrijfsevent in de Brugse Ommeland - wij bezorgen en halen op.
>
> Kies uit ons standaard assortiment (klassiek wit servies) of ga voor luxe design borden. Alle borden worden professioneel gewassen en gecontroleerd. Je brengt alles vuil terug, wij doen de afwas!

---

## 3. PRODUCT GRID (WEBSHOP COMPONENT)

### Layout
- **Padding:** `32px 0 48px 0`.
- **Achtergrond:** `#FFFFFF`.
- **Container:** `max-width: 1200px`, gecentreerd.

### Filter Bar (Compact)
| Element | Specificatie |
|---------|-------------|
| **Layout** | Flexbox, space-between, `margin-bottom: 24px` |
| **Resultaten** | Roboto, 14px, kleur `#666666`, "X {categorie} beschikbaar" |
| **Sortering** | Dropdown: "Sorteer op: Populair / Prijs laag-hoog / Prijs hoog-laag" |

### Grid
- **Desktop (>1024px):** 4 kolommen, `gap: 24px`.
- **Tablet (768-1024px):** 3 kolommen, `gap: 20px`.
- **Mobiel (<768px):** 2 kolommen, `gap: 16px`.

### Per Product Card
| Element | Specificatie |
|---------|-------------|
| **Container** | `border-radius: 12px`, `overflow: hidden`, `box-shadow: 0 2px 8px rgba(0,0,0,0.06)`, `border: 1px solid #E0E0E0` |
| **Afbeelding** | `aspect-ratio: 1/1`, `object-fit: cover`, witte achtergrond |
| **Badge** | Linksboven, "STANDAARD" of "LUXE" |
| **Content Padding** | `16px` |
| **Naam** | Roboto, 14px, kleur `#1A1A1A`, max 2 regels |
| **Prijs** | Roboto Bold, 18px, kleur `#903D3E`, "€0,XX" |
| **Per Stuk** | Roboto, 12px, kleur `#666666`, "/stuk" |
| **Quick Add** | Icon-only (+), 36x36px, achtergrond `#903D3E`, kleur wit |

### Hover Effect
- `transform: translateY(-2px)`
- `box-shadow: 0 4px 16px rgba(0,0,0,0.1)`
- `transition: all 0.2s ease`

### Data Source
```javascript
GET /api/producten?categorie={categorie_slug}
```

---

## 4. BEZORGING INFO (Compact)

### Layout
- **Padding:** `32px`.
- **Achtergrond:** `#F5F5F5`.
- **Border-radius:** `12px`.
- **Margin:** `0 0 48px 0`.

### Content
| Element | Specificatie |
|---------|-------------|
| **Icon** | Truck, 24px, kleur `#903D3E` |
| **Titel** | Roboto Bold, 16px, "Bezorging in {Stad}" |
| **Tekst** | Roboto, 14px, "We bezorgen in heel {Stad} en omliggende gemeenten. Bezorging vanaf €25." |
| **Gemeenten** | Inline list: "Damme, Zedelgem, Jabbeke, Blankenberge" |

---

## 5. GERELATEERDE LINKS

### Layout
- **Padding:** `48px 0`.
- **Achtergrond:** `#FFFFFF`.
- **Border-top:** `1px solid #E0E0E0`.

### Twee Kolommen
| Kolom | Content |
|-------|---------|
| **Links:** Andere categorieën in {Stad} | "Glazen huren in Brugge", "Bestek huren in Brugge" |
| **Rechts:** Zelfde categorie in andere steden | "Borden huren in Kortrijk", "Borden huren in Gent" |

### Link Styling
| Element | Specificatie |
|---------|-------------|
| **Container** | Achtergrond `#F5F5F5`, `border-radius: 8px`, `padding: 12px 16px` |
| **Font** | Roboto, 14px, kleur `#1A1A1A` |
| **Arrow** | ChevronRight, 16px, kleur `#903D3E` |
| **Hover** | Achtergrond `#E8E8E8` |

---

## 6. MINI FAQ

### Layout
- **Padding:** `48px 0`.
- **Achtergrond:** `#F5F5F5`.
- **Container:** `max-width: 800px`, gecentreerd.

### Sectie Header
| Element | Specificatie |
|---------|-------------|
| **H2** | Righteous, 24px, kleur `#1A1A1A`, "Veelgestelde vragen over {categorie} huren in {Stad}" |

### FAQ Items (4 stuks)
| Vraag | Antwoord |
|-------|----------|
| Bezorgen jullie in heel {Stad}? | Ja, we bezorgen in heel {Stad} en omliggende gemeenten. |
| Wat zijn de bezorgkosten? | Bezorging in {Stad} vanaf €25. Exacte kosten zie je bij checkout. |
| Kan ik ook afhalen? | Ja, afhalen is gratis op ons adres in Beernem. |
| Hoe ver vooruit moet ik boeken? | Minimaal 3 werkdagen, maar hoe eerder hoe beter. |

### Accordion Styling
- Zelfde als FAQ pagina (zie `docs/pages/faq/README.md`)

---

## 7. CTA BANNER

### Layout
- **Padding:** `64px 0`.
- **Achtergrond:** `#903D3E`.
- **Tekst uitlijning:** Gecentreerd.

### Content
| Element | Specificatie |
|---------|-------------|
| **H2** | Righteous, 28px, kleur `#FFFFFF`, "{Categorie} nodig in {Stad}?" |
| **Tekst** | Roboto, 16px, kleur `rgba(255,255,255,0.9)`, "Bestel direct online of neem contact op voor advies." |
| **Buttons** | "Bekijk alle {categorie}" (wit) + "Contact" (outline wit), `gap: 16px` |

---

## 8. SEO & META

```html
<title>{Categorie} Huren in {Stad} | Tafel Totaal</title>
<meta name="description" content="{Categorie} huren in {Stad}? Tafel Totaal levert {categorie} in {Stad} en omstreken. Snelle bezorging. Geen afwas!">
<link rel="canonical" href="https://tafeltotaal.be/verhuur/locatie/{stad_slug}/{categorie_slug}">
```

### Structured Data (CollectionPage)
```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "{Categorie} Huren in {Stad}",
  "description": "{Categorie} verhuur in {Stad}",
  "url": "https://tafeltotaal.be/verhuur/locatie/{stad_slug}/{categorie_slug}",
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
    {"@type": "ListItem", "position": 4, "name": "{Stad}", "item": "https://tafeltotaal.be/verhuur/locatie/{stad_slug}"},
    {"@type": "ListItem", "position": 5, "name": "{Categorie}"}
  ]
}
```

### FAQ Schema
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Bezorgen jullie in heel {Stad}?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ja, we bezorgen in heel {Stad} en omliggende gemeenten."
      }
    }
  ]
}
```

---

## 9. JAVASCRIPT FUNCTIONALITEIT

| Functie | Beschrijving |
|---------|-------------|
| `loadProducts(categorie)` | Haalt producten op via API |
| `renderProducts(products)` | Rendert product cards in grid |
| `sortProducts(order)` | Sorteert op prijs/populariteit |
| `openQuickAdd(productId)` | Opent quick add modal |
| `addToCart(productId, quantity)` | Voegt toe aan localStorage cart |
| `initFAQAccordions()` | Initialiseert FAQ accordions |

---

## 10. COMBINATIES PRIORITEIT

### Prioriteit 1: Top 2 categorieën × Top 15 steden = 30 pagina's

| Categorie | Steden |
|-----------|--------|
| Borden | Brugge, Gent, Kortrijk, Oostende, Roeselare, Aalst, Sint-Niklaas, Dendermonde, Knokke-Heist, Ieper, Waregem, Lokeren, Eeklo, Deinze, Tielt |
| Glazen | Zelfde 15 steden |

### Prioriteit 2: Uitbreiden
- Bestek × Top 10 steden
- Linnen × Top 10 steden
- Buffet × Top 5 steden

---

## 11. CHECKLIST VOOR BOUW

### HTML/CSS
- [ ] Page header met breadcrumbs
- [ ] SEO intro tekst
- [ ] Product grid (hergebruik component)
- [ ] Bezorging info card
- [ ] Gerelateerde links (2 kolommen)
- [ ] Mini FAQ accordion
- [ ] CTA banner
- [ ] Responsive design

### JavaScript
- [ ] Product loading
- [ ] Quick add modal
- [ ] FAQ accordions
- [ ] Sorting

### Content Nodig (per combinatie)
- [ ] Unieke SEO tekst (100-200 woorden)
- [ ] Lijst naburige gemeenten
- [ ] FAQ antwoorden (lokaal aangepast)

---

## 12. NOTITIES

_Dit is de belangrijkste pagina voor conversie. De bezoeker die hier landt, is klaar om te bestellen. Zorg dat het productgrid direct zichtbaar is zonder te scrollen._
