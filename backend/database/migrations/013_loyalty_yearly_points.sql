-- Migration: Loyalty Yearly Points System
-- Created: 2026-01-24
-- Description: Change tier calculation from lifetime to yearly points
-- Points reset each year, tiers are based on yearly points earned

-- ============================================
-- ADD YEARLY POINTS TRACKING TO CUSTOMER_LOYALTY
-- ============================================
ALTER TABLE customer_loyalty ADD COLUMN IF NOT EXISTS yearly_points INT DEFAULT 0;
ALTER TABLE customer_loyalty ADD COLUMN IF NOT EXISTS yearly_points_year INT DEFAULT EXTRACT(YEAR FROM NOW());
ALTER TABLE customer_loyalty ADD COLUMN IF NOT EXISTS previous_year_points INT DEFAULT 0;

-- ============================================
-- FUNCTION: Reset yearly points at year start
-- ============================================
CREATE OR REPLACE FUNCTION reset_yearly_points_if_new_year()
RETURNS TRIGGER AS $$
DECLARE
  v_current_year INT;
  v_bronze_tier_id UUID;
BEGIN
  v_current_year := EXTRACT(YEAR FROM NOW())::INT;
  
  -- If the stored year is different from current year, reset points
  IF NEW.yearly_points_year IS NULL OR NEW.yearly_points_year < v_current_year THEN
    -- Store previous year points
    NEW.previous_year_points := NEW.yearly_points;
    -- Reset yearly points to 0
    NEW.yearly_points := 0;
    NEW.yearly_points_year := v_current_year;
    
    -- Also reset yearly spend
    NEW.previous_year_spend := NEW.yearly_spend;
    NEW.yearly_spend := 0;
    NEW.yearly_spend_year := v_current_year;
    
    -- Reset tier to Bronze at start of new year
    SELECT id INTO v_bronze_tier_id FROM loyalty_tiers WHERE slug = 'bronze' LIMIT 1;
    IF v_bronze_tier_id IS NOT NULL THEN
      NEW.current_tier_id := v_bronze_tier_id;
      NEW.tier_start_date := NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update trigger to use new function
DROP TRIGGER IF EXISTS trigger_reset_yearly_spend ON customer_loyalty;
DROP TRIGGER IF EXISTS trigger_reset_yearly_points ON customer_loyalty;
CREATE TRIGGER trigger_reset_yearly_points
  BEFORE UPDATE ON customer_loyalty
  FOR EACH ROW
  EXECUTE FUNCTION reset_yearly_points_if_new_year();

-- ============================================
-- FUNCTION: Update tier based on yearly points
-- ============================================
CREATE OR REPLACE FUNCTION update_tier_from_yearly_points()
RETURNS TRIGGER AS $$
DECLARE
  v_new_tier_id UUID;
BEGIN
  -- Find the appropriate tier based on yearly points
  SELECT id INTO v_new_tier_id
  FROM loyalty_tiers
  WHERE NEW.yearly_points >= min_points
    AND (max_points IS NULL OR NEW.yearly_points <= max_points)
  ORDER BY min_points DESC
  LIMIT 1;
  
  -- Update tier if changed
  IF v_new_tier_id IS NOT NULL AND (NEW.current_tier_id IS NULL OR NEW.current_tier_id != v_new_tier_id) THEN
    NEW.current_tier_id := v_new_tier_id;
    NEW.tier_start_date := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic tier updates based on yearly points
DROP TRIGGER IF EXISTS trigger_update_tier_from_points ON customer_loyalty;
CREATE TRIGGER trigger_update_tier_from_points
  BEFORE UPDATE OF yearly_points ON customer_loyalty
  FOR EACH ROW
  EXECUTE FUNCTION update_tier_from_yearly_points();

-- ============================================
-- Initialize yearly_points from existing data
-- ============================================
-- Set yearly_points to 0 for all existing customers (fresh start)
UPDATE customer_loyalty 
SET yearly_points = 0,
    yearly_points_year = EXTRACT(YEAR FROM NOW())::INT,
    previous_year_points = lifetime_points
WHERE yearly_points IS NULL OR yearly_points_year IS NULL;

-- Reset all customers to Bronze tier for fresh start
UPDATE customer_loyalty cl
SET current_tier_id = (SELECT id FROM loyalty_tiers WHERE slug = 'bronze' LIMIT 1),
    tier_start_date = NOW()
WHERE current_tier_id IS NULL 
   OR yearly_points = 0;

-- ============================================
-- INDEX for yearly points queries
-- ============================================
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_yearly_points ON customer_loyalty(yearly_points);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_yearly_year ON customer_loyalty(yearly_points_year);
