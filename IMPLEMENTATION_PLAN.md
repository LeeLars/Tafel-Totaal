# CMS Pakket Management Systeem - Implementatie Plan

## Overzicht
Een volledig CMS systeem om pakketten te beheren met product selectie, image upload, en toggle points.

## Database Schema

### packages table
- id (SERIAL PRIMARY KEY)
- name (VARCHAR 255) - Naam van het pakket
- slug (VARCHAR 255 UNIQUE) - URL-vriendelijke naam
- description (TEXT) - Uitgebreide beschrijving
- short_description (VARCHAR 500) - Korte samenvatting
- image_url (VARCHAR 500) - Cloudinary URL
- price_per_day (DECIMAL) - Prijs per dag
- persons (INT) - Aantal personen
- is_active (BOOLEAN) - Actief/inactief
- is_featured (BOOLEAN) - Featured op homepage
- sort_order (INT) - Volgorde
- created_at, updated_at (TIMESTAMP)

### package_items table (junction)
- id (SERIAL PRIMARY KEY)
- package_id (INT FK) - Verwijzing naar package
- product_id (INT FK) - Verwijzing naar product
- quantity (INT) - Aantal stuks
- is_optional (BOOLEAN) - Optioneel item
- toggle_points (INT) - Punten voor toggle systeem
- sort_order (INT) - Volgorde in pakket

## Backend API Endpoints

### Public Endpoints
- GET /api/packages - Alle actieve pakketten
- GET /api/packages/:id - Specifiek pakket met producten

### Admin Endpoints (auth required)
- GET /api/admin/packages - Alle pakketten (incl. inactive)
- POST /api/admin/packages - Nieuw pakket aanmaken
- PUT /api/admin/packages/:id - Pakket updaten
- DELETE /api/admin/packages/:id - Pakket verwijderen
- POST /api/admin/packages/:id/items - Product toevoegen aan pakket
- PUT /api/admin/packages/:id/items/:itemId - Package item updaten
- DELETE /api/admin/packages/:id/items/:itemId - Product verwijderen uit pakket

## CMS Admin Interface

### Packages Menu Item
- Nieuw menu item in admin nav: "Pakketten"
- Route: /admin/packages.html

### Packages Overview Page
- Tabel met alle pakketten
- Kolommen: Afbeelding, Naam, Prijs, Personen, Status, Acties
- Filters: Actief/Inactief, Featured
- Sorteer opties
- "Nieuw Pakket" knop

### Package Create/Edit Form
- Basis informatie:
  - Naam (required)
  - Slug (auto-generate from name)
  - Korte beschrijving (max 500 chars)
  - Uitgebreide beschrijving (textarea)
  - Prijs per dag (number)
  - Aantal personen (number)
  - Featured checkbox
  - Actief checkbox
  
- Afbeelding Upload:
  - Drag & drop zone
  - Preview van huidige afbeelding
  - Cloudinary integration
  - Crop/resize opties
  
- Product Selectie:
  - Zoekbare lijst van alle producten
  - Multi-select met checkboxes
  - Per product:
    - Aantal (quantity input)
    - Optioneel checkbox
    - Toggle points (number input voor optionele items)
  - Drag & drop om volgorde te wijzigen
  - Real-time preview van totaal aantal items

### Toggle Points Systeem
- Gebruiker krijgt X toggle points
- Kan optionele producten selecteren tot points op zijn
- Voorbeeld: 
  - Pakket heeft 10 toggle points
  - Product A kost 3 points
  - Product B kost 5 points
  - Product C kost 4 points
  - Gebruiker kan A+B of A+C of B+C kiezen

## Frontend Website

### Packages Overview Page (/pakketten.html)
- Grid van package cards
- Elke card toont:
  - Afbeelding
  - Naam
  - Korte beschrijving
  - Prijs per dag
  - Aantal personen
  - "Bekijk Details" knop
- Filters: Aantal personen, Prijs range
- Sorteer: Prijs, Populariteit, Naam

### Package Detail Page (/pakket.html?id=X)
- Hero sectie met grote afbeelding
- Pakket informatie
- Lijst van inclusief producten
- Optionele producten met toggle systeem
- Prijs calculator (aantal dagen)
- "Toevoegen aan winkelwagen" knop

## Implementatie Stappen

1. ✅ Database migratie aanmaken
2. ⏳ Backend API routes implementeren
3. ⏳ CMS admin interface bouwen
4. ⏳ Image upload integreren
5. ⏳ Product selector bouwen
6. ⏳ Toggle points systeem implementeren
7. ⏳ Frontend package pages bouwen
8. ⏳ Winkelwagen integratie
9. ⏳ Testing & debugging

## Technische Details

### Image Upload Flow
1. User selecteert afbeelding in CMS
2. Frontend upload naar backend endpoint
3. Backend upload naar Cloudinary
4. Cloudinary URL opslaan in database
5. Preview tonen in CMS

### Toggle Points Logic
```javascript
// Frontend validation
const selectedOptionalItems = items.filter(i => i.is_optional && i.selected);
const totalPoints = selectedOptionalItems.reduce((sum, i) => sum + i.toggle_points, 0);
const maxPoints = package.toggle_points_limit;

if (totalPoints > maxPoints) {
  // Show error: "Je hebt te veel opties geselecteerd"
}
```

### Product Selector Component
- Searchable dropdown
- Categories filter
- Selected products list
- Quantity inputs
- Remove buttons

## Testing Checklist

- [ ] Pakket aanmaken via CMS
- [ ] Afbeelding uploaden
- [ ] Producten selecteren
- [ ] Toggle points instellen
- [ ] Pakket opslaan
- [ ] Pakket bekijken op website
- [ ] Optionele producten selecteren
- [ ] Toggle points validatie
- [ ] Toevoegen aan winkelwagen
- [ ] Bestelling plaatsen

## Geschatte Tijd
- Backend: 4-6 uur
- CMS Interface: 6-8 uur
- Frontend: 4-6 uur
- Testing: 2-3 uur
- **Totaal: 16-23 uur**

Dit is een complexe feature die zorgvuldig moet worden geïmplementeerd.
