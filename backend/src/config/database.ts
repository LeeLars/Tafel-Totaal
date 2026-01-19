import { Pool, PoolConfig } from 'pg';
import { env, isDevelopment } from './env';

const poolConfig: PoolConfig = {
  connectionString: env.DATABASE_URL,
  ssl: isDevelopment ? false : { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(poolConfig);

pool.on('connect', () => {
  if (isDevelopment) {
    console.log('📦 Database connected');
  }
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  
  if (isDevelopment) {
    console.log('📝 Query executed:', { text: text.substring(0, 50), duration: `${duration}ms`, rows: result.rowCount });
  }
  
  return result.rows as T[];
}

export async function queryOne<T>(text: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

export async function testConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export async function closePool(): Promise<void> {
  await pool.end();
  console.log('📦 Database pool closed');
}

export async function runLoyaltyMigration(): Promise<boolean> {
  try {
    console.log('🔄 Running loyalty system migration...');
    
    // Create loyalty_tiers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS loyalty_tiers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) NOT NULL,
        slug VARCHAR(50) NOT NULL,
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
      )
    `);

    // Create customer_loyalty table
    await pool.query(`
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
      )
    `);

    // Create point_transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS point_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
        points INT NOT NULL,
        transaction_type VARCHAR(50) NOT NULL,
        description TEXT,
        balance_after INT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create loyalty_milestones table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS loyalty_milestones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        milestone_type VARCHAR(50) NOT NULL,
        points_awarded INT NOT NULL,
        order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
        achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Add loyalty columns to orders table
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS loyalty_discount DECIMAL(10,2) DEFAULT 0`);
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS loyalty_tier_discount DECIMAL(10,2) DEFAULT 0`);
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS loyalty_points_earned INT DEFAULT 0`);
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS loyalty_points_redeemed INT DEFAULT 0`);

    // Add loyalty columns to customers table
    await pool.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS date_of_birth DATE`);
    await pool.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS birthday_points_claimed_year INT`);

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_customer_loyalty_customer_id ON customer_loyalty(customer_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_point_transactions_customer_id ON point_transactions(customer_id)`);

    // Seed loyalty tiers if not exist
    const existingTiers = await pool.query(`SELECT COUNT(*) FROM loyalty_tiers`);
    if (parseInt(existingTiers.rows[0].count) === 0) {
      console.log('🌱 Seeding loyalty tiers...');
      await pool.query(`
        INSERT INTO loyalty_tiers (name, slug, min_points, max_points, discount_percentage, points_boost_percentage, benefits, color, icon, sort_order)
        VALUES 
          ('Brons', 'bronze', 0, 499, 0, 0, '["Punten sparen bij elke bestelling", "Toegang tot loyalty programma"]'::jsonb, '#CD7F32', 'award', 1),
          ('Zilver', 'silver', 500, 1499, 5, 5, '["5% korting op alle bestellingen", "+5% extra punten per bestelling"]'::jsonb, '#C0C0C0', 'award', 2),
          ('Goud', 'gold', 1500, 2999, 10, 7, '["10% korting op alle bestellingen", "+7% extra punten per bestelling", "Prioriteit support (antwoord binnen 1 werkdag)"]'::jsonb, '#FFD700', 'crown', 3),
          ('Platinum', 'platinum', 3000, NULL, 15, 10, '["15% korting op alle bestellingen", "+10% extra punten per bestelling", "Prioriteitsplanning bij reserveringen", "1x gratis wijziging tijdslot per order", "VIP support (antwoord binnen 4 werkuren)"]'::jsonb, '#E5E4E2', 'gem', 4)
      `);
    }

    console.log('✅ Loyalty system migration completed');
    return true;
  } catch (error) {
    console.error('❌ Loyalty migration error:', error);
    return false;
  }
}
