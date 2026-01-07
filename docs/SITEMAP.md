# Tafel Totaal - Sitemap & Site-Architectuur

> Overzicht van alle pagina's en hoe ze met elkaar verbonden zijn.

---

## Visueel Overzicht

```
                                    ┌─────────────────┐
                                    │    HOMEPAGE     │
                                    │   tafeltotaal.be│
                                    └────────┬────────┘
                                             │
            ┌────────────────────────────────┼────────────────────────────────┐
            │                                │                                │
            ▼                                ▼                                ▼
    ┌───────────────┐               ┌───────────────┐               ┌───────────────┐
    │   WEBSITE     │               │   WEBSHOP     │               │   ACCOUNT     │
    │   (Informatie)│               │   (Bestellen) │               │   (Inloggen)  │
    └───────┬───────┘               └───────┬───────┘               └───────┬───────┘
            │                               │                               │
    ┌───────┴───────┐               ┌───────┴───────┐               ┌───────┴───────┐
    │               │               │               │               │               │
    ▼               ▼               ▼               ▼               ▼               ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│Over Ons │   │Hoe Werkt│   │Pakketten│   │Producten│   │  Mijn   │   │  Admin  │
│         │   │  Het    │   │         │   │         │   │Bestellin│   │ Beheer  │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
```

---

## Volledige Sitemap

### 🏠 Hoofdnavigatie

| URL | Pagina | Beschrijving |
|-----|--------|--------------|
| `/` | Homepage | Landingspagina met hero, USP's, featured pakketten |
| `/pakketten` | Pakketten overzicht | Alle verhuurpakketten |
| `/hoe-werkt-het` | Hoe werkt het | Uitleg verhuurproces in stappen |
| `/over-ons` | Over ons | Bedrijfsverhaal, team |
| `/contact` | Contact | Contactformulier, adres, openingstijden |

---

## 📄 Website Pagina's (Informatie & SEO)

### Hoofdpagina's

| URL | Pagina | Doel |
|-----|--------|------|
| `/` | **Homepage** | Eerste indruk, conversie naar pakketten |
| `/over-ons` | **Over Ons** | Vertrouwen opbouwen, verhaal vertellen |
| `/hoe-werkt-het` | **Hoe Werkt Het** | Uitleg proces, drempels wegnemen |
| `/contact` | **Contact** | Bereikbaarheid, locatie |
| `/faq` | **Veelgestelde Vragen** | Antwoorden, SEO |
| `/referenties` | **Referenties** | Klantcases, reviews, foto's |

### Inspiratie & Blog

| URL | Pagina | Doel |
|-----|--------|------|
| `/inspiratie` | **Inspiratie Overzicht** | Lookbook, sfeerbeelden |
| `/inspiratie/shop-the-table` | **Shop the Table** | Interactieve tafels met hotspots - direct bestellen |
| `/blog` | **Blog Overzicht** | Alle artikelen |
| `/blog/[slug]` | **Blog Artikel** | Individueel artikel |

### Verhuur Sectie (Geïntegreerde Webshop + SEO)

**Nieuwe structuur:** Alle categorieën en locaties zijn geïntegreerd onder `/verhuur`.

#### Categorie Overzichten
| URL | Pagina | Zoekterm focus |
|-----|--------|----------------|
| `/verhuur/borden` | **Borden** | borden huren, dinerborden huren |
| `/verhuur/glazen` | **Glazen** | glazen huren, wijnglazen huren |
| `/verhuur/bestek` | **Bestek** | bestek huren, tafelvork huren |
| `/verhuur/linnen` | **Linnen** | servetten huren, tafelkleden huren |
| `/verhuur/buffet` | **Buffetmateriaal** | serveerschalen huren, buffet servies |
| `/verhuur/koffie-thee` | **Koffie & Thee** | koffiekopjes huren, theepotten huren |

