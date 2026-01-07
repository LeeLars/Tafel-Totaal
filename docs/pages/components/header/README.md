# Header Component

> **Bestand:** Onderdeel van elke pagina  
> **Status:** 📋 Planning (Ultra-Gedetailleerd)

---

## 1. HEADER LAYOUT & AFMETINGEN

### Desktop (>1024px)
- **Hoogte:** `80px`.
- **Positie:** `fixed`, `top: 0`, `left: 0`, `width: 100%`, `z-index: 1000`.
- **Achtergrond:** `#FFFFFF`.
- **Border-bottom:** `1px solid #E0E0E0`.
- **Container:** `max-width: 1400px`, gecentreerd, `padding: 0 24px`.

### Tablet (768-1024px)
- **Hoogte:** `72px`.
- **Navigatie:** Verkort (minder items zichtbaar, rest in dropdown).

### Mobiel (<768px)
- **Hoogte:** `64px`.
- **Navigatie:** Verborgen, hamburger menu.

---

## 2. HEADER ELEMENTEN

### Logo (Links)
| Element | Specificatie |
|---------|-------------|
| **Afbeelding** | SVG, `height: 40px`, auto width |
| **Alt tekst** | "Tafel Totaal" |
| **Link** | `/` (homepage) |
| **Hover** | `opacity: 0.8`, `transition: 0.2s` |

### Hoofdnavigatie (Midden)
| Element | Specificatie |
|---------|-------------|
| **Layout** | Flexbox, `gap: 32px` |
| **Font** | Roboto, 15px, `font-weight: 500` |
| **Kleur** | `#1A1A1A` |
| **Hover** | Kleur `#903D3E` |
| **Active** | Kleur `#903D3E`, `font-weight: 600` |
| **Dropdown Arrow** | ChevronDown icon, 16px, `margin-left: 4px` |

### Acties (Rechts)
| Element | Specificatie |
|---------|-------------|
| **Layout** | Flexbox, `gap: 16px` |
| **Winkelwagen Icon** | ShoppingCart, 24px, kleur `#1A1A1A` |
| **Cart Badge** | Cirkel 20x20px, achtergrond `#903D3E`, tekst wit, Roboto Bold 12px |
| **Account Icon** | User, 24px, kleur `#1A1A1A` |
| **Hamburger (mobiel)** | Menu icon, 24px, kleur `#1A1A1A` |

---

## 3. DROPDOWN MENU'S

### Dropdown Container
| Element | Specificatie |
|---------|-------------|
| **Positie** | `absolute`, direct onder nav item |
| **Achtergrond** | `#FFFFFF` |
| **Border** | `1px solid #E0E0E0` |
| **Border-radius** | `8px` |
| **Box-shadow** | `0 8px 24px rgba(0,0,0,0.12)` |
| **Padding** | `16px 0` |
| **Min-width** | `220px` |
| **Animatie** | Fade in + slide down, `0.2s ease` |

### Dropdown Items
| Element | Specificatie |
|---------|-------------|
| **Padding** | `12px 24px` |
| **Font** | Roboto, 14px |
| **Kleur** | `#1A1A1A` |
| **Hover** | Achtergrond `#F5F5F5`, kleur `#903D3E` |
| **Divider** | `1px solid #E0E0E0`, `margin: 8px 0` |
| **Section Header** | Roboto Bold 12px, uppercase, kleur `#999999`, `padding: 8px 24px` |

### Pakketten Dropdown Content
| Item | URL |
|------|-----|
| Alle Pakketten | `/pakketten.html` |
| --- | |
| Diner Pakketten | `/pakketten.html?type=diner` |
| Cocktail Pakketten | `/pakketten.html?type=cocktail` |
| Luxe Pakketten | `/pakketten.html?niveau=luxe` |

### Producten Dropdown Content (Mega Menu)
**Layout:** 2 kolommen op desktop.

| Kolom 1: Categorieën | Kolom 2: Thema's |
|---------------------|-----------------|
| Borden | Italiaans |
| Bestek | Aziatisch |
| Glazen | Kerst |
| Koffie & Thee | Corporate |
| Buffet & Serveer | |
| Linnen | |

---

## 4. MOBIEL MENU

### Hamburger Button
| Element | Specificatie |
|---------|-------------|
| **Grootte** | 44x44px (touch target) |
| **Icon** | Menu (3 lijnen), 24px |
| **Animatie** | Transformeert naar X bij open |

