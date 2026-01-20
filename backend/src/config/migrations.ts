import { pool } from './database';

export async function runMigrations(): Promise<void> {
  console.log('🔄 Running database migrations...');
  
  try {
    // Migration 1: Add damage_compensation_total column to orders table
    const checkOrdersColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'damage_compensation_total'
    `);
    
    if (checkOrdersColumn.rows.length === 0) {
      await pool.query(`
        ALTER TABLE orders 
        ADD COLUMN damage_compensation_total DECIMAL(10,2) NOT NULL DEFAULT 0
      `);
      console.log('✅ Added damage_compensation_total column to orders table');
    } else {
      console.log('✅ damage_compensation_total column already exists in orders');
    }
    
    // Migration 2: Add damage_compensation_amount column to order_items table
    const checkOrderItemsColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'order_items' AND column_name = 'damage_compensation_amount'
    `);
    
    if (checkOrderItemsColumn.rows.length === 0) {
      await pool.query(`
        ALTER TABLE order_items 
        ADD COLUMN damage_compensation_amount DECIMAL(10,2) NOT NULL DEFAULT 0
      `);
      console.log('✅ Added damage_compensation_amount column to order_items table');
    } else {
      console.log('✅ damage_compensation_amount column already exists in order_items');
    }
    
    console.log('✅ Database migrations completed');
  } catch (error) {
    console.error('❌ Migration error:', error);
    // Don't throw - let the app continue even if migration fails
  }
}
