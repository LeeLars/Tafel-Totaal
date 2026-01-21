# Cloudinary Setup voor Image Upload

## Stap 1: Cloudinary Account
1. Ga naar https://cloudinary.com
2. Maak een gratis account aan (of log in)
3. Ga naar je Dashboard

## Stap 2: Cloud Name Ophalen
1. Op je Dashboard zie je je **Cloud Name** bovenaan
2. Kopieer deze naam (bijvoorbeeld: `dxyz123abc`)

## Stap 3: Upload Preset Aanmaken
1. Ga naar **Settings** (tandwiel icoon rechtsboven)
2. Klik op **Upload** tab
3. Scroll naar beneden naar **Upload presets**
4. Klik op **Add upload preset**
5. Vul in:
   - **Preset name**: `packages`
   - **Signing mode**: `Unsigned`
   - **Folder**: `tafel-totaal/packages`
   - **Unique filename**: ✅ Enabled
   - **Overwrite**: ✅ Enabled
   - **Use filename**: ✅ Enabled
6. Klik op **Save**

## Stap 4: Configuratie Updaten
1. Open het bestand: `/docs/js/config/cloudinary.js`
2. Vervang `YOUR_CLOUD_NAME` met je echte Cloud Name:
   ```javascript
   export const CLOUDINARY_CONFIG = {
     CLOUD_NAME: 'dxyz123abc', // ← Jouw cloud name hier
     UPLOAD_PRESET: 'packages',
     FOLDER: 'tafel-totaal/packages',
     MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
     ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp']
   };
   ```
3. Sla het bestand op
4. Commit en push naar GitHub

## Stap 5: Testen
1. Log in op het CMS admin panel
2. Ga naar **Pakketten**
3. Klik op **Nieuw Pakket** of bewerk een bestaand pakket
4. Klik op **Afbeelding uploaden**
5. Selecteer een afbeelding
6. De afbeelding zou moeten uploaden en een preview moeten tonen

## Troubleshooting

### Error: "Upload failed"
- Controleer of je Cloud Name correct is ingevuld
- Controleer of het upload preset `packages` bestaat
- Controleer of het preset op `Unsigned` staat

### Error: "Alleen afbeeldingen zijn toegestaan"
- Zorg dat je een geldig image bestand selecteert (jpg, png, gif, webp)
- Maximale bestandsgrootte is 5MB

### Afbeelding upload maar wordt niet opgeslagen
- Controleer of de backend de `image_url` field correct opslaat
- Check de browser console voor errors

## Beveiligingsnotitie
Het gebruik van een **unsigned upload preset** is veilig voor deze use case omdat:
- Alleen admins toegang hebben tot het CMS
- De folder is beperkt tot `tafel-totaal/packages`
- Er zijn file size en format restricties
- Cloudinary heeft rate limiting

Voor productie kan je overwegen om een **signed upload** te gebruiken via de backend voor extra beveiliging.
