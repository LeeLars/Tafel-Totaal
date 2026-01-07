# Verhuur Sectie - Overzicht

> **URL Prefix:** `/verhuur/...`  
> **Status:** 📋 Planning (Ultra-Gedetailleerd)

---

## Structuur Overzicht

De `/verhuur` sectie combineert de webshop-functionaliteit met SEO-locatiepagina's in één geïntegreerde structuur.

```
/verhuur
│
├── /verhuur/borden              → Categorie Overzicht (alle borden)
├── /verhuur/glazen              → Categorie Overzicht (alle glazen)
├── /verhuur/bestek              → Categorie Overzicht (alle bestek)
├── /verhuur/linnen              → Categorie Overzicht (alle linnen)
├── /verhuur/buffet              → Categorie Overzicht (buffetmateriaal)
├── /verhuur/koffie-thee         → Categorie Overzicht (koffie & thee)
│
└── /verhuur/locatie             → Locatie Hub (overzicht alle steden)
      │
      ├── /verhuur/locatie/brugge          → Stad Hub
      │     ├── /verhuur/locatie/brugge/borden
      │     ├── /verhuur/locatie/brugge/glazen
      │     └── ...
      │
      ├── /verhuur/locatie/gent            → Stad Hub
      │     └── ...
      │
      └── /verhuur/locatie/kortrijk        → Stad Hub
            └── ...
```

---

## Pagina Types

### 1. Categorie Overzicht (`/verhuur/[categorie]`)
**Voorbeeld:** `/verhuur/borden`

De standaard productcatalogus voor een categorie. Geen locatie-context.

**Template:** Zie `docs/pages/producten/README.md` (hergebruik)

---

### 2. Locatie Hub (`/verhuur/locatie/[stad]`)
**Voorbeeld:** `/verhuur/locatie/brugge`

Algemene SEO-landingspagina voor een stad. Linkt door naar alle categorieën in die stad.

**Template:** Zie `docs/pages/verhuur/locatie-hub/README.md`

---

### 3. Locatie + Categorie (`/verhuur/locatie/[stad]/[categorie]`)
**Voorbeeld:** `/verhuur/locatie/brugge/borden`

De krachtigste pagina: combineert SEO-tekst met direct het productgrid. Hoogste conversie.

**Template:** Zie `docs/pages/verhuur/locatie-categorie/README.md`

---

## Voordelen van deze Structuur

| Aspect | Voordeel |
|--------|----------|
| **SEO** | Duidelijke hiërarchie voor Google (Home > Verhuur > Locatie > Stad > Categorie) |
| **Conversie** | Bezoeker ziet direct producten, geen extra kliks |
| **Beheer** | 2 templates in plaats van 100+ losse pagina's |
| **Schaalbaarheid** | Nieuwe categorie = automatisch beschikbaar in alle steden |

---

## Gerelateerde Documentatie

- `docs/pages/verhuur/locatie-hub/README.md` - Stad Hub template
- `docs/pages/verhuur/locatie-categorie/README.md` - Stad + Categorie template
- `docs/pages/producten/README.md` - Basis productgrid (hergebruik)
- `docs/SITEMAP.md` - Volledige URL structuur

---

## Notities

_De oude `/locatie/...` en `/[categorie]-huren/...` structuren zijn vervangen door deze geïntegreerde aanpak._
