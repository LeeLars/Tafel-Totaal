# Admin Orders Pagina

> **Bestand:** `public/admin/orders.html`  
> **URL:** `/admin/orders.html`  
> **Status:** 📋 Planning (Ultra-Gedetailleerd)

---

## 1. ADMIN LAYOUT (CONTEXT)

### Sidebar (Links)
- **Breedte:** `280px` (fixed).
- **Achtergrond:** `#1A1A1A` (--color-dark).
- **Menu Items:** Dashboard, Orders (Actief), Pakketten, Producten, Klanten, Instellingen.
- **Actief Item:** Achtergrond `#903D3E`, tekst wit.

### Main Content Area
- **Padding:** `32px`.
- **Achtergrond:** `#F5F5F5` (hele pagina achtergrond).
- **Breedte:** `calc(100% - 280px)`.

---

## 2. PAGE HEADER

### Layout
- **Flexbox:** Space-between.
- **Margin-bottom:** `32px`.

### Typografie
| Element | Font | Grootte | Kleur | Extra |
|---------|------|---------|-------|-------|
| **H1** | Righteous | `32px` | `#1A1A1A` | - |
| **Subtitel** | Roboto | `14px` | `#666666` | "Beheer alle inkomende bestellingen" |

### Actions
- **Button:** "Nieuwe Order" (+ Icoon).
- **Stijl:** Primary (`#903D3E`), tekst wit, `height: 44px`.

---

## 3. STATISTIEKEN CARDS (BOVEN TABEL)

### Grid
- **Kolommen:** 4.
- **Gap:** `24px`.

### Card Stijl
- **Achtergrond:** `#FFFFFF`.
- **Border-radius:** `12px`.
- **Padding:** `24px`.
- **Shadow:** `0 2px 4px rgba(0,0,0,0.05)`.

### Metrics
1. **Nieuwe Orders:** Aantal (Bold 24px) + Label (14px grijs).
2. **Vandaag Nodig:** Aantal orders voor vandaag.
3. **Retour Vandaag:** Aantal retouren verwacht.
4. **Omzet Vandaag:** Bedrag in €.

---

## 4. FILTER BAR

### Container
- **Achtergrond:** `#FFFFFF`.
- **Padding:** `16px 24px`.
- **Border-radius:** `12px 12px 0 0` (bovenkant van tabel container).
- **Border-bottom:** `1px solid #E0E0E0`.

### Filters
| Element | Stijl |
|---------|-------|
| **Zoeken** | Input met search icon, `width: 300px`, `height: 40px`. |
| **Status Filter** | Dropdown (Select), `height: 40px`. |
| **Datum Filter** | Date range picker. |
| **Export** | Button outline (grijs), "Export CSV". |

---

## 5. ORDERS TABEL

### Container
- **Achtergrond:** `#FFFFFF`.
- **Border-radius:** `0 0 12px 12px`.
- **Shadow:** `0 4px 6px rgba(0,0,0,0.05)`.

### Table Header
- **Achtergrond:** `#FAFAFA`.
- **Hoogte:** `48px`.
- **Font:** Roboto Bold, 13px, uppercase, kleur `#666666`.
- **Kolommen:** Order #, Klant, Event Datum, Status, Totaal, Acties.

### Table Row
- **Hoogte:** `72px`.
- **Border-bottom:** `1px solid #E0E0E0`.
- **Hover:** Achtergrond `#F9F9F9`.
- **Font:** Roboto, 14px, kleur `#1A1A1A`.

### Status Badges
| Status | Achtergrond | Tekst |
|--------|-------------|-------|
| **Nieuw** | `#E3F2FD` (Blauw licht) | `#1976D2` (Blauw donker) |
| **Bevestigd** | `#E8F5E9` (Groen licht) | `#388E3C` (Groen donker) |
| **In behandeling** | `#FFF3E0` (Oranje licht) | `#F57C00` (Oranje donker) |
| **Retour** | `#ECEFF1` (Grijs licht) | `#546E7A` (Grijs donker) |

### Acties Kolom
- **Buttons:** Icon-only buttons (Oog = Bekijk, Potlood = Bewerk).
- **Stijl:** Transparant, hover kleur `#903D3E`.

---

## 6. PAGINERING

### Layout
- **Padding:** `16px 24px`.
- **Positie:** Onderaan tabel container.
- **Flex:** Space-between.

### Elementen
- **Info:** "Toon 1-25 van 156 resultaten".
- **Navigatie:** [Vorige] [1] [2] ... [10] [Volgende].
- **Stijl:** Buttons `32x32px`, active `#903D3E` (wit tekst).

---

## 7. JAVASCRIPT FUNCTIONALITEIT

| Functie | Beschrijving |
|---------|-------------|
| `loadOrders(page, filters)` | Haalt orders op van API |
| `renderTable(data)` | Vult de tabel rows |
| `updateStatus(id, newStatus)` | PATCH request naar API |
| `exportToCSV()` | Genereert CSV bestand |
| `handleSearch(query)` | Debounced search |

---

## 8. API INTEGRATIE

**Endpoint:** `GET /api/admin/orders`
**Response:**
```json
{
  "data": [
    {
      "id": "TT-2026-001",
      "customer": { "name": "Jan Jansen" },
      "eventDate": "2026-03-15",
      "status": "new",
      "total": 250.00
    }
  ],
  "meta": { "total": 156, "page": 1 }
}
```

---

## 9. CHECKLIST

### HTML/CSS
- [ ] Admin layout setup
- [ ] Dashboard metrics grid
- [ ] Filter bar styling
- [ ] Data table styling
- [ ] Status badges variants
- [ ] Paginering component

### JavaScript
- [ ] Data fetching logic
- [ ] Filtering & Sorting
- [ ] Status updates
- [ ] Search functionaliteit

---

## 10. NOTITIES

_Zorg voor een "Loading..." state (skeleton loader) in de tabel tijdens het ophalen van data._