#### Locatie Hub Pagina's (Stad Overzicht)
| URL | Pagina | Doel |
|-----|--------|------|
| `/verhuur/locatie/brugge` | **Brugge** | SEO: servies huren Brugge (hub naar categorieën) |
| `/verhuur/locatie/gent` | **Gent** | SEO: servies huren Gent |
| `/verhuur/locatie/kortrijk` | **Kortrijk** | SEO: servies huren Kortrijk |
| `/verhuur/locatie/oostende` | **Oostende** | SEO: servies huren Oostende |
| `/verhuur/locatie/roeselare` | **Roeselare** | SEO: servies huren Roeselare |
| `/verhuur/locatie/aalst` | **Aalst** | SEO: servies huren Aalst |
| `/verhuur/locatie/sint-niklaas` | **Sint-Niklaas** | SEO: servies huren Sint-Niklaas |
| `/verhuur/locatie/dendermonde` | **Dendermonde** | SEO: servies huren Dendermonde |
| `/verhuur/locatie/knokke-heist` | **Knokke-Heist** | SEO: servies huren Knokke-Heist |
| `/verhuur/locatie/ieper` | **Ieper** | SEO: servies huren Ieper |

#### Locatie + Categorie Pagina's (Hoogste Conversie)

**Structuur:** `/verhuur/locatie/[stad]/[categorie]`

**Voorbeeld: Brugge**
- `/verhuur/locatie/brugge/borden` → Borden huren in Brugge (met productgrid)
- `/verhuur/locatie/brugge/glazen` → Glazen huren in Brugge
- `/verhuur/locatie/brugge/bestek` → Bestek huren in Brugge

**Voorbeeld: Gent**
- `/verhuur/locatie/gent/borden` → Borden huren in Gent
- `/verhuur/locatie/gent/glazen` → Glazen huren in Gent

**Prioriteit voor uitrol:**
1. Top 15 steden × 2 categorieën (borden, glazen) = 30 pagina's
2. Top 10 steden × 4 categorieën = 40 pagina's
3. Uitbreiden naar kleinere steden indien nodig

### Juridisch (Footer)

| URL | Pagina | Doel |
|-----|--------|------|
| `/algemene-voorwaarden` | **Algemene Voorwaarden** | Juridisch |
| `/privacy` | **Privacybeleid** | AVG/GDPR |
| `/cookies` | **Cookiebeleid** | Cookie informatie |

---

## 🛒 Webshop Pagina's (Bestellen)

### Pakketten (Primair)

| URL | Pagina | Beschrijving |
|-----|--------|--------------|
| `/pakketten` | **Pakketten Overzicht** | Alle pakketten met filters |
| `/pakketten/standaard` | **Standaard Pakketten** | Gefilterd op serviceniveau |
| `/pakketten/luxe` | **Luxe Pakketten** | Gefilterd op serviceniveau |
| `/pakketten/[slug]` | **Pakket Detail** | Inhoud, prijs, datumkiezer, add-ons |

**Voorbeeld pakket URL's:**
- `/pakketten/diner-standaard-50-personen`
- `/pakketten/diner-compleet-100-personen`
- `/pakketten/diner-luxe-80-personen`
- `/pakketten/cocktail-party-50-personen`

### Producten

| URL | Pagina | Beschrijving |
|-----|--------|--------------|
| `/producten` | **Producten Overzicht** | Alle losse producten |
| `/producten/[slug]` | **Product Detail** | Individueel product |

**Per Categorie:**
| URL | Categorie |
|-----|-----------|
| `/producten?categorie=borden` | Borden |
| `/producten?categorie=bestek` | Bestek |
| `/producten?categorie=glazen` | Glazen |
| `/producten?categorie=koffie-thee` | Koffie & Thee |
| `/producten?categorie=buffet-serveer` | Buffet & Serveer |
| `/producten?categorie=amuse-aperitief` | Amuse & Aperitief |
| `/producten?categorie=linnen` | Linnen |
| `/producten?categorie=accessoires` | Accessoires |

**Per Thema (SEO):**
| URL | Thema |
|-----|-------|
| `/producten?thema=italiaans` | Thema Italiaans |
| `/producten?thema=aziatisch` | Thema Aziatisch |
| `/producten?thema=kerst` | Thema Kerst |
| `/producten?thema=corporate` | Thema Corporate |

### Bestelproces

