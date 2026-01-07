# Pakketten Overzicht Pagina

> **Bestand:** `public/pakketten.html`  
> **URL:** `/pakketten.html`  
> **Status:** 📋 Planning (Ultra-Gedetailleerd)

---

## 1. PAGE HEADER

### Layout & Afmetingen
- **Padding:** `48px 0` (minder dan homepage hero, dit is een overzichtspagina).
- **Achtergrond:** `#FFFFFF`.
- **Container:** `max-width: 1200px`, gecentreerd.
- **Tekst uitlijning:** Gecentreerd.

### Typografie
| Element | Font | Grootte | Kleur | Extra |
|---------|------|---------|-------|-------|
| **H1** | Righteous | `clamp(2rem, 4vw, 3rem)` | `#1A1A1A` | - |
| **Subtekst** | Roboto | 18px | `#666666` | `max-width: 600px`, `margin: 16px auto 0` |

### Content
- **H1:** "Onze Pakketten"
- **Subtekst:** "Kies het pakket dat bij jouw event past. Van intiem diner tot groot feest."

### Breadcrumbs
- **Positie:** Boven de H1, links uitgelijnd.
- **Stijl:** Roboto, 14px, kleur `#666666`.
- **Content:** `Home > Pakketten`

---

## 2. FILTER BAR

### Layout & Afmetingen
- **Padding:** `24px 0`.
- **Achtergrond:** `#F5F5F5` (--color-light).
- **Container:** `max-width: 1200px`, gecentreerd.
- **Border:** `1px solid #E0E0E0` boven en onder.

### Filter Items
- **Layout:** Horizontaal, `gap: 24px`. Op mobiel: gestapeld.
- **Per Filter:**
  - **Label:** Roboto, 14px, kleur `#666666`, boven de dropdown.
  - **Dropdown:** 
    - Achtergrond: `#FFFFFF`
    - Border: `1px solid #E0E0E0`
    - Border-radius: `8px`
    - Padding: `12px 16px`
    - Min-width: `180px`
    - Focus: `border-color: #903D3E`, `box-shadow: 0 0 0 3px rgba(144,61,62,0.1)`

### Filters
| Filter | Opties | Default |
|--------|--------|--------|
| **Serviceniveau** | Alle, Standaard, Luxe | Alle |
| **Aantal personen** | Alle, 25, 50, 100, 150+ | Alle |

### Gedrag
- Filters werken **instant** (geen "Toepassen" knop nodig).
- URL wordt gesynchroniseerd: `?niveau=luxe&personen=50`.
- Bij geen resultaten: toon "Geen pakketten gevonden" state.

---

## 3. PAKKETTEN GRID

### Layout & Afmetingen
- **Padding:** `48px 0`.
- **Achtergrond:** `#FFFFFF`.
- **Container:** `max-width: 1200px`, gecentreerd.

### Grid
- **Desktop (>1024px):** 3 kolommen, `gap: 32px`.
- **Tablet (768-1024px):** 2 kolommen, `gap: 24px`.
- **Mobiel (<768px):** 1 kolom, `gap: 24px`.

### Per Pakket Card
| Element | Specificatie |
|---------|-------------|
| **Container** | `border-radius: 12px`, `overflow: hidden`, `box-shadow: 0 2px 12px rgba(0,0,0,0.06)`, `border: 1px solid #E0E0E0` |
| **Afbeelding** | Bovenaan, `aspect-ratio: 16/10`, `object-fit: cover` |
| **Badge** | Linksboven op afbeelding, positie `absolute`, `top: 16px`, `left: 16px` |
| **Badge Standaard** | Achtergrond `#1A1A1A`, tekst wit, Roboto Bold 12px, uppercase |
| **Badge Luxe** | Achtergrond `#903D3E`, tekst wit, Roboto Bold 12px, uppercase |
| **Content Padding** | `24px` |
| **Naam** | Roboto Bold, 20px, kleur `#1A1A1A`, `margin-bottom: 8px` |
| **Personen** | Roboto, 14px, kleur `#666666`, icon (Users) + "Voor X personen" |
| **Beschrijving** | Roboto, 14px, kleur `#666666`, max 2 regels, `margin: 12px 0` |
| **Prijs Container** | `margin-top: auto` (push naar beneden), `padding-top: 16px`, `border-top: 1px solid #E0E0E0` |
| **Prijs Label** | Roboto, 12px, kleur `#666666`, "Vanaf" |
| **Prijs** | Roboto Bold, 28px, kleur `#903D3E`, "€XXX" |
| **Per Persoon** | Roboto, 14px, kleur `#666666`, "p.p." naast de prijs |
| **CTA Button** | Full-width, `margin-top: 16px`, achtergrond `#903D3E`, tekst wit, `height: 48px`, `border-radius: 8px` |

### Hover Effect op Card
- `transform: translateY(-4px)`
- `box-shadow: 0 8px 24px rgba(0,0,0,0.1)`
- `border-color: #903D3E`
- `transition: all 0.3s ease`