### Menu Overlay
| Element | Specificatie |
|---------|-------------|
| **Positie** | `fixed`, full screen |
| **Achtergrond** | `#FFFFFF` |
| **Animatie** | Slide in van rechts, `0.3s ease` |
| **Padding** | `24px` |

### Mobiel Menu Items
| Element | Specificatie |
|---------|-------------|
| **Font** | Roboto, 18px, `font-weight: 500` |
| **Padding** | `16px 0` |
| **Border-bottom** | `1px solid #E0E0E0` |
| **Accordion Arrow** | ChevronDown, roteert 180° bij open |

---

## 5. STICKY HEADER GEDRAG

### Scroll States
| State | Trigger | Verandering |
|-------|---------|-------------|
| **Default** | `scrollY < 100px` | Normale hoogte, geen schaduw |
| **Scrolled** | `scrollY >= 100px` | Hoogte `64px`, `box-shadow: 0 2px 8px rgba(0,0,0,0.08)` |
| **Hidden (optioneel)** | Scroll down | Header schuift omhoog uit beeld |
| **Visible** | Scroll up | Header schuift terug in beeld |

### Transparante Header (Homepage)
- Op homepage hero: `background: transparent`, tekst wit.
- Na scroll: `background: #FFFFFF`, tekst donker.
- `transition: all 0.3s ease`.

---

## Mobiel Layout

```
┌─────────────────────────────────────┐
│  [LOGO]              🛒  👤  [☰]   │
└─────────────────────────────────────┘

Menu open:
┌─────────────────────────────────────┐
│  [LOGO]              🛒  👤  [✕]   │
├─────────────────────────────────────┤
│                                     │
│  Pakketten                    [▼]   │
│  Producten                    [▼]   │
│  Inspiratie                         │
│  Hoe Werkt Het                      │
│  Over Ons                           │
│  Contact                            │
│                                     │
└─────────────────────────────────────┘
```

---

## Sticky Behavior

| Gedrag | Beschrijving |
|--------|--------------|
| **Desktop** | Header blijft sticky bovenaan bij scrollen |
| **Mobiel** | Header blijft sticky, verkleint bij scrollen |
| **Transparant op hero** | Optioneel: transparante header op homepage hero |

---

## JavaScript Functionaliteit

| Functie | Beschrijving |
|---------|--------------|
| `toggleMobileMenu()` | Opent/sluit mobiel menu |
| `toggleDropdown(menu)` | Opent/sluit dropdown |
| `updateCartBadge()` | Update winkelwagen aantal |
| `checkAuthState()` | Toont juiste account icoon (inloggen vs account) |
| `handleScroll()` | Sticky/shrink gedrag |

---

## HTML Structuur

```html
<header class="header">
  <div class="container header__inner">
    <!-- Logo -->
    <a href="/" class="header__logo">
      <img src="/images/site/logo.svg" alt="Tafel Totaal">
    </a>
    
    <!-- Main Nav (desktop) -->
    <nav class="header__nav">
      <ul class="nav__list">
        <li class="nav__item nav__item--dropdown">
          <a href="/pakketten.html">Pakketten</a>
          <ul class="nav__dropdown">...</ul>
        </li>
        <li class="nav__item nav__item--dropdown">
          <a href="/producten.html">Producten</a>
          <ul class="nav__dropdown">...</ul>
        </li>
        <li class="nav__item">
          <a href="/inspiratie.html">Inspiratie</a>
        </li>
        <!-- etc -->
      </ul>
    </nav>
    
    <!-- Actions -->
    <div class="header__actions">
      <a href="/winkelwagen.html" class="header__cart">
        <span class="cart-icon">🛒</span>
        <span class="cart-badge" id="cart-badge">0</span>
      </a>
      <a href="/inloggen.html" class="header__account">👤</a>
      <button class="header__hamburger" id="menu-toggle">☰</button>
    </div>
  </div>
</header>
```

---

## Checklist

- [ ] HTML structuur
- [ ] CSS styling volgens styleguide
- [ ] Logo placement
- [ ] Desktop navigatie
- [ ] Dropdown menus
- [ ] Winkelwagen icoon met badge
- [ ] Account icoon
- [ ] Mobiel hamburger menu
- [ ] Mobiel menu overlay
- [ ] Sticky header
- [ ] Responsive breakpoints
- [ ] JavaScript: toggleMobileMenu()
- [ ] JavaScript: updateCartBadge()
- [ ] Active state voor huidige pagina

---

## Notities

_Ruimte voor extra ideeën of opmerkingen tijdens het bouwen._
