# Dashboard Login Fix - "Geen verbinding" Error

## Probleem Diagnose

Je krijgt de error **"Geen verbinding met de server"** wanneer je probeert in te loggen. Dit betekent dat de `fetch()` call naar Railway faalt **voordat** er een response komt.

## Oorzaak

De meest waarschijnlijke oorzaak is **CORS blocking**. De backend op Railway blokkeert requests van `https://leelars.github.io` omdat dit domein niet in de `CORS_ALLOWED_ORIGINS` staat.

## Oplossing: Railway Environment Variables

### 1. Ga naar Railway Dashboard
- Open je Railway project
- Klik op je backend service
- Ga naar **Variables** tab

### 2. Zet/Update deze variabelen:

```bash
# CORS - KRITIEK!
CORS_ALLOWED_ORIGINS=https://leelars.github.io,http://localhost:3000

# Cookie configuratie voor cross-site auth
COOKIE_SAMESITE=none
NODE_ENV=production

# Laat COOKIE_DOMAIN leeg (niet instellen!)
```

### 3. Herstart de service
Railway herstart automatisch na het opslaan van variabelen.

## Verificatie Stappen

### Test 1: Check of Railway backend online is
Open in je browser:
```
https://tafel-totaal-production.up.railway.app/health
```

**Verwacht resultaat:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-09T..."
}
```

Als dit **niet** werkt → Railway backend is offline/crashed.

### Test 2: Check CORS in browser
1. Ga naar `https://leelars.github.io/Tafel-Totaal/login.html`
2. Open DevTools (F12) → Console tab
3. Voer uit:
```javascript
fetch('https://tafel-totaal-production.up.railway.app/health')
  .then(r => r.json())
  .then(d => console.log('✅ CORS OK:', d))
  .catch(e => console.error('❌ CORS BLOCKED:', e));
```

**Als je ziet:**
- `✅ CORS OK: {status: "ok", ...}` → CORS werkt, probleem ligt elders
- `❌ CORS BLOCKED: TypeError: Failed to fetch` → CORS blokkeert, fix Railway env vars

### Test 3: Test login flow
1. Blijf in DevTools → Network tab
2. Probeer in te loggen met je admin credentials
3. Zoek de `POST /api/auth/login` request
4. Check de response:

**Mogelijke resultaten:**
- **Geen request zichtbaar** → Frontend JS error, check Console tab
- **Status (failed) net:ERR_FAILED** → CORS of network issue
- **Status 401** → Verkeerde credentials
- **Status 200** → Login succesvol, maar cookie werkt niet (check COOKIE_SAMESITE)

## Huidige Frontend Status

✅ **Correct geconfigureerd:**
- API Base URL: `https://tafel-totaal-production.up.railway.app`
- Credentials: `include` (stuurt cookies mee)
- Login redirect: `/Tafel-Totaal/admin/index.html`
- Component fetch paths: werken op GitHub Pages

## Backend Checklist

Op Railway moet je hebben:

| Variable | Waarde | Status |
|----------|--------|--------|
| `CORS_ALLOWED_ORIGINS` | `https://leelars.github.io,http://localhost:3000` | ❓ Check |
| `COOKIE_SAMESITE` | `none` | ❓ Check |
| `NODE_ENV` | `production` | ❓ Check |
| `COOKIE_DOMAIN` | (leeg/niet ingesteld) | ❓ Check |
| `DATABASE_URL` | (je Postgres URL) | ✅ Waarschijnlijk OK |
| `JWT_SECRET` | (je secret) | ✅ Waarschijnlijk OK |

## Veelvoorkomende Fouten

### Fout 1: CORS_ALLOWED_ORIGINS mist GitHub Pages domein
```bash
# ❌ FOUT
CORS_ALLOWED_ORIGINS=http://localhost:3000

# ✅ CORRECT
CORS_ALLOWED_ORIGINS=https://leelars.github.io,http://localhost:3000
```

### Fout 2: COOKIE_SAMESITE staat op 'lax'
```bash
# ❌ FOUT (werkt niet voor cross-site)
COOKIE_SAMESITE=lax

# ✅ CORRECT
COOKIE_SAMESITE=none
```

### Fout 3: NODE_ENV niet op production
```bash
# ❌ FOUT (cookies niet secure)
NODE_ENV=development

# ✅ CORRECT
NODE_ENV=production
```

### Fout 4: COOKIE_DOMAIN ingesteld
```bash
# ❌ FOUT (werkt niet voor cross-site)
COOKIE_DOMAIN=.tafeltotaal.be

# ✅ CORRECT
# (variabele niet instellen, of leeg laten)
```

## Als het nog steeds niet werkt

### Check Railway Logs
1. Ga naar Railway dashboard
2. Klik op je backend service
3. Ga naar **Deployments** tab
4. Klik op de laatste deployment
5. Check de logs voor errors

**Zoek naar:**
- `CORS blocked for origin: https://leelars.github.io` → CORS issue
- `Missing required environment variable` → Env var ontbreekt
- Database connection errors → Database issue

### Alternatieve Test (zonder CORS)
Als CORS het probleem is, test dan lokaal:
1. Clone de repo
2. Start backend lokaal: `cd backend && npm run dev`
3. Update `public/js/lib/api.js` regel 7-9:
```javascript
const API_BASE_URL = 'http://localhost:3000';
```
4. Test login op `http://localhost:5500/public/login.html`

Als dit **wel** werkt → probleem is 100% CORS op Railway.

## Contact Info

Als je na deze stappen nog steeds problemen hebt, stuur dan:
1. Screenshot van Railway Variables tab
2. Screenshot van browser DevTools Console + Network tab bij login poging
3. Railway deployment logs (laatste 50 regels)
