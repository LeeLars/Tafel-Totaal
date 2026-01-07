# Home Pagina

> **Bestand:** `public/index.html`  
> **URL:** `/`  
> **Status:** 📋 Planning (Ultra-Gedetailleerd)

---

## 1. HERO SECTIE

### Layout & Afmetingen
- **Hoogte:** `100vh` (volledig scherm) op desktop, `80vh` op mobiel.
- **Breedte:** Full-width, geen margins.
- **Achtergrond:** 
  - Sfeerbeeld van een prachtig gedekte tafel (warm licht, kaarsen, servies in beeld).
  - **Overlay:** Lineaire gradient van links naar rechts: `rgba(144, 61, 62, 0.7)` naar `rgba(26, 26, 26, 0.5)`.
  - Dit zorgt voor een warme, uitnodigende sfeer met goede tekstleesbaarheid.

### Content Positionering
- **Container:** Gecentreerd, `max-width: 800px`.
- **Verticale positie:** Midden van het scherm (`display: flex; align-items: center; justify-content: center`).
- **Tekst uitlijning:** Gecentreerd.

### Typografie
| Element | Font | Grootte | Kleur | Extra |
|---------|------|---------|-------|-------|
| **H1** | Righteous | `clamp(2.5rem, 5vw, 4rem)` | `#FFFFFF` | `text-shadow: 0 2px 4px rgba(0,0,0,0.3)` |
| **Subtekst** | Roboto | `clamp(1rem, 2vw, 1.25rem)` | `#FFFFFF` | `opacity: 0.9`, `max-width: 600px`, `margin: 0 auto` |

### Buttons
- **Layout:** Twee buttons naast elkaar, `gap: 16px`. Op mobiel: gestapeld.
- **Primary CTA ("Bekijk Pakketten"):**
  - Achtergrond: `#903D3E` (--color-primary)
  - Tekst: `#FFFFFF`
  - Padding: `16px 32px`
  - Border-radius: `8px`
  - Hover: Achtergrond wordt `#7A3435`, `transform: translateY(-2px)`, `box-shadow: 0 4px 12px rgba(144,61,62,0.4)`
- **Secondary CTA ("Losse Producten"):**
  - Achtergrond: `transparent`
  - Border: `2px solid #FFFFFF`
  - Tekst: `#FFFFFF`
  - Hover: Achtergrond wordt `rgba(255,255,255,0.1)`

### Scroll Indicator
- Onderaan de hero: subtiele pijl naar beneden (chevron icon).
- Animatie: Zacht op-en-neer bewegend (`animation: bounce 2s infinite`).
- Kleur: `#FFFFFF`, `opacity: 0.7`.

---

## 2. USP BALK

### Layout & Afmetingen
- **Hoogte:** `auto`, padding `24px 0`.
- **Achtergrond:** `#F5F5F5` (--color-light).
- **Container:** `max-width: 1200px`, gecentreerd.

### Grid
- **Desktop:** 3 kolommen, `gap: 48px`.
- **Tablet:** 3 kolommen.
- **Mobiel:** 1 kolom, gestapeld.

### Per USP Item
| Element | Specificatie |
|---------|-------------|
| **Icon** | 48x48px, SVG, kleur `#903D3E` |
| **Titel** | Roboto Bold, 16px, kleur `#1A1A1A` |
| **Layout** | Icon links, tekst rechts (of icon boven, tekst onder op mobiel) |
| **Spacing** | `gap: 12px` tussen icon en tekst |

### USP Content
1. **Icon:** Sparkles → **Tekst:** "Wij doen de afwas!"
2. **Icon:** Truck → **Tekst:** "Bezorging aan huis"
3. **Icon:** Package → **Tekst:** "Vanaf 10 stuks"

---

## 3. FEATURED PAKKETTEN

### Layout & Afmetingen
- **Padding:** `80px 0` (veel witruimte).
- **Achtergrond:** `#FFFFFF`.
- **Container:** `max-width: 1200px`, gecentreerd.

### Sectie Header
| Element | Specificatie |
|---------|-------------|
| **H2** | Righteous, `clamp(1.75rem, 3vw, 2.5rem)`, kleur `#1A1A1A`, gecentreerd |
| **Subtekst** | Roboto, 16px, kleur `#666666`, gecentreerd, `max-width: 600px` |
| **Spacing** | `margin-bottom: 48px` onder de header |

