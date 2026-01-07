# Contact Pagina

> **Bestand:** `public/contact.html`  
> **URL:** `/contact.html`  
> **Status:** 📋 Planning (Ultra-Gedetailleerd)

---

## 1. PAGE HEADER

### Layout & Afmetingen
- **Padding:** `48px 0`.
- **Achtergrond:** `#FFFFFF`.
- **Container:** `max-width: 1200px`, gecentreerd.
- **Tekst uitlijning:** Gecentreerd.

### Typografie
| Element | Font | Grootte | Kleur | Extra |
|---------|------|---------|-------|-------|
| **H1** | Righteous | `clamp(2rem, 4vw, 3rem)` | `#1A1A1A` | - |
| **Subtekst** | Roboto | 18px | `#666666` | `margin-top: 16px` |

### Content
- **H1:** "Contact"
- **Subtekst:** "Vragen? Wij helpen je graag verder."

---

## 2. TWEE KOLOMMEN LAYOUT

### Desktop Layout (>768px)
- **Grid:** 2 kolommen, `60% / 40%`, `gap: 48px`.
- **Container:** `max-width: 1200px`, gecentreerd.
- **Padding:** `48px 0`.

### Mobiel Layout (<768px)
- **Stack:** Formulier boven, contactgegevens onder.

---

## 3. LINKER KOLOM: CONTACTFORMULIER

### Container
- **Achtergrond:** `#FFFFFF`.
- **Border:** `1px solid #E0E0E0`, `border-radius: 12px`.
- **Padding:** `32px`.

### Formulier Velden
| Veld | Type | Placeholder | Validatie |
|------|------|-------------|----------|
| Naam | text | "Je naam" | Required, min 2 chars |
| E-mail | email | "je@email.be" | Required, email format |
| Telefoon | tel | "+32 XXX XX XX XX" | Optional |
| Onderwerp | select | "Selecteer onderwerp" | Required |
| Bericht | textarea | "Hoe kunnen we je helpen?" | Required, min 10 chars |

### Onderwerp Opties
- Algemene vraag
- Offerte aanvragen
- Bestaande bestelling
- Klacht
- Anders

### Input Styling
| Element | Specificatie |
|---------|-------------|
| **Label** | Roboto, 14px, kleur `#1A1A1A`, `margin-bottom: 8px` |
| **Input** | `height: 48px`, `padding: 12px 16px`, `border: 1px solid #E0E0E0`, `border-radius: 8px` |
| **Textarea** | `min-height: 150px`, zelfde border styling |
| **Focus** | `border-color: #903D3E`, `box-shadow: 0 0 0 3px rgba(144,61,62,0.1)` |
| **Error** | `border-color: #DC3545`, error message in rood |

### Submit Button
| Element | Specificatie |
|---------|-------------|
| **Button** | Full-width, `height: 52px`, achtergrond `#903D3E`, tekst wit, Roboto Bold 16px |
| **Hover** | Achtergrond `#7A3435` |
| **Loading** | Spinner icon, "Verzenden..." |
| **Success** | Achtergrond groen, checkmark, "Verzonden!" |

---

## 4. RECHTER KOLOM: CONTACTGEGEVENS

### Container
- **Achtergrond:** `#F5F5F5`.
- **Border-radius:** `12px`.
- **Padding:** `32px`.

### Contact Items
| Element | Specificatie |
|---------|-------------|
| **Item Container** | `margin-bottom: 24px` |
| **Icon** | 24px, kleur `#903D3E`, `margin-right: 16px` |
| **Label** | Roboto Bold, 14px, kleur `#1A1A1A` |
| **Value** | Roboto, 14px, kleur `#666666` |
| **Link (email/tel)** | Kleur `#903D3E`, hover underline |

### Contact Info
| Type | Icon | Content |
|------|------|--------|
| Adres | MapPin | Stationsstraat XX, 8340 Beernem |
| Telefoon | Phone | +32 XX XXX XX XX |
| E-mail | Mail | info@tafeltotaal.be |
| Openingstijden | Clock | Ma-Vr: 9:00-17:00 |

### Social Media
- **Layout:** Horizontaal, `gap: 12px`, `margin-top: 32px`.
- **Icons:** Facebook, Instagram, 24px, kleur `#666666`, hover `#903D3E`.

---

## 5. GOOGLE MAPS (Optioneel)

### Layout
- **Positie:** Onder de twee kolommen, full-width.
- **Hoogte:** `400px` desktop, `300px` mobiel.
- **Border-radius:** `12px` (met overflow hidden).

---

## 6. JAVASCRIPT FUNCTIONALITEIT

| Functie | Beschrijving |
|---------|-------------|
| `validateForm()` | Valideert alle velden, toont errors |
| `submitContact()` | POST naar `/api/contact` |
| `showSuccess()` | Toont success state, reset form |
| `showError(message)` | Toont error message |

---

## 7. SEO & META

```html
<title>Contact | Tafel Totaal</title>
<meta name="description" content="Neem contact op met Tafel Totaal voor vragen over servies verhuur, offertes of advies. Wij helpen je graag!">
<link rel="canonical" href="https://tafeltotaal.be/contact.html">
```

### LocalBusiness Structured Data
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Tafel Totaal",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Stationsstraat XX",
    "addressLocality": "Beernem",
    "postalCode": "8340",
    "addressCountry": "BE"
  },
  "telephone": "+32XXXXXXXX",
  "email": "info@tafeltotaal.be"
}
```

---

## 8. CHECKLIST VOOR BOUW

### HTML/CSS
- [ ] Semantic HTML5 (`<form>`, `<address>`)
- [ ] Twee kolommen layout
- [ ] Form styling
- [ ] Contact info cards
- [ ] Google Maps embed
- [ ] Responsive design

### JavaScript
- [ ] Form validation
- [ ] Submit handler
- [ ] Success/error states

### Content Nodig
- [ ] Definitief adres
- [ ] Telefoonnummer
- [ ] Openingstijden

---

## 9. NOTITIES

_Ruimte voor extra ideeën of opmerkingen tijdens het bouwen._
