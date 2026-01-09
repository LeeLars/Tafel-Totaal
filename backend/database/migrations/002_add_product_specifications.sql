-- Migration: Add product specifications fields
-- Created: 2026-01-09
-- Description: Add dimensions, weight, color, packaging info to products table

-- Add specification columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS length_cm DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS width_cm DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS height_cm DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(10,3),
ADD COLUMN IF NOT EXISTS color VARCHAR(100),
ADD COLUMN IF NOT EXISTS material VARCHAR(200),
ADD COLUMN IF NOT EXISTS units_per_pack INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS pack_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS supplier VARCHAR(200),
ADD COLUMN IF NOT EXISTS supplier_sku VARCHAR(100),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_color ON products(color);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier);

-- Add comment
COMMENT ON COLUMN products.length_cm IS 'Product length in centimeters';
COMMENT ON COLUMN products.width_cm IS 'Product width in centimeters';
COMMENT ON COLUMN products.height_cm IS 'Product height in centimeters';
COMMENT ON COLUMN products.weight_kg IS 'Product weight in kilograms';
COMMENT ON COLUMN products.color IS 'Product color (e.g. Wit, Zwart, Transparant)';
COMMENT ON COLUMN products.material IS 'Product material (e.g. Porselein, Glas, RVS)';
COMMENT ON COLUMN products.units_per_pack IS 'Number of units per packaging unit';
COMMENT ON COLUMN products.pack_type IS 'Packaging type (e.g. Doos, Krat, Pallet)';
COMMENT ON COLUMN products.supplier IS 'Supplier name';
COMMENT ON COLUMN products.supplier_sku IS 'Supplier SKU/article number';
COMMENT ON COLUMN products.notes IS 'Internal notes about the product';
