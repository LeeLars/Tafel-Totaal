# 📧 Email Configuratie - Tafel Totaal

## Waarom werken emails niet?

De backend is geconfigureerd om emails te versturen via **Resend** (moderne email service), maar de `RESEND_API_KEY` moet ingesteld worden in Railway.

## ✅ Wat er nodig is:

### 1. Resend Account Aanmaken
1. Ga naar [resend.com](https://resend.com)
2. Maak een gratis account aan
3. Verifieer je domein (tafeltotaal.be) OF gebruik hun test domein
4. Genereer een API key

### 2. Environment Variable Instellen in Railway

**In Railway Dashboard:**
1. Ga naar je backend service
2. Klik op **"Variables"** tab
3. Voeg toe:
   ```
   RESEND_API_KEY=re_jouwAPIkey
   EMAIL_FROM=Tafel Totaal <noreply@tafeltotaal.be>
   ```
4. Deploy opnieuw (gebeurt automatisch)

### 3. Domein Verificatie (Optioneel maar Aanbevolen)

Voor productie emails vanuit `@tafeltotaal.be`:
1. Voeg DNS records toe in je domein provider
2. Resend geeft je de exacte records
3. Wacht op verificatie (~15 min)

## 🧪 Test Emails

**Zonder domein verificatie:**
- Gebruik Resend's test domein: `onboarding@resend.dev`
- Emails komen aan maar met "via resend.dev" label

**Met domein verificatie:**
- Emails komen van `noreply@tafeltotaal.be`
- Professionele afzender

## 📨 Welke Emails Worden Verstuurd?

1. **Order Bevestiging** - Direct na checkout
   - Bestelnummer
   - Items overzicht
   - Levering/afhaal details
   - Totaalbedrag

2. **Admin Notificatie** - Bij nieuwe order
   - Naar admin email
   - Snelle order samenvatting

3. **Betaling Bevestiging** - Na factuur betaling (toekomstig)

## 🔍 Controleren of Email Werkt

**In Railway Logs:**
```
✅ Emails enabled - Resend configured
📧 Order confirmation sent to customer@email.com
```

**Als emails uit staan:**
```
📧 Email disabled - skipping order confirmation
```

## 💰 Kosten

**Resend Free Tier:**
- 3,000 emails/maand GRATIS
- Meer dan genoeg voor start
- Upgrade later indien nodig

## 🚀 Snelle Setup (5 minuten)

1. **Resend.com** → Sign up
2. **Get API Key** → Kopieer
3. **Railway** → Variables → `RESEND_API_KEY=...`
4. **Test** → Plaats een order
5. **Check** → Email inbox

## ⚠️ Huidige Status

**Backend Code:** ✅ Volledig geïmplementeerd
**Email Service:** ✅ Resend geïntegreerd
**Environment Var:** ❌ Moet ingesteld worden in Railway

**Zodra `RESEND_API_KEY` is ingesteld, werken alle emails automatisch!**
