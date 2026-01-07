# Hoe Werkt Het Pagina

> **Bestand:** `public/hoe-werkt-het.html`  
> **URL:** `/hoe-werkt-het.html`  
> **Status:** 📋 Planning (Ultra-Gedetailleerd)

---

## 1. HERO SECTIE

### Layout & Afmetingen
- **Hoogte:** `50vh` desktop, `40vh` mobiel.
- **Achtergrond:** Video of sfeerbeeld van mensen die samen eten.
- **Overlay:** `rgba(26, 26, 26, 0.5)`.
- **Container:** `max-width: 800px`, gecentreerd.
- **Tekst uitlijning:** Gecentreerd.

### Typografie
| Element | Font | Grootte | Kleur | Extra |
|---------|------|---------|-------|-------|
| **H1** | Righteous | `clamp(2rem, 4vw, 3rem)` | `#FFFFFF` | `text-shadow: 0 2px 4px rgba(0,0,0,0.3)` |
| **Subtekst** | Roboto | 20px | `#FFFFFF` | `opacity: 0.9`, `margin-top: 16px` |

### Content
- **H1:** "Hoe Werkt Het?"
- **Subtekst:** "In 4 simpele stappen naar een perfect gedekte tafel"

---

## 2. STAPPEN (HOOFDSECTIE)

### Layout
- **Padding:** `80px 0`.
- **Achtergrond:** `#FFFFFF`.
- **Container:** `max-width: 1000px`, gecentreerd.
- **Connectielijn:** Verticale stippellijn door de nummers (mobiel: links, desktop: centraal zigzag).

### Per Stap
| Element | Specificatie |
|---------|-------------|
| **Layout** | Desktop: zigzag (afbeelding links/rechts afwisselend). Mobiel: gestapeld. |
| **Gap** | `64px` tussen stappen. |
| **Nummer Badge** | 48x48px, `border-radius: 50%`, achtergrond `#903D3E`, tekst wit, Roboto Bold 20px. |
| **Titel** | Righteous, 24px, kleur `#1A1A1A`. |
| **Tekst** | Roboto, 16px, kleur `#666666`, `line-height: 1.7`. |
| **Afbeelding** | `aspect-ratio: 4/3`, `border-radius: 12px`, `object-fit: cover`, `box-shadow: 0 4px 12px rgba(0,0,0,0.1)`. |

### Stap 1: Kies wat je nodig hebt
- **Titel:** "Kies wat je nodig hebt"
- **Tekst:** "Kies een compleet pakket óf stel zelf samen wat je nodig hebt - ook al is het maar 10 borden. Selecteer je datum en aantallen."
- **Afbeelding:** Screenshot pakketten/producten.

### Stap 2: Bestel online
- **Titel:** "Bestel online"
- **Tekst:** "Voeg eventueel extra's toe, kies bezorgen of afhalen, en rond je bestelling af met iDEAL of Bancontact."
- **Afbeelding:** Checkout illustratie.

### Stap 3: Ontvang je bestelling
- **Titel:** "Ontvang je bestelling"
- **Tekst:** "Wij bezorgen alles netjes in kratten op de afgesproken datum. Of je haalt het zelf op bij ons magazijn."
- **Afbeelding:** Bezorging foto (kratten).

### Stap 4: Geniet & retourneer
- **Titel:** "Geniet & retourneer vuil"
- **Tekst:** "Gebruik alles voor je event. Daarna breng je alles **vuil** terug in dezelfde kratten. Wij wassen af!"
- **Afbeelding:** Feest foto + kratten.

---

## 3. VEELGESTELDE VRAGEN (MINI FAQ)

### Layout
- **Padding:** `64px 0`.
- **Achtergrond:** `#F5F5F5`.
- **Container:** `max-width: 800px`, gecentreerd.

### Sectie Header
| Element | Specificatie |
|---------|-------------|
| **H2** | Righteous, 28px, kleur `#1A1A1A`, "Veelgestelde vragen" |
| **Margin-bottom** | `32px` |

### Accordion Items
- **Stijl:** Zelfde als FAQ pagina (witte cards, shadow, chevron).
- **Vragen:**
  1. Moet ik afwassen?
  2. Wat als er iets kapot gaat?
  3. Hoe ver vooruit moet ik boeken?

---

## 4. CTA BANNER

### Layout
- **Padding:** `64px 0`.
- **Achtergrond:** `#903D3E`.
- **Tekst uitlijning:** Gecentreerd.

### Content
| Element | Specificatie |
|---------|-------------|
| **H2** | Righteous, 28px, kleur `#FFFFFF`, "Klaar om te starten?" |
| **Subtekst** | Roboto, 16px, kleur `rgba(255,255,255,0.9)`, "Bekijk onze pakketten en begin met plannen." |
| **Button** | Wit, tekst `#903D3E`, "Bekijk Pakketten", `margin-top: 24px` |

---

## 5. SEO & META

```html
<title>Hoe Werkt Het | Servies Huren | Tafel Totaal</title>
<meta name="description" content="Servies huren in 4 simpele stappen. Kies je producten, bestel online, wij bezorgen en jij brengt het vuil terug. Wij doen de afwas!">
<link rel="canonical" href="https://tafeltotaal.be/hoe-werkt-het.html">
```

---

## 6. CHECKLIST VOOR BOUW

### HTML/CSS
- [ ] Hero sectie
- [ ] Stappen sectie (zigzag layout)
- [ ] Nummers met connectielijnen
- [ ] Mini FAQ
- [ ] CTA banner
- [ ] Responsive design (stacking op mobiel)

### Content Nodig
- [ ] 4 duidelijke afbeeldingen/illustraties
- [ ] FAQ teksten

---

## 7. NOTITIES

_Ruimte voor extra ideeën of opmerkingen tijdens het bouwen._
