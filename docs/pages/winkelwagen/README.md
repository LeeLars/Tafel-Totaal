# Winkelwagen Pagina

> **Bestand:** `public/winkelwagen.html`  
> **URL:** `/winkelwagen.html`  
> **Status:** 📋 Planning (Ultra-Gedetailleerd)

---

## 1. PAGE HEADER

### Layout & Afmetingen
- **Padding:** `48px 0 24px 0`.
- **Achtergrond:** `#FFFFFF`.
- **Container:** `max-width: 1200px`, gecentreerd.

### Typografie
| Element | Font | Grootte | Kleur | Extra |
|---------|------|---------|-------|-------|
| **H1** | Righteous | `clamp(1.75rem, 3vw, 2.5rem)` | `#1A1A1A` | - |
| **Item Count** | Roboto | 16px | `#666666` | Onder de H1, `margin-top: 8px` |

### Content
- **H1:** "Winkelwagen"
- **Item Count:** "X item(s) in je wagen" (dynamisch)

### Breadcrumbs
- **Content:** `Home > Winkelwagen`
- **Stijl:** Roboto, 14px, kleur `#666666`.

---

## 2. WINKELWAGEN LAYOUT

### Desktop Layout (>768px)
- **Grid:** 2 kolommen, `70% / 30%`, `gap: 32px`.
- **Links:** Cart items lijst.
- **Rechts:** Totalen sidebar (sticky, `top: 100px`).

### Mobiel Layout (<768px)
- **Stack:** Items boven, totalen onder.
- **Totalen:** Sticky footer bar met "Afrekenen" button.

---

## 3. CART ITEMS LIJST

### Container
- **Achtergrond:** `#FFFFFF`.
- **Border:** `1px solid #E0E0E0`, `border-radius: 12px`.
- **Overflow:** `hidden`.

### Per Cart Item
| Element | Specificatie |
|---------|-------------|
| **Container** | `padding: 24px`, `border-bottom: 1px solid #E0E0E0` (laatste item geen border) |
| **Layout** | Flexbox, `gap: 16px` |
| **Afbeelding** | `80x80px`, `border-radius: 8px`, `object-fit: cover` |
| **Content** | Flex-grow, verticaal gestapeld |
| **Naam** | Roboto Bold, 18px, kleur `#1A1A1A` |
| **Details** | Roboto, 14px, kleur `#666666`, icon + tekst (Calendar icon + datum, Users icon + personen) |
| **Add-ons** | Roboto, 14px, kleur `#666666`, ingesprongen lijst met + prefix |
| **Prijs** | Roboto Bold, 20px, kleur `#903D3E`, rechts uitgelijnd |
| **Verwijder Button** | Icon-only, Trash icon, 24x24px, kleur `#999999`, hover: `#903D3E` |

### Hover Effect op Item
- Achtergrond: `#FAFAFA`.
- `transition: background 0.2s ease`.

### Verwijder Animatie
- Item slide naar links uit beeld.
- `transition: transform 0.3s ease, opacity 0.3s ease`.

---

## 4. TOTALEN SIDEBAR

### Layout & Afmetingen
- **Achtergrond:** `#F5F5F5` (--color-light).
- **Border-radius:** `12px`.
- **Padding:** `24px`.
- **Position:** `sticky`, `top: 100px` (desktop).

### Content
| Element | Specificatie |
|---------|-------------|
| **Titel** | Roboto Bold, 18px, kleur `#1A1A1A`, "Overzicht" |
| **Divider** | `1px solid #E0E0E0`, `margin: 16px 0` |
| **Subtotaal Row** | Flexbox, space-between. Label: Roboto 14px `#666666`. Waarde: Roboto 14px `#1A1A1A` |
| **Bezorging Row** | Zelfde stijl. Waarde: "Berekend bij checkout" of "€XX,XX" |
| **Borg Row** | Zelfde stijl. Waarde: "Berekend bij checkout" |
| **Totaal Divider** | `2px solid #1A1A1A`, `margin: 16px 0` |
| **Totaal Row** | Label: Roboto Bold 16px `#1A1A1A`. Waarde: Roboto Bold 24px `#903D3E` |
| **CTA Button** | Full-width, `margin-top: 24px`, achtergrond `#903D3E`, tekst wit, `height: 52px`, `border-radius: 8px`, "Afrekenen →" |
| **Verder Winkelen** | Text link, gecentreerd, `margin-top: 16px`, kleur `#903D3E`, "← Verder winkelen" |

