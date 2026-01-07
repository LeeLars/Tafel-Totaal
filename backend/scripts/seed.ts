import fs from 'fs';
import path from 'path';
import { pool, closePool } from '../src/config/database';

async function seed() {
  try {
    const seedPath = path.join(__dirname, '../database/seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('🌱 Seeding database...');
    
    await pool.query(seedSql);
    
    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

seed();
