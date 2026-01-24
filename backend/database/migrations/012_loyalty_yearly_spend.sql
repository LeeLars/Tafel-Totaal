-- Migration: Loyalty Yearly Spend Tracking
-- Created: 2026-01-24
-- Description: Add yearly spend tracking and tier gradients for Print.com style loyalty

-- ============================================
-- ADD YEARLY SPEND TRACKING TO CUSTOMER_LOYALTY
-- ============================================
ALTER TABLE customer_loyalty ADD COLUMN IF NOT EXISTS yearly_spend DECIMAL(10,2) DEFAULT 0;
ALTER TABLE customer_loyalty ADD COLUMN IF NOT EXISTS yearly_spend_year INT DEFAULT EXTRACT(YEAR FROM NOW());
ALTER TABLE customer_loyalty ADD COLUMN IF NOT EXISTS previous_year_spend DECIMAL(10,2) DEFAULT 0;

-- ============================================
-- ADD GRADIENT COLORS TO LOYALTY_TIERS
-- ============================================
ALTER TABLE loyalty_tiers ADD COLUMN IF NOT EXISTS gradient_colors TEXT[] DEFAULT '{}';
ALTER TABLE loyalty_tiers ADD COLUMN IF NOT EXISTS background_color VARCHAR(20) DEFAULT '#FFFFFF';
ALTER TABLE loyalty_tiers ADD COLUMN IF NOT EXISTS is_locked_default BOOLEAN DEFAULT false;

-- ============================================
-- UPDATE TIERS WITH GRADIENT COLORS (Print.com style)
-- ============================================

-- Bronze tier - warm copper tones
UPDATE loyalty_tiers SET 
  gradient_colors = ARRAY['#CD7F32', '#B87333', '#A0522D', '#8B4513', '#CD853F', '#D2691E', '#DEB887'],
  background_color = '#FFF5E6',
  is_locked_default = false
WHERE slug = 'bronze';

-- Silver tier - cool silver/gray tones
UPDATE loyalty_tiers SET 
  gradient_colors = ARRAY['#C0C0C0', '#A8A8A8', '#D3D3D3', '#BEBEBE', '#B0B0B0', '#C8C8C8', '#E0E0E0'],
  background_color = '#F5F5F5',
  is_locked_default = false
WHERE slug = 'silver';

-- Gold tier - rich gold tones
UPDATE loyalty_tiers SET 
  gradient_colors = ARRAY['#FFD700', '#FFC125', '#DAA520', '#B8860B', '#FFB90F', '#EEAD0E', '#CD950C'],
  background_color = '#FFFACD',
  is_locked_default = false
WHERE slug = 'gold';

-- Platinum tier - elegant platinum/pearl tones
UPDATE loyalty_tiers SET 
  gradient_colors = ARRAY['#E5E4E2', '#EAEFF3', '#D9E4ED', '#FFFFFF', '#D4DEE5', '#E8E8E8', '#E1CAE7'],
  background_color = '#F5F9FF',
  is_locked_default = false
WHERE slug = 'platinum';

-- ============================================
-- ADD NEW PREMIUM TIER: DIAMOND (optional future tier)
-- ============================================
INSERT INTO loyalty_tiers (name, slug, min_points, max_points, discount_percentage, points_boost_percentage, benefits, color, icon, sort_order, gradient_colors, background_color, is_locked_default)
VALUES (
  'Diamant',
  'diamond',
  5000,
  NULL,
  20,
  15,
  '["20% korting op alle bestellingen", "+15% extra punten per bestelling", "Gratis levering bij elke bestelling", "Persoonlijke accountmanager", "Exclusieve early access nieuwe collecties", "VIP support (antwoord binnen 2 uur)"]'::jsonb,
  '#B9F2FF',
  'diamond',
  5,
  ARRAY['#B9F2FF', '#87CEEB', '#ADD8E6', '#E0FFFF', '#AFEEEE', '#00CED1', '#48D1CC'],
  '#E6FFFF',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  min_points = EXCLUDED.min_points,
  max_points = EXCLUDED.max_points,
  discount_percentage = EXCLUDED.discount_percentage,
  points_boost_percentage = EXCLUDED.points_boost_percentage,
  benefits = EXCLUDED.benefits,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  gradient_colors = EXCLUDED.gradient_colors,
  background_color = EXCLUDED.background_color,
  is_locked_default = EXCLUDED.is_locked_default,
  updated_at = NOW();

-- Update Platinum to have max_points now that Diamond exists
UPDATE loyalty_tiers SET max_points = 4999 WHERE slug = 'platinum';

-- ============================================
-- FUNCTION: Calculate yearly spend for customer
-- ============================================
CREATE OR REPLACE FUNCTION calculate_customer_yearly_spend(p_customer_id UUID, p_year INT DEFAULT NULL)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_year INT;
  v_total DECIMAL(10,2);
BEGIN
  v_year := COALESCE(p_year, EXTRACT(YEAR FROM NOW())::INT);
  
  SELECT COALESCE(SUM(total), 0)
  INTO v_total
  FROM orders
  WHERE customer_id = p_customer_id
    AND status NOT IN ('cancelled', 'refunded')
    AND EXTRACT(YEAR FROM created_at) = v_year;
  
  RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Update yearly spend on order completion
-- ============================================
CREATE OR REPLACE FUNCTION update_customer_yearly_spend()
RETURNS TRIGGER AS $$
DECLARE
  v_current_year INT;
  v_yearly_spend DECIMAL(10,2);
BEGIN
  v_current_year := EXTRACT(YEAR FROM NOW())::INT;
  
  -- Calculate new yearly spend
  v_yearly_spend := calculate_customer_yearly_spend(NEW.customer_id, v_current_year);
  
  -- Update customer loyalty record
  UPDATE customer_loyalty
  SET yearly_spend = v_yearly_spend,
      yearly_spend_year = v_current_year,
      updated_at = NOW()
  WHERE customer_id = NEW.customer_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic yearly spend updates
DROP TRIGGER IF EXISTS trigger_update_yearly_spend ON orders;
CREATE TRIGGER trigger_update_yearly_spend
  AFTER INSERT OR UPDATE OF status, total ON orders
  FOR EACH ROW
  WHEN (NEW.status NOT IN ('cancelled', 'refunded'))
  EXECUTE FUNCTION update_customer_yearly_spend();

-- ============================================
-- FUNCTION: Reset yearly spend at year start
-- ============================================
CREATE OR REPLACE FUNCTION reset_yearly_spend_if_new_year()
RETURNS TRIGGER AS $$
DECLARE
  v_current_year INT;
BEGIN
  v_current_year := EXTRACT(YEAR FROM NOW())::INT;
  
  -- If the stored year is different from current year, reset
  IF NEW.yearly_spend_year IS NULL OR NEW.yearly_spend_year < v_current_year THEN
    NEW.previous_year_spend := NEW.yearly_spend;
    NEW.yearly_spend := 0;
    NEW.yearly_spend_year := v_current_year;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for year reset
DROP TRIGGER IF EXISTS trigger_reset_yearly_spend ON customer_loyalty;
CREATE TRIGGER trigger_reset_yearly_spend
  BEFORE UPDATE ON customer_loyalty
  FOR EACH ROW
  EXECUTE FUNCTION reset_yearly_spend_if_new_year();

-- ============================================
-- INDEX for yearly spend queries
-- ============================================
CREATE INDEX IF NOT EXISTS idx_orders_customer_year ON orders(customer_id, EXTRACT(YEAR FROM created_at));