### Loading State
- Toon 6 skeleton cards (grijze blokken met shimmer animatie).
- Skeleton: zelfde afmetingen als echte cards.

### Empty State (geen resultaten)
- **Icon:** Search icon, 64x64px, kleur `#E0E0E0`.
- **Titel:** Roboto Bold, 20px, "Geen pakketten gevonden".
- **Tekst:** Roboto, 16px, kleur `#666666`, "Probeer andere filters of bekijk onze losse producten."
- **CTA:** "Bekijk losse producten" button.

---

## 4. LIEVER LOSSE PRODUCTEN? BANNER

### Layout & Afmetingen
- **Padding:** `48px 0`.
- **Achtergrond:** `#F5F5F5` (--color-light).
- **Container:** `max-width: 800px`, gecentreerd.
- **Tekst uitlijning:** Gecentreerd.

### Content
| Element | Specificatie |
|---------|-------------|
| **Icon** | Package icon, 48x48px, kleur `#903D3E`, `margin-bottom: 16px` |
| **Titel** | Roboto Bold, 20px, kleur `#1A1A1A`, "Liever zelf samenstellen?" |
| **Tekst** | Roboto, 16px, kleur `#666666`, "Geen pakket nodig? Huur gewoon wat je nodig hebt - ook al is het maar 10 borden." |
| **CTA** | Button outline, `margin-top: 24px`, border `2px solid #903D3E`, tekst `#903D3E`, "Bekijk losse producten →" |

---

## 5. HULP NODIG? CTA BANNER

### Layout & Afmetingen
- **Padding:** `64px 0`.
- **Achtergrond:** `#1A1A1A` (--color-dark).
- **Container:** `max-width: 800px`, gecentreerd.
- **Tekst uitlijning:** Gecentreerd.

### Content
| Element | Specificatie |
|---------|-------------|
| **Titel** | Righteous, 28px, kleur `#FFFFFF`, "Niet gevonden wat je zoekt?" |
| **Tekst** | Roboto, 16px, kleur `rgba(255,255,255,0.8)`, "Neem contact op voor advies op maat. Wij helpen je graag!" |
| **CTA** | Button primary, achtergrond `#903D3E`, tekst wit, "Contact opnemen" |

---

## 6. JAVASCRIPT FUNCTIONALITEIT

| Functie | Beschrijving |
|---------|-------------|
| `loadPackages()` | Haalt alle pakketten op via `GET /api/pakketten` |
| `renderPackages(packages)` | Rendert pakket cards in grid container |
| `filterPackages()` | Filtert pakketten op basis van dropdown waarden |
| `updateURL()` | Synchroniseert filters met URL parameters |
| `showLoadingState()` | Toont skeleton loaders tijdens laden |
| `showEmptyState()` | Toont "geen resultaten" bericht |

---

## 7. SEO & META

```html
<title>Servies Pakketten Huren | Compleet Tafelgerei | Tafel Totaal</title>
<meta name="description" content="Bekijk onze complete servies pakketten voor diners, buffetten en feesten. Inclusief borden, bestek en glazen. Wij doen de afwas!">
<link rel="canonical" href="https://tafeltotaal.be/pakketten.html">
```

### Breadcrumbs Schema
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://tafeltotaal.be/"},
    {"@type": "ListItem", "position": 2, "name": "Pakketten"}
  ]
}
```

---

## Wireframe (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│                         HEADER                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    ONZE PAKKETTEN                            │
│        Kies het pakket dat bij jouw event past              │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Serviceniveau: [Alle ▼]    Personen: [Alle ▼]              │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│    │   [IMAGE]   │  │   [IMAGE]   │  │   [IMAGE]   │       │
│    │  STANDAARD  │  │    LUXE     │  │  STANDAARD  │       │
│    │             │  │             │  │             │       │
│    │ Diner Basis │  │ Diner Luxe  │  │  Cocktail   │       │
│    │ 50 personen │  │ 50 personen │  │ 100 personen│       │
│    │             │  │             │  │             │       │
│    │ Vanaf €125  │  │ Vanaf €275  │  │ Vanaf €150  │       │
│    │             │  │             │  │             │       │
│    │[Bekijk pak.]│  │[Bekijk pak.]│  │[Bekijk pak.]│       │
│    └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                              │
│    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│    │   [IMAGE]   │  │   [IMAGE]   │  │   [IMAGE]   │       │
│    │    ...      │  │    ...      │  │    ...      │       │
│    └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│         Niet gevonden wat je zoekt?                         │
│              [ Contact opnemen ]                            │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                         FOOTER                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Checklist

- [ ] HTML structuur
- [ ] CSS styling volgens styleguide
- [ ] Page header
- [ ] Filter bar
- [ ] Pakketten grid
- [ ] Pakket card component
- [ ] Hulp nodig CTA
- [ ] Responsive design (3/2/1 kolommen)
- [ ] JavaScript: loadPackages()
- [ ] JavaScript: filterPackages()
- [ ] Loading state
- [ ] Empty state (geen resultaten)

---

## Notities

_Ruimte voor extra ideeën of opmerkingen tijdens het bouwen._
