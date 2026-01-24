-- ============================================
-- REMOVE BUFFER FROM AVAILABILITY CALCULATION
-- Update check_product_availability function to not use stock_buffer
-- ============================================

CREATE OR REPLACE FUNCTION check_product_availability(
  p_product_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_quantity INTEGER
)
RETURNS TABLE (
  available BOOLEAN,
  available_quantity INTEGER,
  stock_total INTEGER,
  reserved_quantity INTEGER
) AS $$
DECLARE
  v_stock_total INTEGER;
  v_reserved INTEGER;
  v_available INTEGER;
BEGIN
  SELECT p.stock_total
  INTO v_stock_total
  FROM products p
  WHERE p.id = p_product_id;

  SELECT COALESCE(SUM(ir.quantity), 0)
  INTO v_reserved
  FROM inventory_reservations ir
  WHERE ir.product_id = p_product_id
    AND ir.status IN ('PENDING', 'ACTIVE')
    AND ir.start_date <= p_end_date
    AND ir.end_date >= p_start_date;

  v_available := v_stock_total - v_reserved;

  RETURN QUERY SELECT 
    v_available >= p_quantity,
    GREATEST(v_available, 0),
    v_stock_total,
    v_reserved;
END;
$$ LANGUAGE plpgsql;