| URL | Pagina | Beschrijving |
|-----|--------|--------------|
| `/winkelwagen` | **Winkelwagen** | Overzicht bestelling, aanpassen |
| `/checkout` | **Checkout** | Gegevens, bezorging, betaling |
| `/checkout/succes` | **Bestelling Gelukt** | Bevestiging na betaling |
| `/checkout/mislukt` | **Betaling Mislukt** | Foutmelding, opnieuw proberen |
| `/offerte-aanvraag` | **Offerte Aanvragen** | Voor grote/custom orders |
| `/offerte-aanvraag/verstuurd` | **Offerte Verstuurd** | Bevestiging |

---

## 👤 Klant Account Pagina's

> Alleen toegankelijk na inloggen

| URL | Pagina | Beschrijving |
|-----|--------|--------------|
| `/inloggen` | **Inloggen** | Login formulier |
| `/registreren` | **Registreren** | Account aanmaken |
| `/wachtwoord-vergeten` | **Wachtwoord Vergeten** | Reset aanvragen |
| `/wachtwoord-reset` | **Wachtwoord Reset** | Nieuw wachtwoord instellen |

### Mijn Account

| URL | Pagina | Beschrijving |
|-----|--------|--------------|
| `/account` | **Dashboard** | Overzicht, snelle acties |
| `/account/bestellingen` | **Mijn Bestellingen** | Lijst van alle orders |
| `/account/bestellingen/[id]` | **Bestelling Detail** | Specifieke order bekijken |
| `/account/gegevens` | **Mijn Gegevens** | Profiel bewerken |
| `/account/adressen` | **Mijn Adressen** | Bezorg/factuuradres beheren |
| `/account/facturen` | **Mijn Facturen** | Facturen downloaden |

---

## 🔧 Admin Pagina's (Beheer)

> Alleen toegankelijk voor admin/medewerkers

### Dashboard

| URL | Pagina | Beschrijving |
|-----|--------|--------------|
| `/admin` | **Admin Dashboard** | Overzicht, statistieken, acties |

### Orders

| URL | Pagina | Beschrijving |
|-----|--------|--------------|
| `/admin/orders` | **Orders Overzicht** | Alle bestellingen |
| `/admin/orders/[id]` | **Order Detail** | Specifieke order beheren |
| `/admin/orders/nieuw` | **Nieuwe Order** | Handmatig order aanmaken |
| `/admin/paklijsten` | **Paklijsten** | Dagelijkse paklijsten genereren |
| `/admin/planning` | **Planning** | Bezorg/afhaal kalender |

### Offertes

| URL | Pagina | Beschrijving |
|-----|--------|--------------|
| `/admin/offertes` | **Offertes Overzicht** | Alle offertes |
| `/admin/offertes/[id]` | **Offerte Detail** | Offerte bewerken/versturen |
| `/admin/offertes/nieuw` | **Nieuwe Offerte** | Offerte aanmaken |

### Producten & Pakketten

| URL | Pagina | Beschrijving |
|-----|--------|--------------|
| `/admin/pakketten` | **Pakketten Beheer** | Alle pakketten |
| `/admin/pakketten/[id]` | **Pakket Bewerken** | Pakket aanpassen |
| `/admin/pakketten/nieuw` | **Nieuw Pakket** | Pakket aanmaken |
| `/admin/producten` | **Producten Beheer** | Alle producten |
| `/admin/producten/[id]` | **Product Bewerken** | Product aanpassen |
| `/admin/producten/nieuw` | **Nieuw Product** | Product aanmaken |
| `/admin/categorieen` | **Categorieën** | Categorieën beheren |

### Voorraad

| URL | Pagina | Beschrijving |
|-----|--------|--------------|
| `/admin/voorraad` | **Voorraad Overzicht** | Actuele voorraad |
| `/admin/voorraad/mutaties` | **Voorraad Mutaties** | Aanpassingen loggen |
| `/admin/beschikbaarheid` | **Beschikbaarheid** | Kalender met beschikbaarheid |

### Klanten

| URL | Pagina | Beschrijving |
|-----|--------|--------------|
| `/admin/klanten` | **Klanten Overzicht** | Alle klanten |
| `/admin/klanten/[id]` | **Klant Detail** | Klantprofiel, orderhistorie |

