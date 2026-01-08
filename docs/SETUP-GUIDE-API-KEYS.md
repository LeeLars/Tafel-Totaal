# 🔑 API Keys Setup Guide - Stap voor Stap

> **Voor:** Lars (uitgelegd alsof je 5 jaar bent 🎈)  
> **Doel:** Alle API keys verkrijgen voor Tafel Totaal

---

## 📋 Overzicht: Wat hebben we nodig?

1. **Mollie** → Voor betalingen (iDEAL, Bancontact, etc.)
2. **Cloudinary** → Voor het opslaan van foto's (producten, pakketten)
3. **Resend** → Voor het versturen van emails (bevestigingen, facturen)
4. **Netlify** → Voor de website (frontend hosting)

---

## 1️⃣ MOLLIE - Betalingen Instellen

### Wat is Mollie?
Mollie zorgt ervoor dat klanten kunnen betalen met iDEAL, Bancontact, creditcard, etc.

### Stap 1: Account Aanmaken
1. Ga naar: **https://www.mollie.com/nl**
2. Klik op **"Gratis aanmelden"** (rechtsboven)
3. Vul in:
   - Je email adres
   - Een wachtwoord
   - Bedrijfsnaam: **Tafel Totaal**
4. Klik op **"Account aanmaken"**
5. **Bevestig je email** (check je inbox)

### Stap 2: Bedrijfsgegevens Invullen
1. Log in op Mollie
2. Je moet nu je bedrijfsgegevens invullen:
   - **Bedrijfsnaam:** Tafel Totaal
   - **KVK nummer** (als je die hebt)
   - **BTW nummer** (als je die hebt)
   - **Adres**
   - **Telefoonnummer**
3. Klik op **"Opslaan"**

### Stap 3: Test API Key Ophalen (voor nu)
1. Ga naar **"Developers"** in het menu (links)
2. Klik op **"API keys"**
3. Je ziet nu twee keys:
   - **Test API key** → Begint met `test_`
   - **Live API key** → Begint met `live_` (deze krijg je pas na verificatie)

4. **Kopieer de Test API key** (klik op het kopieer icoontje)
   - Het ziet eruit als: `test_dHar4XY7LxsDOtmnkVtjNVWXLSlXsM`

### Stap 4: Test Key in Railway Zetten
1. Ga naar **Railway** → Je project → **backend service** → **Variables**
2. Zoek de variabele: **`MOLLIE_API_KEY`**
3. **Vervang** `test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` door jouw echte test key
4. Klik op **"Save"** of druk op Enter

### ⚠️ Belangrijk: Live Key Later
- De **test key** werkt alleen voor testen (geen echt geld)
- Voor echte betalingen heb je de **live key** nodig
- Die krijg je pas nadat Mollie je bedrijf heeft geverifieerd (kan 1-3 dagen duren)
- **Voor nu gebruiken we de test key!**

---

## 2️⃣ CLOUDINARY - Foto's Opslaan

### Wat is Cloudinary?
Cloudinary slaat alle foto's op van je producten en pakketten. Het maakt ze ook automatisch kleiner voor snellere laadtijd.

### Stap 1: Account Aanmaken
1. Ga naar: **https://cloudinary.com/users/register_free**
2. Klik op **"Sign up for free"**
3. Vul in:
   - **Email:** Jouw email
   - **Wachtwoord:** Kies een sterk wachtwoord
   - **Cloud name:** `tafeltotaal` (of iets anders dat je leuk vindt)
     - ⚠️ **Onthoud deze naam goed!** Je kunt hem later niet meer wijzigen
4. Klik op **"Create Account"**
5. **Bevestig je email** (check je inbox)

### Stap 2: Credentials Ophalen
1. Log in op Cloudinary
2. Je komt nu op het **Dashboard**
3. Je ziet een blok met **"Account Details"** (rechtsboven of midden)
4. Daar staan 3 belangrijke dingen:
   ```
   Cloud name:  tafeltotaal
   API Key:     123456789012345
   API Secret:  abcdefghijklmnopqrstuvwxyz123
   ```

### Stap 3: Credentials in Railway Zetten
1. Ga naar **Railway** → Je project → **backend service** → **Variables**
2. Vul de volgende 3 variabelen in:

   **`CLOUDINARY_CLOUD_NAME`**
   - Vervang `*******` door je **Cloud name** (bijv. `tafeltotaal`)

   **`CLOUDINARY_API_KEY`**
   - Vervang `*******` door je **API Key** (bijv. `123456789012345`)

   **`CLOUDINARY_API_SECRET`**
   - Vervang `*******` door je **API Secret** (bijv. `abcdefghijklmnopqrstuvwxyz123`)

