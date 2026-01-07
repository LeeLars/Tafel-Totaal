# Over Ons Pagina

> **Bestand:** `public/over-ons.html`  
> **URL:** `/over-ons.html`  
> **Status:** 📋 Planning (Ultra-Gedetailleerd)

---

## 1. HERO SECTIE

### Layout & Afmetingen
- **Hoogte:** `60vh` desktop, `50vh` mobiel.
- **Achtergrond:** Sfeerbeeld van magazijn/team met overlay.
- **Overlay:** `rgba(26, 26, 26, 0.6)`.
- **Container:** `max-width: 800px`, gecentreerd.
- **Tekst uitlijning:** Gecentreerd.

### Typografie
| Element | Font | Grootte | Kleur | Extra |
|---------|------|---------|-------|-------|
| **H1** | Righteous | `clamp(2.5rem, 5vw, 4rem)` | `#FFFFFF` | `text-shadow: 0 2px 4px rgba(0,0,0,0.3)` |
| **Subtekst** | Roboto | 20px | `#FFFFFF` | `opacity: 0.9`, `margin-top: 16px` |

### Content
- **H1:** "Over Tafel Totaal"
- **Subtekst:** "Passie voor perfecte tafels sinds [jaar]"

---

## 2. ONS VERHAAL SECTIE

### Layout
- **Padding:** `80px 0`.
- **Achtergrond:** `#FFFFFF`.
- **Container:** `max-width: 1200px`, gecentreerd.
- **Grid:** 2 kolommen, `50% / 50%`, `gap: 64px`. Mobiel: gestapeld.

### Linker Kolom (Tekst)
| Element | Specificatie |
|---------|-------------|
| **Overline** | Roboto, 12px, uppercase, letter-spacing 2px, kleur `#903D3E`, "ONS VERHAAL" |
| **H2** | Righteous, 32px, kleur `#1A1A1A`, `margin-top: 8px` |
| **Tekst** | Roboto, 16px, kleur `#666666`, `line-height: 1.8`, 2-3 alinea's |

### Rechter Kolom (Afbeelding)
| Element | Specificatie |
|---------|-------------|
| **Container** | `border-radius: 12px`, `overflow: hidden` |
| **Afbeelding** | `aspect-ratio: 4/3`, `object-fit: cover` |
| **Decoratie** | Optioneel: kleine accent box in `#903D3E` achter de afbeelding |

---

## 3. WAAROM TAFEL TOTAAL (USP's)

### Layout
- **Padding:** `80px 0`.
- **Achtergrond:** `#F5F5F5`.
- **Container:** `max-width: 1000px`, gecentreerd.

### Sectie Header
| Element | Specificatie |
|---------|-------------|
| **H2** | Righteous, 32px, kleur `#1A1A1A`, gecentreerd |
| **Margin-bottom** | `48px` |

### USP Grid
- **Layout:** 4 kolommen desktop, 2 kolommen tablet, 1 kolom mobiel.
- **Gap:** `32px`.

### Per USP Card
| Element | Specificatie |
|---------|-------------|
| **Container** | Achtergrond `#FFFFFF`, `border-radius: 12px`, `padding: 32px`, `text-align: center` |
| **Icon** | 48x48px, kleur `#903D3E`, `margin-bottom: 16px` |
| **Titel** | Roboto Bold, 18px, kleur `#1A1A1A` |
| **Tekst** | Roboto, 14px, kleur `#666666`, `margin-top: 8px` |

### USP Content
1. **Icon:** Award → **Titel:** "Kwaliteit" → **Tekst:** "Alleen A-kwaliteit servies"
2. **Icon:** Heart → **Titel:** "Service" → **Tekst:** "Persoonlijk advies en flexibele levering"
3. **Icon:** Sparkles → **Titel:** "Gemak" → **Tekst:** "Geen afwas, wij doen het voor je"
4. **Icon:** Clock → **Titel:** "Ervaring" → **Tekst:** "X jaar ervaring, Y+ events"

---

## 4. HET TEAM (Optioneel)

### Layout
- **Padding:** `80px 0`.
- **Achtergrond:** `#FFFFFF`.
- **Container:** `max-width: 800px`, gecentreerd.

### Sectie Header
| Element | Specificatie |
|---------|-------------|
| **H2** | Righteous, 32px, kleur `#1A1A1A`, gecentreerd |

### Team Grid
- **Layout:** 2-3 kolommen, gecentreerd.
- **Gap:** `32px`.

### Per Team Member
| Element | Specificatie |
|---------|-------------|
| **Foto** | `150x150px`, `border-radius: 50%`, `object-fit: cover` |
| **Naam** | Roboto Bold, 18px, kleur `#1A1A1A`, `margin-top: 16px` |
| **Functie** | Roboto, 14px, kleur `#666666` |

---

## 5. CTA BANNER

### Layout
- **Padding:** `64px 0`.
- **Achtergrond:** `#903D3E` (--color-primary).
- **Tekst uitlijning:** Gecentreerd.

### Content
| Element | Specificatie |
|---------|-------------|
| **H2** | Righteous, 28px, kleur `#FFFFFF`, "Klaar om samen te werken?" |
| **Buttons** | Twee buttons, `gap: 16px`: "Bekijk Pakketten" (wit), "Neem Contact Op" (outline wit) |

---

## 6. SEO & META

```html
<title>Over Ons | Tafel Totaal</title>
<meta name="description" content="Leer Tafel Totaal kennen. Ontdek ons verhaal, onze passie voor perfecte tafels en waarom klanten voor ons kiezen.">
<link rel="canonical" href="https://tafeltotaal.be/over-ons.html">
```

---

## 7. CHECKLIST VOOR BOUW

### HTML/CSS
- [ ] Hero met achtergrondafbeelding
- [ ] Twee kolommen verhaal sectie
- [ ] USP cards grid
- [ ] Team sectie (optioneel)
- [ ] CTA banner
- [ ] Responsive design

### Content Nodig
- [ ] Bedrijfsverhaal tekst
- [ ] Team foto's
- [ ] Sfeerbeelden
- [ ] Oprichtingsjaar
- [ ] Aantal events/ervaring

---

## 8. NOTITIES

_Ruimte voor extra ideeën of opmerkingen tijdens het bouwen._
