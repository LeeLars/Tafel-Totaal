# DESIGN PRD – Tafel Totaal: Brutalist Corporate Redesign

**Versie:** 1.0  
**Datum:** 8 Jan 2026  
**Status:** Definitief

---

## 0. Doel & Scope
Dit document definieert de nieuwe visuele en interactieve stijl voor Tafel Totaal. Het combineert de bestaande huisstijl (kleuren/fonts) met een nieuwe "Brutalist Corporate" ontwerptaal.

**Kernregel:** 
- **BEHOUDEN:** Huidige fonts (`Righteous`, `Roboto`) en kleuren (`#903D3E`).
- **VERNIEUWEN:** Layout (Bento Grid), UI-vormen (rechthoekig), interacties (motion physics), en sectie-opbouw.

---

## 1. Design Philosophy: "Gecultiveerd Ruw"
Een hybride stijl die de betrouwbaarheid van Tafel Totaal combineert met een moderne, architecturale uitstraling.

- **Gevoel:** Premium, Solide, Doordacht, Ruim.
- **Vormtaal:** Rechthoekig, technische lijnen, geen afrondingen.
- **Beeldtaal:** Grote vlakken, parallax diepte, "baksteen"-structuur.

---

## 2. Visueel DNA (Style System)

### 2.1 Typografie (Tafel Totaal Specifiek)
Wij gebruiken de bestaande fonts, maar passen de zetting aan naar de Brutalist stijl.

**Headings (H1–H3)**
- **Font:** `Righteous` (Bestaand)
- **Stijl:** 400 (Regular) - *Righteous heeft van zichzelf al een dik, display karakter.*
- **Toepassing:** Sentence Case voor leesbaarheid, UPPERCASE voor korte statements.
- **Tracking:** Iets strakker (`-0.02em`) voor compactheid.

**Body Tekst**
- **Font:** `Roboto` (Bestaand)
- **Stijl:** Schoon, modern, leesbaar.
- **Kleur:** Donkergrijs (`#333` / `#4A4A4A`) voor zacht contrast op lichte achtergronden.

**Labels & Navigatie**
- **Font:** `Roboto`
- **Stijl:** UPPERCASE, Bold (700).
- **Tracking:** Ruim (`0.1em`) voor technische uitstraling.

### 2.2 Kleurenpalet (Huisstijl + Industrieel)
Het palet respecteert de bestaande branding maar past deze toe in een brutalist context.

| Rol | Kleur | Hex | Toepassing |
| :--- | :--- | :--- | :--- |
| **Primair (Brand)** | **Burgundy** | `#903D3E` | Hoofdacties, highlights, actieve states. |
| **Achtergrond** | **White** | `#FFFFFF` | Basis canvas. |
| **Achtergrond Alt** | **Concrete** | `#F4F4F4` | Secundaire secties, cards. |
| **Tekst Primair** | **Charcoal** | `#1A1A1A` | Koppen, sterke tekst. |
| **Tekst Secundair** | **Dark Gray** | `#4A4A4A` | Body tekst. |
| **Lijnen/Borders** | **Light Gray** | `#E5E5E5` | Technische rasters, scheidingslijnen. |

### 2.3 UI Elementen
- **Vorm:** 0px border-radius. Alles is strikt rechthoekig.
- **Borders:** 1px solid `#E5E5E5` overal. Het "Grid" moet zichtbaar zijn.
- **Buttons:**
    - *Default:* Transparant met zwarte rand (`1px` of `2px`).
    - *Hover:* "Magnetic Inverted" effect (achtergrond vult zich met Brand Color `#903D3E`).

---

## 3. Layout Architectuur: Bento Box Grid

### 3.1 Structuur
- **Container:** Breed (`max-width: 1400px` of `90%`), niet smal gecentreerd.
- **Grid:** 12-kolommen systeem (`gap: 24px`).
- **Asymmetrie:** Content staat in blokken gemetseld.
    - *Voorbeeld:* Grote afbeelding links (8 kolommen), 2 tekstblokken rechts (4 kolommen, gestapeld).

### 3.2 Sticky Elementen
Gebruik `position: sticky` voor titels of beschrijvingen aan de zijkant, terwijl visuals voorbij scrollen. Dit creëert een "anker" effect.

---

## 4. Motion System (Bewegingsfysica)

Animaties zijn functioneel en volgen natuurkundige regels (zwaartekracht/vertraging).

### 4.1 Staggered Reveal (Scroll)
Elementen verschijnen niet tegelijk.
1.  **Titel:** `0ms`
2.  **Subtitel:** `100ms`
3.  **Button:** `200ms`
- *Effect:* `translateY(40px)` -> `0`, `opacity: 0` -> `1`.
- *Easing:* `ease-out`.

### 4.2 Parallax (Diepte)
Afbeeldingen in grids bewegen trager dan de pagina (`~20%` vertraging). Geeft diepte alsof je door een raam kijkt.

### 4.3 Image Zoom (Hover)
- **Wrapper:** `overflow: hidden`.
- **Image:** `scale(1.0)` -> `scale(1.05)` op hover.
- **Duur:** `0.6s` (langzaam en luxe).

---

## 5. Component Specificaties

### 5.1 Header & Mega Menu
- **Positie:** Sticky bovenaan.
- **Stijl:** Transparant -> Solid White bij scroll + Backdrop Blur.
- **Mega Menu:**
    - Volle breedte.
    - **Links:** Typografische lijst (Roboto Uppercase).
    - **Rechts:** Dynamische afbeelding die wisselt o.b.v. hover over link.

### 5.2 Hero Sectie
- **Media:** Video of donkere afbeelding.
- **Overlay:** `rgba(0,0,0,0.4)` voor leesbaarheid.
- **Tekst:** Witte H1 (`Righteous`), links uitgelijnd of asymmetrisch.
- **Animatie:** Staggered reveal na laden pagina.

### 5.3 Footer
- **Grootte:** Groot statement (50% viewport height).
- **Stijl:** Zwart (`#1A1A1A`) achtergrond, Witte tekst.
- **Inhoud:** Gigantische "CONTACT" CTA, functionele links in kolommen.

---

## 6. Pagina Structuur

### Home (index.html)
1. Hero met video/afbeelding + overlay
2. USPs in Bento Grid
3. Featured Pakketten met image zoom
4. Hoe Werkt Het met sticky text
5. CTA sectie
6. Footer

### Andere Pagina's
- Dezelfde componenten, andere compositie
- Consistent grid systeem
- Responsive op alle breakpoints

---

## 7. Implementatie Checklist
1. ✅ PRD aangemaakt
2. ⬜ `variables.css` - Brutalist layout vars (fonts behouden)
3. ⬜ `base.css` - Typography & grid system
4. ⬜ `components.css` - Buttons, cards, forms
5. ⬜ Header component - Sticky + blur
6. ⬜ Hero sectie - Overlay + animations
7. ⬜ Footer component - Large CTA
8. ⬜ Global animations JS
