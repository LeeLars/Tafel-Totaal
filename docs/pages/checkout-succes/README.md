# Checkout Succes Pagina

> **Bestand:** `public/checkout-succes.html`  
> **URL:** `/checkout-succes.html?order=TT-2026-0001`  
> **Status:** 📋 Planning (Ultra-Gedetailleerd)

---

## 1. SUCCES HEADER & BEVESTIGING

### Layout & Afmetingen
- **Hoogte:** `100vh` (of `min-height: 800px` met footer).
- **Achtergrond:** `#FFFFFF`.
- **Container:** `max-width: 600px`, gecentreerd verticaal en horizontaal.
- **Tekst uitlijning:** Gecentreerd.

### Confetti Animatie
- **Effect:** Confetti cannons (links/rechts onder) bij laden pagina.
- **Library:** `canvas-confetti` (lichtgewicht).

### Icoon
- **Type:** CheckCircle (gevuld).
- **Grootte:** `80px`.
- **Kleur:** `#4CAF50` (Success groen) of `#903D3E` (Brand).
- **Animatie:** Scale-up + bounce in.

### Typografie
| Element | Font | Grootte | Kleur | Extra |
|---------|------|---------|-------|-------|
| **H1** | Righteous | `32px` | `#1A1A1A` | "Bedankt voor je bestelling!" |
| **Subtekst** | Roboto | `18px` | `#666666` | "Je bestelling is ontvangen en wordt verwerkt." |

---

## 2. ORDER INFO CARD

### Layout
- **Achtergrond:** `#F5F5F5`.
- **Border-radius:** `12px`.
- **Padding:** `24px`.
- **Margin:** `32px 0`.

### Content
| Element | Specificatie |
|---------|-------------|
| **Ordernummer Label** | Roboto, 12px, uppercase, kleur `#999999` |
| **Ordernummer** | Roboto Bold, 24px, kleur `#1A1A1A`, "TT-2026-0001" |
| **Email Info** | Roboto, 14px, kleur `#666666`, "Bevestiging verstuurd naar **jan@example.com**" |

---

## 3. WAT NU? (TIJDLIJN)

### Layout
- **Stijl:** Verticale tijdlijn.
- **Uitlijning:** Links uitgelijnd in de container.

### Tijdlijn Items
| Stap | Icoon | Titel | Tekst | Status |
|------|-------|-------|-------|--------|
| 1 | Mail | Bevestiging | Je ontvangt een e-mail met details | **Actief** (Groen vinkje) |
| 2 | Box | Voorbereiding | Wij maken je bestelling klaar | Inactief (Grijs) |
| 3 | Truck | Levering | Op **15 maart** om **14:00** | Inactief |
| 4 | Refresh | Retour | Breng alles vuil terug | Inactief |

### Styling
- **Lijn:** Verticaal, `2px solid #E0E0E0`, stopt bij laatste item.
- **Bolletje:** `12px`, `#903D3E` (actief) of `#E0E0E0` (inactief).
- **Tekst:** Titel bold, beschrijving regular.

---

## 4. ACTIES

### Layout
- **Margin-top:** `48px`.
- **Gap:** `16px`.
- **Flex:** Column op mobiel, row op desktop.

### Buttons
1. **Primair:** "Bekijk bestelling in account" (indien ingelogd)
   - Stijl: Achtergrond `#903D3E`, tekst wit.
2. **Secundair:** "Terug naar home"
   - Stijl: Outline, border `#E0E0E0`, tekst `#666666`.

---

## 5. JAVASCRIPT FUNCTIONALITEIT

| Functie | Beschrijving |
|---------|-------------|
| `initConfetti()` | Start confetti animatie bij laden |
| `getOrderFromUrl()` | Haalt order ID uit URL parameters |
| `loadOrderDetails(id)` | Haalt status en e-mail op (optioneel) |
| `clearCart()` | **Kritiek:** Leegt localStorage winkelwagen |

---

## 6. SEO & META

```html
<title>Bedankt! | Tafel Totaal</title>
<meta name="robots" content="noindex, nofollow">
```
*(Succes pagina's niet indexeren)*

---

## 7. CHECKLIST VOOR BOUW

### HTML/CSS
- [ ] Gecentreerde layout
- [ ] Succes icoon animatie
- [ ] Order info card
- [ ] Tijdlijn component
- [ ] Actie buttons

### JavaScript
- [ ] Cart leegmaken (localStorage.removeItem)
- [ ] Confetti effect
- [ ] Order ID dynamisch tonen

---

## 8. NOTITIES

_Ruimte voor extra ideeën of opmerkingen tijdens het bouwen._
