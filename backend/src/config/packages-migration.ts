import { pool } from './database';

/**
 * Run packages system migration
 * Creates packages and package_items tables
 */
export async function runPackagesMigration(): Promise<void> {
  console.log('🔄 Running packages system migration...');
  
  try {
    // Create packages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        short_description VARCHAR(500),
        image_url VARCHAR(500),
        price_per_day DECIMAL(10,2) NOT NULL,
        persons INT DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Packages table created/verified');

    // Create package_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS package_items (
        id SERIAL PRIMARY KEY,
        package_id INT NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity INT NOT NULL DEFAULT 1,
        is_optional BOOLEAN DEFAULT false,
        toggle_points INT DEFAULT 0,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(package_id, product_id)
      )
    `);
    console.log('✅ Package_items table created/verified');

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_packages_slug ON packages(slug);
      CREATE INDEX IF NOT EXISTS idx_packages_active ON packages(is_active);
      CREATE INDEX IF NOT EXISTS idx_packages_featured ON packages(is_featured);
      CREATE INDEX IF NOT EXISTS idx_package_items_package ON package_items(package_id);
      CREATE INDEX IF NOT EXISTS idx_package_items_product ON package_items(product_id);
    `);
    console.log('✅ Indexes created/verified');

    // Create updated_at trigger
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_packages_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS packages_updated_at_trigger ON packages;
      
      CREATE TRIGGER packages_updated_at_trigger
        BEFORE UPDATE ON packages
        FOR EACH ROW
        EXECUTE FUNCTION update_packages_updated_at();
    `);
    console.log('✅ Trigger created/verified');

    // Insert sample packages if table is empty
    const countResult = await pool.query('SELECT COUNT(*) FROM packages');
    const count = parseInt(countResult.rows[0].count, 10);
    
    if (count === 0) {
      await pool.query(`
        INSERT INTO packages (name, slug, description, short_description, price_per_day, persons, is_featured, sort_order) VALUES
        ('Basis Pakket', 'basis-pakket', 'Perfect voor kleine feesten en intieme bijeenkomsten. Bevat alle essentiële items voor een geslaagd evenement.', 'Essentiële items voor kleine feesten', 49.99, 10, true, 1),
        ('Standaard Pakket', 'standaard-pakket', 'Ons meest populaire pakket voor middelgrote evenementen. Inclusief servies, bestek en glaswerk voor een complete tafel.', 'Populair pakket voor middelgrote events', 89.99, 20, true, 2),
        ('Premium Pakket', 'premium-pakket', 'Luxe pakket met hoogwaardige items voor speciale gelegenheden. Maak indruk op uw gasten met dit complete arrangement.', 'Luxe arrangement voor speciale momenten', 149.99, 30, true, 3),
        ('Bruiloft Pakket', 'bruiloft-pakket', 'Speciaal samengesteld voor uw grote dag. Elegant servies en decoratie voor een onvergetelijke bruiloft.', 'Elegant pakket voor uw bruiloft', 199.99, 50, false, 4)
      `);
      console.log('✅ Sample packages inserted');
    }

    console.log('✅ Packages system migration completed successfully');
  } catch (error) {
    console.error('❌ Packages migration error:', error);
    throw error;
  }
}
