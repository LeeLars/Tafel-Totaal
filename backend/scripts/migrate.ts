import fs from 'fs';
import path from 'path';
import { pool, closePool } from '../src/config/database';

async function migrate() {
  try {
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('🔄 Running migrations...');
    
    await pool.query(schemaSql);
    
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

migrate();
