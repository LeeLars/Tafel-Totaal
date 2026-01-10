-- ============================================
-- TAFEL TOTAAL SEED DATA
-- Test data voor development
-- ============================================

-- Service Levels
INSERT INTO service_levels (name, slug, description, sort_order) VALUES
('Standaard', 'standaard', 'Klassiek wit servies, perfect voor elke gelegenheid', 1),
('Luxe', 'luxe', 'Premium design servies met gouden accenten', 2);

-- Categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Borden', 'borden', 'Alle soorten borden voor elk gerecht', 1),
('Bestek', 'bestek', 'Vorken, messen en lepels', 2),
('Glazen', 'glazen', 'Wijnglazen, waterglazen en meer', 3),
('Linnen', 'linnen', 'Servetten en tafelkleden', 4),
('Buffet', 'buffet', 'Serveerschalen en buffetmateriaal', 5),
('Koffie & Thee', 'koffie-thee', 'Kopjes, schotels en theepotten', 6),
('Tafels & Stoelen', 'tafels-stoelen', 'Tafels en stoelen voor elk evenement', 7);

-- Subcategories
INSERT INTO subcategories (category_id, name, slug, sort_order) VALUES
((SELECT id FROM categories WHERE slug = 'borden'), 'Dinerborden', 'dinerborden', 1),
((SELECT id FROM categories WHERE slug = 'borden'), 'Voorgerechtborden', 'voorgerechtborden', 2),
((SELECT id FROM categories WHERE slug = 'borden'), 'Dessertborden', 'dessertborden', 3),
((SELECT id FROM categories WHERE slug = 'borden'), 'Soepborden', 'soepborden', 4),
((SELECT id FROM categories WHERE slug = 'bestek'), 'Tafelbestek', 'tafelbestek', 1),
((SELECT id FROM categories WHERE slug = 'bestek'), 'Dessertbestek', 'dessertbestek', 2),
((SELECT id FROM categories WHERE slug = 'glazen'), 'Wijnglazen', 'wijnglazen', 1),
((SELECT id FROM categories WHERE slug = 'glazen'), 'Waterglazen', 'waterglazen', 2),
((SELECT id FROM categories WHERE slug = 'glazen'), 'Champagneglazen', 'champagneglazen', 3);

-- Products - Standaard
INSERT INTO products (sku, name, slug, description, category_id, subcategory_id, service_level, price_per_day, damage_compensation_per_item, stock_total, stock_buffer, images) VALUES
('BD-STD-001', 'Dinerbord Wit', 'dinerbord-wit', 'Klassiek wit dinerbord, 27cm diameter', 
  (SELECT id FROM categories WHERE slug = 'borden'),
  (SELECT id FROM subcategories WHERE slug = 'dinerborden'),
  'STANDAARD', 0.50, 5.00, 500, 20, '["https://res.cloudinary.com/tafeltotaal/products/dinerbord-wit.jpg"]'),

('BD-STD-002', 'Voorgerechtbord Wit', 'voorgerechtbord-wit', 'Klassiek wit voorgerechtbord, 21cm diameter',
  (SELECT id FROM categories WHERE slug = 'borden'),
  (SELECT id FROM subcategories WHERE slug = 'voorgerechtborden'),
  'STANDAARD', 0.40, 4.00, 400, 15, '["https://res.cloudinary.com/tafeltotaal/products/voorgerechtbord-wit.jpg"]'),

('BD-STD-003', 'Dessertbord Wit', 'dessertbord-wit', 'Klassiek wit dessertbord, 18cm diameter',
  (SELECT id FROM categories WHERE slug = 'borden'),
  (SELECT id FROM subcategories WHERE slug = 'dessertborden'),
  'STANDAARD', 0.35, 3.50, 400, 15, '["https://res.cloudinary.com/tafeltotaal/products/dessertbord-wit.jpg"]'),

