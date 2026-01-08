# Testing Checklist - Tafel Totaal

## Pre-Test Setup

- [ ] Backend draait (`npm run dev` in `/backend`)
- [ ] Frontend draait (`npx serve .` in `/public`)
- [ ] Database is gemigreerd en geseeded
- [ ] Browser DevTools open (Network + Console tabs)

---

## 1. Public Pages (geen login nodig)

### Homepage (`/index.html`)
- [ ] Pagina laadt zonder errors
- [ ] Header component laadt
- [ ] Footer component laadt
- [ ] Hero sectie zichtbaar
- [ ] Featured packages laden van API
- [ ] "Bekijk Pakketten" link werkt

### Pakketten Overzicht (`/pakketten.html`)
- [ ] Packages laden van API
- [ ] Filters werken (service level, personen, prijs)
- [ ] Sorteren werkt
- [ ] Package cards klikbaar
- [ ] Mobile filter overlay werkt

### Pakket Detail (`/pakket.html?id=...`)
- [ ] Package data laadt
- [ ] Image gallery werkt
- [ ] Datepicker werkt
- [ ] Personen selector werkt
- [ ] Add-ons selecteerbaar
- [ ] Prijs update dynamisch
- [ ] "Toevoegen aan winkelwagen" werkt

### Content Pages
- [ ] `/hoe-werkt-het.html` - laadt, accordion werkt
- [ ] `/faq.html` - laadt, accordions werken
- [ ] `/contact.html` - laadt, form submit toont toast
- [ ] `/over-ons.html` - laadt
- [ ] `/algemene-voorwaarden.html` - laadt
- [ ] `/privacy.html` - laadt
- [ ] `/cookies.html` - laadt

---

## 2. Authentication Flow

### Registreren (`/registreren.html`)
- [ ] Form validatie werkt (lege velden, email format)
- [ ] Wachtwoord minimaal 8 tekens check
- [ ] Wachtwoord bevestiging check
- [ ] Succesvolle registratie → redirect naar account
- [ ] Cookie wordt gezet (check DevTools → Application → Cookies)
- [ ] Foutmelding bij bestaand email

### Inloggen (`/login.html`)
- [ ] Form validatie werkt
- [ ] Succesvolle login → redirect
- [ ] Cookie wordt gezet
- [ ] Foutmelding bij verkeerde credentials
- [ ] "Onthoud mij" checkbox aanwezig
- [ ] Password toggle werkt

### Uitloggen
- [ ] Logout knop in header dropdown
- [ ] Logout knop in account sidebar
- [ ] Cookie wordt verwijderd
- [ ] Redirect naar homepage

---

## 3. Shopping Flow

### Winkelwagen (`/winkelwagen.html`)
- [ ] Lege cart toont "leeg" state
- [ ] Items tonen correct (naam, prijs, dates)
- [ ] Verwijder item werkt
- [ ] "Winkelwagen legen" werkt
- [ ] Totalen kloppen
- [ ] "Naar Checkout" link werkt

### Checkout (`/checkout.html`)
- [ ] Redirect naar login als niet ingelogd (met returnUrl)
- [ ] Stap 1: Klantgegevens form
  - [ ] Validatie werkt
  - [ ] Prefill met user data als ingelogd
- [ ] Stap 2: Levering
  - [ ] Bezorgen/Afhalen toggle werkt
  - [ ] Adres velden tonen/verbergen
  - [ ] Postcode check (indien geïmplementeerd)
- [ ] Stap 3: Betaling
  - [ ] Order review toont correct
  - [ ] Voorwaarden checkbox required
  - [ ] "Bestelling plaatsen" knop werkt
- [ ] Progress indicator update correct
- [ ] Order summary sidebar toont correct

### Checkout Succes (`/checkout-succes.html`)
- [ ] Pagina laadt na succesvolle betaling
- [ ] Ordernummer toont
- [ ] Links naar account werken

---

## 4. Customer Account

### Account Overzicht (`/account/overzicht.html`)
- [ ] Redirect naar login als niet ingelogd
- [ ] User info in sidebar correct
- [ ] Stats laden
- [ ] Recente orders laden
- [ ] Logout werkt

### Bestellingen (`/account/bestellingen.html`)
- [ ] Orders lijst laadt
- [ ] Status badges correct
- [ ] Klik naar detail werkt

### Bestelling Detail (`/account/bestelling.html?id=...`)
- [ ] Order data laadt
- [ ] Items tabel correct
- [ ] Totalen correct
- [ ] Status badge correct

### Gegevens (`/account/gegevens.html`)
- [ ] Form prefilled met user data
- [ ] Save werkt (of toont placeholder toast)
- [ ] Wachtwoord wijzigen form aanwezig

---

## 5. Admin Dashboard

### Admin Login
- [ ] Normale user kan NIET naar `/admin/`
- [ ] Admin user KAN naar `/admin/`
- [ ] Redirect naar login als niet ingelogd

### Dashboard (`/admin/index.html`)
- [ ] Stats laden
- [ ] Recente orders laden
- [ ] Links werken

### Orders (`/admin/orders.html`)
- [ ] Orders tabel laadt
- [ ] Status filter werkt
- [ ] Pagination werkt
- [ ] Klik naar detail werkt

### Order Detail (`/admin/order.html?id=...`)
- [ ] Order data laadt
- [ ] Klantgegevens tonen
- [ ] Items tabel correct
- [ ] Status dropdown werkt
- [ ] Status update saved
- [ ] PDF links werken:
  - [ ] Picking List download
  - [ ] Factuur download

---

## 6. API Endpoints (via Postman/curl)

### Auth
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.be","password":"test1234","first_name":"Test","last_name":"User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.be","password":"test1234"}' \
  -c cookies.txt

# Me (with cookie)
curl http://localhost:3000/api/auth/me -b cookies.txt
```

### Packages
```bash
# Get all
curl http://localhost:3000/api/packages

# Get by ID
curl http://localhost:3000/api/packages/<uuid>
```

### Cart
```bash
# Get cart
curl http://localhost:3000/api/cart -b cookies.txt

# Add item
curl -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"type":"package","package_id":"<uuid>","quantity":1,"persons":10,"start_date":"2024-02-01","end_date":"2024-02-03"}'
```

### Health
```bash
curl http://localhost:3000/health
```

---

## 7. Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## 8. Responsive Testing

- [ ] Mobile (375px) - hamburger menu, stacked layouts
- [ ] Tablet (768px) - adjusted grids
- [ ] Desktop (1024px+) - full layouts

---

## 9. Error States

- [ ] API offline → error messages tonen
- [ ] 404 pagina werkt
- [ ] Form validation errors tonen
- [ ] Toast notifications werken

---

## 10. Performance

- [ ] Pagina's laden < 3 seconden
- [ ] Geen console errors
- [ ] Geen network errors (behalve verwachte 401s)
- [ ] Images laden correct

---

## Bug Report Template

```markdown
**Pagina:** /pakketten.html
**Browser:** Chrome 120
**Stappen:**
1. Open pagina
2. Klik op filter
3. ...

**Verwacht:** Filter past resultaten aan
**Werkelijk:** Niets gebeurt

**Console errors:** (plak hier)
**Network errors:** (plak hier)
**Screenshot:** (indien relevant)
```
