# Locaties Import Systeem

Deze map is bedoeld voor het importeren van locatiedata via CSV bestanden.

## Hoe te gebruiken

1. **Plaats je CSV bestand** in deze map met de naam `locations.csv`

2. **CSV Formaat:**
   Het CSV bestand moet de volgende kolommen hebben (tab-separated):
   ```
   Provincie	Postcode	Naam	Type	Hoofdgemeente
   ```

   **Voorbeeld:**
   ```
   Oost-Vlaanderen	9000	Gent	Hoofdgemeente	GENT
   Oost-Vlaanderen	9050	Gentbrugge	Deelgemeente	GENT
   West-Vlaanderen	8000	Brugge	Hoofdgemeente	BRUGGE
   West-Vlaanderen	8310	Assebroek	Deelgemeente	BRUGGE
   ```

3. **Run het import script:**
   ```bash
   python3 import_locations_from_csv.py
   ```

4. **Het script zal:**
   - Je CSV bestand lezen
   - Alle locaties parsen
   - Een nieuw `all-locations.json` bestand genereren
   - Een backup maken van het oude bestand

## Kolom Uitleg

- **Provincie:** `Oost-Vlaanderen` of `West-Vlaanderen`
- **Postcode:** De postcode (bijv. `9000`, `8310`)
- **Naam:** De naam van de gemeente/deelgemeente
- **Type:** `Hoofdgemeente` of `Deelgemeente`
- **Hoofdgemeente:** De naam van de hoofdgemeente (in hoofdletters)

## Output

Het script genereert een nieuw `public/data/all-locations.json` bestand met alle locaties.
