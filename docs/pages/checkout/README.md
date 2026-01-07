# Checkout Pagina

> **Bestand:** `public/checkout.html`  
> **URL:** `/checkout.html`  
> **Status:** 📋 Planning (Ultra-Gedetailleerd)

---

## 1. CHECKOUT LAYOUT

### Desktop Layout (>768px)
- **Grid:** 2 kolommen, `60% / 40%`, `gap: 48px`.
- **Links:** Formulier stappen.
- **Rechts:** Order samenvatting sidebar (sticky, `top: 100px`).
- **Container:** `max-width: 1200px`, gecentreerd.
- **Padding:** `48px 0`.

### Mobiel Layout (<768px)
- **Stack:** Formulier boven, samenvatting onder (of in collapsible accordion).
- **Sticky CTA:** "Betalen" button fixed aan onderkant scherm.

---

## 2. STAPPEN INDICATOR

### Layout
- **Positie:** Boven het formulier.
- **Margin-bottom:** `48px`.

### Stappen
| Stap | Label | Icon |
|------|-------|------|
| 1 | Gegevens | User icon |
| 2 | Bezorging | Truck icon |
| 3 | Betaling | CreditCard icon |

### Stijl per Stap
| State | Cirkel | Tekst | Lijn |
|-------|--------|-------|------|
| **Actief** | Achtergrond `#903D3E`, tekst wit | Roboto Bold, `#1A1A1A` | - |
| **Voltooid** | Achtergrond `#903D3E`, checkmark icon wit | Roboto, `#666666` | Solid `#903D3E` |
| **Inactief** | Border `2px solid #E0E0E0`, tekst `#999999` | Roboto, `#999999` | Dashed `#E0E0E0` |

### Afmetingen
- **Cirkel:** 40x40px, `border-radius: 50%`.
- **Verbindingslijn:** `height: 2px`, tussen cirkels.
- **Gap:** `24px` tussen stappen.

---

## 3. STAP 1: GEGEVENS

### Formulier Container
- **Achtergrond:** `#FFFFFF`.
- **Border:** `1px solid #E0E0E0`, `border-radius: 12px`.
- **Padding:** `32px`.

### Sectie: Contactgegevens
| Veld | Type | Placeholder | Validatie |
|------|------|-------------|-----------|
| Voornaam | text | "Jan" | Required, min 2 chars |
| Achternaam | text | "Janssen" | Required, min 2 chars |
| E-mail | email | "jan@voorbeeld.be" | Required, email format |
| Telefoon | tel | "+32 123 456 789" | Required, phone format |

### Sectie: Factuuradres
| Veld | Type | Placeholder | Validatie |
|------|------|-------------|-----------|
| Bedrijfsnaam | text | "Optioneel" | - |
| BTW-nummer | text | "BE0123456789" | Optional, BE VAT format |
| Straat + huisnummer | text | "Hoofdstraat 1" | Required |
| Postcode | text | "8000" | Required, 4 digits |
| Plaats | text | "Brugge" | Required |
| Land | select | België (default) | Required |

### Input Styling
| Element | Specificatie |
|---------|-------------|
| **Container** | `margin-bottom: 20px` |
| **Label** | Roboto, 14px, kleur `#1A1A1A`, `margin-bottom: 8px` |
| **Input** | `height: 48px`, `padding: 12px 16px`, `border: 1px solid #E0E0E0`, `border-radius: 8px` |
| **Input Focus** | `border-color: #903D3E`, `box-shadow: 0 0 0 3px rgba(144,61,62,0.1)` |
| **Input Error** | `border-color: #DC3545`, error message onder input in rood |
| **Required Indicator** | Rood sterretje (*) naast label |

---

## 4. STAP 2: BEZORGING

### Bezorgmethode Keuze
- **Layout:** 2 radio cards naast elkaar.
- **Per Card:**
  - Border: `2px solid #E0E0E0`, `border-radius: 12px`.
  - Padding: `24px`.
  - **Selected:** Border `2px solid #903D3E`, achtergrond `rgba(144,61,62,0.05)`.

| Optie | Icon | Titel | Beschrijving | Prijs |
|-------|------|-------|--------------|-------|
| Afhalen | MapPin | "Afhalen" | "Op ons adres in Beernem" | "Gratis" (groen) |
| Bezorgen | Truck | "Bezorgen" | "Wij brengen en halen op" | "Vanaf €25" |

### Bezorgadres (indien bezorgen)
- **Checkbox:** "Zelfde als factuuradres" (default checked).
- **Velden:** Zelfde styling als Stap 1.

### Tijdslot Selectie
| Element | Specificatie |
|---------|-------------|
| **Bezorgdatum** | Readonly, toont startdatum uit cart |
| **Bezorg Tijdslot** | Radio buttons: Ochtend (9-12u), Middag (12-17u), Avond (17-20u) |
| **Retourdatum** | Readonly, toont einddatum uit cart |
| **Retour Tijdslot** | Radio buttons: zelfde opties |

---

## 5. STAP 3: OVERZICHT & BETALING

### Order Samenvatting (in formulier, niet sidebar)
| Element | Specificatie |
|---------|-------------|
| **Items Lijst** | Compacte weergave: naam, aantal, prijs per regel |
| **Subtotaal** | Roboto, 14px |
| **Bezorgkosten** | Roboto, 14px, toont berekende waarde |
| **Borg** | Roboto, 14px, kleur `#666666`, "(terugbetaald na retour)" |
| **BTW** | Roboto, 14px, "21% BTW" |
| **Totaal** | Roboto Bold, 24px, kleur `#903D3E` |

