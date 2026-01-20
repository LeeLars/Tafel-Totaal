import { pool } from './database';

interface ColumnMigration {
  table: string;
  column: string;
  definition: string;
}

// All columns that should exist based on schema.sql
const requiredColumns: ColumnMigration[] = [
  // orders table
  { table: 'orders', column: 'order_number', definition: "VARCHAR(50) UNIQUE" },
  { table: 'orders', column: 'customer_id', definition: "UUID NOT NULL" },
  { table: 'orders', column: 'status', definition: "VARCHAR(50) NOT NULL DEFAULT 'pending_payment'" },
  { table: 'orders', column: 'subtotal', definition: "DECIMAL(10,2) NOT NULL DEFAULT 0" },
  { table: 'orders', column: 'delivery_fee', definition: "DECIMAL(10,2) NOT NULL DEFAULT 0" },
  { table: 'orders', column: 'damage_compensation_total', definition: "DECIMAL(10,2) NOT NULL DEFAULT 0" },
  { table: 'orders', column: 'total', definition: "DECIMAL(10,2) NOT NULL DEFAULT 0" },
  { table: 'orders', column: 'delivery_method', definition: "VARCHAR(20) NOT NULL DEFAULT 'DELIVERY'" },
  { table: 'orders', column: 'delivery_address_id', definition: "UUID" },
  { table: 'orders', column: 'rental_start_date', definition: "DATE" },
  { table: 'orders', column: 'rental_end_date', definition: "DATE" },
  { table: 'orders', column: 'delivery_date', definition: "TIMESTAMP" },
  { table: 'orders', column: 'return_date', definition: "TIMESTAMP" },
  { table: 'orders', column: 'notes', definition: "TEXT" },
  { table: 'orders', column: 'admin_notes', definition: "TEXT" },
  { table: 'orders', column: 'mollie_payment_id', definition: "VARCHAR(100)" },
  { table: 'orders', column: 'paid_at', definition: "TIMESTAMP" },
  { table: 'orders', column: 'picking_status', definition: "VARCHAR(20) DEFAULT 'not_started'" },
  { table: 'orders', column: 'preparation_deadline', definition: "TIMESTAMP" },
  { table: 'orders', column: 'preparation_location', definition: "VARCHAR(255)" },
  
  // order_items table
  { table: 'order_items', column: 'order_id', definition: "UUID NOT NULL" },
  { table: 'order_items', column: 'item_type', definition: "VARCHAR(20) NOT NULL DEFAULT 'product'" },
  { table: 'order_items', column: 'package_id', definition: "UUID" },
  { table: 'order_items', column: 'product_id', definition: "UUID" },
  { table: 'order_items', column: 'quantity', definition: "INTEGER NOT NULL DEFAULT 1" },
  { table: 'order_items', column: 'persons', definition: "INTEGER" },
  { table: 'order_items', column: 'unit_price', definition: "DECIMAL(10,2) NOT NULL DEFAULT 0" },
  { table: 'order_items', column: 'damage_compensation_amount', definition: "DECIMAL(10,2) NOT NULL DEFAULT 0" },
  { table: 'order_items', column: 'line_total', definition: "DECIMAL(10,2) NOT NULL DEFAULT 0" },
  { table: 'order_items', column: 'picked', definition: "BOOLEAN DEFAULT false" },
  { table: 'order_items', column: 'picked_at', definition: "TIMESTAMP" },
  { table: 'order_items', column: 'picked_by', definition: "UUID" },
  
  // sessions table
  { table: 'sessions', column: 'session_token', definition: "VARCHAR(255) NOT NULL" },
  { table: 'sessions', column: 'customer_id', definition: "UUID" },
  { table: 'sessions', column: 'cart_data', definition: "JSONB DEFAULT '[]'::jsonb" },
  { table: 'sessions', column: 'expires_at', definition: "TIMESTAMP" },
  
  // inventory_reservations table
  { table: 'inventory_reservations', column: 'product_id', definition: "UUID NOT NULL" },
  { table: 'inventory_reservations', column: 'order_id', definition: "UUID" },
  { table: 'inventory_reservations', column: 'session_id', definition: "UUID" },
  { table: 'inventory_reservations', column: 'quantity', definition: "INTEGER NOT NULL DEFAULT 1" },
  { table: 'inventory_reservations', column: 'start_date', definition: "DATE" },
  { table: 'inventory_reservations', column: 'end_date', definition: "DATE" },
  { table: 'inventory_reservations', column: 'type', definition: "VARCHAR(20) NOT NULL DEFAULT 'SOFT'" },
  { table: 'inventory_reservations', column: 'status', definition: "VARCHAR(20) NOT NULL DEFAULT 'PENDING'" },
  { table: 'inventory_reservations', column: 'expires_at', definition: "TIMESTAMP" },
  { table: 'inventory_reservations', column: 'released_at', definition: "TIMESTAMP" },
  
  // products table - warehouse location
  { table: 'products', column: 'warehouse_location', definition: "VARCHAR(100)" },
];

async function columnExists(table: string, column: string): Promise<boolean> {
  const result = await pool.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = $1 AND column_name = $2
  `, [table, column]);
  return result.rows.length > 0;
}

async function tableExists(table: string): Promise<boolean> {
  const result = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_name = $1
  `, [table]);
  return result.rows.length > 0;
}

export async function runMigrations(): Promise<void> {
  console.log('🔄 Running database migrations...');
  
  let addedCount = 0;
  let skippedCount = 0;
  
  try {
    for (const migration of requiredColumns) {
      // Check if table exists first
      const hasTable = await tableExists(migration.table);
      if (!hasTable) {
        console.log(`⏭️ Table ${migration.table} does not exist, skipping ${migration.column}`);
        skippedCount++;
        continue;
      }
      
      // Check if column exists
      const hasColumn = await columnExists(migration.table, migration.column);
      if (!hasColumn) {
        try {
          await pool.query(`
            ALTER TABLE ${migration.table} 
            ADD COLUMN ${migration.column} ${migration.definition}
          `);
          console.log(`✅ Added ${migration.table}.${migration.column}`);
          addedCount++;
        } catch (err) {
          // Column might already exist with different case or constraint issues
          console.log(`⚠️ Could not add ${migration.table}.${migration.column}: ${(err as Error).message}`);
        }
      } else {
        skippedCount++;
      }
    }
    
    console.log(`✅ Database migrations completed: ${addedCount} added, ${skippedCount} already existed`);
  } catch (error) {
    console.error('❌ Migration error:', error);
    // Don't throw - let the app continue even if migration fails
  }
}
