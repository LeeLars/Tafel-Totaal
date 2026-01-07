# Footer Component

> **Bestand:** Onderdeel van elke pagina  
> **Status:** 📋 Planning (Ultra-Gedetailleerd)

---

## 1. FOOTER LAYOUT & AFMETINGEN

### Desktop (>1024px)
- **Achtergrond:** `#1A1A1A` (--color-dark).
- **Padding:** `80px 0 0 0`.
- **Container:** `max-width: 1400px`, gecentreerd, `padding: 0 24px`.

### Tablet (768-1024px)
- **Layout:** 2x2 grid voor kolommen.
- **Padding:** `64px 0 0 0`.

### Mobiel (<768px)
- **Layout:** Gestapeld met accordions.
- **Padding:** `48px 0 0 0`.

---

## 2. MAIN FOOTER GRID

### Desktop Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  TAFEL TOTAAL          PAKKETTEN         PRODUCTEN         INFORMATIE  │
│                                                                         │
│  Van bord tot glas,    Diner Pakketten   Borden            Hoe Werkt Het│
│  zonder de was!        Cocktail          Bestek            Over Ons     │
│                        Luxe              Glazen            FAQ          │
│  [Logo]                                  Koffie & Thee     Contact      │
│                        THEMA'S           Buffet & Serveer  Referenties  │
│                        Italiaans         Linnen                         │
│                        Aziatisch                           LOCATIES     │
│                        Kerst             INSPIRATIE        West-Vlaand. │
│                        Corporate         Shop the Table    Oost-Vlaand. │
│                                          Lookbook          Antwerpen    │
│                                                            Brussel      │
│                                                                         │
│  CONTACT                                                                │
│  📍 Adresstraat 123, 8000 Stad                                         │
│  📞 +32 XX XXX XX XX                                                   │
│  ✉️  info@tafeltotaal.be                                               │
│                                                                         │
│  [Facebook] [Instagram] [Pinterest]                                     │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  © 2026 Tafel Totaal    Algemene Voorwaarden    Privacy    Cookies     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Footer Kolommen

### Kolom 1: Branding
| Element | Inhoud |
|---------|--------|
| **Logo** | Tafel Totaal logo (wit/licht) |
| **Tagline** | "Van bord tot glas, zonder de was!" |
| **Korte tekst** | 1-2 zinnen over het bedrijf |

### Kolom 2: Pakketten
| Link | URL |
|------|-----|
| Diner Pakketten | `/pakketten.html?type=diner` |
| Cocktail Pakketten | `/pakketten.html?type=cocktail` |
| Luxe Pakketten | `/pakketten.html?niveau=luxe` |
| **Thema's** | |
| Italiaans | `/producten.html?thema=italiaans` |
| Aziatisch | `/producten.html?thema=aziatisch` |
| Kerst | `/producten.html?thema=kerst` |
| Corporate | `/producten.html?thema=corporate` |

### Kolom 3: Producten
| Link | URL |
|------|-----|
| Borden | `/producten.html?categorie=borden` |
| Bestek | `/producten.html?categorie=bestek` |
| Glazen | `/producten.html?categorie=glazen` |
| Koffie & Thee | `/producten.html?categorie=koffie-thee` |
| Buffet & Serveer | `/producten.html?categorie=buffet-serveer` |
| Linnen | `/producten.html?categorie=linnen` |
| **Inspiratie** | |
| Shop the Table | `/inspiratie/shop-the-table.html` |
| Lookbook | `/inspiratie.html` |

### Kolom 4: Informatie
| Link | URL |
|------|-----|
| Hoe Werkt Het | `/hoe-werkt-het.html` |
| Over Ons | `/over-ons.html` |
| FAQ | `/faq.html` |
| Contact | `/contact.html` |
| Referenties | `/referenties.html` |
| **Locaties** | |
| West-Vlaanderen | `/locatie/west-vlaanderen.html` |
| Oost-Vlaanderen | `/locatie/oost-vlaanderen.html` |
| Antwerpen | `/locatie/antwerpen.html` |
| Brussel | `/locatie/brussel.html` |

### Contact Sectie
| Element | Inhoud |
|---------|--------|
| **Adres** | Straat, Postcode Plaats |
| **Telefoon** | +32 XX XXX XX XX |
| **E-mail** | info@tafeltotaal.be |

### Social Media
| Platform | URL |
|----------|-----|
| Facebook | facebook.com/tafeltotaal |
| Instagram | instagram.com/tafeltotaal |
| Pinterest | pinterest.com/tafeltotaal |

### Bottom Bar (Juridisch)
| Link | URL |
|------|-----|
| Algemene Voorwaarden | `/algemene-voorwaarden.html` |
| Privacybeleid | `/privacy.html` |
| Cookiebeleid | `/cookies.html` |
| Copyright | © 2026 Tafel Totaal |

---

## Mobiel Layout

Op mobiel worden de kolommen onder elkaar gestapeld met accordions.

