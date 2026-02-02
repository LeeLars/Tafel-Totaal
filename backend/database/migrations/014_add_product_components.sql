-- ============================================
-- PRODUCT COMPONENTS / SETS
-- Allows products to be composed of other products
-- Example: Theeset contains Theekan, Melkkan, Suikerpot
-- ============================================

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
CREATE INDEX idx_product_components_parent ON product_components(parent_product_id);
CREATE INDEX idx_product_components_component ON product_components(component_product_id);

-- Add a flag to products to indicate if it's a set/bundle
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_set BOOLEAN DEFAULT false;

-- Add comment for clarity
COMMENT ON TABLE product_components IS 'Defines product composition - which products are made up of other products';
COMMENT ON COLUMN product_components.parent_product_id IS 'The set/bundle product (e.g., Theeset)';
COMMENT ON COLUMN product_components.component_product_id IS 'The individual component (e.g., Theekan)';
COMMENT ON COLUMN product_components.quantity IS 'How many of this component are in the set';
COMMENT ON COLUMN products.is_set IS 'True if this product is composed of other products';
