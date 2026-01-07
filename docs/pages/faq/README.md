# FAQ Pagina

> **Bestand:** `public/faq.html`  
> **URL:** `/faq.html`  
> **Status:** 📋 Planning (Ultra-Gedetailleerd)

---

## 1. PAGE HEADER

### Layout & Afmetingen
- **Padding:** `48px 0`.
- **Achtergrond:** `#FFFFFF`.
- **Container:** `max-width: 800px`, gecentreerd.
- **Tekst uitlijning:** Gecentreerd.

### Typografie
| Element | Font | Grootte | Kleur | Extra |
|---------|------|---------|-------|-------|
| **H1** | Righteous | `clamp(2rem, 4vw, 3rem)` | `#1A1A1A` | - |
| **Subtekst** | Roboto | 18px | `#666666` | `margin-top: 16px` |

### Content
- **H1:** "Veelgestelde Vragen"
- **Subtekst:** "Vind snel antwoord op je vragen"

### Breadcrumbs
- **Content:** `Home > FAQ`
- **Stijl:** Roboto, 14px, kleur `#666666`.

---

## 2. FAQ ACCORDION SECTIE

### Layout
- **Padding:** `48px 0`.
- **Achtergrond:** `#F5F5F5`.
- **Container:** `max-width: 800px`, gecentreerd.

### Categorie Headers
| Element | Specificatie |
|---------|-------------|
| **Font** | Righteous, 20px, kleur `#1A1A1A` |
| **Margin** | `margin-top: 48px` (eerste categorie `margin-top: 0`) |
| **Margin-bottom** | `24px` |

### Accordion Item (Gesloten)
| Element | Specificatie |
|---------|-------------|
| **Container** | Achtergrond `#FFFFFF`, `border-radius: 8px`, `margin-bottom: 8px` |
| **Padding** | `20px 24px` |
| **Vraag** | Roboto, 16px, `font-weight: 500`, kleur `#1A1A1A` |
| **Arrow** | ChevronDown, 20px, kleur `#666666`, rechts uitgelijnd |
| **Hover** | `box-shadow: 0 2px 8px rgba(0,0,0,0.06)` |

### Accordion Item (Open)
| Element | Specificatie |
|---------|-------------|
| **Container** | `border-left: 3px solid #903D3E` |
| **Arrow** | Roteert 180° |
| **Antwoord** | Roboto, 15px, kleur `#666666`, `padding-top: 16px`, `line-height: 1.7` |
| **Animatie** | Slide down, `0.3s ease` |

### FAQ Content (behouden uit origineel)
**Categorie: Bestellen**
- Moet ik een pakket huren?
- Hoe bestel ik?
- Hoe ver vooruit moet ik boeken?
- Kan ik mijn bestelling wijzigen?
- Kan ik annuleren?

**Categorie: Levering & Retour**
- Bezorgen jullie bij mij?
- Kan ik ook afhalen?
- Moet ik afwassen?
- Wat als ik te laat retourneer?

**Categorie: Producten & Kwaliteit**
- Wat is het verschil tussen Standaard en Luxe?
- Zijn de producten schoon?
- Wat als er iets kapot is bij ontvangst?

**Categorie: Betaling & Borg**
- Welke betaalmethodes accepteren jullie?
- Moet ik borg betalen?
- Wat als er iets kapot gaat?

---

## 3. NIET GEVONDEN? CTA

### Layout
- **Padding:** `64px 0`.
- **Achtergrond:** `#1A1A1A`.
- **Tekst uitlijning:** Gecentreerd.

### Content
| Element | Specificatie |
|---------|-------------|
| **Titel** | Righteous, 28px, kleur `#FFFFFF`, "Staat je vraag er niet bij?" |
| **Subtekst** | Roboto, 16px, kleur `rgba(255,255,255,0.8)`, "Neem gerust contact met ons op" |
| **CTA** | Button primary, achtergrond `#903D3E`, "Neem contact op", `margin-top: 24px` |

---

## 4. JAVASCRIPT FUNCTIONALITEIT

| Functie | Beschrijving |
|---------|-------------|
| `initAccordions()` | Initialiseert alle accordion event listeners |
| `toggleAccordion(id)` | Opent/sluit FAQ item met animatie |
| `closeAllAccordions()` | Sluit alle open items (optioneel: alleen 1 open tegelijk) |
| `openFromHash()` | Opent specifieke vraag als URL hash aanwezig is (#vraag-id) |

---

## 5. SEO & META

```html
<title>Veelgestelde Vragen | FAQ | Tafel Totaal</title>
<meta name="description" content="Antwoorden op veelgestelde vragen over servies huren, bezorging, afwas en meer. Alles wat je moet weten over Tafel Totaal.">
<link rel="canonical" href="https://tafeltotaal.be/faq.html">
```

### FAQ Structured Data
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Moet ik afwassen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nee! Je brengt alles vuil terug in dezelfde kratten. Wij wassen af."
      }
    }
  ]
}
```

---

## 6. CHECKLIST VOOR BOUW

### HTML/CSS
- [ ] Semantic HTML5 structuur
- [ ] Accordion component met ARIA attributes
- [ ] Categorie headers
- [ ] CTA banner
- [ ] Responsive design

### JavaScript
- [ ] Accordion toggle met animatie
- [ ] URL hash support
- [ ] Keyboard navigation (Enter/Space)

### Accessibility
- [ ] `aria-expanded` op accordion buttons
- [ ] `aria-controls` linking
- [ ] Focus visible states

---

## 7. NOTITIES

_Ruimte voor extra ideeën of opmerkingen tijdens het bouwen._