### Schade & Borg

| URL | Pagina | Beschrijving |
|-----|--------|--------------|
| `/admin/retouren` | **Retouren** | Retour verwerking |
| `/admin/schade` | **Schade Overzicht** | Schademeldingen |
| `/admin/schade/[id]` | **Schade Detail** | Schade afhandelen |
| `/admin/borg` | **Borg Overzicht** | Openstaande borgen |

### Content (CMS)

| URL | Pagina | Beschrijving |
|-----|--------|--------------|
| `/admin/paginas` | **Pagina's** | Website pagina's bewerken |
| `/admin/blog` | **Blog Beheer** | Blogartikelen |
| `/admin/blog/[id]` | **Blog Bewerken** | Artikel bewerken |
| `/admin/blog/nieuw` | **Nieuw Artikel** | Artikel schrijven |
| `/admin/faq` | **FAQ Beheer** | Vragen/antwoorden |
| `/admin/media` | **Media Bibliotheek** | Afbeeldingen uploaden |

### Instellingen

| URL | Pagina | Beschrijving |
|-----|--------|--------------|
| `/admin/instellingen` | **Instellingen** | Algemene instellingen |
| `/admin/instellingen/bezorgzones` | **Bezorgzones** | Postcodes, tarieven |
| `/admin/instellingen/borg-regels` | **Borg Regels** | Deposit rules |
| `/admin/instellingen/checkout-regels` | **Checkout Regels** | Offerte triggers |
| `/admin/instellingen/kortingen` | **Kortingen** | Kortingscodes |
| `/admin/instellingen/emails` | **E-mail Templates** | E-mails aanpassen |
| `/admin/instellingen/btw` | **BTW Instellingen** | Belastingtarieven |

### Gebruikers

| URL | Pagina | Beschrijving |
|-----|--------|--------------|
| `/admin/gebruikers` | **Gebruikers** | Admin/medewerker accounts |
| `/admin/gebruikers/[id]` | **Gebruiker Bewerken** | Rechten aanpassen |
| `/admin/gebruikers/nieuw` | **Nieuwe Gebruiker** | Account aanmaken |

### Rapportages

| URL | Pagina | Beschrijving |
|-----|--------|--------------|
| `/admin/rapportages` | **Rapportages** | Overzicht rapporten |
| `/admin/rapportages/omzet` | **Omzet Rapport** | Omzet per periode |
| `/admin/rapportages/producten` | **Product Rapport** | Populaire producten |
| `/admin/rapportages/klanten` | **Klant Rapport** | Klantanalyse |

---

## 🔗 URL Structuur Samenvatting

```
tafeltotaal.be/
│
├── (Website - Publiek)
│   ├── /
│   ├── /over-ons
│   ├── /hoe-werkt-het
│   ├── /contact
│   ├── /faq
│   ├── /referenties
│   ├── /blog
│   ├── /blog/[slug]
│   ├── /inspiratie
│   ├── /algemene-voorwaarden
│   ├── /privacy
│   └── /cookies
│
├── (Webshop - Publiek)
│   ├── /pakketten
│   ├── /pakketten/standaard
│   ├── /pakketten/luxe
│   ├── /pakketten/[slug]
│   ├── /verhuur                      ← NIEUW: Geïntegreerde verhuur sectie
│   │   ├── /verhuur/borden
│   │   ├── /verhuur/glazen
│   │   ├── /verhuur/bestek
│   │   ├── /verhuur/linnen
│   │   ├── /verhuur/buffet
│   │   ├── /verhuur/koffie-thee
│   │   └── /verhuur/locatie
│   │       ├── /verhuur/locatie/[stad]           (Stad Hub)
│   │       └── /verhuur/locatie/[stad]/[cat]     (Stad + Categorie)
│   ├── /winkelwagen
│   ├── /checkout
│   ├── /checkout/succes
│   ├── /checkout/mislukt
│   ├── /offerte-aanvraag
│   └── /offerte-aanvraag/verstuurd
│
├── (Auth)
│   ├── /inloggen
│   ├── /registreren
│   ├── /wachtwoord-vergeten
│   └── /wachtwoord-reset
│
├── (Klant Account - Beveiligd)
│   ├── /account
│   ├── /account/bestellingen
│   ├── /account/bestellingen/[id]
│   ├── /account/gegevens
│   ├── /account/adressen
│   └── /account/facturen
│
└── (Admin - Beveiligd)
    ├── /admin
    ├── /admin/orders
    ├── /admin/orders/[id]
    ├── /admin/paklijsten
    ├── /admin/planning
    ├── /admin/offertes
    ├── /admin/pakketten
    ├── /admin/producten
    ├── /admin/categorieen
    ├── /admin/voorraad
    ├── /admin/klanten
    ├── /admin/retouren
    ├── /admin/schade
    ├── /admin/borg
    ├── /admin/paginas
    ├── /admin/blog
    ├── /admin/faq
    ├── /admin/media
    ├── /admin/instellingen
    ├── /admin/gebruikers
    └── /admin/rapportages
```