### Pakket Cards Grid
- **Desktop:** 3 kolommen, `gap: 32px`.
- **Tablet:** 2 kolommen.
- **Mobiel:** 1 kolom (of horizontale scroll/carousel).

### Per Pakket Card
| Element | Specificatie |
|---------|-------------|
| **Container** | `border-radius: 12px`, `overflow: hidden`, `box-shadow: 0 4px 20px rgba(0,0,0,0.08)` |
| **Afbeelding** | Bovenaan, `aspect-ratio: 16/9`, `object-fit: cover` |
| **Badge** | Rechtsboven op afbeelding, "POPULAIR" of "LUXE", achtergrond `#903D3E`, tekst wit, `padding: 4px 12px`, `border-radius: 4px` |
| **Content Padding** | `24px` |
| **Titel** | Roboto Bold, 20px, kleur `#1A1A1A` |
| **Beschrijving** | Roboto, 14px, kleur `#666666`, max 2 regels |
| **Prijs** | Roboto Bold, 24px, kleur `#903D3E`, "Vanaf €X,XX p.p." |
| **CTA Button** | Full-width, `margin-top: 16px`, achtergrond `#903D3E`, tekst wit |
### Hover Effect op Card
- `transform: translateY(-4px)`
- `box-shadow: 0 8px 30px rgba(0,0,0,0.12)`
- `transition: all 0.3s ease`

### Onder de Cards
- **Link:** "Bekijk alle pakketten →" + "Of huur losse producten"
- **Stijl:** Tekst links, gecentreerd, kleur `#903D3E`, underline on hover.

---

## 4. INSPIRATIE / SHOP THE TABLE

### Layout
- **Desktop:** Split-screen, 50/50. Links: grote afbeelding. Rechts: tekst + CTA.
- **Mobiel:** Gestapeld (afbeelding boven, tekst onder).
- **Achtergrond:** `#F5F5F5` (--color-light).
- **Padding:** `80px 0`.

### Linker Kolom (Afbeelding)
| Element | Specificatie |
|---------|-------------|
| **Afbeelding** | Sfeerbeeld van gedekte tafel, `border-radius: 12px` (alleen rechter hoeken op desktop) |
| **Hotspots** | Kleine cirkels (24x24px) met pulserende animatie op producten in de foto |
| **Hotspot Kleur** | Wit met `box-shadow: 0 0 0 4px rgba(255,255,255,0.3)` |

### Rechter Kolom (Content)
| Element | Specificatie |
|---------|-------------|
| **Overline** | Roboto, 12px, uppercase, letter-spacing 2px, kleur `#903D3E`, "INSPIRATIE" |
| **H2** | Righteous, 32px, kleur `#1A1A1A`, "Shop de Look" |
| **Tekst** | Roboto, 16px, kleur `#666666`, "Bekijk onze gedekte tafels en bestel direct wat je ziet." |
| **CTA** | Button, achtergrond `#903D3E`, "Ontdek Inspiratie →" |
| **Padding** | `48px` rondom de content |

---

## 5. HOE WERKT HET?

### Layout & Afmetingen
- **Padding:** `80px 0`.
- **Achtergrond:** `#FFFFFF`.
- **Container:** `max-width: 1000px`, gecentreerd.

### Sectie Header
| Element | Specificatie |
|---------|-------------|
| **H2** | Righteous, 32px, kleur `#1A1A1A`, gecentreerd, "Hoe werkt het?" |
| **Spacing** | `margin-bottom: 48px` |

### Stappen Grid
- **Desktop:** 3 kolommen, `gap: 48px`.
- **Mobiel:** 1 kolom, gestapeld.

### Per Stap
| Element | Specificatie |
|---------|-------------|
| **Nummer** | Cirkel, 64x64px, achtergrond `#903D3E`, tekst wit, Righteous 24px, "1", "2", "3" |
| **Icon** | Onder het nummer, 48x48px, kleur `#903D3E` |
| **Titel** | Roboto Bold, 18px, kleur `#1A1A1A` |
| **Tekst** | Roboto, 14px, kleur `#666666`, gecentreerd |
| **Verbindingslijn** | Tussen stappen: gestippelde lijn (alleen desktop), kleur `#E0E0E0` |

