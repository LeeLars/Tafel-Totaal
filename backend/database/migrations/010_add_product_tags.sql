-- ============================================
-- ADD PRODUCT TAGS SYSTEM
-- Tags for filtering by Beleving/Moment and Stijl
-- ============================================

-- Create tag_groups table (e.g., "Moment & Beleving", "Stijl")
CREATE TABLE IF NOT EXISTS tag_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_group_id UUID REFERENCES tag_groups(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create product_tags junction table
CREATE TABLE IF NOT EXISTS product_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, tag_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tags_group ON tags(tag_group_id);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_product_tags_product ON product_tags(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_tag ON product_tags(tag_id);

-- Insert tag groups
INSERT INTO tag_groups (name, slug, description, sort_order) VALUES
('Moment & Beleving', 'moment-beleving', 'Filter op type evenement of moment', 1),
('Stijl', 'stijl', 'Filter op designstijl', 2)
ON CONFLICT (slug) DO NOTHING;

-- Insert Moment & Beleving tags
INSERT INTO tags (tag_group_id, name, slug, icon, sort_order) VALUES
((SELECT id FROM tag_groups WHERE slug = 'moment-beleving'), 'Diner', 'diner', '🍽️', 1),
((SELECT id FROM tag_groups WHERE slug = 'moment-beleving'), 'Dessert & Coffee', 'dessert-coffee', '☕', 2),
((SELECT id FROM tag_groups WHERE slug = 'moment-beleving'), 'High Tea', 'high-tea', '🫖', 3),
((SELECT id FROM tag_groups WHERE slug = 'moment-beleving'), 'Aperitief & Receptie', 'aperitief-receptie', '🥂', 4),
((SELECT id FROM tag_groups WHERE slug = 'moment-beleving'), 'Feest & Party', 'feest-party', '🎉', 5),
((SELECT id FROM tag_groups WHERE slug = 'moment-beleving'), 'Ceremonie', 'ceremonie', '💒', 6),
((SELECT id FROM tag_groups WHERE slug = 'moment-beleving'), 'Tafel Aankleding', 'tafel-aankleding', '🌸', 7)
ON CONFLICT (slug) DO NOTHING;

-- Insert Stijl tags
INSERT INTO tags (tag_group_id, name, slug, icon, sort_order) VALUES
((SELECT id FROM tag_groups WHERE slug = 'stijl'), 'Modern', 'modern', '◻️', 1),
((SELECT id FROM tag_groups WHERE slug = 'stijl'), 'Klassiek', 'klassiek', '🏛️', 2),
((SELECT id FROM tag_groups WHERE slug = 'stijl'), 'Vintage', 'vintage', '🕰️', 3),
((SELECT id FROM tag_groups WHERE slug = 'stijl'), 'Luxe', 'luxe', '✨', 4),
((SELECT id FROM tag_groups WHERE slug = 'stijl'), 'Minimal', 'minimal', '○', 5)
ON CONFLICT (slug) DO NOTHING;