### Trust Badges (onder CTA)
- **Layout:** Horizontaal, gecentreerd, `margin-top: 24px`.
- **Items:** Lock icon + "Veilig betalen", Truck icon + "Snelle bezorging".
- **Stijl:** Roboto, 12px, kleur `#666666`.

---

## 5. LEGE WINKELWAGEN STATE

### Layout
- **Padding:** `80px 0`.
- **Tekst uitlijning:** Gecentreerd.
- **Container:** `max-width: 400px`, gecentreerd.

### Content
| Element | Specificatie |
|---------|-------------|
| **Icon** | ShoppingCart icon, 80x80px, kleur `#E0E0E0` |
| **Titel** | Roboto Bold, 24px, kleur `#1A1A1A`, "Je winkelwagen is leeg", `margin-top: 24px` |
| **Tekst** | Roboto, 16px, kleur `#666666`, "Voeg pakketten of losse producten toe om te beginnen." |
| **CTA Primary** | Button, achtergrond `#903D3E`, "Bekijk pakketten", `margin-top: 24px` |
| **CTA Secondary** | Text link, kleur `#903D3E`, "Of bekijk losse producten", `margin-top: 12px` |

---

## 6. JAVASCRIPT FUNCTIONALITEIT

| Functie | Beschrijving |
|---------|-------------|
| `loadCart()` | Haalt cart uit localStorage, parsed JSON |
| `renderCart()` | Rendert alle items in de DOM |
| `updateItemQuantity(index, delta)` | Past aantal aan (+1 of -1) |
| `removeItem(index)` | Verwijdert item met animatie |
| `calculateTotals()` | Berekent subtotaal en update DOM |
| `saveCart()` | Slaat cart op in localStorage |
| `updateCartCount()` | Update header cart badge |
| `proceedToCheckout()` | Valideert cart en navigeert naar checkout |

---

## 7. SEO & META

```html
<title>Winkelwagen | Tafel Totaal</title>
<meta name="robots" content="noindex, nofollow">
```

*Winkelwagen pagina's worden niet geïndexeerd door zoekmachines.*

---

## LocalStorage Structuur

```javascript
// Key: "tafel_totaal_cart"
{
  items: [
    {
      type: "package",
      packageId: 1,
      packageSlug: "diner-standaard-50",
      packageName: "Diner Standaard 50 personen",
      persons: 50,
      startDate: "2026-03-15",
      endDate: "2026-03-17",
      periodType: "weekend",
      basePrice: 175,
      addons: [...],
      totalPrice: 184
    }
  ],
  updatedAt: "2026-01-07T15:00:00Z"
}
```

---

## Wireframe (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│                         HEADER                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  WINKELWAGEN                                                │
│  2 items in je wagen                                        │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ [IMG]  Diner Standaard 50 personen                    │  │
│  │        15-17 maart 2026 (weekend)                     │  │
│  │        50 personen                                    │  │
│  │                                                       │  │
│  │        + 20x Champagneglas (€9,00)                   │  │
│  │                                              €184,00  │  │
│  │                                                  [🗑️] │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ [IMG]  Cocktail Party 30 personen                     │  │
│  │        15-17 maart 2026 (weekend)                     │  │
│  │        30 personen                                    │  │
│  │                                              €95,00   │  │
│  │                                                  [🗑️] │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                              Subtotaal:          €279,00    │
│                              Bezorging:    bij checkout     │
│                              Borg:         bij checkout     │
│                              ─────────────────────────────  │
│                              TOTAAL:             €279,00    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [← Verder winkelen]                    [ AFREKENEN → ]     │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                         FOOTER                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Checklist

- [ ] HTML structuur
- [ ] CSS styling volgens styleguide
- [ ] Page header met item count
- [ ] Cart items lijst
- [ ] Item card component
- [ ] Verwijder functionaliteit
- [ ] Totalen sectie
- [ ] Actie buttons
- [ ] Lege wagen state
- [ ] Responsive design
- [ ] JavaScript: loadCart()
- [ ] JavaScript: removeItem()
- [ ] JavaScript: calculateTotals()
- [ ] JavaScript: saveCart()

---

## Notities

_Ruimte voor extra ideeën of opmerkingen tijdens het bouwen._
