/**
 * Run categories migration script
 * Usage: node run-categories-migration.js
 * Make sure DATABASE_URL is set in environment
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('Set it with: export DATABASE_URL="postgresql://..."');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();
    
    console.log('✅ Connected! Running migration...');
    
    const migrationPath = path.join(__dirname, 'database/migrations/008_update_categories_structure.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await client.query(sql);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify results
    const categories = await client.query('SELECT name, slug FROM categories WHERE is_active = true ORDER BY sort_order');
    console.log('\n📂 Active Categories:');
    categories.rows.forEach(cat => console.log(`   - ${cat.name} (${cat.slug})`));
    
    const subcategories = await client.query('SELECT s.name, s.slug, c.name as category FROM subcategories s JOIN categories c ON s.category_id = c.id WHERE s.is_active = true ORDER BY c.sort_order, s.sort_order');
    console.log('\n📁 Subcategories:');
    subcategories.rows.forEach(sub => console.log(`   - ${sub.category} > ${sub.name}`));
    
    client.release();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
