# Tafel Totaal - Styleguide

> **Design System & Huisstijl Handboek**  
> Consistentie is de sleutel tot een professionele uitstraling.

---

## 1. Logo & Identiteit

Het logo van Tafel Totaal bestaat uit een krachtige typografie met een iconisch "kommetje" (smile) element.

- **Primaire Vorm:** Vierkant (favicon/socials) en Liggend (website header).
- **Witruimte:** Houd altijd minimaal `2rem` witruimte rondom het logo.

---

## 2. Kleurenpalet

Onze kleuren zijn gekozen voor een warme, luxe en professionele uitstraling.

### Primaire Kleuren
De basis van onze identiteit. Gebruik `#903D3E` als de hoofdkleur voor belangrijke actieknoppen, headers en accenten.

| Kleur | Hex Code | Naam | Gebruik |
|-------|----------|------|---------|
| <span style="display:inline-block;width:20px;height:20px;background:#903D3E;border:1px solid #ddd;"></span> | **`#903D3E`** | **Tafel Rood** | **Hoofdkleur**, CTA buttons, titels |
| <span style="display:inline-block;width:20px;height:20px;background:#7A3233;border:1px solid #ddd;"></span> | **`#7A3233`** | **Tafel Dark** | Hover states, actieve elementen |
| <span style="display:inline-block;width:20px;height:20px;background:#B56B6C;border:1px solid #ddd;"></span> | **`#B56B6C`** | **Tafel Light** | Achtergronden, subtiele accenten |

### Neutrale Kleuren
Voor tekst, achtergronden en lijnen.

| Kleur | Hex Code | Naam | Gebruik |
|-------|----------|------|---------|
| <span style="display:inline-block;width:20px;height:20px;background:#1A1A1A;border:1px solid #ddd;"></span> | **`#1A1A1A`** | **Black** | Hoofdtekst, koppen |
| <span style="display:inline-block;width:20px;height:20px;background:#4A4A4A;border:1px solid #ddd;"></span> | **`#4A4A4A`** | **Dark Gray** | Secundaire tekst |
| <span style="display:inline-block;width:20px;height:20px;background:#F5F5F5;border:1px solid #ddd;"></span> | **`#F5F5F5`** | **Off White** | Sectie achtergronden |
| <span style="display:inline-block;width:20px;height:20px;background:#FFFFFF;border:1px solid #ddd;"></span> | **`#FFFFFF`** | **White** | Card achtergronden, tekst op rood |

### Status Kleuren
Functionele kleuren voor feedback.

| Kleur | Hex Code | Naam | Gebruik |
|-------|----------|------|---------|
| <span style="display:inline-block;width:20px;height:20px;background:#2E7D32;border:1px solid #ddd;"></span> | **`#2E7D32`** | **Success** | Meldingen, "op voorraad" |
| <span style="display:inline-block;width:20px;height:20px;background:#D32F2F;border:1px solid #ddd;"></span> | **`#D32F2F`** | **Error** | Foutmeldingen, "niet beschikbaar" |
| <span style="display:inline-block;width:20px;height:20px;background:#ED6C02;border:1px solid #ddd;"></span> | **`#ED6C02`** | **Warning** | Let op, bijna uitverkocht |

---

## 3. Typografie

We combineren een karakteristiek display font met een zeer leesbaar body font.

### Font Families

