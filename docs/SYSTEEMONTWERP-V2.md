# Tafel Totaal Verhuur - Systeemontwerp V2

> **Van bord tot glas, zonder afwas!**  
> Compleet verhuurplatform voor tafelservies, bestek, glazen en accessoires.

---

## Inhoudsopgave

1. [Systeemarchitectuur Overzicht](#1-systeemarchitectuur-overzicht)
2. [Module Breakdown](#2-module-breakdown)
   - [Website (SEO)](#21-website-seo--marketing)
   - [Webshop (E-commerce)](#22-webshop-e-commerce)
   - [CMS/CRM (Backend)](#23-cmscrm-backend-beheer)
   - [Accounts & Portals](#24-accounts--portals)
3. [Database Structuur](#3-database-structuur)
4. [Beschikbaarheid & Voorraadlogica](#4-beschikbaarheid--voorraadlogica)
5. [Prijsmodel (Forfait-Ready)](#5-prijsmodel-forfait-ready)
6. [Borg & Schade (Regel-Gedreven)](#6-borg--schade-regel-gedreven)
7. [Offerte vs Direct Checkout](#7-offerte-vs-direct-checkout)
8. [Technologie Stack](#8-technologie-stack)
9. [Gebruikersflows](#9-gebruikersflows)
10. [Productcatalogus](#10-productcatalogus)
11. [Mappenstructuur Project](#11-mappenstructuur-project)
12. [Integraties](#12-integraties)
---

## 1. Systeemarchitectuur Overzicht (Railway Backend)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NETLIFY                                         │
│                         (Frontend Hosting)                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Website  │  │ Webshop  │  │ Account  │  │  Admin   │  │ Verhuur  │     │
│  │  .html   │  │  .html   │  │  .html   │  │  .html   │  │  .html   │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ REST API calls (fetch)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              RAILWAY                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    NODE.JS + EXPRESS BACKEND                         │   │
│  │                                                                      │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │ REST API ENDPOINTS                                           │   │   │
│  │  │                                                              │   │   │
│  │  │ • POST   /api/auth/register                                 │   │   │
│  │  │ • POST   /api/auth/login                                    │   │   │
│  │  │ • GET    /api/packages                                      │   │   │
│  │  │ • GET    /api/products                                      │   │   │
│  │  │ • POST   /api/checkout                                      │   │   │
│  │  │ • POST   /api/webhooks/mollie                               │   │   │
│  │  │ • GET    /api/availability                                  │   │   │
│  │  │ • GET    /api/orders (auth required)                        │   │   │
│  │  │ • POST   /api/admin/* (admin auth required)                 │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │ MIDDLEWARE                                                   │   │   │
│  │  │ • JWT Authentication                                         │   │   │
│  │  │ • Role-based Authorization                                   │   │   │
│  │  │ • Request Validation                                         │   │   │
│  │  │ • CORS                                                       │   │   │
│  │  │ • Rate Limiting                                              │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      POSTGRESQL DATABASE                             │   │
│  │                                                                      │   │
│  │  • products          • orders           • deposit_rules             │   │
│  │  • packages          • order_items      • checkout_rules            │   │
│  │  • customers         • reservations     • damage_reports            │   │
│  │  • users (admin)     • addresses        • sessions                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      CLOUDINARY (Media Storage)                      │   │
│  │  • Product images    • Package images   • Damage photos              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                          ┌─────────┴─────────┐
                          ▼                   ▼
                   ┌─────────────┐     ┌─────────────┐
                   │   MOLLIE    │     │   RESEND    │
                   │ (Betalingen)│     │  (E-mail)   │
                   └─────────────┘     └─────────────┘
```

### Kernprincipes

| Principe | Beschrijving |
|----------|--------------|
| **Cloud-First** | Geen lokale servers, alles draait op Railway & Netlify |
| **Pakketten & Los** | Pakketten zijn handig voor complete events, maar losse producten huren kan ook |
| **REST API** | Backend logica in Node.js/Express (TypeScript) |
| **Buffer-First** | Beschikbaarheid altijd met veiligheidsmarges |
| **Forfait-Ready** | Prijsmodel ondersteunt zowel dagverhuur als event-forfaits |
| **Session-Based State** | Geen localStorage, state via database sessions en cookies |

---

## 2. Module Breakdown

### 2.1 Website (SEO & Marketing)

**Doel:** Vindbaarheid in Google, branding, informatievoorziening

#### Pagina's

| Pagina | Functie | SEO Focus |
|--------|---------|-----------|
| **Homepage** | Hero, USP's, featured pakketten | "tafel verhuur", "servies huren" |
| **Over Ons** | Bedrijfsverhaal, team, missie | Brand authority |
| **Hoe Werkt Het** | Stap-voor-stap uitleg verhuurproces | "servies huren zonder afwas" |
| **Pakketten Overzicht** | Hoofdpagina met alle pakketten | "diner pakket huren" |
| **Blog/Inspiratie** | Artikelen, tips, trends | Long-tail keywords |
| **FAQ** | Veelgestelde vragen | Featured snippets |
| **Contact** | Formulier, locatie, openingstijden | Local SEO |
| **Referenties** | Klantcases, reviews | Social proof |

#### SEO Technische Vereisten

- ✅ Statische HTML generatie (Fast & Secure)
- ✅ Structured data (JSON-LD) via API data
- ✅ Automatische sitemap.xml (gegenereerd door backend)
- ✅ Meta tags per pagina (dynamisch via API)
- ✅ Canonical URLs
- ✅ Mobile-first design
- ✅ Core Web Vitals optimalisatie

---

### 2.2 Webshop (E-commerce)

**Doel:** Pakketten bestellen, add-ons toevoegen, beschikbaarheid tonen

#### Kernfilosofie: Pakketten Centraal

```
BESTELFLOW (PRIMAIR)
┌─────────────────────────────────────────────────────────────┐
│  1. Kies PAKKET (bv. "Diner Standaard 50 personen")        │
│  2. Selecteer DATUM/PERIODE                                 │
│  3. Voeg ADD-ONS toe (extra glazen, champagne, etc.)       │
│  4. Checkout                                                │
└─────────────────────────────────────────────────────────────┘

BESTELFLOW (SECUNDAIR - voor ervaren klanten)
┌─────────────────────────────────────────────────────────────┐
│  1. Bouw eigen samenstelling (losse producten)             │
│  2. Selecteer DATUM/PERIODE                                 │
│  3. Checkout (mogelijk offerte bij grote orders)           │
└─────────────────────────────────────────────────────────────┘
```

#### Functionaliteiten

| Feature | Beschrijving | MVP |
|---------|--------------|-----|
| **Pakketcatalogus** | Overzicht alle pakketten per serviceniveau | ✅ |
| **Pakket detail** | Inhoud, prijs, beschikbaarheid per datum | ✅ |
| **Add-ons** | Extra items toevoegen aan pakket | ✅ |
| **Datumkiezer** | Selecteer verhuurperiode met beschikbaarheid | ✅ |
| **Winkelwagen** | Pakket + add-ons + periode | ✅ |
| **Checkout** | Bezorg/afhaal, betaling, factuurgegevens | ✅ |
| **Losse producten** | Individuele producten bestellen | v1.1 |
| **Pakketsamensteller** | "Bouw je eigen tafel" wizard | v2 |
| **Offerte aanvragen** | Voor grote/custom orders | v1.1 |

---

### 2.3 CMS/CRM (Admin Dashboard)

**Doel:** Alle data beheren, orders verwerken, klantrelaties onderhouden.

> **Architectuur:** Admin bestaat uit beveiligde statische HTML pagina's in `/admin/`.
> Toegang wordt geregeld via JWT tokens (httpOnly cookies) en backend API authorization.

#### CMS Modules (Content Management)

| Module | Functionaliteit | Backend |
|--------|-----------------|---------|
| **Pakketbeheer** | CRUD pakketten, inhoud, prijzen | Railway PostgreSQL + REST API |
| **Productbeheer** | CRUD producten, voorraad, afbeeldingen | Railway PostgreSQL + Cloudinary |
| **Categoriebeheer** | Serviceniveaus, categorieën | Railway PostgreSQL + REST API |
| **Media Library** | Afbeeldingen uploaden & beheren | Cloudinary API |

#### CRM Modules (Customer Relationship)

| Module | Functionaliteit | Backend |
|--------|-----------------|---------|
| **Orderbeheer** | Orders bekijken, status flow, betalingen | Railway PostgreSQL + REST API |
| **Klantenbeheer** | Klantprofielen, historie, notities | Railway PostgreSQL + JWT Auth |
| **Picking Lists** | PDF genereren voor magazijn | Node.js service (PDFKit/Puppeteer) |
| **Schade/Borg** | Schade registreren, borg inhouden | Railway PostgreSQL + REST API |

#### Orderstatus Flow

```
                                    ┌─────────────┐
                                    │   NIEUW     │
                                    └──────┬──────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
           ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
           │  GEANNULEERD  │      │   BEVESTIGD   │      │ REVIEW NODIG  │
           └───────────────┘      └───────┬───────┘      │  (offerte)    │
                                          │              └───────┬───────┘
                                          │                      │
                                          ▼                      ▼
                                  ┌───────────────┐      ┌───────────────┐
                                  │IN VOORBEREIDING│     │   OFFERTE     │
                                  └───────┬───────┘      │   VERSTUURD   │
                                          │              └───────────────┘
                                          ▼
                                  ┌───────────────┐
                                  │   VERZONDEN   │
                                  │ / KLAAR AFHAAL│
                                  └───────┬───────┘
                                          │
                                          ▼
                                  ┌───────────────┐
                                  │   GELEVERD    │
                                  └───────┬───────┘
                                          │
                                          ▼
                                  ┌───────────────┐
                                  │RETOUR ONTVANGEN│
                                  └───────┬───────┘
                                          │
                         ┌────────────────┼────────────────┐
                         │                │                │
                         ▼                ▼                ▼
                 ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
                 │   AFGEROND    │ │SCHADE GEMELD  │ │ BORG INGEHOUDEN│
                 └───────────────┘ └───────────────┘ └───────────────┘
```

---

### 2.4 Accounts & Portals

#### 2.4.1 Klant Account (Klantenportaal)

| Feature | Beschrijving | MVP |
|---------|--------------|-----|
| **Dashboard** | Overzicht actieve/afgelopen bestellingen | ✅ |
| **Bestellingen** | Detailweergave, facturen downloaden | ✅ |
| **Herbestellen** | Eerdere order opnieuw plaatsen | v1.1 |
| **Gegevens** | Profiel, adressen, betaalvoorkeuren | ✅ |
| **Favorieten** | Opgeslagen pakketten | v2 |

> **Loyalty:** Niet in MVP. Focus eerst op conversie + foutloze levering/retour.

#### 2.4.2 Admin Account (Volledige toegang)

| Feature | Beschrijving |
|---------|--------------|
| **Volledige CMS/CRM** | Alle modules |
| **Gebruikersbeheer** | Accounts aanmaken, rollen toewijzen |
| **Instellingen** | Prijsregels, bezorgzones, BTW, buffers |
| **Borg regels** | Deposit rules configureren |
| **Logs & Audit** | Alle systeemactiviteit |

#### 2.4.3 Medewerker Account (Beperkte toegang)

| Feature | Beschrijving |
|---------|--------------|
| **Orderbeheer** | Orders bekijken, status updaten |
| **Picking list** | Dagelijkse picking list genereren/afvinken |
| **Voorraad** | Voorraad checken, mutaties invoeren |
| **Retourverwerking** | Retouren afhandelen, schade registreren |
| **Planning** | Bezorg/ophaalschema bekijken |

---

## 3. Database Structuur

### 3.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PRODUCT LAAG                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────┐     ┌───────────────┐     ┌───────────────┐             │
│  │ SERVICE_LEVELS│────<│  CATEGORIES   │────<│ SUBCATEGORIES │             │
│  │ (STANDAARD,   │     │ (Borden,      │     │ (Aperitief,   │             │
│  │  LUXE)        │     │  Bestek, etc) │     │  Voorgerecht) │             │
│  └───────────────┘     └───────────────┘     └───────┬───────┘             │
│                                                      │                      │
│                                                      ▼                      │
│  ┌───────────────┐                           ┌───────────────┐             │
│  │   PACKAGES    │──────────────────────────>│   PRODUCTS    │             │
│  │ (Pakketten)   │     package_items         │ (Modellen)    │             │
│  └───────────────┘                           └───────┬───────┘             │
│                                                      │                      │
│                                                      ▼                      │
│                                              ┌───────────────┐             │
│                                              │    ASSETS     │◄── FUTURE   │
│                                              │ (Fysieke stuks)│             │
│                                              └───────┬───────┘             │
│                                                      │                      │
│                                                      ▼                      │
│                                              ┌───────────────┐             │
│                                              │ ASSET_BATCHES │◄── FUTURE   │
│                                              │ (Kratten/bakken)            │
│                                              └───────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              ORDER LAAG                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────┐     ┌───────────────┐     ┌───────────────┐             │
│  │   CUSTOMERS   │────<│    ORDERS     │────<│  ORDER_ITEMS  │             │
│  └───────┬───────┘     └───────┬───────┘     └───────────────┘             │
│          │                     │                                            │
│          ▼                     ▼                                            │
│  ┌───────────────┐     ┌───────────────┐                                   │
│  │   ADDRESSES   │     │ RESERVATIONS  │                                   │
│  └───────────────┘     └───────────────┘                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              REGELS LAAG                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────┐     ┌───────────────┐     ┌───────────────┐             │
│  │ DEPOSIT_RULES │     │ PRICING_RULES │     │ CHECKOUT_RULES│             │
│  │ (Borg regels) │     │ (Kortingen)   │     │ (Offerte vs   │             │
│  │               │     │               │     │  direct)      │             │
│  └───────────────┘     └───────────────┘     └───────────────┘             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Kernentiteiten

#### Service Levels & Categorieën

```sql
service_levels
├── id (PK)
├── name                    -- "STANDAARD" / "LUXE"
├── slug
├── description
├── sort_order
└── is_active

categories
├── id (PK)
├── service_level_id (FK)
├── name                    -- "Borden", "Bestek", "Glazen"
├── slug
├── icon
├── sort_order
└── is_active

subcategories
├── id (PK)
├── category_id (FK)
├── name                    -- "Aperitief", "Voorgerecht"
├── slug
├── sort_order
└── is_active
```

#### Products (Modellen - niet fysieke stuks)

```sql
products
├── id (PK)
├── sku                     -- Unieke productcode
├── name                    -- "Wijnglas Cabernet 35cl"
├── slug
├── description
├── service_level_id (FK)
├── category_id (FK)
├── subcategory_id (FK)
│
│-- PRICING (forfait-ready)
├── price_mode              -- 'PER_DAY' | 'FORFAIT'
├── price_per_day           -- Dagprijs (indien PER_DAY)
├── forfait_price           -- Forfaitprijs (indien FORFAIT)
├── included_days           -- Dagen inbegrepen bij forfait (bv. 3)
├── extra_day_price         -- Prijs per extra dag
│
│-- VOORRAAD
├── stock_total             -- Totale voorraad (aantallen)
├── buffer_percentage       -- Buffer % niet boekbaar (bv. 5)
├── min_rent_quantity       -- Minimum huuraantal (bv. per bak)
├── pack_size               -- Stuks per bak/krat (bv. 25)
│
│-- OPERATIONEEL
├── wash_category           -- 'GLASS' | 'PORCELAIN' | 'CUTLERY' | 'LINEN'
├── turnaround_hours        -- Uren nodig voor was/controle
│
│-- MEDIA & META
├── images (JSON)
├── specifications (JSON)
├── is_active
├── created_at
└── updated_at
```

#### Assets (Future-proof laag - MVP: alleen aantallen)

```sql
-- FUTURE: Voor individuele stuk-tracking
assets
├── id (PK)
├── product_id (FK)
├── asset_code              -- Unieke code per stuk (barcode/QR)
├── batch_id (FK)           -- Optioneel: in welke krat
├── status                  -- 'AVAILABLE' | 'RESERVED' | 'RENTED' | 'WASHING' | 'DAMAGED' | 'RETIRED'
├── condition               -- 'NEW' | 'GOOD' | 'FAIR' | 'POOR'
├── purchase_date
├── last_inspection_date
├── notes
└── created_at

asset_batches
├── id (PK)
├── batch_code              -- "KRAT-GL-001"
├── product_id (FK)         -- Welk product type
├── capacity                -- Max stuks in krat
├── current_count           -- Huidige vulling
├── location                -- Magazijnlocatie
└── is_active
```

> **MVP Aanpak:** Assets tabel bestaat, maar we werken met `stock_total` op product niveau.  
> Later kunnen we assets individueel gaan tracken zonder database herbouw.

#### Packages (Pakketten - CENTRAAL)

```sql
packages
├── id (PK)
├── name                    -- "Diner Standaard 50 personen"
├── slug
├── description
├── short_description       -- Voor overzichtspagina
├── service_level_id (FK)
├── persons                 -- Aantal personen
│
│-- PRICING
├── price_mode              -- 'PER_DAY' | 'FORFAIT'
├── base_price              -- Basisprijs pakket
├── included_days           -- Dagen inbegrepen
├── extra_day_price         -- Per extra dag
├── discount_percentage     -- Pakketkorting t.o.v. losse items
│
│-- MEDIA
├── image
├── gallery (JSON)
│
├── is_featured             -- Tonen op homepage
├── is_active
├── sort_order
├── created_at
└── updated_at

package_items
├── id (PK)
├── package_id (FK)
├── product_id (FK)
├── quantity_per_person     -- Aantal per persoon
├── is_optional             -- Add-on of standaard
└── sort_order
```

#### Orders

```sql
orders
├── id (PK)
├── order_number            -- "TT-2026-0001"
├── customer_id (FK)
├── status                  -- Zie orderstatus flow
│
│-- TYPE & CONTEXT
├── order_type              -- 'PACKAGE' | 'CUSTOM' | 'QUOTE'
├── event_type              -- 'WEDDING' | 'CORPORATE' | 'PRIVATE' | 'VIP' | 'OTHER'
├── requires_review         -- Boolean: moet admin goedkeuren?
├── quote_status            -- 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | NULL
│
│-- VERHUURPERIODE
├── rental_start_date
├── rental_end_date
├── rental_period_type      -- 'DAY' | 'WEEKEND' | 'WEEK'
├── rental_days             -- Berekend aantal dagen
│
│-- LEVERING
├── delivery_method         -- 'DELIVERY' | 'PICKUP'
├── delivery_address_id (FK)
├── delivery_date
├── delivery_slot           -- Tijdslot
├── return_date
├── return_slot
│
│-- FINANCIEEL
├── subtotal
├── discount_amount
├── discount_code           -- Eventuele kortingscode
├── delivery_fee
├── deposit_total           -- Berekend via deposit_rules
├── tax_rate
├── tax_amount
├── total
│
│-- NOTITIES
├── customer_notes          -- Klant opmerkingen
├── setup_notes             -- Styling/setup instructies (premium)
├── internal_notes          -- Alleen admin zichtbaar
│
├── created_at
└── updated_at

order_items
├── id (PK)
├── order_id (FK)
├── item_type               -- 'PACKAGE' | 'PRODUCT' | 'ADDON'
├── package_id (FK)         -- Als item_type = PACKAGE
├── product_id (FK)         -- Als item_type = PRODUCT/ADDON
├── quantity
├── persons                 -- Bij pakket: voor hoeveel personen
├── unit_price
├── days
├── line_total
└── notes
```

#### Reservations (Beschikbaarheid)

```sql
inventory_reservations
├── id (PK)
├── product_id (FK)
├── order_id (FK)
├── quantity
│
│-- PERIODE (inclusief turnaround)
├── start_date              -- Werkelijke startdatum
├── end_date                -- Werkelijke einddatum
├── buffer_start            -- Start incl. voorbereiding
├── buffer_end              -- Eind incl. turnaround/was
│
│-- TYPE & STATUS
├── type                    -- 'SOFT' | 'HARD'
├── status                  -- 'ACTIVE' | 'RELEASED' | 'COMPLETED'
├── released_at             -- Wanneer soft-reserve verviel
├── expires_at              -- Soft-reserve timeout
│
├── created_at
└── updated_at
```

#### Customers

```sql
customers
├── id (PK)
├── email
├── password_hash
├── customer_type           -- 'BUSINESS' | 'PRIVATE'
│
│-- BEDRIJF (optioneel)
├── company_name
├── vat_number              -- BTW nummer
├── chamber_of_commerce     -- KvK nummer
│
│-- CONTACT
├── first_name
├── last_name
├── phone
│
│-- SETTINGS
├── payment_terms           -- 'PREPAID' | 'INVOICE_14' | 'INVOICE_30'
├── is_vip                  -- VIP klant
├── notes                   -- Admin notities
│
├── created_at
└── updated_at

customer_addresses
├── id (PK)
├── customer_id (FK)
├── type                    -- 'BILLING' | 'DELIVERY'
├── is_default
├── company_name            -- Optioneel afwijkend
├── street
├── house_number
├── house_number_addition
├── postal_code
├── city
├── country
├── phone                   -- Contactnummer voor bezorging
└── notes                   -- Bezorginstructies
```

#### Users (Interne gebruikers)

```sql
users
├── id (PK)
├── email
├── password_hash
├── name
├── role                    -- 'ADMIN' | 'EMPLOYEE'
├── permissions (JSON)      -- Fijnmazige rechten
├── is_active
├── last_login_at
├── created_at
└── updated_at
```

---

## 4. Beschikbaarheid & Voorraadlogica

### 4.1 Kernprincipes

```
BESCHIKBARE VOORRAAD = 
    stock_total 
    - buffer_stock (niet boekbaar)
    - gereserveerd (HARD reserves in periode)
    - in verhuur (nog niet terug + turnaround)
```

### 4.2 Buffer Configuratie

| Parameter | Beschrijving | Voorbeeld |
|-----------|--------------|-----------|
| `buffer_percentage` | % van voorraad niet boekbaar | 5% |
| `turnaround_hours` | Uren nodig na retour | Glazen: 4u, Linnen: 24u |
| `late_return_buffer_hours` | Extra buffer voor late returns | 12u |

#### Turnaround per Wash Category

| Wash Category | Turnaround | Reden |
|---------------|------------|-------|
| `GLASS` | 4 uur | Snel te wassen, breekbaar |
| `PORCELAIN` | 6 uur | Wassen + drogen |
| `CUTLERY` | 4 uur | Snel te wassen |
| `LINEN` | 24 uur | Wassen + drogen + vouwen |

### 4.3 Reservatie Types

```
SOFT RESERVE
├── Wanneer: Bij toevoegen aan winkelwagen
├── Duur: 15-30 minuten (configureerbaar)
├── Doel: Voorkom dat 2 klanten zelfde items boeken
├── Actie bij timeout: Automatisch vrijgeven
└── Veld: expires_at, released_at

HARD RESERVE
├── Wanneer: Bij succesvolle checkout/betaling
├── Duur: Tot order afgerond
├── Doel: Definitieve reservering
└── Veld: status = 'ACTIVE'
```

### 4.4 Beschikbaarheidsberekening (Pseudo-code)

```javascript
function getAvailability(productId, startDate, endDate) {
  const product = getProduct(productId);
  
  // Basis voorraad
  const totalStock = product.stock_total;
  
  // Buffer (niet boekbaar)
  const bufferStock = Math.ceil(totalStock * (product.buffer_percentage / 100));
  
  // Turnaround periode toevoegen aan query
  const queryStart = startDate.subtract(product.turnaround_hours, 'hours');
  const queryEnd = endDate.add(product.turnaround_hours, 'hours');
  
  // Actieve reserveringen in periode
  const reserved = getHardReservations(productId, queryStart, queryEnd);
  const softReserved = getActiveSoftReservations(productId, queryStart, queryEnd);
  
  // Beschikbaar
  const available = totalStock - bufferStock - reserved - softReserved;
  
  return Math.max(0, available);
}
```

### 4.5 Overboeking Preventie

| Scenario | Oplossing |
|----------|-----------|
| Twee klanten tegelijk bestellen | Soft-reserve bij winkelwagen |
| Piekweekend (bruiloften) | Buffer + turnaround automatisch |
| Late return | `late_return_buffer_hours` blokkeert volgende verhuur |
| Schade/verlies | Admin past `stock_total` aan |

---

## 5. Prijsmodel (Forfait-Ready)

### 5.1 Twee Prijsmodi

#### PER_DAY (Traditioneel)

```
Prijs = price_per_day × quantity × days
```

#### FORFAIT (Event-typisch)

```
Prijs = forfait_price × quantity
        + (extra_days × extra_day_price × quantity)

Waarbij:
- forfait_price = prijs voor included_days
- extra_days = max(0, rental_days - included_days)
```

### 5.2 Rental Period Types

| Type | Definitie | Typisch gebruik |
|------|-----------|-----------------|
| `DAY` | 1 kalenderdag | Zakelijke events |
| `WEEKEND` | Vrijdag 16:00 - Maandag 10:00 | Bruiloften, feesten |
| `WEEK` | 7 dagen | Langere events |

> **Weekend = 1 forfait dag:** Klant betaalt 1x forfaitprijs voor heel weekend.

### 5.3 Prijsstructuur Voorbeeld

```yaml
# Product: Wijnglas Standaard
price_mode: FORFAIT
forfait_price: 0.45          # Per stuk voor weekend
included_days: 3             # Vr-Za-Zo inbegrepen
extra_day_price: 0.15        # Per extra dag

# Berekening 50 glazen, weekend (3 dagen):
# 50 × €0.45 = €22.50

# Berekening 50 glazen, 5 dagen:
# 50 × €0.45 + (2 × €0.15 × 50) = €22.50 + €15.00 = €37.50
```

### 5.4 Pakketprijzen

```yaml
# Pakket: Diner Standaard 50 personen
price_mode: FORFAIT
base_price: 175.00           # Totaalprijs pakket
included_days: 3
extra_day_price: 35.00       # Per extra dag (heel pakket)
discount_percentage: 15      # Korting t.o.v. losse items
```

### 5.5 Kortingsregels

| Type | Trigger | Korting |
|------|---------|---------|
| **Pakketkorting** | Pakket i.p.v. losse items | 15% |
| **Volumekorting** | >€500 orderwaarde | 5% |
| **Herhaalklant** | >3 orders in 12 maanden | 5% |
| **Early bird** | >30 dagen vooruit boeken | 3% |

---

## 6. Borg & Schade (Regel-Gedreven)

### 6.1 Deposit Rules (Niet per product!)

```sql
deposit_rules
├── id (PK)
├── name                    -- "Glaswerk Borg"
├── description
│
│-- MATCHING CRITERIA (OR logic binnen groep, AND tussen groepen)
├── applies_to_category_ids (JSON)    -- [1, 2, 3] of NULL = alle
├── applies_to_service_level_ids (JSON)
├── applies_to_customer_types (JSON)  -- ['BUSINESS', 'PRIVATE'] of NULL
├── min_order_value         -- Alleen boven X euro
├── max_order_value         -- Alleen onder X euro
│
│-- BEREKENING
├── calculation_type        -- 'PERCENTAGE' | 'FIXED_PER_ITEM' | 'FIXED_PER_ORDER'
├── value                   -- Percentage of vast bedrag
├── max_deposit             -- Plafond
│
├── is_active
├── priority                -- Hogere priority wint bij overlap
├── created_at
└── updated_at
```

### 6.2 Voorbeeldregels

| Regel | Criteria | Berekening |
|-------|----------|------------|
| **Glaswerk particulier** | category=Glazen, customer=PRIVATE | 15% van glaswerk subtotaal |
| **Luxe items** | service_level=LUXE | 20% van luxe subtotaal |
| **Grote orders zakelijk** | customer=BUSINESS, order>€1000 | Geen borg |
| **Kleine orders** | order<€100 | €25 vast |

### 6.3 Borgflow

```
CHECKOUT
├── Systeem berekent borg via deposit_rules
├── Klant ziet borg in totaaloverzicht
├── Borg wordt meegenomen in betaling (of aparte autorisatie)
└── Order.deposit_total = berekende borg

RETOUR
├── Medewerker controleert items
├── Geen schade → Borg vrijgeven (automatisch of handmatig)
├── Schade → Schade registreren
│   ├── Schade < borg → Gedeeltelijke terugbetaling
│   ├── Schade > borg → Extra factuur
│   └── Klant informeren via e-mail
└── Order status → AFGEROND of SCHADE_AFGEHANDELD
```

### 6.4 Schade Registratie

```sql
damage_reports
├── id (PK)
├── order_id (FK)
├── product_id (FK)
├── quantity_damaged
├── damage_type             -- 'BROKEN' | 'CHIPPED' | 'STAINED' | 'MISSING'
├── description
├── photos (JSON)
├── estimated_cost
├── charged_amount
├── deposit_deducted
├── additional_invoice_id   -- Als schade > borg
├── reported_by_user_id (FK)
├── created_at
└── updated_at
```

---

## 7. Offerte vs Direct Checkout

### 7.1 Checkout Rules

```sql
checkout_rules
├── id (PK)
├── name
├── description
│
│-- TRIGGER CRITERIA
├── trigger_type            -- 'ORDER_VALUE' | 'QUANTITY' | 'PERSONS' | 'CUSTOM_REQUEST'
├── trigger_operator        -- 'GT' | 'GTE' | 'LT' | 'LTE' | 'EQ'
├── trigger_value
│
│-- ACTIE
├── action                  -- 'REQUIRE_REVIEW' | 'REQUIRE_QUOTE' | 'BLOCK'
├── message                 -- Bericht aan klant
│
├── is_active
├── priority
└── created_at
```

### 7.2 Voorbeeldregels

| Regel | Trigger | Actie |
|-------|---------|-------|
| **Grote order** | persons >= 150 | REQUIRE_QUOTE |
| **Hoge waarde** | order_value >= 2500 | REQUIRE_REVIEW |
| **Custom styling** | heeft setup_notes | REQUIRE_REVIEW |
| **VIP event** | event_type = VIP | REQUIRE_REVIEW |

### 7.3 Flow

```
KLANT CHECKOUT
      │
      ▼
┌─────────────────┐
│ Check rules     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────────┐
│ DIRECT │ │ REVIEW/    │
│CHECKOUT│ │ QUOTE      │
└────┬───┘ └─────┬──────┘
     │           │
     ▼           ▼
┌────────┐ ┌────────────┐
│BETALING│ │ORDER SAVED │
│        │ │status=     │
│        │ │REVIEW_NODIG│
└────┬───┘ └─────┬──────┘
     │           │
     ▼           ▼
┌────────┐ ┌────────────┐
│ORDER   │ │ADMIN REVIEW│
│BEVESTIGD│ │            │
└────────┘ └─────┬──────┘
                 │
         ┌───────┴───────┐
         │               │
         ▼               ▼
   ┌──────────┐   ┌──────────┐
   │ OFFERTE  │   │ DIRECT   │
   │ VERSTUREN│   │ BEVESTIGEN│
   └──────────┘   └──────────┘
```

---

## 8. Technologie Stack (Railway Backend)

> **Filosofie:** Geen lokale servers, alles in de cloud op Railway. Direct online bouwen en testen.

### 8.1 Cloud Stack Overzicht

| Laag | Technologie | Reden | Kosten |
|------|-------------|-------|--------|
| **Frontend** | HTML + CSS + Vanilla JS | Simpel, snel, geen build | Gratis |
| **Hosting** | **Netlify** | Automatische deploys, forms, CDN | Gratis tier |
| **Backend** | **Railway** (Node.js/Express) | Eenvoudige deploy, auto-scaling, TypeScript | $5/maand |
| **Database** | **Railway PostgreSQL** | Managed PostgreSQL, backups, metrics | Inbegrepen |
| **Auth** | **JWT + bcrypt** | Session-based auth met httpOnly cookies | Gratis (libraries) |
| **Betalingen** | **Mollie** | iDEAL, Bancontact (BE-focused) | Per transactie |
| **E-mail** | **Resend** | Transactionele e-mails, gratis tier | Gratis (100/dag) |
| **Media** | **Cloudinary** | Afbeeldingen, transformaties, CDN | Gratis tier (25GB) |

### 8.2 Waarom Railway?

| Feature | Voordeel |
|---------|----------|
| **Node.js Native** | Volledige controle over backend logica |
| **PostgreSQL Managed** | Automatische backups, monitoring, scaling |
| **Git-based Deploy** | Push naar GitHub = automatische deploy |
| **Environment Variables** | Veilige secrets management |
| **Logs & Metrics** | Real-time logging en performance monitoring |
| **Custom Domains** | SSL certificates automatisch |
| **Predictable Pricing** | $5/maand voor hobby projects |
| **No Cold Starts** | Altijd actief, geen serverless delays |

### 8.3 Backend Architectuur (Railway)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXPRESS.JS APPLICATION                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ROUTES (src/routes/)                                                 │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ • auth.routes.ts        → /api/auth/*                                │   │
│  │ • packages.routes.ts    → /api/packages/*                            │   │
│  │ • products.routes.ts    → /api/products/*                            │   │
│  │ • orders.routes.ts      → /api/orders/*                              │   │
│  │ • checkout.routes.ts    → /api/checkout                              │   │
│  │ • webhooks.routes.ts    → /api/webhooks/mollie                       │   │
│  │ • admin.routes.ts       → /api/admin/*                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ MIDDLEWARE (src/middleware/)                                         │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ • auth.middleware.ts    → JWT verificatie, httpOnly cookies          │   │
│  │ • admin.middleware.ts   → Admin role check                           │   │
│  │ • validate.middleware.ts → Request body/params validatie             │   │
│  │ • rateLimit.middleware.ts → Rate limiting per endpoint               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ CONTROLLERS (src/controllers/)                                       │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ • authController.ts     → Login, register, logout logica             │   │
│  │ • packageController.ts  → Pakket CRUD, beschikbaarheid               │   │
│  │ • orderController.ts    → Order processing, status updates           │   │
│  │ • checkoutController.ts → Cart → Order → Mollie payment              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ SERVICES (src/services/)                                             │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ • mollieService.ts      → Mollie API wrapper                         │   │
│  │ • emailService.ts       → Resend email templates                     │   │
│  │ • pricingService.ts     → Forfait/dagprijs berekeningen              │   │
│  │ • availabilityService.ts → Voorraad + reserveringen check            │   │
│  │ • pdfService.ts         → Picking lists genereren                    │   │
│  │ • cloudinaryService.ts  → Image upload/transform                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ MODELS (src/models/)                                                 │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ • Package.model.ts      → PostgreSQL queries voor packages           │   │
│  │ • Product.model.ts      → PostgreSQL queries voor products           │   │
│  │ • Order.model.ts        → PostgreSQL queries voor orders             │   │
│  │ • Customer.model.ts     → PostgreSQL queries voor customers          │   │
│  │ • Reservation.model.ts  → PostgreSQL queries voor reservations       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ DATABASE CONNECTION (src/config/database.ts)                         │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ • pg (node-postgres) connection pool                                 │   │
│  │ • Connection string via Railway environment variable                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.4 Data Flow: Bestelling Plaatsen

```
1. Klant klikt "Afrekenen"
         │
         ▼
2. Frontend: fetch('/api/auth/me') → Check ingelogd (JWT cookie)
         │
         ▼
3. Frontend: POST /api/checkout
   Body: { cart, deliveryInfo, customerId }
   Headers: Cookie (httpOnly JWT)
         │
         ▼
4. Backend Controller (checkoutController.ts):
   ├── Valideer JWT token
   ├── Valideer cart items (check product IDs exist)
   ├── Check beschikbaarheid (availabilityService)
   ├── Bereken totaalprijs + borg (pricingService)
   ├── INSERT order (status: 'pending_payment')
   ├── INSERT order_items
   ├── INSERT reservations (type: 'SOFT', expires_at: +30min)
   ├── Maak Mollie payment (mollieService)
   └── Return: { paymentUrl, orderId }
         │
         ▼
5. Frontend: window.location.href = paymentUrl
         │
         ▼
6. Klant betaalt bij Mollie
         │
         ▼
7. Mollie webhook → POST /api/webhooks/mollie
   Body: { id: paymentId }
         │
         ▼
8. Backend Webhook Handler:
   ├── Haal payment status op bij Mollie API
   ├── Vind order via mollie_payment_id
   ├── UPDATE order (status: 'confirmed', paid_at: NOW())
   ├── UPDATE reservations (type: 'HARD', status: 'ACTIVE')
   ├── Verstuur bevestigingsmail (emailService)
   └── Return 200 OK
         │
         ▼
9. Klant ontvangt bevestigingsmail (Resend)
```

### 8.5 Frontend API Client Setup

```javascript
// public/js/lib/api.js
const API_BASE_URL = 'https://api.tafeltotaal.be' // Railway backend URL

// Generic fetch wrapper met credentials (cookies)
async function apiCall(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // Send httpOnly cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'API Error')
  }
  
  return response.json()
}

// Auth API
export const authAPI = {
  login: (email, password) => 
    apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  
  register: (userData) => 
    apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
  
  logout: () => apiCall('/api/auth/logout', { method: 'POST' }),
  
  me: () => apiCall('/api/auth/me') // Check current user
}

// Packages API
export const packagesAPI = {
  getAll: () => apiCall('/api/packages'),
  
  getById: (id) => apiCall(`/api/packages/${id}`),
  
  checkAvailability: (packageId, startDate, endDate, persons) => 
    apiCall('/api/availability', {
      method: 'POST',
      body: JSON.stringify({ packageId, startDate, endDate, persons })
    })
}

// Checkout API
export const checkoutAPI = {
  createOrder: (cart, deliveryInfo) => 
    apiCall('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ cart, deliveryInfo })
    }),
  
  calculatePrice: (items, startDate, endDate) => 
    apiCall('/api/checkout/calculate', {
      method: 'POST',
      body: JSON.stringify({ items, startDate, endDate })
    })
}

// Orders API (authenticated)
export const ordersAPI = {
  getMyOrders: () => apiCall('/api/orders'),
  
  getOrderById: (id) => apiCall(`/api/orders/${id}`)
}
```

### 8.6 Session Management (Geen localStorage!)

**Winkelwagen State:** Database-backed sessions

```javascript
// public/js/services/cart.js
import { apiCall } from '../lib/api.js'

// Winkelwagen wordt opgeslagen in database sessions tabel
export const cartService = {
  // Voeg item toe aan cart (opgeslagen in database)
  async addItem(item) {
    return apiCall('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify(item)
    })
  },
  
  // Haal cart op van server
  async getCart() {
    return apiCall('/api/cart')
  },
  
  // Update item quantity
  async updateItem(itemId, quantity) {
    return apiCall(`/api/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity })
    })
  },
  
  // Verwijder item
  async removeItem(itemId) {
    return apiCall(`/api/cart/items/${itemId}`, {
      method: 'DELETE'
    })
  },
  
  // Clear hele cart
  async clearCart() {
    return apiCall('/api/cart', { method: 'DELETE' })
  }
}
```

**Sessions Database Schema:**

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  cart_data JSONB DEFAULT '[]'::jsonb,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

**Voordelen:**
- ✅ Geen data loss bij browser refresh
- ✅ Cart sync tussen devices (zelfde account)
- ✅ Server-side validatie van cart items
- ✅ Abandoned cart recovery mogelijk
- ✅ GDPR compliant (data in eigen database)

---

## 9. Gebruikersflows

### 9.1 Klant Bestelflow (Pakket - Primair)

```
 1. Bezoeker komt op website (via Google/marketing)
 2. Bekijkt pakketten overzicht
 3. Selecteert pakket (bv. "Diner Standaard 50 personen")
 4. Kiest datum/periode (weekend selector)
 5. Ziet beschikbaarheid bevestigd
 6. Optioneel: voegt add-ons toe
 7. Gaat naar winkelwagen
 8. Kiest bezorging of afhalen
 9. Logt in of maakt account aan
10. Vult bezorg/factuurgegevens in
11. Ziet totaaloverzicht (incl. eventuele borg)
12. Checkout rules check:
    - OK → Betaling
    - Review nodig → "Wij nemen contact op"
13. Betaalt (iDEAL, creditcard)
14. Ontvangt bevestigingsmail met:
    - Orderoverzicht
    - Bezorg/afhaaldatum
    - Retourinstructies
15. Ontvangt herinneringsmail (dag voor bezorging)
16. Ontvangt producten (of haalt af)
17. Gebruikt producten
18. Retourneert VUIL (geen afwas nodig!)
19. Controle door Tafel Totaal
20. Borg terugbetaling (indien van toepassing)
```

### 9.2 Admin Orderverwerking

```
 1. Nieuwe order binnenkomst (notificatie + dashboard)
 2. Order review (indien requires_review = true)
 3. Bevestigen of offerte maken
 4. Order op planning
 5. Dag voor levering: picking list genereren
 6. Producten verzamelen per krat
 7. Controleren tegen picking list
 8. Bezorgen of klaarzetten voor afhaal
 9. Status update → GELEVERD
10. Na retour: producten controleren
11. Schade? → Registreren in damage_reports
12. Geen schade? → Borg vrijgeven
13. Producten naar wasstraat
14. Na turnaround: terug beschikbaar
15. Order → AFGEROND
```

### 9.3 Picking List (PDF/Print)

```
┌─────────────────────────────────────────────────────────────┐
│                    PICKING LIST                              │
│                    TT-2026-0042                              │
├─────────────────────────────────────────────────────────────┤
│ Klant: Bruiloft Van der Berg                                │
│ Datum: 15 maart 2026 (weekend)                              │
│ Levering: 14 maart 16:00                                    │
│ Retour: 17 maart 10:00                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ PAKKET: Diner Luxe 80 personen                              │
│                                                              │
│ □ 80x Design dinerbord          [KRAT-BD-012, BD-013]      │
│ □ 80x Design voorgerechtbord    [KRAT-BD-014]              │
│ □ 80x Tafelvork goud            [KRAT-BT-008]              │
│ □ 80x Tafelmes goud             [KRAT-BT-009]              │
│ □ 80x Wijnglas rood             [KRAT-GL-022, GL-023]      │
│ □ 80x Wijnglas wit              [KRAT-GL-024, GL-025]      │
│ □ 80x Champagneflûte            [KRAT-GL-026, GL-027]      │
│                                                              │
│ ADD-ONS:                                                     │
│ □ 20x Cocktailglas              [KRAT-GL-030]              │
│ □ 4x  Charger/showbord          [KRAT-BD-020]              │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ Notities: Gouden bestek extra gepoetst. Chargers voor       │
│           bruidstafel.                                       │
├─────────────────────────────────────────────────────────────┤
│ Gecontroleerd door: _____________ Datum: _____________      │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Productcatalogus

### Overzicht per Serviceniveau

#### STANDAARD

| Categorie | Subcategorie | Producten |
|-----------|--------------|-----------|
| **Borden** | Aperitief | Aperitiefbord |
| | Voorgerecht | Voorgerechtbord |
| | Hoofdgerecht | Hoofdgerechtbord |
| | Dessert | Dessertbord |
| | Brood | Broodbord |
| | Soep | Soepbord diep |
| **Bestek** | Tafelbestek | Tafelvork, Tafelmes, Tafellepel |
| | Dessertbestek | Dessertvork, Dessertmes, Dessertlepel |
| | Koffie | Koffielepel |
| **Glazen** | Water | Waterglas |
| | Wijn wit | Wijnglas wit |
| | Wijn rood | Wijnglas rood |
| | Champagne | Champagneflûte |
| | Koffie | Koffiekop + schotel |
| **Accessoires** | Transport | Glazenkrat 60x40cm, Bordenkrat 60x40cm, Bestekbak |
| **Linnen** | Servetten | Papieren servetten |

#### LUXE

| Categorie | Subcategorie | Producten |
|-----------|--------------|-----------|
| **Borden** | Aperitief | Design aperitiefbord |
| | Voorgerecht | Design voorgerechtbord |
| | Hoofdgerecht | Dinerbord design, Pastabord diep |
| | Dessert | Dessertbord design |
| | Presentatie | Charger / showbord |
| **Bestek** | Goud | Tafelmes goud, Tafelvork goud, Tafellepel goud, Dessertbestek goud |
| | Zwart | Tafelmes zwart, Tafelvork zwart, Tafellepel zwart |

### Voorbeeldpakketten

| Pakket | Niveau | Personen | Inhoud |
|--------|--------|----------|--------|
| **Diner Basis** | Standaard | 25/50/100 | Dinerbord, vork, mes, wijnglas |
| **Diner Compleet** | Standaard | 25/50/100 | + voorgerecht, dessert, water, koffie |
| **Diner Luxe** | Luxe | 25/50/100 | Design servies, goud bestek, alle glazen |
| **Cocktail Party** | Standaard | 50/100 | Aperitiefbord, cocktailglazen, champagne |
| **High Tea** | Luxe | 25/50 | Dessertbord, koffie set, taartschotel |

---

## 11. Mappenstructuur Project

```
tafel-totaal/
│
├── 📁 public/                           # FRONTEND (statische bestanden)
│   │
│   ├── 📁 css/
│   │   ├── style.css                    # Hoofdstylesheet
│   │   ├── components.css               # Herbruikbare componenten
│   │   └── admin.css                    # Admin-specifieke styles
│   │
│   ├── 📁 js/
│   │   ├── 📁 lib/                      # Libraries & Clients
│   │   │   ├── api.js                   # REST API wrapper
│   │   │   └── utils.js                 # Helpers (formatting, etc)
│   │   ├── 📁 services/                 # Data interactie (API wrappers)
│   │   │   ├── auth.js                  # Login/Register logic
│   │   │   ├── cart.js                  # Winkelwagen state (database-backed)
│   │   │   └── products.js              # Product fetching
│   │   ├── 📁 pages/                    # Pagina-specifieke logica
│   │   │   ├── home.js
│   │   │   ├── pakketten.js
│   │   │   ├── pakket-detail.js
│   │   │   ├── checkout.js
│   │   │   └── admin-orders.js
│   │   └── main.js                      # Global scripts (nav, footer)
│   │
│   ├── 📁 images/
│   │   ├── 📁 products/
│   │   ├── 📁 packages/
│   │   └── 📁 site/                     # Logo, icons, etc.
│   │
│   ├── 📁 fonts/
│   │
│   │── # WEBSITE PAGINA'S
│   ├── index.html                       # Homepage
│   ├── over-ons.html
│   ├── hoe-werkt-het.html
│   ├── contact.html
│   ├── faq.html
│   ├── referenties.html
│   │
│   │── # WEBSHOP PAGINA'S
│   ├── pakketten.html                   # Pakketten overzicht
│   ├── pakket.html                      # Pakket detail (dynamisch via JS)
│   ├── producten.html                   # Producten overzicht
│   ├── product.html                     # Product detail
│   ├── winkelwagen.html
│   ├── checkout.html
│   ├── checkout-succes.html
│   ├── offerte-aanvraag.html
│   │
│   │── # ACCOUNT PAGINA'S
│   ├── inloggen.html
│   ├── registreren.html
│   ├── wachtwoord-vergeten.html
│   ├── 📁 account/
│   │   ├── index.html                   # Dashboard
│   │   ├── bestellingen.html
│   │   ├── bestelling.html              # Detail (dynamisch)
│   │   └── gegevens.html
│   │
│   │── # ADMIN PAGINA'S
│   └── 📁 admin/
│       ├── index.html                   # Admin dashboard
│       ├── orders.html
│       ├── order.html                   # Detail (dynamisch)
│       ├── paklijst.html
│       ├── pakketten.html
│       ├── pakket-edit.html
│       ├── producten.html
│       ├── product-edit.html
│       ├── klanten.html
│       ├── klant.html
│       ├── voorraad.html
│       ├── schade.html
│       └── instellingen.html
│
├── 📁 backend/                          # BACKEND (Railway - Node.js/Express)
│   │
│   ├── src/
│   │   ├── index.ts                     # Express app entry point
│   │   │
│   │   ├── 📁 routes/                   # API endpoints
│   │   │   ├── auth.routes.ts           # /api/auth/*
│   │   │   ├── packages.routes.ts       # /api/packages/*
│   │   │   ├── products.routes.ts       # /api/products/*
│   │   │   ├── orders.routes.ts         # /api/orders/*
│   │   │   ├── cart.routes.ts           # /api/cart/*
│   │   │   ├── checkout.routes.ts       # /api/checkout
│   │   │   ├── webhooks.routes.ts       # /api/webhooks/mollie
│   │   │   ├── availability.routes.ts   # /api/availability
│   │   │   └── admin.routes.ts          # /api/admin/*
│   │   │
│   │   ├── 📁 controllers/              # Business logica
│   │   │   ├── authController.ts
│   │   │   ├── packageController.ts
│   │   │   ├── productController.ts
│   │   │   ├── orderController.ts
│   │   │   ├── cartController.ts
│   │   │   ├── checkoutController.ts
│   │   │   └── webhookController.ts
│   │   │
│   │   ├── 📁 models/                   # Database queries
│   │   │   ├── Package.model.ts
│   │   │   ├── Product.model.ts
│   │   │   ├── Order.model.ts
│   │   │   ├── Customer.model.ts
│   │   │   ├── Reservation.model.ts
│   │   │   └── Session.model.ts
│   │   │
│   │   ├── 📁 middleware/
│   │   │   ├── auth.middleware.ts       # JWT verificatie
│   │   │   ├── admin.middleware.ts      # Admin role check
│   │   │   ├── validate.middleware.ts   # Input validatie
│   │   │   └── rateLimit.middleware.ts  # Rate limiting
│   │   │
│   │   ├── 📁 services/
│   │   │   ├── mollieService.ts         # Betalingen
│   │   │   ├── emailService.ts          # E-mail versturen (Resend)
│   │   │   ├── availabilityService.ts   # Beschikbaarheidslogica
│   │   │   ├── pricingService.ts        # Prijsberekening
│   │   │   ├── depositService.ts        # Borgberekening
│   │   │   ├── pdfService.ts            # PDF generatie (picking lists)
│   │   │   └── cloudinaryService.ts     # Image upload/transform
│   │   │
│   │   ├── 📁 config/
│   │   │   ├── database.ts              # PostgreSQL connectie (pg)
│   │   │   └── env.ts                   # Environment variables
│   │   │
│   │   └── 📁 types/
│   │       └── index.ts                 # TypeScript types
│   │
│   ├── 📁 database/
│   │   ├── schema.sql                   # Database tabellen
│   │   ├── seed.sql                     # Test data
│   │   └── 📁 migrations/               # Database wijzigingen
│   │       └── 001_initial.sql
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── 📁 docs/
│   ├── SYSTEEMONTWERP-V2.md
│   └── SITEMAP.md
│
├── .gitignore
└── README.md

### Frontend Uitleg

| Map/Bestand | Wat het doet |
|-------------|--------------|
| `public/` | Alle statische bestanden (HTML, CSS, JS, images) |
| `public/css/` | Stylesheets |
| `public/js/lib/` | API client en utilities |
| `public/js/services/` | Data services (cart, auth, products) - database-backed |
| `public/js/pages/` | Pagina-specifieke JavaScript |
| `*.html` | Statische HTML pagina's |

### Backend Uitleg (Railway)

| Map/Bestand | Wat het doet |
|-------------|--------------|
| `backend/src/` | Alle backend code (TypeScript) |
| `backend/src/routes/` | Express route definities |
| `backend/src/controllers/` | Business logica per feature |
| `backend/src/models/` | PostgreSQL queries (node-postgres) |
| `backend/src/services/` | Externe diensten (Mollie, Resend, Cloudinary) |
| `backend/src/middleware/` | Auth, validatie, rate limiting |
| `backend/database/` | SQL schema en migrations |

---

## 12. Integraties (Cloud)

### 12.1 Externe Services

| Integratie | Doel | Provider | Setup |
|------------|------|----------|-------|
| **Betalingen** | iDEAL, Bancontact | **Mollie** | API key in Railway env vars |
| **E-mail** | Transactionele mails | **Resend** | API key in Railway env vars |
| **Media Storage** | Product/package images | **Cloudinary** | API credentials in Railway env vars |
| **Analytics** | Website statistieken | **Google Analytics 4** | Script in HTML |
| **PDF** | Picking lists, facturen | **PDFKit** of **Puppeteer** | Node.js library in backend |

### 12.2 Mollie Integratie

#### Mollie Setup
1. Maak account op mollie.com
2. Kopieer API key (test + live)
3. Voeg toe aan Railway environment variables: `MOLLIE_API_KEY`
4. Configureer webhook URL: `https://api.tafeltotaal.be/api/webhooks/mollie`

#### Mollie Service (backend/src/services/mollieService.ts)

```typescript
import { createMollieClient, PaymentStatus } from '@mollie/api-client'
import { env } from '../config/env'

const mollieClient = createMollieClient({ 
  apiKey: env.MOLLIE_API_KEY
})

export const mollieService = {
  async createPayment(orderData: {
    amount: number
    orderId: string
    description: string
  }) {
    const payment = await mollieClient.payments.create({
      amount: {
        currency: 'EUR',
        value: orderData.amount.toFixed(2)
      },
      description: orderData.description,
      redirectUrl: `${env.FRONTEND_URL}/checkout-succes?order=${orderData.orderId}`,
      webhookUrl: `${env.BACKEND_URL}/api/webhooks/mollie`,
      metadata: {
        orderId: orderData.orderId
      }
    })
    
    return {
      paymentId: payment.id,
      checkoutUrl: payment.getCheckoutUrl()
    }
  },
  
  async getPaymentStatus(paymentId: string) {
    const payment = await mollieClient.payments.get(paymentId)
    return {
      status: payment.status,
      isPaid: payment.status === PaymentStatus.paid,
      metadata: payment.metadata
    }
  }
}
```

#### Checkout Controller

```typescript
// backend/src/controllers/checkoutController.ts
import { Request, Response } from 'express'
import { mollieService } from '../services/mollieService'
import { Order } from '../models/Order.model'
import { Reservation } from '../models/Reservation.model'
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // 1. Valideer cart & check beschikbaarheid
  const availability = await checkAvailability(supabase, cart)
  if (!availability.ok) {
    return new Response(JSON.stringify({ error: availability.message }), { status: 400 })
  }
  
  // 2. Bereken totaal
  const totals = await calculateTotals(supabase, cart, deliveryInfo)
  
  // 3. Maak order aan (status: pending_payment)
  const { data: order } = await supabase
    .from('orders')
    .insert({
      customer_id: userId,
      status: 'pending_payment',
      subtotal: totals.subtotal,
      delivery_fee: totals.deliveryFee,
      deposit_total: totals.deposit,
      total: totals.total,
      delivery_method: deliveryInfo.method,
      rental_start_date: cart.startDate,
      rental_end_date: cart.endDate,
    })
    .select()
    .single()
  
  // 4. Maak soft reserveringen
  await createSoftReservations(supabase, order.id, cart)
  
  // 5. Maak Mollie payment
  const payment = await mollieClient.payments.create({
    amount: { currency: 'EUR', value: totals.total.toFixed(2) },
    description: `Tafel Totaal - Order ${order.order_number}`,
    redirectUrl: `https://tafeltotaal.be/checkout-succes?order=${order.id}`,
    webhookUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mollie-webhook`,
    metadata: { orderId: order.id }
  })
  
  // 6. Sla payment ID op
  await supabase
    .from('orders')
    .update({ mollie_payment_id: payment.id })
    .eq('id', order.id)
  
  return new Response(JSON.stringify({ 
    paymentUrl: payment.getCheckoutUrl(),
    orderId: order.id 
  }))
})
```

#### Edge Function: mollie-webhook

```typescript
// supabase/functions/mollie-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createMollieClient } from 'https://esm.sh/@mollie/api-client@3'

serve(async (req) => {
  const { id: paymentId } = await req.json()
  
  const mollieClient = createMollieClient({ 
    apiKey: Deno.env.get('MOLLIE_API_KEY')! 
  })
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // 1. Haal payment status op bij Mollie
  const payment = await mollieClient.payments.get(paymentId)
  const orderId = payment.metadata.orderId
  
  if (payment.status === 'paid') {
    // 2. Update order status
    await supabase
      .from('orders')
      .update({ status: 'confirmed', paid_at: new Date().toISOString() })
      .eq('id', orderId)
    
    // 3. Converteer soft naar hard reserveringen
    await supabase
      .from('inventory_reservations')
      .update({ type: 'HARD', status: 'ACTIVE' })
      .eq('order_id', orderId)
    
    // 4. Verstuur bevestigingsmail
    await supabase.functions.invoke('send-email', {
      body: { type: 'order_confirmation', orderId }
    })
  }
  
  if (payment.status === 'failed' || payment.status === 'expired') {
    // Release soft reserveringen
    await supabase
      .from('inventory_reservations')
      .update({ status: 'RELEASED', released_at: new Date().toISOString() })
      .eq('order_id', orderId)
    
    await supabase
      .from('orders')
      .update({ status: 'payment_failed' })
      .eq('id', orderId)
  }
  
  return new Response('OK')
})
```

### 12.3 Resend E-mail Integratie

#### Edge Function: send-email

```typescript
// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2'

const resend = new Resend(Deno.env.get('RESEND_API_KEY')!)

const EMAIL_TEMPLATES = {
  order_confirmation: (order) => ({
    subject: `Bevestiging bestelling ${order.order_number}`,
    html: `
      <h1>Bedankt voor je bestelling!</h1>
      <p>Ordernummer: <strong>${order.order_number}</strong></p>
      <p>Leverdatum: ${order.delivery_date}</p>
      <p>Totaal: €${order.total.toFixed(2)}</p>
      <hr>
      <p>Je ontvangt je servies op de afgesproken datum. Vergeet niet: je mag alles vuil terugbrengen!</p>
    `
  }),
  
  order_reminder: (order) => ({
    subject: `Herinnering: Levering morgen - ${order.order_number}`,
    html: `
      <h1>Je bestelling wordt morgen geleverd!</h1>
      <p>Zorg dat er iemand aanwezig is om de levering te ontvangen.</p>
    `
  }),
  
  return_reminder: (order) => ({
    subject: `Herinnering: Retour vandaag - ${order.order_number}`,
    html: `
      <h1>Vergeet niet je servies terug te brengen!</h1>
      <p>Je mag alles vuil terugbrengen in dezelfde kratten.</p>
    `
  })
}

serve(async (req) => {
  const { type, orderId } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // Haal order + klant op
  const { data: order } = await supabase
    .from('orders')
    .select('*, customer:customers(*)')
    .eq('id', orderId)
    .single()
  
  const template = EMAIL_TEMPLATES[type](order)
  
  await resend.emails.send({
    from: 'Tafel Totaal <noreply@tafeltotaal.be>',
    to: order.customer.email,
    subject: template.subject,
    html: template.html
  })
  
  return new Response('OK')
})
```

---

## 13. Supabase Database Schema (Volledig SQL)

> **Uitvoeren in:** Supabase Dashboard → SQL Editor

### 13.1 Enums & Types

```sql
-- Service levels
CREATE TYPE service_level_type AS ENUM ('STANDAARD', 'LUXE');

-- Order statuses
CREATE TYPE order_status AS ENUM (
  'pending_payment',
  'confirmed', 
  'in_preparation',
  'shipped',
  'delivered',
  'return_received',
  'completed',
  'cancelled',
  'payment_failed'
);

-- Reservation types
CREATE TYPE reservation_type AS ENUM ('SOFT', 'HARD');
CREATE TYPE reservation_status AS ENUM ('ACTIVE', 'RELEASED', 'COMPLETED');

-- Customer types
CREATE TYPE customer_type AS ENUM ('PRIVATE', 'BUSINESS');

-- Delivery methods
CREATE TYPE delivery_method AS ENUM ('DELIVERY', 'PICKUP');

-- Price modes
CREATE TYPE price_mode AS ENUM ('PER_DAY', 'FORFAIT');

-- Wash categories
CREATE TYPE wash_category AS ENUM ('GLASS', 'PORCELAIN', 'CUTLERY', 'LINEN');
```

### 13.2 Core Tables

```sql
-- ============================================
-- SERVICE LEVELS & CATEGORIES
-- ============================================

CREATE TABLE service_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_level_id UUID REFERENCES service_levels(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(service_level_id, slug)
);

CREATE TABLE subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(category_id, slug)
);

-- ============================================
-- PRODUCTS
-- ============================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  
  -- Relations
  service_level_id UUID REFERENCES service_levels(id),
  category_id UUID REFERENCES categories(id),
  subcategory_id UUID REFERENCES subcategories(id),
  
  -- Pricing
  price_mode price_mode DEFAULT 'FORFAIT',
  price_per_day DECIMAL(10,2),
  forfait_price DECIMAL(10,2) NOT NULL,
  included_days INTEGER DEFAULT 3,
  extra_day_price DECIMAL(10,2),
  
  -- Stock
  stock_total INTEGER NOT NULL DEFAULT 0,
  buffer_percentage INTEGER DEFAULT 5,
  min_rent_quantity INTEGER DEFAULT 1,
  pack_size INTEGER DEFAULT 1,
  
  -- Operations
  wash_category wash_category DEFAULT 'PORCELAIN',
  turnaround_hours INTEGER DEFAULT 6,
  
  -- Media
  images JSONB DEFAULT '[]',
  specifications JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PACKAGES
-- ============================================

CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  
  service_level_id UUID REFERENCES service_levels(id),
  persons INTEGER NOT NULL,
  
  -- Pricing
  price_mode price_mode DEFAULT 'FORFAIT',
  base_price DECIMAL(10,2) NOT NULL,
  included_days INTEGER DEFAULT 3,
  extra_day_price DECIMAL(10,2),
  discount_percentage INTEGER DEFAULT 0,
  
  -- Media
  image TEXT,
  gallery JSONB DEFAULT '[]',
  
  -- Status
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE package_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity_per_person INTEGER NOT NULL DEFAULT 1,
  is_optional BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  
  UNIQUE(package_id, product_id)
);

-- ============================================
-- CUSTOMERS (extends Supabase Auth)
-- ============================================

CREATE TABLE customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  customer_type customer_type DEFAULT 'PRIVATE',
  
  -- Business info
  company_name TEXT,
  vat_number TEXT,
  chamber_of_commerce TEXT,
  
  -- Contact
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  
  -- Settings
  payment_terms TEXT DEFAULT 'PREPAID',
  is_vip BOOLEAN DEFAULT false,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('BILLING', 'DELIVERY')),
  is_default BOOLEAN DEFAULT false,
  
  company_name TEXT,
  street TEXT NOT NULL,
  house_number TEXT NOT NULL,
  house_number_addition TEXT,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT DEFAULT 'BE',
  phone TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ORDERS
-- ============================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id),
  status order_status DEFAULT 'pending_payment',
  
  -- Type
  order_type TEXT DEFAULT 'PACKAGE',
  event_type TEXT,
  requires_review BOOLEAN DEFAULT false,
  
  -- Rental period
  rental_start_date DATE NOT NULL,
  rental_end_date DATE NOT NULL,
  rental_days INTEGER GENERATED ALWAYS AS (rental_end_date - rental_start_date + 1) STORED,
  
  -- Delivery
  delivery_method delivery_method DEFAULT 'DELIVERY',
  delivery_address_id UUID REFERENCES customer_addresses(id),
  delivery_date DATE,
  delivery_slot TEXT,
  return_date DATE,
  return_slot TEXT,
  
  -- Financials
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  discount_code TEXT,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  deposit_total DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 21.00,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Payment
  mollie_payment_id TEXT,
  paid_at TIMESTAMPTZ,
  
  -- Notes
  customer_notes TEXT,
  setup_notes TEXT,
  internal_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'TT-' || TO_CHAR(NOW(), 'YYYY') || '-' || 
    LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('PACKAGE', 'PRODUCT', 'ADDON')),
  
  package_id UUID REFERENCES packages(id),
  product_id UUID REFERENCES products(id),
  
  quantity INTEGER NOT NULL DEFAULT 1,
  persons INTEGER,
  unit_price DECIMAL(10,2) NOT NULL,
  days INTEGER DEFAULT 1,
  line_total DECIMAL(10,2) NOT NULL,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INVENTORY RESERVATIONS
-- ============================================

CREATE TABLE inventory_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  
  -- Period (including turnaround)
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  buffer_start DATE,
  buffer_end DATE,
  
  -- Type & Status
  type reservation_type DEFAULT 'SOFT',
  status reservation_status DEFAULT 'ACTIVE',
  
  -- Soft reserve timeout
  expires_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for availability queries
CREATE INDEX idx_reservations_product_dates 
  ON inventory_reservations(product_id, start_date, end_date) 
  WHERE status = 'ACTIVE';

-- ============================================
-- DEPOSIT & DAMAGE
-- ============================================

CREATE TABLE deposit_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Matching criteria
  applies_to_category_ids JSONB,
  applies_to_service_level_ids JSONB,
  applies_to_customer_types JSONB,
  min_order_value DECIMAL(10,2),
  max_order_value DECIMAL(10,2),
  
  -- Calculation
  calculation_type TEXT NOT NULL CHECK (calculation_type IN ('PERCENTAGE', 'FIXED_PER_ITEM', 'FIXED_PER_ORDER')),
  value DECIMAL(10,2) NOT NULL,
  max_deposit DECIMAL(10,2),
  
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE damage_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity_damaged INTEGER NOT NULL,
  damage_type TEXT CHECK (damage_type IN ('BROKEN', 'CHIPPED', 'STAINED', 'MISSING')),
  description TEXT,
  photos JSONB DEFAULT '[]',
  estimated_cost DECIMAL(10,2),
  charged_amount DECIMAL(10,2),
  deposit_deducted DECIMAL(10,2),
  reported_by_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ADMIN USERS (internal staff)
-- ============================================

CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'EMPLOYEE')),
  permissions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- LOCATION DATA (for SEO pages)
-- ============================================

CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  province TEXT NOT NULL,
  postal_codes JSONB DEFAULT '[]',
  delivery_fee DECIMAL(10,2) DEFAULT 25.00,
  seo_text TEXT,
  nearby_cities JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

-- ============================================
-- INSPIRATIE (Shop the Table)
-- ============================================

CREATE TABLE inspiration_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT NOT NULL,
  theme TEXT,
  suggested_persons INTEGER DEFAULT 2,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE inspiration_hotspots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES inspiration_tables(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  x_position DECIMAL(5,2) NOT NULL,
  y_position DECIMAL(5,2) NOT NULL,
  sort_order INTEGER DEFAULT 0
);
```

### 13.3 Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_reservations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PUBLIC READ (anyone can read products, packages)
-- ============================================

-- Products: public read
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (is_active = true);

-- Packages: public read
CREATE POLICY "Packages are viewable by everyone"
  ON packages FOR SELECT
  USING (is_active = true);

-- Categories: public read
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (is_active = true);

-- Cities: public read
CREATE POLICY "Cities are viewable by everyone"
  ON cities FOR SELECT
  USING (is_active = true);

-- Inspiration: public read
CREATE POLICY "Inspiration tables are viewable by everyone"
  ON inspiration_tables FOR SELECT
  USING (is_active = true);

-- ============================================
-- CUSTOMER POLICIES (own data only)
-- ============================================

-- Customers: own profile only
CREATE POLICY "Customers can view own profile"
  ON customers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Customers can update own profile"
  ON customers FOR UPDATE
  USING (auth.uid() = id);

-- Addresses: own addresses only
CREATE POLICY "Customers can view own addresses"
  ON customer_addresses FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can insert own addresses"
  ON customer_addresses FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update own addresses"
  ON customer_addresses FOR UPDATE
  USING (customer_id = auth.uid());

-- Orders: own orders only
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  USING (customer_id = auth.uid());

-- Order items: via order ownership
CREATE POLICY "Customers can view own order items"
  ON order_items FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE customer_id = auth.uid()
    )
  );

-- ============================================
-- ADMIN POLICIES (full access)
-- ============================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin: full access to all tables
CREATE POLICY "Admins have full access to customers"
  ON customers FOR ALL
  USING (is_admin());

CREATE POLICY "Admins have full access to orders"
  ON orders FOR ALL
  USING (is_admin());

CREATE POLICY "Admins have full access to products"
  ON products FOR ALL
  USING (is_admin());

CREATE POLICY "Admins have full access to packages"
  ON packages FOR ALL
  USING (is_admin());

-- Service role bypass (for Edge Functions)
-- Edge Functions use service_role key which bypasses RLS
```

### 13.4 Database Functions

```sql
-- ============================================
-- AVAILABILITY CHECK
-- ============================================

CREATE OR REPLACE FUNCTION check_availability(
  p_product_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_quantity INTEGER
)
RETURNS TABLE (
  available BOOLEAN,
  available_quantity INTEGER,
  message TEXT
) AS $$
DECLARE
  v_product products%ROWTYPE;
  v_buffer_stock INTEGER;
  v_reserved INTEGER;
  v_available INTEGER;
BEGIN
  -- Get product
  SELECT * INTO v_product FROM products WHERE id = p_product_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 'Product niet gevonden';
    RETURN;
  END IF;
  
  -- Calculate buffer
  v_buffer_stock := CEIL(v_product.stock_total * (v_product.buffer_percentage / 100.0));
  
  -- Get active reservations in period (including turnaround)
  SELECT COALESCE(SUM(quantity), 0) INTO v_reserved
  FROM inventory_reservations
  WHERE product_id = p_product_id
    AND status = 'ACTIVE'
    AND (
      (start_date <= p_end_date AND end_date >= p_start_date)
      OR (buffer_start <= p_end_date AND buffer_end >= p_start_date)
    );
  
  -- Calculate available
  v_available := v_product.stock_total - v_buffer_stock - v_reserved;
  
  IF v_available >= p_quantity THEN
    RETURN QUERY SELECT true, v_available, 'Beschikbaar';
  ELSE
    RETURN QUERY SELECT false, v_available, 
      FORMAT('Slechts %s beschikbaar (gevraagd: %s)', v_available, p_quantity);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CALCULATE ORDER TOTALS
-- ============================================

CREATE OR REPLACE FUNCTION calculate_order_totals(p_order_id UUID)
RETURNS TABLE (
  subtotal DECIMAL,
  tax_amount DECIMAL,
  total DECIMAL
) AS $$
DECLARE
  v_subtotal DECIMAL;
  v_tax_rate DECIMAL;
BEGIN
  -- Sum line totals
  SELECT COALESCE(SUM(line_total), 0) INTO v_subtotal
  FROM order_items
  WHERE order_id = p_order_id;
  
  -- Get tax rate from order
  SELECT COALESCE(o.tax_rate, 21) INTO v_tax_rate
  FROM orders o WHERE o.id = p_order_id;
  
  RETURN QUERY SELECT 
    v_subtotal,
    ROUND(v_subtotal * (v_tax_rate / 100), 2),
    ROUND(v_subtotal * (1 + v_tax_rate / 100), 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- AUTO-RELEASE EXPIRED SOFT RESERVATIONS
-- ============================================

CREATE OR REPLACE FUNCTION release_expired_reservations()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE inventory_reservations
  SET 
    status = 'RELEASED',
    released_at = NOW()
  WHERE 
    type = 'SOFT'
    AND status = 'ACTIVE'
    AND expires_at < NOW();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule this function via pg_cron (Supabase extension)
-- SELECT cron.schedule('release-expired', '*/5 * * * *', 'SELECT release_expired_reservations()');
```

### 13.5 Seed Data

```sql
-- ============================================
-- INITIAL DATA
-- ============================================

-- Service Levels
INSERT INTO service_levels (name, slug, description, sort_order) VALUES
  ('STANDAARD', 'standaard', 'Klassiek wit servies, betrouwbaar en betaalbaar', 1),
  ('LUXE', 'luxe', 'Design servies en gouden bestek voor speciale gelegenheden', 2);

-- Categories (Standaard)
INSERT INTO categories (service_level_id, name, slug, icon, sort_order) 
SELECT id, 'Borden', 'borden', 'circle', 1 FROM service_levels WHERE slug = 'standaard';

INSERT INTO categories (service_level_id, name, slug, icon, sort_order) 
SELECT id, 'Glazen', 'glazen', 'wine', 2 FROM service_levels WHERE slug = 'standaard';

INSERT INTO categories (service_level_id, name, slug, icon, sort_order) 
SELECT id, 'Bestek', 'bestek', 'utensils', 3 FROM service_levels WHERE slug = 'standaard';

INSERT INTO categories (service_level_id, name, slug, icon, sort_order) 
SELECT id, 'Linnen', 'linnen', 'shirt', 4 FROM service_levels WHERE slug = 'standaard';

-- Cities (Top 10)
INSERT INTO cities (name, slug, province, delivery_fee, sort_order) VALUES
  ('Brugge', 'brugge', 'West-Vlaanderen', 25.00, 1),
  ('Gent', 'gent', 'Oost-Vlaanderen', 25.00, 2),
  ('Kortrijk', 'kortrijk', 'West-Vlaanderen', 25.00, 3),
  ('Oostende', 'oostende', 'West-Vlaanderen', 30.00, 4),
  ('Roeselare', 'roeselare', 'West-Vlaanderen', 25.00, 5),
  ('Aalst', 'aalst', 'Oost-Vlaanderen', 30.00, 6),
  ('Sint-Niklaas', 'sint-niklaas', 'Oost-Vlaanderen', 30.00, 7),
  ('Dendermonde', 'dendermonde', 'Oost-Vlaanderen', 30.00, 8),
  ('Knokke-Heist', 'knokke-heist', 'West-Vlaanderen', 30.00, 9),
  ('Ieper', 'ieper', 'West-Vlaanderen', 35.00, 10);

-- Deposit Rules
INSERT INTO deposit_rules (name, calculation_type, value, max_deposit, priority) VALUES
  ('Standaard borg', 'PERCENTAGE', 15, 500, 1),
  ('Kleine orders', 'FIXED_PER_ORDER', 25, NULL, 2);
```

---

## 14. Supabase Edge Functions (Volledig)

### 14.1 Overzicht Edge Functions

| Functie | Trigger | Doel |
|---------|---------|------|
| `checkout` | Frontend call | Order + payment aanmaken |
| `mollie-webhook` | Mollie POST | Payment status verwerken |
| `send-email` | Internal call | E-mails versturen |
| `check-availability` | Frontend call | Beschikbaarheid checken |
| `calculate-price` | Frontend call | Prijs berekenen |
| `generate-pdf` | Admin call | Picking list / factuur |
| `cron-reminders` | Scheduled | Herinneringsmails |

### 14.2 Edge Function: check-availability

```typescript
// supabase/functions/check-availability/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { productId, startDate, endDate, quantity } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  )
  
  const { data, error } = await supabase
    .rpc('check_availability', {
      p_product_id: productId,
      p_start_date: startDate,
      p_end_date: endDate,
      p_quantity: quantity
    })
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
  
  return new Response(JSON.stringify(data[0]))
})
```

### 14.3 Edge Function: calculate-price

```typescript
// supabase/functions/calculate-price/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface CartItem {
  type: 'package' | 'product'
  id: string
  quantity: number
  persons?: number
}

interface PriceRequest {
  items: CartItem[]
  startDate: string
  endDate: string
  deliveryMethod: 'DELIVERY' | 'PICKUP'
  citySlug?: string
}

serve(async (req) => {
  const body: PriceRequest = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  let subtotal = 0
  const itemDetails = []
  
  // Calculate rental days
  const start = new Date(body.startDate)
  const end = new Date(body.endDate)
  const rentalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  
  for (const item of body.items) {
    if (item.type === 'package') {
      const { data: pkg } = await supabase
        .from('packages')
        .select('*')
        .eq('id', item.id)
        .single()
      
      if (pkg) {
        const extraDays = Math.max(0, rentalDays - pkg.included_days)
        const lineTotal = pkg.base_price + (extraDays * (pkg.extra_day_price || 0))
        
        subtotal += lineTotal
        itemDetails.push({
          name: pkg.name,
          quantity: 1,
          persons: item.persons,
          unitPrice: pkg.base_price,
          extraDays,
          lineTotal
        })
      }
    } else {
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.id)
        .single()
      
      if (product) {
        const extraDays = Math.max(0, rentalDays - product.included_days)
        const lineTotal = (product.forfait_price * item.quantity) + 
          (extraDays * (product.extra_day_price || 0) * item.quantity)
        
        subtotal += lineTotal
        itemDetails.push({
          name: product.name,
          quantity: item.quantity,
          unitPrice: product.forfait_price,
          extraDays,
          lineTotal
        })
      }
    }
  }
  
  // Delivery fee
  let deliveryFee = 0
  if (body.deliveryMethod === 'DELIVERY' && body.citySlug) {
    const { data: city } = await supabase
      .from('cities')
      .select('delivery_fee')
      .eq('slug', body.citySlug)
      .single()
    
    deliveryFee = city?.delivery_fee || 35
  }
  
  // Deposit (simplified: 15% of subtotal, max €500)
  const deposit = Math.min(subtotal * 0.15, 500)
  
  // Tax
  const taxRate = 21
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount + deliveryFee
  
  return new Response(JSON.stringify({
    items: itemDetails,
    rentalDays,
    subtotal: Math.round(subtotal * 100) / 100,
    deliveryFee,
    deposit: Math.round(deposit * 100) / 100,
    taxRate,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100
  }))
})
```

---

## 15. Environment Variables

### 15.1 Supabase Secrets

```bash
# In Supabase Dashboard → Settings → Edge Functions → Secrets

MOLLIE_API_KEY=test_xxxxxxxxxxxxxxxxxxxxxxxx
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
```

### 15.2 Frontend Environment

```javascript
// public/js/config.js
const CONFIG = {
  SUPABASE_URL: 'https://xxxxx.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIs...',
  
  // Feature flags
  ENABLE_CHECKOUT: true,
  ENABLE_QUOTES: false,
  
  // Business rules
  MIN_RENTAL_DAYS: 1,
  MAX_RENTAL_DAYS: 14,
  SOFT_RESERVE_MINUTES: 30,
  
  // Delivery
  FREE_DELIVERY_THRESHOLD: 500,
  DEFAULT_DELIVERY_FEE: 35
}
```

---

## 16. Deployment Checklist

### 16.1 Supabase Setup

- [ ] Maak Supabase project aan
- [ ] Voer SQL schema uit (sectie 13)
- [ ] Voer seed data uit
- [ ] Enable Row Level Security
- [ ] Deploy Edge Functions
- [ ] Configureer secrets (Mollie, Resend)
- [ ] Test RLS policies

### 16.2 Netlify Setup

- [ ] Connect GitHub repo
- [ ] Configure build settings (none needed for static HTML)
- [ ] Set custom domain: tafeltotaal.be
- [ ] Enable HTTPS
- [ ] Configure redirects (_redirects file)

### 16.3 Mollie Setup

- [ ] Maak Mollie account
- [ ] Verifieer bedrijfsgegevens
- [ ] Configureer webhook URL
- [ ] Test met test API key
- [ ] Switch naar live API key

### 16.4 DNS Setup

```
tafeltotaal.be      A       75.2.60.5 (Netlify)
www.tafeltotaal.be  CNAME   tafeltotaal.netlify.app
```

---

## Vragen?

Dit document is een levend document en wordt bijgewerkt naarmate het project vordert.

**Laatste update:** Januari 2026 - V2 (Cloud-First)
