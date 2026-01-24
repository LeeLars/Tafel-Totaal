-- ============================================
-- ADD EXTRA SUBCATEGORIES
-- Adds recommended subcategories (safe - checks if exists first)
-- ============================================

-- SERVIES: Add Soepborden/Pastaborden (if not exists)
INSERT INTO subcategories (category_id, name, slug, sort_order, is_active)
SELECT (SELECT id FROM categories WHERE slug = 'servies'), 'Soepborden & Pastaborden', 'soepborden-pastaborden', 3, true
WHERE NOT EXISTS (SELECT 1 FROM subcategories WHERE slug = 'soepborden-pastaborden');

-- SERVIES: Add Broodbordjes & Side Plates (if not exists)
INSERT INTO subcategories (category_id, name, slug, sort_order, is_active)
SELECT (SELECT id FROM categories WHERE slug = 'servies'), 'Broodbordjes & Side Plates', 'broodbordjes-sideplates', 4, true
WHERE NOT EXISTS (SELECT 1 FROM subcategories WHERE slug = 'broodbordjes-sideplates');

-- Reorder Servies subcategories for logical flow
UPDATE subcategories SET sort_order = 1 WHERE slug = 'dinerborden';
UPDATE subcategories SET sort_order = 2 WHERE slug = 'dessertborden';
UPDATE subcategories SET sort_order = 3 WHERE slug = 'soepborden-pastaborden';
UPDATE subcategories SET sort_order = 4 WHERE slug = 'broodbordjes-sideplates';
UPDATE subcategories SET sort_order = 5 WHERE slug = 'kommen-schalen';
UPDATE subcategories SET sort_order = 6 WHERE slug = 'theesets';
UPDATE subcategories SET sort_order = 7 WHERE slug = 'serveerschalen-etageres';

-- GLASWERK: Add Bierglazen (if not exists)
INSERT INTO subcategories (category_id, name, slug, sort_order, is_active)
SELECT (SELECT id FROM categories WHERE slug = 'glaswerk'), 'Bierglazen', 'bierglazen', 5, true
WHERE NOT EXISTS (SELECT 1 FROM subcategories WHERE slug = 'bierglazen');

-- GLASWERK: Add Karaffen & Kannen (if not exists)
INSERT INTO subcategories (category_id, name, slug, sort_order, is_active)
SELECT (SELECT id FROM categories WHERE slug = 'glaswerk'), 'Karaffen & Kannen', 'karaffen-kannen', 7, true
WHERE NOT EXISTS (SELECT 1 FROM subcategories WHERE slug = 'karaffen-kannen');

-- Reorder Glaswerk subcategories for logical flow
UPDATE subcategories SET sort_order = 1 WHERE slug = 'wijnglazen';
UPDATE subcategories SET sort_order = 2 WHERE slug = 'champagneglazen';
UPDATE subcategories SET sort_order = 3 WHERE slug = 'cocktailglazen';
UPDATE subcategories SET sort_order = 4 WHERE slug = 'water-frisdrankglazen';
UPDATE subcategories SET sort_order = 5 WHERE slug = 'bierglazen';
UPDATE subcategories SET sort_order = 6 WHERE slug = 'koffie-theeglazen';
UPDATE subcategories SET sort_order = 7 WHERE slug = 'karaffen-kannen';