### Voorwaarden Checkbox
| Element | Specificatie |
|---------|-------------|
| **Checkbox** | Custom styled, 24x24px, `border-radius: 4px` |
| **Label** | Roboto, 14px, "Ik ga akkoord met de [algemene voorwaarden]" |
| **Link** | Kleur `#903D3E`, opent in nieuw tabblad |
| **Error** | Rood border + "Je moet akkoord gaan met de voorwaarden" |

### Betaal Button
| Element | Specificatie |
|---------|-------------|
| **Button** | Full-width, `height: 56px`, achtergrond `#903D3E`, tekst wit, Roboto Bold 18px |
| **Tekst** | "Betalen €XXX,XX" (dynamisch totaal) |
| **Icon** | Lock icon links van tekst (veiligheid) |
| **Hover** | Achtergrond `#7A3435` |
| **Loading State** | Spinner icon, tekst "Bezig met verwerken..." |
| **Disabled** | Als voorwaarden niet geaccepteerd, `opacity: 0.5`, `cursor: not-allowed` |

### Betaalmethoden Info
- **Onder button:** Kleine iconen van betaalmethoden (Bancontact, iDEAL, Visa, Mastercard).
- **Stijl:** Grijze iconen, 32px hoog, `gap: 8px`.

---

## JavaScript Functionaliteit

| Functie | Beschrijving |
|---------|--------------|
| `loadCart()` | Haalt cart uit localStorage |
| `validateStep(step)` | Valideert formuliervelden per stap |
| `nextStep()` | Gaat naar volgende stap |
| `prevStep()` | Gaat naar vorige stap |
| `calculateDelivery(postcode)` | Berekent bezorgkosten |
| `calculateDeposit()` | Berekent borg |
| `calculateTotals()` | Berekent alle totalen |
| `submitOrder()` | POST order naar API |
| `handleMollieRedirect()` | Redirect naar Mollie betaalpagina |

---

## API Calls

| Endpoint | Methode | Doel |
|----------|---------|------|
| `/api/bezorgzones` | GET | Bezorgkosten per postcode |
| `/api/checkout` | POST | Order aanmaken, Mollie payment starten |

**POST /api/checkout body:**
```javascript
{
  customer: {
    firstName: "Jan",
    lastName: "Janssen",
    email: "jan@example.com",
    phone: "+32 123 456 789",
    company: "Bedrijf BV",
    vatNumber: "BE0123456789"
  },
  billingAddress: {
    street: "Hoofdstraat 1",
    postalCode: "2000",
    city: "Antwerpen",
    country: "BE"
  },
  deliveryMethod: "delivery", // of "pickup"
  deliveryAddress: {
    street: "Feeststraat 10",
    postalCode: "2000",
    city: "Antwerpen",
    instructions: "Achterom bellen"
  },
  deliverySlot: {
    date: "2026-03-15",
    time: "afternoon"
  },
  returnSlot: {
    date: "2026-03-17",
    time: "morning"
  },
  items: [...], // Cart items
  acceptedTerms: true
}
```

**Response:**
```javascript
{
  orderId: "TT-2026-0001",
  paymentUrl: "https://www.mollie.com/checkout/..." // Redirect hier naartoe
}
```

---

## Wireframe (ASCII)

```
┌─────────────────────────────────────────────────────────────┐
│                         HEADER                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│        (1) Gegevens  ──  (2) Bezorging  ──  (3) Betaling    │
│            ●                  ○                  ○           │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────┐  ┌─────────────────────┐  │
│  │                             │  │                     │  │
│  │  CONTACTGEGEVENS            │  │  SAMENVATTING       │  │
│  │                             │  │                     │  │
│  │  Voornaam: [__________]     │  │  Diner Standaard    │  │
│  │  Achternaam: [________]     │  │  50 pers, weekend   │  │
│  │  E-mail: [____________]     │  │            €175,00  │  │
│  │  Telefoon: [__________]     │  │                     │  │
│  │                             │  │  + Champagneglas    │  │
│  │  FACTUURADRES               │  │  20x        €9,00   │  │
│  │                             │  │  ─────────────────  │  │
│  │  Bedrijf: [___________]     │  │  Subtotaal €184,00  │  │
│  │  BTW-nr: [____________]     │  │  Bezorging  €25,00  │  │
│  │  Straat: [____________]     │  │  Borg       €30,00  │  │
│  │  Postcode: [____]           │  │  BTW 21%    €43,89  │  │
│  │  Plaats: [____________]     │  │  ─────────────────  │  │
│  │  Land: [België ▼]           │  │  TOTAAL    €282,89  │  │
│  │                             │  │                     │  │
│  │  [ ← Terug ]  [ Volgende →] │  │                     │  │
│  │                             │  │                     │  │
│  └─────────────────────────────┘  └─────────────────────┘  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                         FOOTER                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Checklist

- [ ] HTML structuur
- [ ] CSS styling volgens styleguide
- [ ] Stappen indicator
- [ ] Stap 1: Contactgegevens formulier
- [ ] Stap 1: Factuuradres formulier
- [ ] Stap 2: Bezorgmethode keuze
- [ ] Stap 2: Bezorgadres formulier
- [ ] Stap 2: Tijdslot selectie
- [ ] Stap 3: Order samenvatting
- [ ] Stap 3: Voorwaarden checkbox
- [ ] Stap 3: Betaalknop
- [ ] Sidebar: Order samenvatting (sticky)
- [ ] Responsive design
- [ ] JavaScript: validateStep()
- [ ] JavaScript: nextStep() / prevStep()
- [ ] JavaScript: calculateDelivery()
- [ ] JavaScript: calculateDeposit()
- [ ] JavaScript: submitOrder()
- [ ] Form validatie
- [ ] Error handling
- [ ] Loading state bij submit

---

## Notities

_Ruimte voor extra ideeën of opmerkingen tijdens het bouwen._
