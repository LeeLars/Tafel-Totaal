# Tafel Totaal - Implementatie Stappenplan

> **Logische volgorde voor de volledige implementatie van het Tafel Totaal verhuurplatform**  
> Gebaseerd op analyse van alle projectdocumentatie en Railway backend architectuur.

---

## 📋 Inhoudsopgave

1. [Fase 0: Voorbereiding & Setup](#fase-0-voorbereiding--setup)
2. [Fase 1: Database & Backend Fundament](#fase-1-database--backend-fundament)
3. [Fase 2: Externe Integraties](#fase-2-externe-integraties)
4. [Fase 3: Core Backend API](#fase-3-core-backend-api)
5. [Fase 4: Frontend Basis & Design System](#fase-4-frontend-basis--design-system)
6. [Fase 5: Webshop Flow (MVP)](#fase-5-webshop-flow-mvp)
7. [Fase 6: Admin Dashboard](#fase-6-admin-dashboard)
8. [Fase 7: SEO & Content Pagina's](#fase-7-seo--content-paginas)
9. [Fase 8: Testing & Optimalisatie](#fase-8-testing--optimalisatie)
10. [Fase 9: Launch & Monitoring](#fase-9-launch--monitoring)

---

## Fase 0: Voorbereiding & Setup

### 0.1 Accounts & Toegang Aanmaken
**Waarom eerst:** Je hebt deze accounts nodig voordat je kan beginnen met development.

- [ ] **GitHub Repository**
  - Maak nieuwe private repository aan
  - Initialiseer met `.gitignore` (Node.js template)
  - Maak `main` en `development` branches
  - Stel branch protection rules in voor `main`

- [ ] **Railway Account**
  - Registreer op railway.app
  - Verifieer e-mail
  - Koppel GitHub account
  - Noteer Railway project URL

- [ ] **Netlify Account**
  - Registreer op netlify.com
  - Koppel GitHub account
  - Claim custom domain: `tafeltotaal.be`

- [ ] **Mollie Account**
  - Registreer op mollie.com
  - Verifieer bedrijfsgegevens (KVK, BTW)
  - Activeer test mode
  - Kopieer test API key
  - Kopieer live API key (bewaar veilig)

- [ ] **Resend Account**
  - Registreer op resend.com
  - Verifieer domein `tafeltotaal.be` (DNS records)
  - Kopieer API key
  - Test e-mail versturen

- [ ] **Cloudinary Account**
  - Registreer op cloudinary.com
  - Kopieer Cloud name, API key, API secret
  - Maak folders aan: `/products`, `/packages`, `/damage`

### 0.2 Lokale Development Setup
**Waarom eerst:** Je development omgeving moet klaar zijn voordat je code schrijft.

- [ ] **Development Tools**
  - Installeer Node.js (v18 LTS of hoger)
  - Installeer Git
  - Installeer VS Code (of preferred editor)
  - Installeer PostgreSQL lokaal (voor development)
  - Installeer Postman of Insomnia (API testing)

- [ ] **Project Structuur Aanmaken**
  ```bash
  mkdir tafel-totaal
  cd tafel-totaal
  mkdir -p public/{css,js/{lib,services,pages},images/{products,packages,site},fonts}
  mkdir -p backend/{src/{routes,controllers,models,middleware,services,config,types},database/migrations}
  mkdir docs
  ```

- [ ] **Git Initialiseren**
  ```bash
  git init
  git add .
  git commit -m "Initial project structure"
  git remote add origin [GITHUB_URL]
  git push -u origin main
  ```

---

## Fase 1: Database & Backend Fundament

### 1.1 Railway PostgreSQL Database Setup
**Waarom eerst:** De database is de basis van alles. Zonder database kunnen we geen data opslaan.

- [ ] **Railway Database Aanmaken**
  - Log in op Railway dashboard
  - Maak nieuw project: "Tafel Totaal Backend"
  - Voeg PostgreSQL database toe
  - Kopieer `DATABASE_URL` connection string
  - Sla credentials op in `.env.example`

- [ ] **Database Schema Implementeren**
  - Maak `backend/database/schema.sql`
  - Implementeer alle tabellen in deze volgorde:
    1. `service_levels` (geen dependencies)
    2. `categories` (depends on service_levels)
    3. `subcategories` (depends on categories)
    4. `products` (depends on categories)
    5. `packages` (standalone)
    6. `package_items` (depends on packages + products)
    7. `customers` (standalone)
    8. `customer_addresses` (depends on customers)
    9. `users` (admin users, standalone)
    10. `orders` (depends on customers)
    11. `order_items` (depends on orders)
    12. `inventory_reservations` (depends on products + orders)
    13. `sessions` (depends on customers)
    14. `deposit_rules` (standalone)
    15. `checkout_rules` (standalone)
    16. `damage_reports` (depends on orders)

- [ ] **Database Indexes Toevoegen**
  - Maak indexes voor foreign keys
  - Maak indexes voor vaak gebruikte queries (email, slug, dates)
  - Maak composite indexes voor availability queries

- [ ] **Seed Data Aanmaken**
  - Maak `backend/database/seed.sql`
  - Voeg test data toe:
    - 2 service levels (STANDAARD, LUXE)
    - 5 categorieën (Borden, Bestek, Glazen, Linnen, Buffet)
    - 10-15 subcategorieën
    - 20-30 test producten
    - 3-5 test pakketten
    - 2 test klanten
    - 1 admin user

- [ ] **Database Connectie Testen**
  - Maak `backend/src/config/database.ts`
  - Implementeer PostgreSQL connection pool (node-postgres)
  - Test connectie met simpel query
  - Implementeer error handling

### 1.2 Backend Project Setup (TypeScript + Express)
**Waarom nu:** Met database klaar kunnen we de backend structuur opzetten.

- [ ] **Package.json Initialiseren**
  ```bash
  cd backend
  npm init -y
  ```

- [ ] **Dependencies Installeren**
  ```bash
  # Core
  npm install express cors dotenv
  
  # Database
  npm install pg
  
  # Auth
  npm install bcrypt jsonwebtoken cookie-parser
  
  # Validation
  npm install express-validator
  
  # Rate limiting
  npm install express-rate-limit
  
  # Dev dependencies
  npm install -D typescript @types/node @types/express @types/pg @types/bcrypt @types/jsonwebtoken @types/cookie-parser ts-node nodemon
  ```

- [ ] **TypeScript Configureren**
  - Maak `tsconfig.json`
  - Configureer strict mode
  - Stel output directory in op `dist/`

- [ ] **Environment Variables Setup**
  - Maak `.env.example` met alle benodigde vars
  - Maak `backend/src/config/env.ts` voor type-safe env vars
  - Valideer required env vars bij startup

- [ ] **Express App Basis**
  - Maak `backend/src/index.ts`
  - Setup Express app
  - Configureer middleware (cors, json parser, cookie-parser)
  - Setup error handling middleware
  - Setup 404 handler

---

## Fase 2: Externe Integraties

### 2.1 Mollie Betaling Integratie
**Waarom nu:** Mollie setup is complex en moet vroeg getest worden.

- [ ] **Mollie Service Implementeren**
  - Maak `backend/src/services/mollieService.ts`
  - Implementeer `createPayment()` functie
  - Implementeer `getPaymentStatus()` functie
  - Implementeer `refundPayment()` functie (voor borg terugbetaling)
  - Test met Mollie test API key

- [ ] **Webhook Endpoint**
  - Maak `backend/src/routes/webhooks.routes.ts`
  - Implementeer `POST /api/webhooks/mollie`
  - Valideer Mollie signature
  - Update order status bij payment success/failure
  - Test met Mollie webhook simulator

### 2.2 Resend Email Service
**Waarom nu:** E-mail templates kunnen parallel ontwikkeld worden.

- [ ] **Email Service Implementeren**
  - Maak `backend/src/services/emailService.ts`
  - Implementeer email templates:
    - Order bevestiging
    - Betaling ontvangen
    - Levering reminder (dag voor)
    - Retour reminder (dag van)
    - Borg terugbetaling bevestiging
  - Implementeer `sendEmail()` functie met Resend API
  - Test e-mails naar test adres

### 2.3 Cloudinary Media Service
**Waarom nu:** Image uploads moeten vroeg werken voor product management.

- [ ] **Cloudinary Service Implementeren**
  - Maak `backend/src/services/cloudinaryService.ts`
  - Implementeer `uploadImage()` functie
  - Implementeer `deleteImage()` functie
  - Implementeer image transformaties (resize, optimize)
  - Test upload met test afbeelding

---

## Fase 3: Core Backend API

### 3.1 Authentication & Authorization
**Waarom eerst:** Auth is nodig voor alle beschermde endpoints.

- [ ] **Auth Middleware**
  - Maak `backend/src/middleware/auth.middleware.ts`
  - Implementeer JWT verificatie
  - Implementeer httpOnly cookie parsing
  - Implementeer user role check
  - Implementeer admin middleware

- [ ] **Auth Routes & Controllers**
  - Maak `backend/src/routes/auth.routes.ts`
  - Maak `backend/src/controllers/authController.ts`
  - Implementeer endpoints:
    - `POST /api/auth/register` (klant registratie)
    - `POST /api/auth/login` (JWT token in httpOnly cookie)
    - `POST /api/auth/logout` (clear cookie)
    - `GET /api/auth/me` (current user info)
    - `POST /api/auth/forgot-password`
    - `POST /api/auth/reset-password`

- [ ] **Customer Model**
  - Maak `backend/src/models/Customer.model.ts`
  - Implementeer CRUD queries
  - Implementeer password hashing (bcrypt)
  - Implementeer email uniqueness check

### 3.2 Session Management (Cart State)
**Waarom nu:** Winkelwagen moet database-backed zijn (geen localStorage).

- [ ] **Session Model**
  - Maak `backend/src/models/Session.model.ts`
  - Implementeer session CRUD
  - Implementeer cart data opslag (JSONB)
  - Implementeer session cleanup (expired sessions)

- [ ] **Cart Routes & Controllers**
  - Maak `backend/src/routes/cart.routes.ts`
  - Maak `backend/src/controllers/cartController.ts`
  - Implementeer endpoints:
    - `GET /api/cart` (haal cart op)
    - `POST /api/cart/items` (voeg item toe)
    - `PATCH /api/cart/items/:id` (update quantity)
    - `DELETE /api/cart/items/:id` (verwijder item)
    - `DELETE /api/cart` (clear cart)

### 3.3 Products & Packages API
**Waarom nu:** Webshop heeft product data nodig.

- [ ] **Product Model**
  - Maak `backend/src/models/Product.model.ts`
  - Implementeer queries:
    - Get all products (met filters)
    - Get product by ID
    - Get products by category
    - Search products
    - Admin: CRUD operations

- [ ] **Package Model**
  - Maak `backend/src/models/Package.model.ts`
  - Implementeer queries:
    - Get all packages (met package_items)
    - Get package by ID (met alle items)
    - Admin: CRUD operations

- [ ] **Product Routes**
  - Maak `backend/src/routes/products.routes.ts`
  - Maak `backend/src/controllers/productController.ts`
  - Implementeer endpoints:
    - `GET /api/products` (public)
    - `GET /api/products/:id` (public)
    - `POST /api/products` (admin only)
    - `PATCH /api/products/:id` (admin only)
    - `DELETE /api/products/:id` (admin only)

- [ ] **Package Routes**
  - Maak `backend/src/routes/packages.routes.ts`
  - Maak `backend/src/controllers/packageController.ts`
  - Implementeer endpoints:
    - `GET /api/packages` (public)
    - `GET /api/packages/:id` (public)
    - `POST /api/packages` (admin only)
    - `PATCH /api/packages/:id` (admin only)

### 3.4 Availability Service
**Waarom nu:** Kritiek voor voorraad management en dubbele boekingen voorkomen.

- [ ] **Availability Service**
  - Maak `backend/src/services/availabilityService.ts`
  - Implementeer `checkProductAvailability()`
  - Implementeer `checkPackageAvailability()`
  - Implementeer buffer calculation
  - Implementeer turnaround time logic
  - Implementeer soft/hard reservation logic

- [ ] **Reservation Model**
  - Maak `backend/src/models/Reservation.model.ts`
  - Implementeer reservation CRUD
  - Implementeer soft reserve (30 min timeout)
  - Implementeer hard reserve (bij betaling)
  - Implementeer auto-cleanup expired soft reserves

- [ ] **Availability Routes**
  - Maak `backend/src/routes/availability.routes.ts`
  - Implementeer endpoint:
    - `POST /api/availability/check` (product/package + dates)

### 3.5 Pricing & Deposit Services
**Waarom nu:** Prijsberekening moet correct zijn voor checkout.

- [ ] **Pricing Service**
  - Maak `backend/src/services/pricingService.ts`
  - Implementeer forfait pricing logic
  - Implementeer per-day pricing logic
  - Implementeer extra days calculation
  - Implementeer package discount calculation
  - Implementeer delivery fee calculation

- [ ] **Deposit Service**
  - Maak `backend/src/services/depositService.ts`
  - Implementeer deposit rules matching
  - Implementeer deposit calculation (percentage/fixed)
  - Implementeer max deposit cap

### 3.6 Checkout & Orders
**Waarom nu:** Core van de webshop functionaliteit.

- [ ] **Order Model**
  - Maak `backend/src/models/Order.model.ts`
  - Implementeer order creation
  - Implementeer order status updates
  - Implementeer order queries (by customer, by status, etc.)

- [ ] **Checkout Controller**
  - Maak `backend/src/routes/checkout.routes.ts`
  - Maak `backend/src/controllers/checkoutController.ts`
  - Implementeer `POST /api/checkout`:
    1. Valideer cart items
    2. Check availability
    3. Calculate totals (pricing + deposit)
    4. Create order (status: pending_payment)
    5. Create soft reservations
    6. Create Mollie payment
    7. Return payment URL

- [ ] **Order Routes**
  - Maak `backend/src/routes/orders.routes.ts`
  - Maak `backend/src/controllers/orderController.ts`
  - Implementeer endpoints:
    - `GET /api/orders` (customer: eigen orders)
    - `GET /api/orders/:id` (customer: eigen order detail)
    - `GET /api/admin/orders` (admin: alle orders)
    - `PATCH /api/admin/orders/:id/status` (admin: status update)

### 3.7 PDF Generation Service
**Waarom nu:** Picking lists zijn essentieel voor operationeel proces.

- [ ] **PDF Service**
  - Maak `backend/src/services/pdfService.ts`
  - Installeer PDFKit of Puppeteer
  - Implementeer picking list template
  - Implementeer factuur template
  - Test PDF generatie

---

## Fase 4: Frontend Basis & Design System

### 4.1 Design System Implementatie
**Waarom eerst:** Consistente styling voorkomt later refactoring.

- [ ] **CSS Variables Setup**
  - Maak `public/css/variables.css`
  - Implementeer alle kleuren uit STYLEGUIDE.md
  - Implementeer fluid typography scale
  - Implementeer spacing scale
  - Implementeer border-radius scale

- [ ] **Base Styles**
  - Maak `public/css/base.css`
  - Reset CSS (normalize)
  - Typography base styles
  - Link styles
  - Focus states

- [ ] **Component Library**
  - Maak `public/css/components.css`
  - Implementeer button styles (primary, secondary, ghost)
  - Implementeer form input styles
  - Implementeer card styles
  - Implementeer badge/tag styles
  - Implementeer modal styles
  - Implementeer toast notification styles

### 4.2 Shared Components (Header & Footer)
**Waarom eerst:** Elke pagina heeft deze nodig.

- [ ] **Header Component**
  - Maak `public/components/header.html` (template)
  - Implementeer desktop navigatie
  - Implementeer mobiel hamburger menu
  - Implementeer sticky header on scroll
  - Implementeer cart icon met badge (item count)
  - Implementeer user account dropdown
  - Maak `public/js/components/header.js` voor interactiviteit

- [ ] **Footer Component**
  - Maak `public/components/footer.html` (template)
  - Implementeer 4-kolom layout (desktop)
  - Implementeer accordion layout (mobiel)
  - Implementeer social media links
  - Implementeer nieuwsbrief signup form

### 4.3 Frontend API Client
**Waarom nu:** Alle pagina's hebben API calls nodig.

- [ ] **API Client Library**
  - Maak `public/js/lib/api.js`
  - Implementeer `apiCall()` wrapper met credentials
  - Implementeer error handling
  - Implementeer loading states
  - Implementeer retry logic

- [ ] **Auth Service**
  - Maak `public/js/services/auth.js`
  - Implementeer `login()`, `register()`, `logout()`
  - Implementeer `getCurrentUser()`
  - Implementeer auth state management

- [ ] **Cart Service**
  - Maak `public/js/services/cart.js`
  - Implementeer cart API calls
  - Implementeer cart state synchronisatie
  - Implementeer cart badge update

---

## Fase 5: Webshop Flow (MVP)

### 5.1 Homepage
**Waarom eerst:** Entry point van de website.

- [ ] **Homepage HTML**
  - Maak `public/index.html`
  - Implementeer hero sectie (volgens home/README.md)
  - Implementeer USP's sectie
  - Implementeer featured pakketten sectie
  - Implementeer "Hoe werkt het" sectie
  - Implementeer CTA sectie

- [ ] **Homepage JavaScript**
  - Maak `public/js/pages/home.js`
  - Fetch featured packages van API
  - Implementeer smooth scroll
  - Implementeer lazy loading voor images

### 5.2 Pakketten Overzicht
**Waarom nu:** Primaire conversie pagina.

- [ ] **Pakketten HTML**
  - Maak `public/pakketten.html`
  - Implementeer filter bar (service level, personen)
  - Implementeer package grid
  - Implementeer package cards

- [ ] **Pakketten JavaScript**
  - Maak `public/js/pages/pakketten.js`
  - Fetch packages van API
  - Implementeer filter functionaliteit
  - Implementeer sort functionaliteit
  - Implementeer "Bekijk details" navigatie

### 5.3 Pakket Detail Pagina
**Waarom nu:** Klant moet pakket kunnen configureren.

- [ ] **Pakket Detail HTML**
  - Maak `public/pakket.html`
  - Implementeer image gallery
  - Implementeer pakket info sectie
  - Implementeer configurator:
    - Datepicker (start/eind datum)
    - Personen selector
    - Add-ons selector
  - Implementeer prijs calculator (live update)
  - Implementeer "Toevoegen aan winkelwagen" button

- [ ] **Pakket Detail JavaScript**
  - Maak `public/js/pages/pakket-detail.js`
  - Fetch package by ID
  - Implementeer availability check
  - Implementeer price calculation
  - Implementeer add to cart functionaliteit

### 5.4 Winkelwagen
**Waarom nu:** Klant moet cart kunnen reviewen.

- [ ] **Winkelwagen HTML**
  - Maak `public/winkelwagen.html`
  - Implementeer cart items lijst
  - Implementeer quantity update controls
  - Implementeer remove item buttons
  - Implementeer totaal overzicht
  - Implementeer "Naar checkout" button

- [ ] **Winkelwagen JavaScript**
  - Maak `public/js/pages/winkelwagen.js`
  - Fetch cart van API
  - Implementeer update quantity
  - Implementeer remove item
  - Implementeer price recalculation

### 5.5 Checkout Flow
**Waarom nu:** Conversie punt - moet foutloos werken.

- [ ] **Checkout HTML**
  - Maak `public/checkout.html`
  - Implementeer stappen indicator (3 stappen)
  - Implementeer stap 1: Klantgegevens form
  - Implementeer stap 2: Bezorging/afhaal keuze
  - Implementeer stap 3: Order review + betaling
  - Implementeer sticky order samenvatting sidebar

- [ ] **Checkout JavaScript**
  - Maak `public/js/pages/checkout.js`
  - Implementeer form validatie
  - Implementeer stappen navigatie
  - Implementeer checkout API call
  - Redirect naar Mollie payment
  - Handle return van Mollie

- [ ] **Checkout Succes Pagina**
  - Maak `public/checkout-succes.html`
  - Implementeer order bevestiging
  - Implementeer order details weergave
  - Implementeer "Wat nu?" instructies

### 5.6 Account Pagina's
**Waarom nu:** Klant moet orders kunnen bekijken.

- [ ] **Login/Register Pagina's**
  - Maak `public/inloggen.html`
  - Maak `public/registreren.html`
  - Implementeer forms
  - Implementeer validatie
  - Implementeer auth service calls

- [ ] **Account Dashboard**
  - Maak `public/account/index.html`
  - Implementeer orders overzicht
  - Implementeer account info
  - Implementeer logout functionaliteit

- [ ] **Order Detail Pagina**
  - Maak `public/account/bestelling.html`
  - Implementeer order details
  - Implementeer order status timeline
  - Implementeer factuur download

---

## Fase 6: Admin Dashboard

### 6.1 Admin Authentication
**Waarom eerst:** Admin moet veilig inloggen.

- [ ] **Admin Login**
  - Maak `public/admin/login.html`
  - Implementeer admin login form
  - Check admin role bij login
  - Redirect naar dashboard

### 6.2 Admin Dashboard Overview
**Waarom nu:** Admin heeft overzicht nodig.

- [ ] **Dashboard HTML**
  - Maak `public/admin/index.html`
  - Implementeer statistieken cards:
    - Nieuwe orders vandaag
    - Actieve verhuur
    - Pending reviews
    - Omzet deze maand
  - Implementeer recent orders lijst
  - Implementeer quick actions

### 6.3 Order Management
**Waarom nu:** Core admin functionaliteit.

- [ ] **Orders Overzicht**
  - Maak `public/admin/orders.html`
  - Implementeer orders tabel met filters
  - Implementeer status filter
  - Implementeer datum filter
  - Implementeer search functionaliteit

- [ ] **Order Detail & Status Update**
  - Maak `public/admin/order.html`
  - Implementeer order details weergave
  - Implementeer status update dropdown
  - Implementeer picking list generatie button
  - Implementeer schade registratie form

### 6.4 Product & Package Management
**Waarom nu:** Admin moet producten kunnen beheren.

- [ ] **Producten Overzicht**
  - Maak `public/admin/producten.html`
  - Implementeer producten tabel
  - Implementeer voorraad weergave
  - Implementeer "Nieuw product" button

- [ ] **Product Edit**
  - Maak `public/admin/product-edit.html`
  - Implementeer product form (alle velden)
  - Implementeer image upload (Cloudinary)
  - Implementeer voorraad management
  - Implementeer save/update functionaliteit

- [ ] **Pakketten Management**
  - Maak `public/admin/pakketten.html`
  - Maak `public/admin/pakket-edit.html`
  - Implementeer package CRUD
  - Implementeer package items management

### 6.5 Customer Management
**Waarom nu:** Admin moet klanten kunnen beheren.

- [ ] **Klanten Overzicht**
  - Maak `public/admin/klanten.html`
  - Implementeer klanten tabel
  - Implementeer search functionaliteit

- [ ] **Klant Detail**
  - Maak `public/admin/klant.html`
  - Implementeer klant info
  - Implementeer order historie
  - Implementeer notities veld

### 6.6 Voorraad & Schade
**Waarom nu:** Operationeel essentieel.

- [ ] **Voorraad Overzicht**
  - Maak `public/admin/voorraad.html`
  - Implementeer voorraad status per product
  - Implementeer voorraad mutaties log
  - Implementeer low stock warnings

- [ ] **Schade Registratie**
  - Maak `public/admin/schade.html`
  - Implementeer schade reports overzicht
  - Implementeer nieuwe schade registratie
  - Implementeer foto upload
  - Implementeer borg verrekening

---

## Fase 7: SEO & Content Pagina's

### 7.1 Statische Content Pagina's
**Waarom nu:** SEO en vertrouwen opbouwen.

- [ ] **Over Ons**
  - Maak `public/over-ons.html`
  - Implementeer bedrijfsverhaal
  - Implementeer team sectie
  - Implementeer USP's

- [ ] **Hoe Werkt Het**
  - Maak `public/hoe-werkt-het.html`
  - Implementeer stappen uitleg
  - Implementeer FAQ sectie
  - Implementeer CTA

- [ ] **Contact**
  - Maak `public/contact.html`
  - Implementeer contact form
  - Implementeer Google Maps embed
  - Implementeer contact info

- [ ] **FAQ**
  - Maak `public/faq.html`
  - Implementeer accordion FAQ's
  - Implementeer categorieën
  - Implementeer search functionaliteit

### 7.2 Verhuur Locatie Pagina's (SEO)
**Waarom nu:** Local SEO is belangrijk voor conversie.

- [ ] **Locatie Hub Template**
  - Maak `public/verhuur/locatie/template.html`
  - Implementeer dynamische content (stad naam)
  - Implementeer links naar categorieën
  - Implementeer delivery info
  - Implementeer popular packages

- [ ] **Locatie + Categorie Template**
  - Maak `public/verhuur/locatie/categorie-template.html`
  - Implementeer dynamische content (stad + categorie)
  - Implementeer product grid
  - Implementeer breadcrumbs
  - Implementeer mini FAQ

- [ ] **Genereer Alle Locatie Pagina's**
  - Script om alle stad pagina's te genereren
  - Script om alle stad+categorie pagina's te genereren
  - Implementeer sitemap.xml generatie

### 7.3 Inspiratie & Blog
**Waarom later:** Nice-to-have, niet kritiek voor MVP.

- [ ] **Inspiratie Overzicht**
  - Maak `public/inspiratie.html`
  - Implementeer lookbook grid
  - Implementeer "Shop the Table" feature

- [ ] **Blog (Optioneel)**
  - Maak `public/blog.html`
  - Implementeer blog posts overzicht
  - Implementeer blog post detail pagina

---

## Fase 8: Testing & Optimalisatie

### 8.1 Functionele Testing
**Waarom nu:** Voor launch moet alles werken.

- [ ] **Backend API Testing**
  - Test alle endpoints met Postman
  - Test auth flow (login, logout, protected routes)
  - Test cart flow (add, update, remove)
  - Test checkout flow (end-to-end)
  - Test admin endpoints
  - Test error handling

- [ ] **Frontend Testing**
  - Test alle user flows:
    - Homepage → Pakketten → Detail → Cart → Checkout → Betaling
    - Login → Account → Order detail
    - Admin login → Orders → Status update
  - Test op verschillende browsers (Chrome, Firefox, Safari)
  - Test op verschillende devices (desktop, tablet, mobile)
  - Test form validatie
  - Test error states

### 8.2 Integratie Testing
**Waarom nu:** Externe services moeten correct werken.

- [ ] **Mollie Integratie**
  - Test payment creation
  - Test webhook ontvangst
  - Test payment success flow
  - Test payment failure flow
  - Test refund flow

- [ ] **Email Testing**
  - Test alle email templates
  - Test email delivery
  - Test email rendering in verschillende clients

- [ ] **Cloudinary Testing**
  - Test image upload
  - Test image transformaties
  - Test image deletion

### 8.3 Performance Optimalisatie
**Waarom nu:** Snelheid is belangrijk voor conversie en SEO.

- [ ] **Frontend Optimalisatie**
  - Minify CSS en JavaScript
  - Optimize images (WebP format)
  - Implement lazy loading
  - Implement caching headers
  - Test Core Web Vitals (Lighthouse)

- [ ] **Backend Optimalisatie**
  - Implement database query optimization
  - Add database connection pooling
  - Implement API response caching (Redis optioneel)
  - Add compression middleware

- [ ] **CDN Setup**
  - Configure Cloudinary CDN voor images
  - Configure Netlify CDN voor static assets

### 8.4 Security Audit
**Waarom kritiek:** Beveiliging is essentieel voor betalingen en klantdata.

- [ ] **Security Checklist**
  - Test SQL injection preventie
  - Test XSS preventie
  - Test CSRF protection
  - Test rate limiting
  - Test JWT expiration
  - Test password hashing
  - Test HTTPS enforcement
  - Test environment variables security
  - Review CORS configuration
  - Test file upload security

---

## Fase 9: Launch & Monitoring

### 9.1 Production Environment Setup
**Waarom nu:** Klaar voor live gang.

- [ ] **Railway Production Deploy**
  - Deploy backend naar Railway
  - Configure production environment variables
  - Test production database connection
  - Configure auto-deploy from `main` branch

- [ ] **Netlify Production Deploy**
  - Deploy frontend naar Netlify
  - Configure custom domain `tafeltotaal.be`
  - Setup SSL certificate (automatic)
  - Configure redirects en rewrites

- [ ] **DNS Configuration**
  - Point `tafeltotaal.be` naar Netlify
  - Point `api.tafeltotaal.be` naar Railway
  - Configure email DNS records (Resend)
  - Test DNS propagation

### 9.2 Mollie Live Mode
**Waarom nu:** Echte betalingen moeten werken.

- [ ] **Mollie Live Setup**
  - Switch naar live API key
  - Test live payment
  - Configure webhook URL (production)
  - Verify payment methods (iDEAL, Bancontact)

### 9.3 Monitoring & Analytics
**Waarom nu:** Je moet weten wat er gebeurt in productie.

- [ ] **Error Monitoring**
  - Setup Sentry of vergelijkbaar (optioneel)
  - Configure error alerts
  - Test error reporting

- [ ] **Analytics**
  - Setup Google Analytics 4
  - Configure conversion tracking
  - Setup Google Search Console
  - Submit sitemap.xml

- [ ] **Uptime Monitoring**
  - Setup UptimeRobot of vergelijkbaar
  - Configure downtime alerts
  - Monitor API response times

### 9.4 Launch Checklist
**Waarom kritiek:** Final check voor go-live.

- [ ] **Pre-Launch Checklist**
  - [ ] Alle test data verwijderd uit productie database
  - [ ] Alle environment variables correct ingesteld
  - [ ] SSL certificates actief
  - [ ] Mollie live mode actief en getest
  - [ ] Email delivery getest
  - [ ] Backup strategie ingesteld (Railway auto-backups)
  - [ ] Admin account aangemaakt
  - [ ] Contact formulier getest
  - [ ] 404 pagina werkt
  - [ ] Robots.txt correct
  - [ ] Sitemap.xml gegenereerd
  - [ ] Privacy policy pagina
  - [ ] Terms & conditions pagina
  - [ ] Cookie consent banner (indien nodig)

- [ ] **Launch Day**
  - Deploy naar productie
  - Test complete checkout flow met echte betaling (klein bedrag)
  - Monitor error logs
  - Monitor server resources
  - Announce launch

### 9.5 Post-Launch
**Waarom belangrijk:** Eerste dagen zijn kritiek.

- [ ] **Week 1 Monitoring**
  - Daily check van error logs
  - Daily check van order flow
  - Monitor payment success rate
  - Monitor email delivery rate
  - Collect user feedback

- [ ] **Optimalisatie**
  - Fix bugs op basis van feedback
  - Optimize slow queries
  - Improve UX op basis van analytics
  - Add missing features

---

## 🎯 Prioriteiten per Fase

### Must-Have (MVP)
- Fase 0-5: Absoluut noodzakelijk voor launch
- Fase 6.1-6.3: Minimale admin functionaliteit
- Fase 8: Testing is kritiek
- Fase 9: Production deployment

### Should-Have (V1.1)
- Fase 6.4-6.6: Volledige admin functionaliteit
- Fase 7.1: Content pagina's voor SEO
- Fase 7.2: Locatie pagina's voor local SEO

### Nice-to-Have (V2)
- Fase 7.3: Inspiratie & blog
- Advanced analytics
- Customer reviews systeem
- Loyalty programma

---

## 📊 Geschatte Tijdsindicatie (Referentie)

**Let op:** Dit is GEEN deadline planning, maar een indicatie van complexiteit.

| Fase | Complexiteit | Geschatte effort |
|------|--------------|------------------|
| Fase 0 | Laag | 1-2 dagen |
| Fase 1 | Hoog | 3-5 dagen |
| Fase 2 | Gemiddeld | 2-3 dagen |
| Fase 3 | Hoog | 5-7 dagen |
| Fase 4 | Gemiddeld | 2-3 dagen |
| Fase 5 | Hoog | 5-7 dagen |
| Fase 6 | Hoog | 4-6 dagen |
| Fase 7 | Gemiddeld | 3-4 dagen |
| Fase 8 | Hoog | 3-5 dagen |
| Fase 9 | Gemiddeld | 2-3 dagen |

**Totaal MVP (Fase 0-5 + 6.1-6.3 + 8-9):** ~25-35 werkdagen

---

## 🔄 Iteratieve Aanpak

Dit stappenplan is bedoeld om **lineair** gevolgd te worden, maar binnen elke fase kun je iteratief werken:

1. **Build** → Implementeer feature
2. **Test** → Test de feature lokaal
3. **Review** → Check of het voldoet aan requirements
4. **Refactor** → Verbeter code quality
5. **Commit** → Push naar Git
6. **Repeat** → Volgende feature

---

## 📝 Notities

- **Geen localStorage:** Alle state via database sessions
- **Geen Supabase:** Railway PostgreSQL + Express.js
- **TypeScript:** Voor type safety in backend
- **Vanilla JS:** Geen frameworks in frontend (simpel, snel)
- **Mobile-first:** Alle pagina's responsive
- **SEO-first:** Structured data, meta tags, sitemap
- **Security-first:** JWT, bcrypt, rate limiting, HTTPS

---

**Laatste update:** Januari 2026  
**Versie:** 1.0 (Railway Backend)
