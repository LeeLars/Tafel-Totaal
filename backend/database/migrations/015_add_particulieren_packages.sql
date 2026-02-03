-- ============================================
-- ADD PARTICULIEREN PACKAGES
-- Pakketten voor particulieren doelgroep
-- ============================================

-- 1. Tuinfeest Pakket
INSERT INTO packages (name, slug, description, short_description, service_level, pricing_type, base_price, price_per_extra_day, forfait_days, min_persons, max_persons, damage_compensation_percentage, is_featured, sort_order, images)
VALUES (
  'Tuinfeest Pakket', 
  'tuinfeest-pakket', 
  'Alles voor een onvergetelijk tuinfeest. Casual maar stijlvol servies dat tegen een stootje kan. Perfect voor BBQ''s, zomerfeesten en gezellige bijeenkomsten in de tuin. Inclusief borden, bestek en glazen.',
  'Casual servies voor buiten',
  'STANDAARD', 
  'FORFAIT', 
  3.50, 
  1.00, 
  3, 
  20, 
  100, 
  20, 
  true, 
  10,
  '["/images/collections/tuinfeest-pakket.jpg"]'
);

-- Items for Tuinfeest Pakket
INSERT INTO package_items (package_id, product_id, quantity_per_person, is_optional, extra_price) VALUES
((SELECT id FROM packages WHERE slug = 'tuinfeest-pakket'), (SELECT id FROM products WHERE sku = 'BD-STD-001'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'tuinfeest-pakket'), (SELECT id FROM products WHERE sku = 'BD-STD-003'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'tuinfeest-pakket'), (SELECT id FROM products WHERE sku = 'BT-STD-001'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'tuinfeest-pakket'), (SELECT id FROM products WHERE sku = 'BT-STD-002'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'tuinfeest-pakket'), (SELECT id FROM products WHERE sku = 'GL-STD-002'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'tuinfeest-pakket'), (SELECT id FROM products WHERE sku = 'GL-STD-003'), 1, false, 0);

-- 2. Verjaardagsdiner Pakket
INSERT INTO packages (name, slug, description, short_description, service_level, pricing_type, base_price, price_per_extra_day, forfait_days, min_persons, max_persons, damage_compensation_percentage, is_featured, sort_order, images)
VALUES (
  'Verjaardagsdiner Pakket', 
  'verjaardag-pakket', 
  'Vier je verjaardag in stijl met dit complete dinerpakket. Van voorgerecht tot dessert, wij zorgen dat je tafel er prachtig uitziet. Perfect voor een elegant diner thuis met vrienden en familie.',
  'Elegant servies voor een verjaardagsdiner',
  'STANDAARD', 
  'FORFAIT', 
  5.50, 
  1.50, 
  3, 
  10, 
  50, 
  20, 
  true, 
  11,
  '["/images/collections/verjaardag-pakket.jpg"]'
);

-- Items for Verjaardagsdiner Pakket
INSERT INTO package_items (package_id, product_id, quantity_per_person, is_optional, extra_price) VALUES
((SELECT id FROM packages WHERE slug = 'verjaardag-pakket'), (SELECT id FROM products WHERE sku = 'BD-STD-001'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'verjaardag-pakket'), (SELECT id FROM products WHERE sku = 'BD-STD-002'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'verjaardag-pakket'), (SELECT id FROM products WHERE sku = 'BD-STD-003'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'verjaardag-pakket'), (SELECT id FROM products WHERE sku = 'BT-STD-001'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'verjaardag-pakket'), (SELECT id FROM products WHERE sku = 'BT-STD-002'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'verjaardag-pakket'), (SELECT id FROM products WHERE sku = 'BT-STD-003'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'verjaardag-pakket'), (SELECT id FROM products WHERE sku = 'GL-STD-001'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'verjaardag-pakket'), (SELECT id FROM products WHERE sku = 'GL-STD-002'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'verjaardag-pakket'), (SELECT id FROM products WHERE sku = 'GL-STD-003'), 1, false, 0);

-- 3. BBQ Servies Set
INSERT INTO packages (name, slug, description, short_description, service_level, pricing_type, base_price, price_per_extra_day, forfait_days, min_persons, max_persons, damage_compensation_percentage, is_featured, sort_order, images)
VALUES (
  'BBQ Servies Set', 
  'bbq-servies', 
  'Robuust servies voor een gezellige BBQ. Geen papieren bordjes die doorbuigen, maar stevig porselein en goed bestek. Perfect voor grote groepen en outdoor events.',
  'Robuust servies voor BBQ',
  'STANDAARD', 
  'FORFAIT', 
  2.50, 
  0.75, 
  3, 
  15, 
  100, 
  20, 
  true, 
  12,
  '["/images/collections/bbq-servies.jpg"]'
);

-- Items for BBQ Servies Set
INSERT INTO package_items (package_id, product_id, quantity_per_person, is_optional, extra_price) VALUES
((SELECT id FROM packages WHERE slug = 'bbq-servies'), (SELECT id FROM products WHERE sku = 'BD-STD-001'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'bbq-servies'), (SELECT id FROM products WHERE sku = 'BT-STD-001'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'bbq-servies'), (SELECT id FROM products WHERE sku = 'BT-STD-002'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'bbq-servies'), (SELECT id FROM products WHERE sku = 'GL-STD-003'), 1, false, 0);
