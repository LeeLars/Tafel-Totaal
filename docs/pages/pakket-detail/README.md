# Pakket Detail Pagina

> **Bestand:** `public/pakket.html`  
> **URL:** `/pakket.html?slug=diner-standaard-50`  
> **Status:** 📋 Planning (Ultra-Gedetailleerd)

---

## 1. PAGE HEADER

### Breadcrumbs
- **Content:** `Home > Pakketten > [Pakketnaam]`
- **Stijl:** Roboto, 14px, kleur `#666666`.
- **Separator:** ChevronRight icon, 12px.

### Badge
| Type | Specificatie |
|------|-------------|
| **Standaard** | Achtergrond `#1A1A1A`, tekst wit, Roboto Bold 12px, uppercase, `padding: 6px 12px`, `border-radius: 4px` |
| **Luxe** | Achtergrond `#903D3E`, tekst wit, zelfde styling |

### Titel & Beschrijving
| Element | Specificatie |
|---------|-------------|
| **H1** | Righteous, `clamp(1.75rem, 3vw, 2.5rem)`, kleur `#1A1A1A`, `margin-top: 16px` |
| **Beschrijving** | Roboto, 16px, kleur `#666666`, `max-width: 600px`, `margin-top: 12px` |

---

## 2. TWEE KOLOMMEN LAYOUT

### Desktop Layout (>768px)
- **Grid:** 2 kolommen, `55% / 45%`, `gap: 48px`.
- **Container:** `max-width: 1200px`, gecentreerd.
- **Padding:** `48px 0`.

### Mobiel Layout (<768px)
- **Stack:** Afbeeldingen boven, configurator onder.
- **Configurator:** Sticky aan onderkant scherm (compact versie).

---

## 3. LINKER KOLOM: AFBEELDINGEN GALLERY

### Hoofdafbeelding
| Element | Specificatie |
|---------|-------------|
| **Container** | `aspect-ratio: 4/3`, `border-radius: 12px`, `overflow: hidden` |
| **Afbeelding** | `object-fit: cover`, `width: 100%` |
| **Zoom on Hover** | `transform: scale(1.05)`, `transition: 0.3s ease` |
| **Lightbox** | Klik opent fullscreen lightbox |

### Thumbnails
| Element | Specificatie |
|---------|-------------|
| **Layout** | Horizontaal, `gap: 12px`, `margin-top: 16px` |
| **Thumbnail** | `64x64px`, `border-radius: 8px`, `border: 2px solid transparent` |
| **Active** | `border-color: #903D3E` |
| **Hover** | `opacity: 0.8` |

---

## 4. RECHTER KOLOM: CONFIGURATOR

### Container
- **Achtergrond:** `#F5F5F5` (--color-light).
- **Border-radius:** `16px`.
- **Padding:** `32px`.
- **Position:** `sticky`, `top: 100px` (desktop).

### Prijs Display
| Element | Specificatie |
|---------|-------------|
| **Label** | Roboto, 14px, kleur `#666666`, "Vanaf" |
| **Prijs** | Roboto Bold, 36px, kleur `#903D3E`, "€XXX" |
| **Per Info** | Roboto, 14px, kleur `#666666`, "voor X personen" |

### Datum Picker
| Element | Specificatie |
|---------|-------------|
| **Label** | Roboto Bold, 14px, kleur `#1A1A1A`, "Huurdatum" |
| **Input Container** | `border: 1px solid #E0E0E0`, `border-radius: 8px`, `padding: 12px 16px` |
| **Icon** | Calendar, 20px, kleur `#666666` |
| **Date Range** | "15 - 17 maart 2026" format |
| **Period Badge** | "Weekend" of "Doordeweeks", kleine badge rechts |

### Personen Selector
| Element | Specificatie |
|---------|-------------|
| **Label** | Roboto Bold, 14px, "Aantal personen" |
| **Selector** | - / [aantal] / + buttons |
| **Button** | 44x44px, `border-radius: 8px`, border `1px solid #E0E0E0` |
| **Number** | Roboto Bold, 20px, min-width `60px`, gecentreerd |
| **Min/Max** | Toon melding bij min (10) of max (150) |

