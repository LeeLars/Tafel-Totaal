-- Migration: Add toggle_points column to package_items table
-- This enables the toggle points feature for optional package items

ALTER TABLE package_items 
ADD COLUMN IF NOT EXISTS toggle_points INTEGER DEFAULT 0;

-- Update existing optional items to have 1 toggle point by default
UPDATE package_items 
SET toggle_points = 1 
WHERE is_optional = true AND toggle_points = 0;
