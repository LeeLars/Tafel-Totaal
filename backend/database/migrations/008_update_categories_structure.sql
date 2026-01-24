-- ============================================
-- UPDATE CATEGORIES STRUCTURE
-- Reorganize categories and subcategories according to new structure
-- Run this migration carefully - it preserves existing products
-- ============================================

-- Step 1: Clear ALL product subcategory references first (to avoid FK constraint)
UPDATE products SET subcategory_id = NULL;

-- Step 2: Delete ALL existing subcategories (we'll recreate them)
DELETE FROM subcategories;

-- Step 3: Deactivate old categories (don't delete to preserve foreign keys)
UPDATE categories SET is_active = false WHERE slug NOT IN ('servies', 'bestek', 'glaswerk', 'decoratie', 'tafels-stoelen');

-- Step 4: Upsert main categories (insert or update if exists)
INSERT INTO categories (name, slug, description, sort_order, is_active) VALUES
('Servies', 'servies', 'Borden, kommen, schalen en serveermateriaal', 1, true),
('Bestek', 'bestek', 'Messen, vorken, lepels en serveertangen', 2, true),
('Glaswerk', 'glaswerk', 'Wijnglazen, champagneglazen en drinkglazen', 3, true),
('Decoratie', 'decoratie', 'Tafellinnen, kaarsen en tafelaccessoires', 4, true),
('Tafels & Stoelen', 'tafels-stoelen', 'Tafels, stoelen, statafels en barkrukken', 5, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  updated_at = NOW();

-- Step 4: Insert SERVIES subcategories
INSERT INTO subcategories (category_id, name, slug, sort_order, is_active) VALUES
((SELECT id FROM categories WHERE slug = 'servies'), 'Dinerborden', 'dinerborden', 1, true),
((SELECT id FROM categories WHERE slug = 'servies'), 'Dessertborden', 'dessertborden', 2, true),
((SELECT id FROM categories WHERE slug = 'servies'), 'Kommen & Schalen', 'kommen-schalen', 3, true),
((SELECT id FROM categories WHERE slug = 'servies'), 'Theesets', 'theesets', 4, true),
((SELECT id FROM categories WHERE slug = 'servies'), 'Serveerschalen & Etagères', 'serveerschalen-etageres', 5, true);

-- Step 5: Insert BESTEK subcategories
INSERT INTO subcategories (category_id, name, slug, sort_order, is_active) VALUES
((SELECT id FROM categories WHERE slug = 'bestek'), 'Messen', 'messen', 1, true),
((SELECT id FROM categories WHERE slug = 'bestek'), 'Vorken', 'vorken', 2, true),
((SELECT id FROM categories WHERE slug = 'bestek'), 'Lepels', 'lepels', 3, true),
((SELECT id FROM categories WHERE slug = 'bestek'), 'Dessertbestek', 'dessertbestek', 4, true),
((SELECT id FROM categories WHERE slug = 'bestek'), 'Serveertangen & -lepels', 'serveertangen-lepels', 5, true);

-- Step 6: Insert GLASWERK subcategories
INSERT INTO subcategories (category_id, name, slug, sort_order, is_active) VALUES
((SELECT id FROM categories WHERE slug = 'glaswerk'), 'Wijnglazen', 'wijnglazen', 1, true),
((SELECT id FROM categories WHERE slug = 'glaswerk'), 'Champagneglazen', 'champagneglazen', 2, true),
((SELECT id FROM categories WHERE slug = 'glaswerk'), 'Cocktailglazen', 'cocktailglazen', 3, true),
((SELECT id FROM categories WHERE slug = 'glaswerk'), 'Water- & Frisdrankglazen', 'water-frisdrankglazen', 4, true),
((SELECT id FROM categories WHERE slug = 'glaswerk'), 'Koffie- & Theeglazen', 'koffie-theeglazen', 5, true);

-- Step 7: Insert DECORATIE subcategories
INSERT INTO subcategories (category_id, name, slug, sort_order, is_active) VALUES
((SELECT id FROM categories WHERE slug = 'decoratie'), 'Tafellinnen', 'tafellinnen', 1, true),
((SELECT id FROM categories WHERE slug = 'decoratie'), 'Kaarsen & Houders', 'kaarsen-houders', 2, true),
((SELECT id FROM categories WHERE slug = 'decoratie'), 'Tafelaccessoires', 'tafelaccessoires', 3, true),
((SELECT id FROM categories WHERE slug = 'decoratie'), 'Presentatie & Aankleding', 'presentatie-aankleding', 4, true);

-- Step 8: Insert TAFELS & STOELEN subcategories
INSERT INTO subcategories (category_id, name, slug, sort_order, is_active) VALUES
((SELECT id FROM categories WHERE slug = 'tafels-stoelen'), 'Tafels', 'tafels', 1, true),
((SELECT id FROM categories WHERE slug = 'tafels-stoelen'), 'Stoelen', 'stoelen', 2, true),
((SELECT id FROM categories WHERE slug = 'tafels-stoelen'), 'Statafels', 'statafels', 3, true),
((SELECT id FROM categories WHERE slug = 'tafels-stoelen'), 'Barkrukken', 'barkrukken', 4, true);

-- Step 9: Auto-map existing products to new categories/subcategories based on name patterns
-- Map old "borden" category products to Servies
UPDATE products SET 
  category_id = (SELECT id FROM categories WHERE slug = 'servies')
WHERE category_id IN (SELECT id FROM categories WHERE slug = 'borden');

-- Map dinerborden
UPDATE products SET 
  subcategory_id = (SELECT id FROM subcategories WHERE slug = 'dinerborden')
WHERE (name ILIKE '%dinerbord%' OR name ILIKE '%diner bord%')
  AND category_id = (SELECT id FROM categories WHERE slug = 'servies');

-- Map dessertborden
UPDATE products SET 
  subcategory_id = (SELECT id FROM subcategories WHERE slug = 'dessertborden')
WHERE (name ILIKE '%dessertbord%' OR name ILIKE '%dessert bord%' OR name ILIKE '%voorgerecht%')
  AND category_id = (SELECT id FROM categories WHERE slug = 'servies');

-- Map kommen & schalen
UPDATE products SET 
  subcategory_id = (SELECT id FROM subcategories WHERE slug = 'kommen-schalen')
WHERE (name ILIKE '%kom%' OR name ILIKE '%schaal%' OR name ILIKE '%bowl%' OR name ILIKE '%soep%')
  AND category_id = (SELECT id FROM categories WHERE slug = 'servies');

-- Map old "glazen" category products to Glaswerk
UPDATE products SET 
  category_id = (SELECT id FROM categories WHERE slug = 'glaswerk')
WHERE category_id IN (SELECT id FROM categories WHERE slug = 'glazen');

-- Map wijnglazen
UPDATE products SET 
  subcategory_id = (SELECT id FROM subcategories WHERE slug = 'wijnglazen')
WHERE (name ILIKE '%wijnglas%' OR name ILIKE '%wijn glas%')
  AND category_id = (SELECT id FROM categories WHERE slug = 'glaswerk');

-- Map champagneglazen
UPDATE products SET 
  subcategory_id = (SELECT id FROM subcategories WHERE slug = 'champagneglazen')
WHERE (name ILIKE '%champagne%' OR name ILIKE '%flute%')
  AND category_id = (SELECT id FROM categories WHERE slug = 'glaswerk');

-- Map water/frisdrankglazen
UPDATE products SET 
  subcategory_id = (SELECT id FROM subcategories WHERE slug = 'water-frisdrankglazen')
WHERE (name ILIKE '%waterglas%' OR name ILIKE '%water glas%' OR name ILIKE '%longdrink%' OR name ILIKE '%frisdrank%')
  AND category_id = (SELECT id FROM categories WHERE slug = 'glaswerk');

-- Map bestek subcategories
UPDATE products SET 
  subcategory_id = (SELECT id FROM subcategories WHERE slug = 'vorken')
WHERE name ILIKE '%vork%'
  AND category_id = (SELECT id FROM categories WHERE slug = 'bestek');

UPDATE products SET 
  subcategory_id = (SELECT id FROM subcategories WHERE slug = 'messen')
WHERE name ILIKE '%mes%'
  AND category_id = (SELECT id FROM categories WHERE slug = 'bestek');

UPDATE products SET 
  subcategory_id = (SELECT id FROM subcategories WHERE slug = 'lepels')
WHERE name ILIKE '%lepel%'
  AND category_id = (SELECT id FROM categories WHERE slug = 'bestek');

-- Map old "linnen" category to Decoratie > Tafellinnen
UPDATE products SET 
  category_id = (SELECT id FROM categories WHERE slug = 'decoratie'),
  subcategory_id = (SELECT id FROM subcategories WHERE slug = 'tafellinnen')
WHERE category_id IN (SELECT id FROM categories WHERE slug = 'linnen');

-- Map old "koffie-thee" category to Servies > Theesets
UPDATE products SET 
  category_id = (SELECT id FROM categories WHERE slug = 'servies'),
  subcategory_id = (SELECT id FROM subcategories WHERE slug = 'theesets')
WHERE category_id IN (SELECT id FROM categories WHERE slug = 'koffie-thee');

-- Map old "buffet" category to Servies > Serveerschalen & Etagères
UPDATE products SET 
  category_id = (SELECT id FROM categories WHERE slug = 'servies'),
  subcategory_id = (SELECT id FROM subcategories WHERE slug = 'serveerschalen-etageres')
WHERE category_id IN (SELECT id FROM categories WHERE slug = 'buffet');

-- Note: "Alle Producten" is NOT a database category - it's a frontend filter state
-- Products without category filter = all products