### Stappen Content
1. **Nummer:** 1 → **Titel:** "Kies" → **Tekst:** "Selecteer een pakket of stel zelf samen met losse producten."
2. **Nummer:** 2 → **Titel:** "Ontvang" → **Tekst:** "Wij bezorgen op jouw gewenste datum. Of haal zelf af."
3. **Nummer:** 3 → **Titel:** "Geniet" → **Tekst:** "Breng alles vuil terug. Wij doen de afwas!"

---

## 6. TESTIMONIALS / SOCIAL PROOF

### Layout
- **Padding:** `80px 0`.
- **Achtergrond:** `#903D3E` (--color-primary), voor contrast.
- **Container:** `max-width: 1200px`, gecentreerd.

### Sectie Header
| Element | Specificatie |
|---------|-------------|
| **H2** | Righteous, 32px, kleur `#FFFFFF`, gecentreerd, "Wat klanten zeggen" |

### Testimonial Cards
- **Layout:** 3 kolommen op desktop, carousel op mobiel.
- **Card:** Achtergrond `#FFFFFF`, `border-radius: 12px`, `padding: 32px`.
- **Quote Icon:** Groot aanhalingsteken, kleur `#903D3E`, `opacity: 0.2`, linksboven.
- **Tekst:** Roboto Italic, 16px, kleur `#1A1A1A`.
- **Naam:** Roboto Bold, 14px, kleur `#1A1A1A`.
- **Sterren:** 5 sterren, kleur `#F5A623` (goud).

---

## 7. CTA BANNER (Afsluiting)

### Layout
- **Padding:** `64px 0`.
- **Achtergrond:** `#1A1A1A` (--color-dark).
- **Tekst:** Gecentreerd.

### Content
| Element | Specificatie |
|---------|-------------|
| **H2** | Righteous, 28px, kleur `#FFFFFF`, "Klaar om te starten?" |
| **Subtekst** | Roboto, 16px, kleur `rgba(255,255,255,0.8)`, "Bestel vandaag, geniet morgen." |
| **Buttons** | Twee buttons naast elkaar: "Bekijk Pakketten" (primary) + "Neem Contact Op" (secondary/outline wit) |

---

## 8. JAVASCRIPT FUNCTIONALITEIT

| Functie | Beschrijving |
|---------|-------------|
| `initStickyHeader()` | Header wordt kleiner en krijgt schaduw na 100px scroll |
| `initScrollReveal()` | Secties faden in met `IntersectionObserver` |
| `loadFeaturedPackages()` | Haalt 3 featured pakketten op via API |
| `initTestimonialCarousel()` | Swipe carousel voor testimonials op mobiel |
| `initHotspots()` | Maakt hotspots in inspiratie-afbeelding klikbaar |

---

## 9. SEO & META

```html
<title>Tafel Totaal | Servies & Glaswerk Verhuur (Inclusief Afwas!)</title>
<meta name="description" content="Servies huren zonder afwas? Huur complete pakketten of losse borden, glazen en bestek. Wij bezorgen en doen de was. Dé expert in West- en Oost-Vlaanderen.">
<meta name="keywords" content="servies huren, borden huren, glazen huren, bestek huren, geen afwas, West-Vlaanderen, Oost-Vlaanderen">
<link rel="canonical" href="https://tafeltotaal.be/">
```

### Open Graph (Social Sharing)
```html
<meta property="og:title" content="Tafel Totaal | Servies Verhuur Zonder Afwas">
<meta property="og:description" content="Huur servies, glazen en bestek voor jouw event. Wij doen de afwas!">
<meta property="og:image" content="https://tafeltotaal.be/images/og-home.jpg">
<meta property="og:url" content="https://tafeltotaal.be/">
```

---