---

## 📱 Navigatie Structuur

### Hoofdmenu (Header)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🍽️ Tafel Totaal    Pakketten ▼   Hoe Werkt Het   Over Ons   Contact   │
│                                                                         │
│                                              🛒 Winkelwagen   👤 Account │
└─────────────────────────────────────────────────────────────────────────┘

Pakketten Dropdown:
├── Alle Pakketten
├── Standaard Pakketten
├── Luxe Pakketten
└── Losse Producten
```

### Footer

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  TAFEL TOTAAL          PAKKETTEN         INFORMATIE        CONTACT     │
│                                                                         │
│  Van bord tot glas,    Standaard         Hoe werkt het     Adres       │
│  zonder afwas!         Luxe              Over ons          Telefoon    │
│                        Losse producten   FAQ               E-mail      │
│                                          Blog              Openingstijd│
│                                          Referenties                   │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  © 2026 Tafel Totaal   Algemene Voorwaarden   Privacy   Cookies        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Admin Sidebar

```
┌──────────────────────┐
│  🍽️ Tafel Totaal     │
│      Admin           │
├──────────────────────┤
│  📊 Dashboard        │
├──────────────────────┤
│  📦 Orders           │
│  📋 Paklijsten       │
│  📅 Planning         │
├──────────────────────┤
│  📝 Offertes         │
├──────────────────────┤
│  🎁 Pakketten        │
│  🍽️ Producten        │
│  📁 Categorieën      │
├──────────────────────┤
│  📦 Voorraad         │
│  📅 Beschikbaarheid  │
├──────────────────────┤
│  👥 Klanten          │
├──────────────────────┤
│  ↩️ Retouren         │
│  ⚠️ Schade           │
│  💰 Borg             │
├──────────────────────┤
│  📄 Content          │
│     ├── Pagina's     │
│     ├── Blog         │
│     ├── FAQ          │
│     └── Media        │
├──────────────────────┤
│  ⚙️ Instellingen     │
│  👤 Gebruikers       │
│  📈 Rapportages      │
└──────────────────────┘
```

---

## 🎯 SEO URL Richtlijnen

| Richtlijn | Voorbeeld |
|-----------|-----------|
| Gebruik Nederlandse URL's | `/pakketten` niet `/packages` |
| Kleine letters | `/over-ons` niet `/Over-Ons` |
| Koppeltekens voor spaties | `/hoe-werkt-het` niet `/hoe_werkt_het` |
| Geen trailing slash | `/pakketten` niet `/pakketten/` |
| Beschrijvende slugs | `/pakketten/diner-luxe-50-personen` |
| Korte URL's waar mogelijk | `/faq` niet `/veelgestelde-vragen` |

---

## Totaal Aantal Pagina's

| Sectie | Aantal |
|--------|--------|
| Website (publiek) | 12 |
| Webshop (publiek) | 10 + dynamisch |
| Auth | 4 |
| Klant Account | 6 |
| Admin | 35+ |
| **Totaal statisch** | **~67** |
| **+ Dynamische pagina's** | Pakketten, producten, orders, klanten, etc. |

---

**Laatste update:** Januari 2026