3. Klik op **"Save"** of druk op Enter

### 💡 Tip: Upload Preset Aanmaken (Optioneel maar handig)
1. Ga in Cloudinary naar **Settings** (tandwiel icoon) → **Upload**
2. Scroll naar beneden naar **"Upload presets"**
3. Klik op **"Add upload preset"**
4. Vul in:
   - **Preset name:** `tafel-totaal-products`
   - **Signing Mode:** `Unsigned`
   - **Folder:** `products`
5. Klik op **"Save"**

---

## 3️⃣ RESEND - Emails Versturen

### Wat is Resend?
Resend stuurt automatisch emails naar je klanten (bevestigingen, facturen, etc.)

### Stap 1: Account Aanmaken
1. Ga naar: **https://resend.com/signup**
2. Klik op **"Sign up"**
3. Vul in:
   - **Email:** Jouw email
   - **Wachtwoord:** Kies een sterk wachtwoord
4. Klik op **"Create Account"**
5. **Bevestig je email** (check je inbox)

### Stap 2: API Key Aanmaken
1. Log in op Resend
2. Ga naar **"API Keys"** in het menu (links)
3. Klik op **"Create API Key"**
4. Vul in:
   - **Name:** `Tafel Totaal Production`
   - **Permission:** `Sending access` (standaard)
5. Klik op **"Create"**
6. **Kopieer de API key** (je ziet hem maar 1 keer!)
   - Het ziet eruit als: `re_123abc456def789ghi012jkl345mno678`

### Stap 3: API Key in Railway Zetten
1. Ga naar **Railway** → Je project → **backend service** → **Variables**
2. Zoek de variabele: **`RESEND_API_KEY`**
3. **Vervang** `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` door jouw echte API key
4. Klik op **"Save"** of druk op Enter

### Stap 4: Domein Verificatie (Later, voor nu niet nodig)
- Voor nu kun je emails versturen vanaf `onboarding@resend.dev`
- Later kun je je eigen domein toevoegen (bijv. `noreply@tafeltotaal.be`)
- Dat doe je via **"Domains"** in Resend → **"Add Domain"**

---

## 4️⃣ NETLIFY - Website Hosting

### Wat is Netlify?
Netlify host je website (de frontend waar klanten op klikken)

### Stap 1: Account Aanmaken
1. Ga naar: **https://app.netlify.com/signup**
2. Klik op **"Sign up with GitHub"** (makkelijkste optie)
3. Log in met je GitHub account
4. Geef Netlify toegang tot je repositories

### Stap 2: Site Deployen
1. Klik op **"Add new site"** → **"Import an existing project"**
2. Kies **"Deploy with GitHub"**
3. Zoek en selecteer: **`LeeLars/Tafel-Totaal`**
4. Configureer de build settings:
   ```
   Base directory:     (leeg laten)
   Build command:      (leeg laten voor nu)
   Publish directory:  public
   ```
5. Klik op **"Deploy site"**

### Stap 3: Site URL Ophalen
1. Na deployment zie je je site URL, bijvoorbeeld:
   ```
   https://amazing-cupcake-123abc.netlify.app
   ```
2. **Kopieer deze URL**

### Stap 4: Custom Domain Instellen (Optioneel)
1. Ga naar **"Site settings"** → **"Domain management"**
2. Klik op **"Add custom domain"**
3. Vul in: `tafeltotaal.be` (of `www.tafeltotaal.be`)
4. Volg de instructies om je DNS in te stellen bij je domein provider

### Stap 5: URLs in Railway Zetten
1. Ga naar **Railway** → Je project → **backend service** → **Variables**

   **`FRONTEND_URL`**
   - Vervang `*******` door je Netlify URL
   - Bijvoorbeeld: `https://amazing-cupcake-123abc.netlify.app`
   - (Later vervang je dit door `https://tafeltotaal.be`)

   **`CORS_ALLOWED_ORIGINS`**
   - Vervang `*******` door dezelfde Netlify URL
   - Bijvoorbeeld: `https://amazing-cupcake-123abc.netlify.app`

2. Klik op **"Save"** of druk op Enter