('BT-STD-001', 'Tafelvork Zilver', 'tafelvork-zilver', 'Klassieke tafelvork in zilverkleur',
  (SELECT id FROM categories WHERE slug = 'bestek'),
  (SELECT id FROM subcategories WHERE slug = 'tafelbestek'),
  'STANDAARD', 0.20, 2.00, 600, 25, '["https://res.cloudinary.com/tafeltotaal/products/tafelvork-zilver.jpg"]'),

('BT-STD-002', 'Tafelmes Zilver', 'tafelmes-zilver', 'Klassiek tafelmes in zilverkleur',
  (SELECT id FROM categories WHERE slug = 'bestek'),
  (SELECT id FROM subcategories WHERE slug = 'tafelbestek'),
  'STANDAARD', 0.20, 2.00, 600, 25, '["https://res.cloudinary.com/tafeltotaal/products/tafelmes-zilver.jpg"]'),

('BT-STD-003', 'Tafellepel Zilver', 'tafellepel-zilver', 'Klassieke tafellepel in zilverkleur',
  (SELECT id FROM categories WHERE slug = 'bestek'),
  (SELECT id FROM subcategories WHERE slug = 'tafelbestek'),
  'STANDAARD', 0.20, 2.00, 600, 25, '["https://res.cloudinary.com/tafeltotaal/products/tafellepel-zilver.jpg"]'),

('GL-STD-001', 'Wijnglas Rood', 'wijnglas-rood', 'Klassiek wijnglas voor rode wijn, 350ml',
  (SELECT id FROM categories WHERE slug = 'glazen'),
  (SELECT id FROM subcategories WHERE slug = 'wijnglazen'),
  'STANDAARD', 0.30, 3.00, 400, 20, '["https://res.cloudinary.com/tafeltotaal/products/wijnglas-rood.jpg"]'),

('GL-STD-002', 'Wijnglas Wit', 'wijnglas-wit', 'Klassiek wijnglas voor witte wijn, 300ml',
  (SELECT id FROM categories WHERE slug = 'glazen'),
  (SELECT id FROM subcategories WHERE slug = 'wijnglazen'),
  'STANDAARD', 0.30, 3.00, 400, 20, '["https://res.cloudinary.com/tafeltotaal/products/wijnglas-wit.jpg"]'),

('GL-STD-003', 'Waterglas', 'waterglas', 'Klassiek waterglas, 250ml',
  (SELECT id FROM categories WHERE slug = 'glazen'),
  (SELECT id FROM subcategories WHERE slug = 'waterglazen'),
  'STANDAARD', 0.25, 2.50, 500, 25, '["https://res.cloudinary.com/tafeltotaal/products/waterglas.jpg"]');

-- Products - Luxe
INSERT INTO products (sku, name, slug, description, category_id, subcategory_id, service_level, price_per_day, damage_compensation_per_item, stock_total, stock_buffer, images) VALUES
('BD-LUX-001', 'Dinerbord Design Goud', 'dinerbord-design-goud', 'Premium dinerbord met gouden rand, 27cm diameter',
  (SELECT id FROM categories WHERE slug = 'borden'),
  (SELECT id FROM subcategories WHERE slug = 'dinerborden'),
  'LUXE', 1.00, 10.00, 200, 10, '["https://res.cloudinary.com/tafeltotaal/products/dinerbord-design-goud.jpg"]'),

('BD-LUX-002', 'Voorgerechtbord Design Goud', 'voorgerechtbord-design-goud', 'Premium voorgerechtbord met gouden rand, 21cm diameter',
  (SELECT id FROM categories WHERE slug = 'borden'),
  (SELECT id FROM subcategories WHERE slug = 'voorgerechtborden'),
  'LUXE', 0.80, 8.00, 200, 10, '["https://res.cloudinary.com/tafeltotaal/products/voorgerechtbord-design-goud.jpg"]'),

('BT-LUX-001', 'Tafelvork Goud', 'tafelvork-goud', 'Premium tafelvork in goudkleur',
  (SELECT id FROM categories WHERE slug = 'bestek'),
  (SELECT id FROM subcategories WHERE slug = 'tafelbestek'),
  'LUXE', 0.50, 5.00, 300, 15, '["https://res.cloudinary.com/tafeltotaal/products/tafelvork-goud.jpg"]'),

