# Producten Overzicht Pagina

> **Bestand:** `public/producten.html`  
> **URL:** `/producten.html`  
> **Status:** 📋 Planning (Ultra-Gedetailleerd)

---

## 1. PAGE HEADER

### Layout & Afmetingen
- **Padding:** `48px 0 24px 0`.
- **Achtergrond:** `#FFFFFF`.
- **Container:** `max-width: 1200px`, gecentreerd.
- **Tekst uitlijning:** Gecentreerd.

### Typografie
| Element | Font | Grootte | Kleur | Extra |
|---------|------|---------|-------|-------|
| **H1** | Righteous | `clamp(2rem, 4vw, 3rem)` | `#1A1A1A` | - |
| **Subtekst** | Roboto | 18px | `#666666` | `max-width: 600px`, `margin: 16px auto 0` |

### Content
- **H1:** "Losse Producten"
- **Subtekst:** "Huur precies wat je nodig hebt - ook al is het maar 10 borden"

### Breadcrumbs
- **Content:** `Home > Producten`
- **Stijl:** Roboto, 14px, kleur `#666666`.

---

## 2. CATEGORIE TABS

### Layout & Afmetingen
- **Positie:** Onder page header.
- **Achtergrond:** `#F5F5F5` (--color-light).
- **Padding:** `16px 0`.
- **Container:** `max-width: 1200px`, gecentreerd.

### Tabs Styling
| Element | Specificatie |
|---------|-------------|
| **Layout** | Horizontale scroll op mobiel, flexbox desktop |
| **Gap** | `8px` |
| **Tab Button** | `padding: 12px 20px`, `border-radius: 24px`, `border: none` |
| **Tab Inactive** | Achtergrond `transparent`, kleur `#666666` |
| **Tab Active** | Achtergrond `#903D3E`, kleur `#FFFFFF` |
| **Tab Hover** | Achtergrond `#E0E0E0` |
| **Font** | Roboto, 14px, `font-weight: 500` |

### Hoofdcategorieën
| Categorie | Icon | URL param |
|-----------|------|-----------|
| Alle | Grid icon | - |
| Borden | Circle icon | `?categorie=borden` |
| Bestek | Utensils icon | `?categorie=bestek` |
| Glazen | Wine icon | `?categorie=glazen` |
| Koffie & Thee | Coffee icon | `?categorie=koffie-thee` |
| Buffet & Serveer | ChefHat icon | `?categorie=buffet-serveer` |
| Linnen | Shirt icon | `?categorie=linnen` |

### Thema Quick-Links (Onder tabs)
- **Layout:** Kleine badges, horizontaal.
- **Stijl:** `border: 1px solid #E0E0E0`, `border-radius: 16px`, `padding: 6px 12px`.
- **Thema's:** Italiaans, Aziatisch, Kerst, Corporate.

---

## 3. PRODUCTEN GRID

### Layout & Afmetingen
- **Padding:** `48px 0`.
- **Achtergrond:** `#FFFFFF`.
- **Container:** `max-width: 1200px`, gecentreerd.

### Grid
- **Desktop (>1024px):** 4 kolommen, `gap: 24px`.
- **Tablet (768-1024px):** 3 kolommen, `gap: 20px`.
- **Mobiel (<768px):** 2 kolommen, `gap: 16px`.

### Per Product Card
| Element | Specificatie |
|---------|-------------|
| **Container** | `border-radius: 12px`, `overflow: hidden`, `box-shadow: 0 2px 8px rgba(0,0,0,0.06)`, `border: 1px solid #E0E0E0` |
| **Afbeelding** | `aspect-ratio: 1/1`, `object-fit: cover`, witte achtergrond |
| **Badge** | Linksboven op afbeelding, `top: 12px`, `left: 12px` |
| **Badge Standaard** | Achtergrond `#1A1A1A`, tekst wit, 10px, uppercase |
| **Badge Luxe** | Achtergrond `#903D3E`, tekst wit, 10px, uppercase |
| **Content Padding** | `16px` |
| **Naam** | Roboto, 14px, kleur `#1A1A1A`, max 2 regels |
| **Prijs** | Roboto Bold, 18px, kleur `#903D3E`, "€0,XX" |
| **Per Stuk** | Roboto, 12px, kleur `#666666`, "/stuk" |
| **Quick Add Button** | Icon-only (+), 36x36px, achtergrond `#903D3E`, kleur wit, `border-radius: 50%` |

### Hover Effect op Card
- `transform: translateY(-2px)`
- `box-shadow: 0 4px 16px rgba(0,0,0,0.1)`
- Quick Add button: `transform: scale(1.1)`
- `transition: all 0.2s ease`

---

## 4. QUICK ADD MODAL

### Trigger
- Klik op Quick Add (+) button op product card.