## 10. WIREFRAME (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│                    [LOGO]  [NAV]  [CART]                     │
├─────────────────────────────────────────────────────────────┤
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░  VAN BORD TOT GLAS, ZONDER DE WAS  ░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░  Huur compleet tafelservies. Wij wassen af.  ░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░  [██ PAKKETTEN ██]  [ LOSSE PROD. ]  ░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░ ▼ ░░░░░░░░░░░░░░░░░░░░░░░░░│
├─────────────────────────────────────────────────────────────┤
│  ✨ Wij wassen af    🚚 Bezorging    📦 Vanaf 10 stuks    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                  POPULAIRE PAKKETTEN                         │
│                                                              │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐    │
│   │  [IMAGE]    │   │  [IMAGE]    │   │  [IMAGE]    │    │
│   │  POPULAIR   │   │    LUXE     │   │  POPULAIR   │    │
│   │ Diner       │   │ Diner Luxe  │   │ Feest       │    │
│   │ Standaard   │   │             │   │ Compleet    │    │
│   │ Vanaf €2,50 │   │ Vanaf €4,50 │   │ Vanaf €3,00 │    │
│   │[██ BEKIJK ██]│   │[██ BEKIJK ██]│   │[██ BEKIJK ██]│    │
│   └─────────────┘   └─────────────┘   └─────────────┘    │
│                                                              │
│          Bekijk alle pakketten →  |  Losse producten         │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────┐   INSPIRATIE              │
│  │                          │   Shop de Look              │
│  │   [SFEERBEELD TAFEL]     │                              │
│  │      ●   ●   ●          │   Bekijk onze gedekte        │
│  │   (hotspots)             │   tafels en bestel direct    │
│  │                          │   wat je ziet.               │
│  │                          │   [██ ONTDEK ██]             │
│  └──────────────────────────┘                              │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                     HOE WERKT HET?                           │
│                                                              │
│      ┌───┐          ┌───┐          ┌───┐                 │
│      │ 1 │──────────│ 2 │──────────│ 3 │                 │
│      └───┘          └───┘          └───┘                 │
│       KIES          ONTVANG         GENIET                  │
│    Pakket of       Wij bezorgen    Breng vuil               │
│    losse items     aan huis        terug!                   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│▓▓▓▓▓▓▓▓▓▓▓▓▓  WAT KLANTEN ZEGGEN  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓  ┌───────────┐  ┌───────────┐  ┌───────────┐  ▓▓▓▓▓▓▓▓▓│
│▓  │ ★★★★★    │  │ ★★★★★    │  │ ★★★★★    │  ▓▓▓▓▓▓▓▓▓│
│▓  │ "Super!" │  │ "Geweldig"│  │ "Top!"   │  ▓▓▓▓▓▓▓▓▓│
│▓  │ - Jan    │  │ - Marie   │  │ - Pieter │  ▓▓▓▓▓▓▓▓▓│
│▓  └───────────┘  └───────────┘  └───────────┘  ▓▓▓▓▓▓▓▓▓│
├─────────────────────────────────────────────────────────────┤
│████████████████████████████████████████████████████████████│
│█████████████  KLAAR OM TE STARTEN?  ████████████████████│
│████████  [██ PAKKETTEN ██]  [ CONTACT ]  ██████████████│
├─────────────────────────────────────────────────────────────┤
│                         FOOTER                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. CHECKLIST VOOR BOUW

### HTML/CSS
- [ ] Semantic HTML5 structuur (`<header>`, `<main>`, `<section>`, `<footer>`)
- [ ] CSS variabelen uit styleguide correct toegepast
- [ ] Responsive breakpoints: 1200px, 768px, 480px
- [ ] Hero overlay gradient correct
- [ ] Card hover effecten
- [ ] USP balk iconen als SVG

### JavaScript
- [ ] Sticky header functionaliteit
- [ ] Scroll reveal animaties
- [ ] Featured pakketten laden via API
- [ ] Testimonial carousel (mobiel)
- [ ] Hotspot interactie in inspiratie sectie

### Media
- [ ] Hero afbeelding: min. 1920x1080, WebP formaat, max 200KB
- [ ] Pakket afbeeldingen: 800x450, WebP, max 80KB per stuk
- [ ] Inspiratie afbeelding: 1200x800, WebP
- [ ] USP iconen: SVG, inline of sprite

### SEO
- [ ] Meta tags correct
- [ ] Open Graph tags correct
- [ ] Alt teksten op alle afbeeldingen
- [ ] Heading hiërarchie (H1 > H2 > H3)

---

## 12. NOTITIES

_Ruimte voor extra ideeën of opmerkingen tijdens het bouwen._
