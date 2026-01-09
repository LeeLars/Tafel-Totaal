-- ============================================
-- TAFEL TOTAAL DATABASE SCHEMA
-- Railway PostgreSQL
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE service_level AS ENUM ('STANDAARD', 'LUXE');
CREATE TYPE pricing_type AS ENUM ('FORFAIT', 'PER_DAY');
CREATE TYPE order_status AS ENUM (
  'pending_payment',
  'confirmed',
  'preparing',
  'ready_for_delivery',
  'delivered',
  'returned',
  'completed',
  'cancelled',
  'payment_failed'
);
CREATE TYPE delivery_method AS ENUM ('DELIVERY', 'PICKUP');
CREATE TYPE reservation_type AS ENUM ('SOFT', 'HARD');
CREATE TYPE reservation_status AS ENUM ('PENDING', 'ACTIVE', 'RELEASED', 'COMPLETED');
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE address_type AS ENUM ('delivery', 'billing');

-- ============================================
-- SERVICE LEVELS
-- ============================================

CREATE TABLE service_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CATEGORIES
-- ============================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SUBCATEGORIES
-- ============================================

CREATE TABLE subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- ============================================
-- PRODUCTS
-- ============================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  category_id UUID NOT NULL REFERENCES categories(id),
  subcategory_id UUID REFERENCES subcategories(id),
  service_level service_level NOT NULL DEFAULT 'STANDAARD',
  price_per_day DECIMAL(10,2) NOT NULL DEFAULT 0,
  deposit_per_item DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock_total INTEGER NOT NULL DEFAULT 0,
  stock_buffer INTEGER NOT NULL DEFAULT 5,
  turnaround_days INTEGER NOT NULL DEFAULT 1,
  images JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_subcategory ON products(subcategory_id);
CREATE INDEX idx_products_service_level ON products(service_level);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);

-- ============================================
-- PACKAGES
-- ============================================

CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  short_description VARCHAR(500),
  service_level service_level NOT NULL DEFAULT 'STANDAARD',
  pricing_type pricing_type NOT NULL DEFAULT 'FORFAIT',
  base_price DECIMAL(10,2) NOT NULL,
  price_per_extra_day DECIMAL(10,2) DEFAULT 0,
  forfait_days INTEGER DEFAULT 3,
  min_persons INTEGER NOT NULL DEFAULT 1,
  max_persons INTEGER NOT NULL DEFAULT 100,
  deposit_percentage DECIMAL(5,2) DEFAULT 20,
  images JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_packages_slug ON packages(slug);
CREATE INDEX idx_packages_service_level ON packages(service_level);
CREATE INDEX idx_packages_featured ON packages(is_featured) WHERE is_featured = true;

-- ============================================
-- PACKAGE ITEMS
-- ============================================

CREATE TABLE package_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_per_person INTEGER NOT NULL DEFAULT 1,
  is_optional BOOLEAN DEFAULT false,
  extra_price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(package_id, product_id)
);

CREATE INDEX idx_package_items_package ON package_items(package_id);
CREATE INDEX idx_package_items_product ON package_items(product_id);

-- ============================================
-- CUSTOMERS
-- ============================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  company_name VARCHAR(200),
  vat_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);

-- ============================================
-- CUSTOMER ADDRESSES
-- ============================================

CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type address_type NOT NULL DEFAULT 'delivery',
  street VARCHAR(255) NOT NULL,
  house_number VARCHAR(20) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) DEFAULT 'Belgium',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customer_addresses_customer ON customer_addresses(customer_id);

-- ============================================
-- ADMIN USERS
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role user_role NOT NULL DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ORDERS
-- ============================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  status order_status NOT NULL DEFAULT 'pending_payment',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  deposit_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  delivery_method delivery_method NOT NULL DEFAULT 'DELIVERY',
  delivery_address_id UUID REFERENCES customer_addresses(id),
  rental_start_date DATE NOT NULL,
  rental_end_date DATE NOT NULL,
  delivery_date TIMESTAMP,
  return_date TIMESTAMP,
  notes TEXT,
  admin_notes TEXT,
  mollie_payment_id VARCHAR(100),
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_rental_dates ON orders(rental_start_date, rental_end_date);
CREATE INDEX idx_orders_mollie ON orders(mollie_payment_id);

-- ============================================
-- ORDER ITEMS
-- ============================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('package', 'product')),
  package_id UUID REFERENCES packages(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  persons INTEGER,
  unit_price DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  line_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================
-- INVENTORY RESERVATIONS
-- ============================================

CREATE TABLE inventory_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  session_id UUID,
  quantity INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  type reservation_type NOT NULL DEFAULT 'SOFT',
  status reservation_status NOT NULL DEFAULT 'PENDING',
  expires_at TIMESTAMP,
  released_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reservations_product ON inventory_reservations(product_id);
CREATE INDEX idx_reservations_order ON inventory_reservations(order_id);
CREATE INDEX idx_reservations_dates ON inventory_reservations(start_date, end_date);
CREATE INDEX idx_reservations_status ON inventory_reservations(status);
CREATE INDEX idx_reservations_expires ON inventory_reservations(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================
-- SESSIONS (Cart State - NO localStorage!)
-- ============================================

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token VARCHAR(255) NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  cart_data JSONB DEFAULT '[]'::jsonb,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_customer ON sessions(customer_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- ============================================
-- DEPOSIT RULES
-- ============================================

CREATE TABLE deposit_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  min_order_value DECIMAL(10,2) DEFAULT 0,
  max_order_value DECIMAL(10,2),
  deposit_type VARCHAR(20) NOT NULL CHECK (deposit_type IN ('percentage', 'fixed')),
  deposit_value DECIMAL(10,2) NOT NULL,
  max_deposit DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CHECKOUT RULES
-- ============================================

CREATE TABLE checkout_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  rule_type VARCHAR(50) NOT NULL,
  condition_json JSONB,
  action_json JSONB,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- DAMAGE REPORTS
-- ============================================

CREATE TABLE damage_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity_damaged INTEGER NOT NULL DEFAULT 1,
  description TEXT NOT NULL,
  photos JSONB DEFAULT '[]'::jsonb,
  cost_per_item DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  deducted_from_deposit BOOLEAN DEFAULT true,
  reported_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_damage_reports_order ON damage_reports(order_id);

-- ============================================
-- CITIES (Delivery Zones)
-- ============================================

CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  province VARCHAR(100) NOT NULL,
  postal_codes JSONB DEFAULT '[]'::jsonb,
  delivery_fee DECIMAL(10,2) DEFAULT 25,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cities_slug ON cities(slug);
CREATE INDEX idx_cities_province ON cities(province);

-- ============================================
-- FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'TT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- AVAILABILITY CHECK FUNCTION
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
  v_stock_buffer INTEGER;
  v_reserved INTEGER;
  v_available INTEGER;
BEGIN
  SELECT p.stock_total, p.stock_buffer
  INTO v_stock_total, v_stock_buffer
  FROM products p
  WHERE p.id = p_product_id;

  SELECT COALESCE(SUM(ir.quantity), 0)
  INTO v_reserved
  FROM inventory_reservations ir
  WHERE ir.product_id = p_product_id
    AND ir.status IN ('PENDING', 'ACTIVE')
    AND ir.start_date <= p_end_date
    AND ir.end_date >= p_start_date;

  v_available := v_stock_total - v_stock_buffer - v_reserved;

  RETURN QUERY SELECT 
    v_available >= p_quantity,
    GREATEST(v_available, 0),
    v_stock_total,
    v_reserved;
END;
$$ LANGUAGE plpgsql;
