-- Migration: Loyalty Points System
-- Created: 2026-01-19
-- Description: Complete loyalty program with tiers, points tracking, and milestones

-- ============================================
-- LOYALTY TIERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  min_points INT NOT NULL,
  max_points INT,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  points_boost_percentage DECIMAL(5,2) DEFAULT 0,
  benefits JSONB DEFAULT '[]'::jsonb,
  color VARCHAR(20) DEFAULT '#666666',
  icon VARCHAR(50) DEFAULT 'star',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CUSTOMER LOYALTY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customer_loyalty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  total_points INT DEFAULT 0,
  available_points INT DEFAULT 0,
  lifetime_points INT DEFAULT 0,
  current_tier_id UUID REFERENCES loyalty_tiers(id),
  tier_start_date TIMESTAMP WITH TIME ZONE,
  last_activity_date TIMESTAMP WITH TIME ZONE,
  total_orders INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id)
);

-- ============================================
-- POINT TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  points INT NOT NULL,
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'bonus', 'adjustment')),
  description TEXT,
  balance_after INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- LOYALTY MILESTONES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS loyalty_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  milestone_type VARCHAR(50) NOT NULL CHECK (milestone_type IN ('first_order', 'orders_5', 'orders_10', 'orders_25', 'orders_50', 'birthday', 'review')),
  points_awarded INT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, milestone_type, achieved_at)
);

-- ============================================
-- EXTEND ORDERS TABLE
-- ============================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS loyalty_discount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS loyalty_tier_discount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS loyalty_points_earned INT DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS loyalty_points_redeemed INT DEFAULT 0;

-- ============================================
-- EXTEND CUSTOMERS TABLE
-- ============================================
ALTER TABLE customers ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS birthday_points_claimed_year INT;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_customer_id ON customer_loyalty(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_tier_id ON customer_loyalty(current_tier_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_customer_id ON point_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_order_id ON point_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON point_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_milestones_customer_id ON loyalty_milestones(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_milestones_type ON loyalty_milestones(milestone_type);

-- ============================================
-- SEED LOYALTY TIERS
-- ============================================
INSERT INTO loyalty_tiers (name, slug, min_points, max_points, discount_percentage, points_boost_percentage, benefits, color, icon, sort_order)
VALUES 
  (
    'Brons',
    'bronze',
    0,
    499,
    0,
    0,
    '["Punten sparen bij elke bestelling", "Toegang tot loyalty programma"]'::jsonb,
    '#CD7F32',
    'award',
    1
  ),
  (
    'Zilver',
    'silver',
    500,
    1499,
    5,
    5,
    '["5% korting op alle bestellingen", "+5% extra punten per bestelling"]'::jsonb,
    '#C0C0C0',
    'award',
    2
  ),
  (
    'Goud',
    'gold',
    1500,
    2999,
    10,
    7,
    '["10% korting op alle bestellingen", "+7% extra punten per bestelling", "Prioriteit support (antwoord binnen 1 werkdag)"]'::jsonb,
    '#FFD700',
    'crown',
    3
  ),
  (
    'Platinum',
    'platinum',
    3000,
    NULL,
    15,
    10,
    '["15% korting op alle bestellingen", "+10% extra punten per bestelling", "Prioriteitsplanning bij reserveringen", "1x gratis wijziging tijdslot per order", "VIP support (antwoord binnen 4 werkuren)"]'::jsonb,
    '#E5E4E2',
    'gem',
    4
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
  updated_at = NOW();

-- ============================================
-- FUNCTION: Update customer tier based on points
-- ============================================
CREATE OR REPLACE FUNCTION update_customer_tier()
RETURNS TRIGGER AS $$
DECLARE
  new_tier_id UUID;
BEGIN
  -- Find the appropriate tier based on lifetime points
  SELECT id INTO new_tier_id
  FROM loyalty_tiers
  WHERE NEW.lifetime_points >= min_points
    AND (max_points IS NULL OR NEW.lifetime_points <= max_points)
  ORDER BY min_points DESC
  LIMIT 1;
  
  -- Update tier if changed
  IF new_tier_id IS DISTINCT FROM NEW.current_tier_id THEN
    NEW.current_tier_id := new_tier_id;
    NEW.tier_start_date := NOW();
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic tier updates
DROP TRIGGER IF EXISTS trigger_update_customer_tier ON customer_loyalty;
CREATE TRIGGER trigger_update_customer_tier
  BEFORE UPDATE OF lifetime_points ON customer_loyalty
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_tier();

-- ============================================
-- FUNCTION: Initialize customer loyalty on first order
-- ============================================
CREATE OR REPLACE FUNCTION initialize_customer_loyalty(p_customer_id UUID)
RETURNS UUID AS $$
DECLARE
  loyalty_id UUID;
  bronze_tier_id UUID;
BEGIN
  -- Get bronze tier ID
  SELECT id INTO bronze_tier_id FROM loyalty_tiers WHERE slug = 'bronze';
  
  -- Insert or get existing loyalty record
  INSERT INTO customer_loyalty (customer_id, current_tier_id, tier_start_date, last_activity_date)
  VALUES (p_customer_id, bronze_tier_id, NOW(), NOW())
  ON CONFLICT (customer_id) DO UPDATE SET last_activity_date = NOW()
  RETURNING id INTO loyalty_id;
  
  RETURN loyalty_id;
END;
$$ LANGUAGE plpgsql;
