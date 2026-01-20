import { pool } from './database';

export async function runMigrations(): Promise<void> {
  console.log('🔄 Running database migrations...');
  
  try {
    // Check and add damage_compensation_total column to orders table
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'damage_compensation_total'
    `);
    
    if (checkColumn.rows.length === 0) {
      await pool.query(`
        ALTER TABLE orders 
        ADD COLUMN damage_compensation_total DECIMAL(10,2) NOT NULL DEFAULT 0
      `);
      console.log('✅ Added damage_compensation_total column to orders table');
    } else {
      console.log('✅ damage_compensation_total column already exists');
    }
    
    console.log('✅ Database migrations completed');
  } catch (error) {
    console.error('❌ Migration error:', error);
    // Don't throw - let the app continue even if migration fails
  }
}