('BT-LUX-002', 'Tafelmes Goud', 'tafelmes-goud', 'Premium tafelmes in goudkleur',
  (SELECT id FROM categories WHERE slug = 'bestek'),
  (SELECT id FROM subcategories WHERE slug = 'tafelbestek'),
  'LUXE', 0.50, 5.00, 300, 15, '["https://res.cloudinary.com/tafeltotaal/products/tafelmes-goud.jpg"]'),

('GL-LUX-001', 'Champagneflute Kristal', 'champagneflute-kristal', 'Premium champagneflute in kristal, 200ml',
  (SELECT id FROM categories WHERE slug = 'glazen'),
  (SELECT id FROM subcategories WHERE slug = 'champagneglazen'),
  'LUXE', 0.60, 6.00, 250, 15, '["https://res.cloudinary.com/tafeltotaal/products/champagneflute-kristal.jpg"]');

-- Packages
INSERT INTO packages (name, slug, description, short_description, service_level, pricing_type, base_price, price_per_extra_day, forfait_days, min_persons, max_persons, damage_compensation_percentage, is_featured, sort_order, images) VALUES
('Diner Basis', 'diner-basis', 
  'Het perfecte startpakket voor een stijlvol diner. Bevat alles wat je nodig hebt voor een hoofdgerecht: dinerborden, bestek en wijnglazen.',
  'Alles voor een stijlvol hoofdgerecht',
  'STANDAARD', 'FORFAIT', 4.50, 1.50, 3, 10, 100, 20, true, 1,
  '["https://res.cloudinary.com/tafeltotaal/packages/diner-basis.jpg"]'),

('Diner Compleet', 'diner-compleet',
  'Het complete dinerpakket voor een uitgebreid menu. Inclusief voor-, hoofd- en nagerecht borden, volledig bestek en diverse glazen.',
  'Compleet pakket voor een 3-gangen menu',
  'STANDAARD', 'FORFAIT', 7.50, 2.50, 3, 10, 100, 20, true, 2,
  '["https://res.cloudinary.com/tafeltotaal/packages/diner-compleet.jpg"]'),

('Diner Luxe', 'diner-luxe',
  'Ons premium pakket met design servies en gouden bestek. Voor events waar je indruk wilt maken.',
  'Premium servies met gouden accenten',
  'LUXE', 'FORFAIT', 12.50, 4.00, 3, 10, 80, 25, true, 3,
  '["https://res.cloudinary.com/tafeltotaal/packages/diner-luxe.jpg"]'),

('Cocktail Party', 'cocktail-party',
  'Alles voor een geslaagde cocktailparty. Champagneglazen, cocktailglazen en kleine hapjesbordjes.',
  'Perfect voor een stijlvolle receptie',
  'STANDAARD', 'FORFAIT', 5.00, 1.50, 3, 20, 150, 20, false, 4,
  '["https://res.cloudinary.com/tafeltotaal/packages/cocktail-party.jpg"]');

-- Package Items - Diner Basis
INSERT INTO package_items (package_id, product_id, quantity_per_person, is_optional, extra_price) VALUES
((SELECT id FROM packages WHERE slug = 'diner-basis'), (SELECT id FROM products WHERE sku = 'BD-STD-001'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'diner-basis'), (SELECT id FROM products WHERE sku = 'BT-STD-001'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'diner-basis'), (SELECT id FROM products WHERE sku = 'BT-STD-002'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'diner-basis'), (SELECT id FROM products WHERE sku = 'GL-STD-001'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'diner-basis'), (SELECT id FROM products WHERE sku = 'GL-STD-003'), 1, false, 0);

