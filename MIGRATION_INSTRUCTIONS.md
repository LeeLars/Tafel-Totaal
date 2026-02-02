# Migration 014 - Product Components

## Probleem
De backend endpoints voor product components falen omdat de database tabel nog niet bestaat.

## Oplossing: Migratie draaien op Railway

### Optie 1: Via Railway Dashboard (Makkelijkst)

1. Ga naar [Railway Dashboard](https://railway.app)
2. Open je project "Tafel Totaal"
3. Klik op de **PostgreSQL** service
4. Klik op **Data** tab
5. Klik op **Query** knop
6. Kopieer en plak de volgende SQL:

```sql
-- PRODUCT COMPONENTS / SETS
-- Allows products to be composed of other products
-- Example: Theeset contains Theekan, Melkkan, Suikerpot

-- Table to define which products are components of other products
CREATE TABLE IF NOT EXISTS product_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  component_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(parent_product_id, component_product_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_components_parent ON product_components(parent_product_id);
CREATE INDEX IF NOT EXISTS idx_product_components_component ON product_components(component_product_id);

-- Add a flag to products to indicate if it's a set/bundle
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_set BOOLEAN DEFAULT false;

-- Add comment for clarity
COMMENT ON TABLE product_components IS 'Defines product composition - which products are made up of other products';
COMMENT ON COLUMN product_components.parent_product_id IS 'The set/bundle product (e.g., Theeset)';
COMMENT ON COLUMN product_components.component_product_id IS 'The individual component (e.g., Theekan)';
COMMENT ON COLUMN product_components.quantity IS 'How many of this component are in the set';
COMMENT ON COLUMN products.is_set IS 'True if this product is composed of other products';
```

7. Klik **Run Query**
8. Je zou moeten zien: "Query executed successfully"

### Optie 2: Via Railway CLI

```bash
# In de backend folder
cd backend

# Zet DATABASE_URL environment variable
export DATABASE_URL="postgresql://..." # Haal dit op uit Railway dashboard

# Run de migratie
npm run migrate:014
```

### Verificatie

Na het draaien van de migratie, refresh de CMS pagina en probeer opnieuw een component toe te voegen.
De errors in de console zouden moeten verdwijnen en je zou producten moeten kunnen zoeken.

## Wat doet deze migratie?

1. **Maakt `product_components` tabel aan** - Definieert welke producten onderdeel zijn van andere producten
2. **Voegt indexes toe** - Voor snelle lookups
3. **Voegt `is_set` kolom toe** - Markeert producten die sets zijn

## Voorbeeld gebruik

Na de migratie kun je in de CMS:
- Een "Theeset" product maken
- Componenten toevoegen: Theekan (1x), Melkkan (1x), Suikerpot (1x)
- De voorraad wordt automatisch gesynchroniseerd tussen de set en de losse items
