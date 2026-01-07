# Inspiratie Pagina

> **Bestand:** `public/inspiratie.html`  
> **URL:** `/inspiratie.html`  
> **Status:** 📋 Planning (Ultra-Gedetailleerd)

---

## 1. PAGE HEADER

### Layout & Afmetingen
- **Hoogte:** `60vh` desktop, `50vh` mobiel.
- **Achtergrond:** Full-screen sfeerfoto van een luxueus gedekte tafel.
- **Overlay:** Gradiënt van onder (`rgba(0,0,0,0.6)`) voor tekstleesbaarheid.
- **Tekst Positie:** Linksonder uitgelijnd.

### Typografie
| Element | Font | Grootte | Kleur | Extra |
|---------|------|---------|-------|-------|
| **H1** | Righteous | `clamp(2.5rem, 5vw, 4.5rem)` | `#FFFFFF` | - |
| **Subtekst** | Roboto | 20px | `#FFFFFF` | `opacity: 0.9`, `max-width: 600px` |

### Content
- **H1:** "Inspiratie"
- **Subtekst:** "Ontdek prachtige tafeldekkingen en shop direct de look"

---

## 2. SHOP THE TABLE (HOOFDFEATURE)

### Layout
- **Padding:** `80px 0`.
- **Achtergrond:** `#FFFFFF`.
- **Container:** Full-width container met `max-width: 1400px`.

### Slider Component
- **Navigatie:** Pijlen links/rechts (zwevend op afbeelding) + dots indicatoren onderaan.
- **Afbeelding:** `aspect-ratio: 16/9` (desktop), `4/5` (mobiel).
- **Hotspots:** Absolute positionering (%).

### Hotspot Styling
| State | Stijl |
|-------|-------|
| **Default** | Witte cirkel (12px) met pulserende ring (24px, `rgba(255,255,255,0.5)`). |
| **Hover** | Schaalt op naar 16px, tooltip verschijnt. |
| **Active** | Wordt `#903D3E` (primary color). |

### Product Sidebar (Modal op mobiel)
- **Positie:** Schuift in van rechts bij klik op hotspot.
- **Breedte:** `400px`.
- **Header:** "Geselecteerde Producten" + Sluit knop.
- **Content:** Lijst van producten uit de tafel.
- **Footer:** Totaalprijs + "Alles toevoegen aan wagen" button.

---

## 3. LOOKBOOK GRID

### Layout
- **Padding:** `48px 0`.
- **Achtergrond:** `#F5F5F5`.
- **Container:** `max-width: 1400px`.

### Filters
- **Stijl:** Horizontale scroll tabs (zoals Producten pagina).
- **Opties:** Alle / Klassiek / Modern / Feestelijk / Zakelijk / Seizoensgebonden.

### Grid Layout
- **Type:** Masonry layout (verschillende hoogtes) of strak grid.
- **Desktop:** 3 kolommen.
- **Mobiel:** 1 kolom.

### Per Inspiratie Card
| Element | Specificatie |
|---------|-------------|
| **Container** | `border-radius: 12px`, `overflow: hidden`, `position: relative`. |
| **Afbeelding** | `width: 100%`, `object-fit: cover`. |
| **Overlay** | Fade-in op hover: donkere overlay met "Bekijk Look" knop. |
| **Label** | Linksonder: Naam van de look (Righteous, wit). |

---

## 4. THEMA COLLECTIES

### Layout
- **Padding:** `80px 0`.
- **Achtergrond:** `#FFFFFF`.

### Sectie Header
| Element | Specificatie |
|---------|-------------|
| **H2** | Righteous, 32px, kleur `#1A1A1A`, "Shop per thema" |
| **Margin-bottom** | `48px` |

### Collectie Cards
- **Grid:** 4 kolommen.
- **Card:** Ronde afbeelding (`200x200px`) met titel eronder.
- **Hover:** Afbeelding zoomt in (`scale 1.1`).

| Thema | Afbeelding | Link |
|-------|------------|------|
| Italiaans | Pasta/Olijfolie sfeer | `/producten?thema=italiaans` |
| Aziatisch | Sushi/Stokjes sfeer | `/producten?thema=aziatisch` |
| Kerst | Goud/Rood/Groen | `/producten?thema=kerst` |
| Corporate | Strak/Wit/Blauw | `/producten?thema=corporate` |

---

## 5. CTA BANNER

### Layout
- **Padding:** `80px 0`.
- **Achtergrond:** `#1A1A1A`.
- **Tekst uitlijning:** Gecentreerd.

### Content
| Element | Specificatie |
|---------|-------------|
| **H2** | Righteous, 32px, kleur `#FFFFFF`, "Hulp nodig bij styling?" |
| **Subtekst** | Roboto, 16px, kleur `rgba(255,255,255,0.8)`, "Onze stylisten helpen je graag met een persoonlijk advies." |
| **Button** | Goud/Geel (`#D4AF37`) of Primary (`#903D3E`), "Neem contact op" |

---

## 6. TECHNISCHE SPECIFICATIES

### Shop the Table Data
```javascript
{
  id: 1,
  title: "Romantisch Diner",
  image: "/images/inspiratie/romantisch.jpg",
  products: [
    { id: 12, name: "Design Bord", x: 25, y: 40, price: 0.55 },
    { id: 28, name: "Wijnglas", x: 45, y: 35, price: 0.45 }
  ]
}
```

### Hotspot Logica
- **Coördinaten:** `top: Y%`, `left: X%`.
- **Responsive:** Coördinaten blijven relatief, dus schalen mee met afbeelding.

---

## 7. SEO & META

```html
<title>Inspiratie & Lookbook | Tafel Totaal</title>
<meta name="description" content="Ontdek unieke tafeldekkingen en inspiratie voor jouw event. Shop the Look: klik en bestel direct de producten van de foto.">
<link rel="canonical" href="https://tafeltotaal.be/inspiratie.html">
```

---

## 8. CHECKLIST VOOR BOUW

### HTML/CSS
- [ ] Hero sectie
- [ ] Shop the Table component (slider + hotspots)
- [ ] Sidebar/Modal voor producten
- [ ] Lookbook masonry grid
- [ ] Thema collecties
- [ ] CTA banner
- [ ] Responsive design

### JavaScript
- [ ] Hotspot positionering
- [ ] Sidebar toggle interactie
- [ ] "Shop hele tafel" logica
- [ ] Filter functionaliteit lookbook

---

## 9. NOTITIES

_Ruimte voor extra ideeën of opmerkingen tijdens het bouwen._