-- Package Items - Diner Compleet
INSERT INTO package_items (package_id, product_id, quantity_per_person, is_optional, extra_price) VALUES
((SELECT id FROM packages WHERE slug = 'diner-compleet'), (SELECT id FROM products WHERE sku = 'BD-STD-001'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'diner-compleet'), (SELECT id FROM products WHERE sku = 'BD-STD-002'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'diner-compleet'), (SELECT id FROM products WHERE sku = 'BD-STD-003'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'diner-compleet'), (SELECT id FROM products WHERE sku = 'BT-STD-001'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'diner-compleet'), (SELECT id FROM products WHERE sku = 'BT-STD-002'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'diner-compleet'), (SELECT id FROM products WHERE sku = 'BT-STD-003'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'diner-compleet'), (SELECT id FROM products WHERE sku = 'GL-STD-001'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'diner-compleet'), (SELECT id FROM products WHERE sku = 'GL-STD-002'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'diner-compleet'), (SELECT id FROM products WHERE sku = 'GL-STD-003'), 1, false, 0);

-- Package Items - Diner Luxe
INSERT INTO package_items (package_id, product_id, quantity_per_person, is_optional, extra_price) VALUES
((SELECT id FROM packages WHERE slug = 'diner-luxe'), (SELECT id FROM products WHERE sku = 'BD-LUX-001'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'diner-luxe'), (SELECT id FROM products WHERE sku = 'BD-LUX-002'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'diner-luxe'), (SELECT id FROM products WHERE sku = 'BT-LUX-001'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'diner-luxe'), (SELECT id FROM products WHERE sku = 'BT-LUX-002'), 1, false, 0),
((SELECT id FROM packages WHERE slug = 'diner-luxe'), (SELECT id FROM products WHERE sku = 'GL-LUX-001'), 2, false, 0),
((SELECT id FROM packages WHERE slug = 'diner-luxe'), (SELECT id FROM products WHERE sku = 'GL-STD-003'), 1, false, 0);

-- Cities (Delivery Zones)
INSERT INTO cities (name, slug, province, delivery_fee, postal_codes) VALUES
('Brugge', 'brugge', 'West-Vlaanderen', 0, '["8000", "8200", "8310", "8380"]'),
('Gent', 'gent', 'Oost-Vlaanderen', 15, '["9000", "9030", "9040", "9050"]'),
('Kortrijk', 'kortrijk', 'West-Vlaanderen', 10, '["8500", "8510", "8520"]'),
('Oostende', 'oostende', 'West-Vlaanderen', 15, '["8400", "8420", "8430"]'),
('Roeselare', 'roeselare', 'West-Vlaanderen', 10, '["8800", "8810", "8820"]'),
('Knokke-Heist', 'knokke-heist', 'West-Vlaanderen', 10, '["8300", "8301"]'),
('Aalst', 'aalst', 'Oost-Vlaanderen', 25, '["9300", "9310", "9320"]'),
('Sint-Niklaas', 'sint-niklaas', 'Oost-Vlaanderen', 25, '["9100", "9110", "9120"]');

-- Damage Compensation Rules
INSERT INTO damage_compensation_rules (name, description, min_order_value, max_order_value, compensation_type, compensation_value, max_compensation, priority) VALUES
('Standaard Schadevergoeding', 'Standaard schadevergoeding percentage voor alle bestellingen', 0, 500, 'percentage', 20, 100, 1),
('Grote Bestelling', 'Verlaagd schadevergoeding percentage voor grote bestellingen', 500, NULL, 'percentage', 15, 200, 2);

-- Test Customer (password: Test1234!)
INSERT INTO customers (email, password_hash, first_name, last_name, phone, company_name) VALUES
('test@tafeltotaal.be', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYWCqNXJqKHe', 'Test', 'Klant', '+32 470 12 34 56', NULL);

-- Test Admin (password: Admin1234!)
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@tafeltotaal.be', '$2b$12$6FP0KjtF0up72NuevKaSL.fcL7OFDV6vncV.d.iN5g0qz3A2kZpV.', 'Admin', 'Tafel Totaal', 'admin');

-- Test Customer Address
INSERT INTO customer_addresses (customer_id, type, street, house_number, postal_code, city, country, is_default) VALUES
((SELECT id FROM customers WHERE email = 'test@tafeltotaal.be'), 'delivery', 'Markt', '1', '8000', 'Brugge', 'Belgium', true);