```
┌─────────────────────────────────────┐
│                                     │
│  [LOGO]                             │
│  Van bord tot glas, zonder de was!  │
│                                     │
│  Pakketten                    [▼]   │
│  Producten                    [▼]   │
│  Informatie                   [▼]   │
│  Locaties                     [▼]   │
│                                     │
│  CONTACT                            │
│  📍 Adres                           │
│  📞 Telefoon                        │
│  ✉️  E-mail                         │
│                                     │
│  [FB] [IG] [PIN]                    │
│                                     │
├─────────────────────────────────────┤
│  © 2026 | AV | Privacy | Cookies    │
└─────────────────────────────────────┘
```

---

## 3. FOOTER KOLOMMEN STYLING

### Kolom Headers
| Element | Specificatie |
|---------|-------------|
| **Font** | Roboto Bold, 14px, uppercase |
| **Kleur** | `#FFFFFF` |
| **Letter-spacing** | `1px` |
| **Margin-bottom** | `24px` |

### Kolom Links
| Element | Specificatie |
|---------|-------------|
| **Font** | Roboto, 14px |
| **Kleur** | `rgba(255,255,255,0.7)` |
| **Hover** | Kleur `#FFFFFF`, `text-decoration: underline` |
| **Line-height** | `2` (ruime spacing) |
| **Transition** | `color 0.2s ease` |

### Branding Kolom
| Element | Specificatie |
|---------|-------------|
| **Logo** | SVG, wit versie, `height: 48px` |
| **Tagline** | Righteous, 18px, kleur `#FFFFFF`, `margin-top: 16px` |
| **Beschrijving** | Roboto, 14px, kleur `rgba(255,255,255,0.7)`, `max-width: 280px` |

---

## 4. CONTACT SECTIE

### Layout
- **Positie:** Onder de kolommen, full-width.
- **Padding:** `48px 0`.
- **Border-top:** `1px solid rgba(255,255,255,0.1)`.

### Contact Items
| Element | Specificatie |
|---------|-------------|
| **Layout** | Flexbox, `gap: 48px` |
| **Icon** | 20px, kleur `#903D3E` |
| **Tekst** | Roboto, 14px, kleur `rgba(255,255,255,0.7)` |
| **Link (email/tel)** | Hover: kleur `#FFFFFF` |

### Social Media Icons
| Element | Specificatie |
|---------|-------------|
| **Layout** | Flexbox, `gap: 16px` |
| **Icon Size** | 24px |
| **Container** | 44x44px (touch target), `border-radius: 50%`, `border: 1px solid rgba(255,255,255,0.2)` |
| **Hover** | Achtergrond `#903D3E`, border-color `#903D3E` |

---

## 5. BOTTOM BAR

### Layout
| Element | Specificatie |
|---------|-------------|
| **Achtergrond** | `#111111` (donkerder dan footer) |
| **Padding** | `24px 0` |
| **Layout** | Flexbox, space-between |

### Links
| Element | Specificatie |
|---------|-------------|
| **Copyright** | Roboto, 14px, kleur `rgba(255,255,255,0.5)` |
| **Juridische Links** | Roboto, 14px, kleur `rgba(255,255,255,0.5)`, `gap: 24px` |
| **Hover** | Kleur `#FFFFFF` |

---

## 6. MOBIEL ACCORDION

### Accordion Header
| Element | Specificatie |
|---------|-------------|
| **Padding** | `16px 0` |
| **Border-bottom** | `1px solid rgba(255,255,255,0.1)` |
| **Font** | Roboto Bold, 14px, uppercase |
| **Arrow** | ChevronDown, 20px, roteert 180° bij open |

### Accordion Content
| Element | Specificatie |
|---------|-------------|
| **Padding** | `0 0 16px 0` |
| **Animatie** | Slide down, `0.3s ease` |
| **Max-height** | `0` → `auto` bij open |

---

## 7. JAVASCRIPT FUNCTIONALITEIT

| Functie | Beschrijving |
|---------|-------------|
| `toggleFooterAccordion(section)` | Opent/sluit accordion sectie op mobiel |
| `initFooterAccordions()` | Initialiseert accordion event listeners |

---

## 8. CHECKLIST VOOR BOUW

### HTML/CSS
- [ ] Semantic HTML5 (`<footer>`, `<nav>`, `<address>`)
- [ ] 4-kolom grid layout desktop
- [ ] 2x2 grid tablet
- [ ] Accordion mobiel
- [ ] Branding kolom met logo
- [ ] Contact sectie met iconen
- [ ] Social media icons
- [ ] Bottom bar met juridische links

### JavaScript
- [ ] Accordion toggle functionaliteit
- [ ] Smooth animaties

### Accessibility
- [ ] ARIA labels op accordions
- [ ] Focus states op alle links
- [ ] Voldoende kleurcontrast (WCAG AA)

---

## 9. NOTITIES

_Ruimte voor extra ideeën of opmerkingen tijdens het bouwen._
