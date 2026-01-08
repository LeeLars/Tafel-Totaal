# Deployment Guide - Tafel Totaal

## Overzicht

| Component | Platform | URL |
|-----------|----------|-----|
| Backend API | Railway | `https://tafel-totaal-production.up.railway.app` |
| Frontend | Netlify | `https://tafel-totaal.netlify.app` |
| Database | Railway PostgreSQL | Automatisch gekoppeld |

---

## 1. Backend Deployment (Railway)

### Stap 1: Railway Project Setup

1. Ga naar [railway.app](https://railway.app) en log in
2. Klik op "New Project" → "Deploy from GitHub repo"
3. Selecteer de `Tafel Totaal` repository
4. Kies de `backend` folder als root directory

### Stap 2: Environment Variables

Ga naar Settings → Variables en voeg toe:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<genereer-een-veilige-random-string>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://tafel-totaal.netlify.app
BACKEND_URL=https://tafel-totaal-production.up.railway.app
CORS_ALLOWED_ORIGINS=https://tafel-totaal.netlify.app
COOKIE_SAMESITE=none
MOLLIE_API_KEY=live_xxxxxxxxxxx
MOLLIE_WEBHOOK_URL=https://tafel-totaal-production.up.railway.app/api/webhooks/mollie
RESEND_API_KEY=re_xxxxxxxxxxx
EMAIL_FROM=Tafel Totaal <noreply@tafeltotaal.be>
```

### Stap 3: Database Setup

1. Klik op "New" → "Database" → "PostgreSQL"
2. Railway koppelt automatisch `DATABASE_URL`
3. Run database migratie:
   ```bash
   railway run npm run db:migrate
   railway run npm run db:seed
   ```

### Stap 4: Deploy

Railway deployt automatisch bij elke push naar main. Check:
- Build logs voor errors
- Health endpoint: `https://your-app.up.railway.app/health`

---

## 2. Frontend Deployment (Netlify)

### Stap 1: Netlify Setup

1. Ga naar [netlify.com](https://netlify.com) en log in
2. Klik op "Add new site" → "Import an existing project"
3. Selecteer de `Tafel Totaal` repository
4. **Belangrijk:** Stel in:
   - Base directory: `public`
   - Build command: (leeg laten)
   - Publish directory: `.`

### Stap 2: Deploy Settings

De `netlify.toml` in `/public` regelt:
- Redirects voor SPA-achtig gedrag
- Security headers
- Caching voor static assets
- Custom 404 pagina

### Stap 3: Custom Domain (optioneel)

1. Ga naar Domain settings
2. Voeg custom domain toe: `www.tafeltotaal.be`
3. Configureer DNS bij je domain provider

---

## 3. Post-Deployment Checklist

### Backend Checks
- [ ] Health endpoint werkt: `/health`
- [ ] Database connectie OK
- [ ] CORS headers correct
- [ ] Cookies worden gezet (check `Set-Cookie` header)

### Frontend Checks
- [ ] Homepage laadt
- [ ] Header/footer componenten laden
- [ ] API calls werken (check Network tab)
- [ ] Login/register werkt
- [ ] Cart functionaliteit werkt

### Integratie Checks
- [ ] Volledige checkout flow testen
- [ ] Mollie payment testen (test mode eerst)
- [ ] Admin dashboard toegankelijk
- [ ] PDF generatie werkt

---

## 4. Troubleshooting

### CORS Errors
```
Access to fetch at 'https://api...' from origin 'https://frontend...' has been blocked by CORS
```
**Oplossing:** Check `CORS_ALLOWED_ORIGINS` in backend env vars.

### Cookie Auth Faalt
```
401 Unauthorized - cookies worden niet meegestuurd
```
**Oplossing:** 
1. Check `COOKIE_SAMESITE=none` in backend
2. Check `credentials: 'include'` in frontend fetch calls
3. Backend moet HTTPS zijn voor `SameSite=None`

### Database Connection Failed
```
Error: connect ECONNREFUSED
```
**Oplossing:** Check `DATABASE_URL` format en of PostgreSQL service draait.

### Mollie Webhook Niet Ontvangen
**Oplossing:**
1. Check `MOLLIE_WEBHOOK_URL` is publiek bereikbaar
2. Check Mollie dashboard voor webhook logs
3. Zorg dat URL HTTPS is

---

## 5. Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `development` of `production` |
| `PORT` | Yes | Server port (Railway sets this) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret voor JWT tokens |
| `FRONTEND_URL` | Yes | Frontend URL voor redirects |
| `BACKEND_URL` | Yes | Backend URL voor links in emails |
| `CORS_ALLOWED_ORIGINS` | Yes | Comma-separated allowed origins |
| `COOKIE_SAMESITE` | Yes | `lax` (local) of `none` (cross-domain) |
| `MOLLIE_API_KEY` | Yes | Mollie API key |
| `MOLLIE_WEBHOOK_URL` | Yes | Webhook URL voor Mollie |
| `RESEND_API_KEY` | No | Resend API key (empty = skip emails) |
| `CLOUDINARY_*` | No | Cloudinary credentials (empty = skip) |

---

## 6. Lokaal Testen

### Backend starten
```bash
cd backend
npm install
npm run dev
```
Server draait op `http://localhost:3000`

### Frontend starten
```bash
cd public
npx serve .
# of
python -m http.server 8080
```
Frontend draait op `http://localhost:8080`

### Database migratie
```bash
cd backend
npm run db:migrate
npm run db:seed
```
