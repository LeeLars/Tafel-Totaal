# Railway Environment Variables voor GitHub Pages Login

## Probleem
Je kunt niet inloggen op het admin dashboard op GitHub Pages omdat de **httpOnly cookies** niet correct worden meegestuurd tussen `leelars.github.io` (frontend) en `tafel-totaal-production.up.railway.app` (backend).

## Oplossing
Zet de volgende environment variables op Railway:

### 1. COOKIE_SAMESITE
```
COOKIE_SAMESITE=none
```
**Waarom:** Voor cross-site cookies (GitHub Pages → Railway) moet SameSite op `none` staan.

### 2. NODE_ENV
```
NODE_ENV=production
```
**Waarom:** Dit zorgt ervoor dat cookies automatisch `Secure` worden (vereist voor SameSite=none).

### 3. CORS_ALLOWED_ORIGINS
```
CORS_ALLOWED_ORIGINS=https://leelars.github.io,http://localhost:3000
```
**Waarom:** GitHub Pages domein moet expliciet toegestaan zijn voor CORS + credentials.

### 4. COOKIE_DOMAIN
```
COOKIE_DOMAIN=
```
**Waarom:** Laat dit **leeg** (niet instellen) voor cross-site cookies. Als je een domein instelt, werkt het alleen binnen dat domein.

## Hoe in te stellen op Railway

1. Ga naar je Railway project
2. Klik op je backend service
3. Ga naar **Variables** tab
4. Voeg bovenstaande variabelen toe/update ze
5. Railway zal automatisch herstarten

## Verificatie

Na het instellen:
1. Ga naar `https://leelars.github.io/Tafel-Totaal/login.html`
2. Log in met je admin credentials
3. Open DevTools → Network tab
4. Check de `POST /api/auth/login` request:
   - Response moet `Set-Cookie` header hebben met `SameSite=None; Secure`
5. Check de `GET /api/auth/me` request:
   - Request moet `Cookie` header hebben met `auth_token`
   - Response moet status `200` zijn (niet 401)

Als `/api/auth/me` nog steeds 401 geeft na deze wijzigingen, is er een ander probleem (maar dit lost 99% van de gevallen op).

## Huidige Frontend Status
✅ Login page laadt correct op GitHub Pages (`/Tafel-Totaal/login.html`)
✅ Guards redirecten correct naar login met base path
✅ Admin pages hebben correcte asset paths (`/Tafel-Totaal/...`)
✅ Login redirect gaat naar `/Tafel-Totaal/admin/index.html`

Het enige dat ontbreekt is de correcte cookie configuratie op Railway.
