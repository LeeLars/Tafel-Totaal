#!/usr/bin/env node

/**
 * Run migration 014 - Add product_components table
 * Usage: node run-migration.js
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting migration 014 - Product Components...\n');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'database/migrations/014_add_product_components.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL loaded from:', migrationPath);
    console.log('🔗 Connecting to database...\n');
    
    // Run the migration
    await client.query(migrationSQL);
    
    console.log('✅ Migration 014 completed successfully!\n');
    console.log('Created:');
    console.log('  - product_components table');
    console.log('  - Indexes for performance');
    console.log('  - is_set column in products table\n');
    
    // Verify the table was created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'product_components'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Verified: product_components table exists');
      console.log('\n🎉 You can now use product sets in the CMS!');
    } else {
      console.error('❌ Error: product_components table was not created');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