### Beschikbaarheid Indicator
| State | Specificatie |
|-------|-------------|
| **Beschikbaar** | CheckCircle icon groen, "Beschikbaar op deze datum" |
| **Niet beschikbaar** | XCircle icon rood, "Niet beschikbaar - kies andere datum" |
| **Laden** | Spinner icon, "Beschikbaarheid checken..." |

### Add to Cart Button
| Element | Specificatie |
|---------|-------------|
| **Button** | Full-width, `height: 56px`, achtergrond `#903D3E`, tekst wit, Roboto Bold 16px |
| **Tekst** | "Toevoegen aan wagen - €XXX" (dynamisch totaal) |
| **Icon** | ShoppingCart, 20px, links van tekst |
| **Hover** | Achtergrond `#7A3435` |
| **Disabled** | Als niet beschikbaar, `opacity: 0.5` |
| **Success State** | Achtergrond groen, checkmark icon, "Toegevoegd!" |

---

## 5. PAKKET INHOUD SECTIE

### Layout
- **Padding:** `48px 0`.
- **Achtergrond:** `#FFFFFF`.
- **Border-top:** `1px solid #E0E0E0`.

### Sectie Header
| Element | Specificatie |
|---------|-------------|
| **H2** | Righteous, 24px, kleur `#1A1A1A`, "Wat zit erin?" |
| **Subtekst** | Roboto, 14px, kleur `#666666`, "Alle items zijn inbegrepen in de huurprijs" |

### Inhoud Tabel
| Element | Specificatie |
|---------|-------------|
| **Container** | `border: 1px solid #E0E0E0`, `border-radius: 12px`, `overflow: hidden` |
| **Header Row** | Achtergrond `#F5F5F5`, Roboto Bold 14px |
| **Body Row** | `padding: 16px`, `border-bottom: 1px solid #E0E0E0` |
| **Product Image** | `48x48px`, `border-radius: 8px` |
| **Product Name** | Roboto, 14px, kleur `#1A1A1A` |
| **Quantity** | Roboto Bold, 14px, kleur `#903D3E`, "50x" |

---

## 6. ADD-ONS SECTIE

### Layout
- **Padding:** `48px 0`.
- **Achtergrond:** `#F5F5F5`.

### Sectie Header
| Element | Specificatie |
|---------|-------------|
| **H2** | Righteous, 24px, kleur `#1A1A1A`, "Maak je pakket compleet" |
| **Subtekst** | Roboto, 14px, kleur `#666666`, "Voeg extra items toe aan je pakket" |

### Add-on Cards Grid
- **Desktop:** 4 kolommen, `gap: 16px`.
- **Mobiel:** 2 kolommen.

### Per Add-on Card
| Element | Specificatie |
|---------|-------------|
| **Container** | Achtergrond `#FFFFFF`, `border-radius: 12px`, `padding: 16px`, `border: 1px solid #E0E0E0` |
| **Selected** | `border-color: #903D3E`, `box-shadow: 0 0 0 2px rgba(144,61,62,0.1)` |
| **Image** | `64x64px`, gecentreerd, `margin-bottom: 12px` |
| **Name** | Roboto, 14px, kleur `#1A1A1A`, gecentreerd |
| **Price** | Roboto Bold, 16px, kleur `#903D3E`, "€0,45/st" |
| **Quantity Selector** | Compact - / [n] / + buttons, `margin-top: 12px` |

---

## 7. GERELATEERDE PAKKETTEN

### Layout
- **Padding:** `48px 0`.
- **Achtergrond:** `#FFFFFF`.

### Sectie Header
| Element | Specificatie |
|---------|-------------|
| **H2** | Righteous, 24px, kleur `#1A1A1A`, "Bekijk ook" |

### Cards
- **Layout:** 3 kolommen desktop, horizontale scroll mobiel.
- **Card Stijl:** Zelfde als pakketten overzicht pagina.

---

## 8. JAVASCRIPT FUNCTIONALITEIT