1.  **Display / Headings:** [Righteous](https://fonts.google.com/specimen/Righteous)
    *   Gebruik voor: Koppen (H1-H3), Logo, Grote Cijfers.
    *   Karakter: Modern, geometrisch, vriendelijk.
2.  **Body / UI:** [Roboto](https://fonts.google.com/specimen/Roboto)
    *   Gebruik voor: Lopende tekst, knoppen, labels, menu's.
    *   Karakter: Neutraal, goed leesbaar, professioneel.

### Fluid Typography Scale (CSS Clamp)
We gebruiken `clamp()` zodat tekst vloeiend meeschaalt van mobiel naar desktop zonder breakpoints.

```css
:root {
  /* Schaalratio: 1.25 (Major Third) */
  --font-size-sm: clamp(0.8rem, 0.17vw + 0.76rem, 0.89rem);
  --font-size-base: clamp(1rem, 0.34vw + 0.91rem, 1.19rem);
  --font-size-md: clamp(1.25rem, 0.61vw + 1.1rem, 1.58rem);
  --font-size-lg: clamp(1.56rem, 1vw + 1.31rem, 2.11rem);
  --font-size-xl: clamp(1.95rem, 1.56vw + 1.56rem, 2.81rem);
  --font-size-xxl: clamp(2.44rem, 2.38vw + 1.85rem, 3.75rem);
  --font-size-xxxl: clamp(3.05rem, 3.54vw + 2.17rem, 5rem);
}
```

### Typografie Regels

| Element | Font Family | Size Var | Weight | Line Height | Letter Spacing |
|---------|-------------|----------|--------|-------------|----------------|
| **H1** | Righteous | `--font-size-xxxl` | 400 | 1.1 | -0.02em |
| **H2** | Righteous | `--font-size-xxl` | 400 | 1.2 | -0.01em |
| **H3** | Righteous | `--font-size-xl` | 400 | 1.3 | Normal |
| **H4** | Roboto | `--font-size-lg` | 700 | 1.4 | Normal |
| **Body** | Roboto | `--font-size-base` | 400 | 1.6 | Normal |
| **Small** | Roboto | `--font-size-sm` | 400 | 1.5 | Normal |
| **Button** | Roboto | `--font-size-base` | 500 | 1 | 0.02em |

---

## 4. Layout & Spacing

We gebruiken vaste constanten om de layout strak en consistent te houden.

### Grid & Container

```css
:root {
  /* Container Breedtes */
  --container-width: 1280px;  /* Max breedte content */
  --container-padding: clamp(1rem, 5vw, 2rem); /* Padding zijkanten */
  
  /* Sectie Spacing */
  --section-spacing: clamp(3rem, 8vw, 6rem); /* Ruimte tussen secties */
  
  /* Grid Gaps */
  --grid-gap: clamp(1rem, 2vw, 2rem);
}

.container {
  width: 100%;
  max-width: var(--container-width);
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--container-padding);
  padding-right: var(--container-padding);
}
```

### Spacing Scale
Gebruik deze variabelen voor margin en padding.

| Naam | Waarde | Desktop (approx) |
|------|--------|------------------|
| `--space-xs` | `0.25rem` | 4px |
| `--space-sm` | `0.5rem` | 8px |
| `--space-md` | `1rem` | 16px |
| `--space-lg` | `1.5rem` | 24px |
| `--space-xl` | `2rem` | 32px |
| `--space-2xl` | `3rem` | 48px |
| `--space-3xl` | `5rem` | 80px |

---

## 5. Components & Styling

### Border Radius & Shadows
Een zachte, moderne uitstraling.

```css
:root {
  --radius-sm: 4px;
  --radius-md: 8px;   /* Standaard voor buttons/inputs */
  --radius-lg: 16px;  /* Standaard voor cards */
  --radius-xl: 24px;  /* Grote secties */
  
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  --shadow-hover: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
}
```

### Buttons

**Primary Button**
- Achtergrond: `var(--color-primary)` (`#903D3E`)
- Tekst: `var(--color-white)`
- Font: Roboto, Uppercase, Bold
- Radius: `var(--radius-md)`
- Hover: Darker (`#7A3233`) + Transform Y -2px

**Secondary Button**
- Achtergrond: Transparent
- Border: 2px solid `var(--color-primary)`
- Tekst: `var(--color-primary)`
- Hover: Achtergrond `var(--color-primary-light)` (10% opacity)

### Cards (Producten/Pakketten)
- Achtergrond: `var(--color-white)`
- Border: 1px solid `#E5E5E5`
- Radius: `var(--radius-lg)`
- Shadow: `var(--shadow-sm)`
- Transition: Transform & Shadow 0.3s ease
- **Hover:** `var(--shadow-hover)` + Transform Y -4px

### Images
- **Standaard:** `object-fit: cover`
- **Border Radius:** Gelijk aan de parent card (vaak `var(--radius-lg)` aan de bovenkant).
- **Aspect Ratio:**
    - Producten: `1/1` (Vierkant)
    - Headers: `16/9` of `21/9`

---

## 6. CSS Variabelen Samenvatting (Copy-Paste)

Kopieer dit naar `css/style.css`:

```css
:root {
  /* KLEUREN */
  --color-primary: #903D3E;
  --color-primary-dark: #7A3233;
  --color-primary-light: #B56B6C;
  
  --color-text-main: #1A1A1A;
  --color-text-muted: #4A4A4A;
  --color-bg-body: #FFFFFF;
  --color-bg-light: #F5F5F5;
  --color-white: #FFFFFF;
  
  --color-success: #2E7D32;
  --color-error: #D32F2F;
  --color-warning: #ED6C02;

  /* FONTS */
  --font-heading: 'Righteous', display, sans-serif;
  --font-body: 'Roboto', sans-serif;

  /* TYPOGRAFIE SIZE (Fluid) */
  --text-sm: clamp(0.8rem, 0.17vw + 0.76rem, 0.89rem);
  --text-base: clamp(1rem, 0.34vw + 0.91rem, 1.19rem);
  --text-md: clamp(1.25rem, 0.61vw + 1.1rem, 1.58rem);
  --text-lg: clamp(1.56rem, 1vw + 1.31rem, 2.11rem);
  --text-xl: clamp(1.95rem, 1.56vw + 1.56rem, 2.81rem);
  --text-2xl: clamp(2.44rem, 2.38vw + 1.85rem, 3.75rem);
  --text-3xl: clamp(3.05rem, 3.54vw + 2.17rem, 5rem);

  /* SPACING */
  --container-width: 1280px;
  --container-padding: clamp(1rem, 5vw, 2rem);
  --section-spacing: clamp(3rem, 8vw, 6rem);
  
  /* VORMGEVING */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
}
```

---

## 7. Do's & Don'ts

✅ **DO:**
*   Gebruik altijd de CSS variabelen voor kleuren en spacing.
*   Gebruik Righteous **alleen** voor koppen.
*   Zorg voor voldoende contrast tussen tekst en achtergrond.
*   Houd formulieren en CTA's groot en klikbaar (min 44px hoogte).

❌ **DON'T:**
*   Gebruik geen puur zwart (`#000000`) voor tekst, gebruik `#1A1A1A`.
*   Gebruik geen Righteous voor lange stukken tekst.
*   Maak de borders van cards niet dikker dan 1px.