### Modal Container
| Element | Specificatie |
|---------|-------------|
| **Overlay** | `background: rgba(0,0,0,0.5)`, `backdrop-filter: blur(4px)` |
| **Modal** | `max-width: 400px`, `border-radius: 16px`, achtergrond `#FFFFFF`, `padding: 32px` |
| **Animatie** | Fade in + scale up, `0.2s ease` |

### Modal Content
| Element | Specificatie |
|---------|-------------|
| **Product Image** | `80x80px`, `border-radius: 8px` |
| **Product Name** | Roboto Bold, 18px |
| **Product Price** | Roboto, 16px, kleur `#903D3E` |
| **Quantity Selector** | - / [aantal] / + buttons, `height: 48px` |
| **Min Quantity** | 10 stuks (toon melding: "Minimum 10 stuks") |
| **Subtotaal** | Roboto Bold, 20px, dynamisch berekend |
| **Add to Cart Button** | Full-width, achtergrond `#903D3E`, "Toevoegen aan wagen" |
| **Close Button** | X icon, rechtsboven, 24px |

---

## 5. LIEVER EEN PAKKET? BANNER

### Layout
- **Padding:** `48px 0`.
- **Achtergrond:** `#F5F5F5`.
- **Tekst uitlijning:** Gecentreerd.

### Content
| Element | Specificatie |
|---------|-------------|
| **Icon** | Package icon, 48px, kleur `#903D3E` |
| **Titel** | Roboto Bold, 20px, "Liever een compleet pakket?" |
| **Tekst** | Roboto, 16px, kleur `#666666` |
| **CTA** | Button outline, border `#903D3E`, "Bekijk pakketten →" |

---

## 6. JAVASCRIPT FUNCTIONALITEIT

| Functie | Beschrijving |
|---------|-------------|
| `loadProducts()` | Haalt producten op via `GET /api/producten` |
| `renderProducts(products)` | Rendert product cards in grid |
| `filterByCategory(category)` | Filtert en update URL |
| `filterByTheme(theme)` | Filtert op thema |
| `openQuickAdd(productId)` | Opent quick add modal |
| `updateQuantity(delta)` | Past aantal aan in modal |
| `addToCart(productId, quantity)` | Voegt toe aan localStorage cart |
| `showAddedFeedback()` | Toont "Toegevoegd!" animatie |

---

## 7. SEO & META

```html
<title>Losse Producten Huren | Borden, Glazen & Bestek | Tafel Totaal</title>
<meta name="description" content="Huur losse borden, glazen, bestek en meer vanaf 10 stuks. Perfect voor wie zelf wil samenstellen. Wij wassen af!">
<link rel="canonical" href="https://tafeltotaal.be/producten.html">
```

---

## Wireframe (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│                         HEADER                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    LOSSE PRODUCTEN                           │
│     Huur precies wat je nodig hebt - ook al is het          │
│                    maar 10 borden                            │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Alle] [Borden] [Bestek] [Glazen] [Servies] [Linnen]       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ [IMG]   │  │ [IMG]   │  │ [IMG]   │  │ [IMG]   │        │
│  │STANDAARD│  │  LUXE   │  │STANDAARD│  │STANDAARD│        │
│  │         │  │         │  │         │  │         │        │
│  │Dinerbord│  │Design   │  │Tafelvork│  │Wijnglas │        │
│  │         │  │Dinerbord│  │         │  │Rood     │        │
│  │€0,35/st │  │€0,55/st │  │€0,15/st │  │€0,45/st │        │
│  │         │  │         │  │         │  │         │        │
│  │[Toevoeg]│  │[Toevoeg]│  │[Toevoeg]│  │[Toevoeg]│        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  ...    │  │  ...    │  │  ...    │  │  ...    │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│         Liever een compleet pakket?                         │
│              [ Bekijk pakketten ]                           │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                         FOOTER                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Add vs Detail Page

**Optie A: Quick Add (aanbevolen voor MVP)**
- Gebruiker klikt "Toevoegen"
- Modal opent met aantal selector
- Direct toevoegen aan winkelwagen

**Optie B: Detail Page**
- Gebruiker klikt op product
- Gaat naar `/product.html?slug=xxx`
- Meer info, foto's, gerelateerde producten

Voor MVP: **Optie A** (sneller, minder pagina's)

---

## Checklist

- [ ] HTML structuur
- [ ] CSS styling volgens styleguide
- [ ] Page header
- [ ] Categorie tabs
- [ ] Filter opties
- [ ] Producten grid
- [ ] Product card component
- [ ] Quick add modal
- [ ] Liever pakket CTA
- [ ] Responsive design (4/3/2 kolommen)
- [ ] JavaScript: loadProducts()
- [ ] JavaScript: filterByCategory()
- [ ] JavaScript: addToCart()
- [ ] Loading state
- [ ] Empty state (geen resultaten)

---

## Notities

_Ruimte voor extra ideeën of opmerkingen tijdens het bouwen._