| Functie | Beschrijving |
|---------|-------------|
| `getSlugFromUrl()` | Haalt slug uit URL parameter |
| `loadPackage(slug)` | Haalt pakket data op via `GET /api/pakketten/:slug` |
| `renderPackage(data)` | Rendert alle pakket info in DOM |
| `initDatePicker()` | Initialiseert datum picker component |
| `checkAvailability(startDate, endDate)` | POST naar `/api/beschikbaarheid` |
| `updatePersons(delta)` | Past aantal personen aan (+/-) |
| `updatePrice()` | Herberekent totaalprijs (base + add-ons) |
| `toggleAddon(productId)` | Voegt add-on toe of verwijdert |
| `updateAddonQuantity(productId, delta)` | Past add-on aantal aan |
| `addToCart()` | Voegt pakket + config toe aan localStorage |
| `initGallery()` | Initialiseert thumbnail clicks en lightbox |

---

## 9. SEO & META

```html
<title>[Pakketnaam] Huren | Tafel Totaal</title>
<meta name="description" content="Huur het [Pakketnaam] pakket voor [X] personen. Inclusief [items]. Wij doen de afwas!">
<link rel="canonical" href="https://tafeltotaal.be/pakket.html?slug=[slug]">
```

### Structured Data (Product)
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "[Pakketnaam]",
  "description": "[Beschrijving]",
  "offers": {
    "@type": "Offer",
    "price": "[Prijs]",
    "priceCurrency": "EUR"
  }
}
```

---

## LocalStorage (Winkelwagen)

```javascript
// Structuur van cart item
{
  type: "package",
  packageId: 1,
  packageSlug: "diner-standaard-50",
  packageName: "Diner Standaard 50 personen",
  persons: 50,
  startDate: "2026-03-15",
  endDate: "2026-03-17",
  periodType: "weekend",
  basePrice: 175,
  addons: [
    { productId: 5, name: "Champagneglas", quantity: 20, price: 0.45 }
  ],
  totalPrice: 184
}
```

---

## Wireframe (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│                         HEADER                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Home > Pakketten > Diner Standaard 50 personen             │
│                                                              │
│  [STANDAARD]                                                 │
│  Diner Standaard 50 personen                                │
│  Compleet pakket voor een klassiek diner...                 │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │                     │  │                             │  │
│  │                     │  │  Vanaf €175                 │  │
│  │    HOOFDAFBEELDING  │  │                             │  │
│  │                     │  │  Datum: [15-17 maart 2026]  │  │
│  │                     │  │                             │  │
│  │                     │  │  Personen: [ - ] 50 [ + ]   │  │
│  └─────────────────────┘  │                             │  │
│                           │  ✓ Beschikbaar              │  │
│  [thumb] [thumb] [thumb]  │                             │  │
│                           │  [ TOEVOEGEN AAN WAGEN ]    │  │
│                           │                             │  │
│                           └─────────────────────────────┘  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  WAT ZIT ERIN?                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Product              │ Aantal                        │  │
│  ├──────────────────────┼───────────────────────────────┤  │
│  │ Dinerbord            │ 50x                           │  │
│  │ Tafelvork            │ 50x                           │  │
│  │ Tafelmes             │ 50x                           │  │
│  │ Wijnglas rood        │ 50x                           │  │
│  └──────────────────────┴───────────────────────────────┘  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  MAAK JE PAKKET COMPLEET                                    │
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │Champagne│  │ Koffie  │  │Dessert- │  │ Water-  │       │
│  │  glas   │  │   kop   │  │  bord   │  │  glas   │       │
│  │ €0.45/st│  │ €0.35/st│  │ €0.30/st│  │ €0.25/st│       │
│  │ [+] [-] │  │ [+] [-] │  │ [+] [-] │  │ [+] [-] │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  BEKIJK OOK                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Diner Luxe  │  │  Cocktail   │  │ Diner Compl.│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                         FOOTER                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Checklist

- [ ] HTML structuur
- [ ] CSS styling volgens styleguide
- [ ] Breadcrumb
- [ ] Pakket header
- [ ] Afbeeldingen gallery
- [ ] Configurator (datum, personen)
- [ ] Beschikbaarheid check
- [ ] Pakket inhoud tabel
- [ ] Add-ons sectie
- [ ] Gerelateerde pakketten
- [ ] Responsive design
- [ ] JavaScript: loadPackage()
- [ ] JavaScript: checkAvailability()
- [ ] JavaScript: updatePrice()
- [ ] JavaScript: addToCart()
- [ ] Loading state
- [ ] Error state (pakket niet gevonden)

---

## Notities

_Ruimte voor extra ideeën of opmerkingen tijdens het bouwen._