---

## 5️⃣ RAILWAY - Backend URL & Laatste Checks

### Stap 1: Backend URL Ophalen
1. Ga naar **Railway** → Je project → **backend service**
2. Klik op **"Settings"** tab
3. Scroll naar **"Networking"**
4. Klik op **"Generate Domain"**
5. Je krijgt nu een URL zoals:
   ```
   https://backend-production-a1b2.up.railway.app
   ```
6. **Kopieer deze URL**

### Stap 2: Backend URL in Railway Zetten
1. Ga naar **Variables** tab
2. Zoek de variabele: **`BACKEND_URL`**
3. **Vervang** `*******` door je Railway backend URL
4. Klik op **"Save"** of druk op Enter

### Stap 3: Webhook URL Fixen
1. Zoek de variabele: **`MOLLIE_WEBHOOK_URL`**
2. Je ziet nu: `${{RAILWAY_PUBLIC_DOMAIN}}/api/webhooks/mollie`
3. **Vervang dit** door je volledige URL:
   ```
   https://backend-production-a1b2.up.railway.app/api/webhooks/mollie
   ```
4. Klik op **"Save"** of druk op Enter

### Stap 4: Email From Adres Instellen
1. Zoek de variabele: **`EMAIL_FROM`**
2. **Vervang** `*******` door:
   ```
   Tafel Totaal <onboarding@resend.dev>
   ```
   (Later kun je dit veranderen naar `noreply@tafeltotaal.be`)
3. Klik op **"Save"** of druk op Enter

### Stap 5: JWT Secret Genereren
1. Zoek de variabele: **`JWT_SECRET`**
2. Je moet een lange, random string genereren
3. **Optie A:** Gebruik een online generator
   - Ga naar: https://www.random.org/strings/
   - Stel in: 64 characters, alleen letters en cijfers
   - Klik op **"Get Strings"**
   - Kopieer de gegenereerde string

4. **Optie B:** Gebruik je terminal (als je dat durft 😊)
   ```bash
   openssl rand -base64 48
   ```

5. **Plak de gegenereerde string** in Railway bij `JWT_SECRET`
6. Klik op **"Save"** of druk op Enter

---

## ✅ CHECKLIST - Ben je klaar?

Vink af wat je hebt ingevuld:

### Mollie
- [ ] Account aangemaakt
- [ ] Test API key gekopieerd
- [ ] `MOLLIE_API_KEY` ingevuld in Railway

### Cloudinary
- [ ] Account aangemaakt
- [ ] Cloud name, API Key en API Secret gekopieerd
- [ ] `CLOUDINARY_CLOUD_NAME` ingevuld in Railway
- [ ] `CLOUDINARY_API_KEY` ingevuld in Railway
- [ ] `CLOUDINARY_API_SECRET` ingevuld in Railway

### Resend
- [ ] Account aangemaakt
- [ ] API key aangemaakt en gekopieerd
- [ ] `RESEND_API_KEY` ingevuld in Railway
- [ ] `EMAIL_FROM` ingevuld in Railway

### Netlify
- [ ] Account aangemaakt
- [ ] Site gedeployed
- [ ] Site URL gekopieerd
- [ ] `FRONTEND_URL` ingevuld in Railway
- [ ] `CORS_ALLOWED_ORIGINS` ingevuld in Railway

### Railway
- [ ] Backend domain gegenereerd
- [ ] `BACKEND_URL` ingevuld in Railway
- [ ] `MOLLIE_WEBHOOK_URL` ingevuld in Railway (met volledige URL)
- [ ] `JWT_SECRET` gegenereerd en ingevuld in Railway

---

## 🚀 Volgende Stap

Als je alle checkboxes hebt afgevinkt, ben je klaar!

Je kunt nu:
1. Je backend service in Railway **redeploy**en (klik op "Deploy" → "Redeploy")
2. Wachten tot de deployment klaar is (groen vinkje)
3. Je backend testen via de Railway URL

**Test URL:** `https://jouw-backend-url.up.railway.app/health`

Als je een JSON response krijgt met `{"status":"ok"}`, dan werkt alles! 🎉

---

## 🆘 Hulp Nodig?

Als je ergens vastloopt:
1. Check of je alle stappen hebt gevolgd
2. Kijk of je geen typfouten hebt gemaakt bij het kopiëren
3. Vraag het aan mij! Ik help je verder 😊
