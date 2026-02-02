/**
 * Run migration 014 - Add product_components table
 * This script connects to the Railway database and runs the migration
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection from environment or Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting migration 014...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../database/migrations/014_add_product_components.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL loaded');
    
    // Run the migration
    await client.query(migrationSQL);
    
    console.log('✅ Migration 014 completed successfully!');
    console.log('   - Created product_components table');
    console.log('   - Added indexes for performance');
    console.log('   - Added is_set column to products table');
    
    // Verify the table was created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'product_components'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Verified: product_components table exists');
    } else {
      console.error('❌ Error: product_components table was not created');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
