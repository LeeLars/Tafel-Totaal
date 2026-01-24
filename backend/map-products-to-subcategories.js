/**
 * Map products to subcategories based on name patterns
 * Usage: DATABASE_URL="..." node map-products-to-subcategories.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Mapping rules: product name patterns -> subcategory slug
const MAPPING_RULES = {
  // SERVIES subcategories
  'dinerborden': ['dinerbord', 'diner bord', 'plat bord', 'hoofdgerecht'],
  'dessertborden': ['dessertbord', 'dessert bord', 'voorgerecht', 'ontbijtbord', 'gebaksbord'],
  'kommen-schalen': ['kom', 'schaal', 'bowl', 'soep', 'slakom', 'salade'],
  'theesets': ['kopje', 'schotel', 'koffie', 'thee', 'espresso', 'cappuccino', 'mok'],
  'serveerschalen-etageres': ['serveerschaal', 'etagere', 'plateau', 'serveerplank', 'taartplateau'],
  
  // BESTEK subcategories
  'messen': ['mes', 'knife'],
  'vorken': ['vork', 'fork'],
  'lepels': ['lepel', 'spoon', 'soeplepel', 'dessertlepel'],
  'dessertbestek': ['dessertbestek', 'gebaksv', 'taartv', 'petit four'],
  'serveertangen-lepels': ['serveertang', 'serveerlepel', 'slabestek', 'opscheplepel', 'tang'],
  
  // GLASWERK subcategories
  'wijnglazen': ['wijnglas', 'wijn glas', 'rode wijn', 'witte wijn', 'bourgogne', 'bordeaux'],
  'champagneglazen': ['champagne', 'flute', 'prosecco', 'cava', 'mousserende'],
  'cocktailglazen': ['cocktail', 'martini', 'margarita', 'mojito', 'gin tonic'],
  'water-frisdrankglazen': ['waterglas', 'water glas', 'longdrink', 'frisdrank', 'limonade', 'tumbler', 'highball'],
  'koffie-theeglazen': ['koffieglas', 'theeglas', 'latte', 'irish coffee'],
  
  // DECORATIE subcategories
  'tafellinnen': ['servet', 'tafelkleed', 'tafelloper', 'placemat', 'linnen', 'napkin'],
  'kaarsen-houders': ['kaars', 'kandelaar', 'waxine', 'theelicht', 'candlestick'],
  'tafelaccessoires': ['vaas', 'bloem', 'menuhouder', 'naamkaart', 'peper', 'zout', 'olie', 'azijn'],
  'presentatie-aankleding': ['decoratie', 'aankleding', 'versiering', 'centerpiece'],
  
  // TAFELS & STOELEN subcategories
  'tafels': ['tafel', 'table', 'banket'],
  'stoelen': ['stoel', 'chair', 'chiavari', 'napoleon', 'crossback'],
  'statafels': ['statafel', 'sta-tafel', 'cocktailtafel', 'bartafel'],
  'barkrukken': ['barkruk', 'barstoelen', 'kruk']
};

async function mapProducts() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Fetching products and subcategories...\n');
    
    // Get all subcategories with their category info
    const subcatsResult = await client.query(`
      SELECT s.id, s.slug, s.name, c.slug as category_slug, c.name as category_name
      FROM subcategories s
      JOIN categories c ON s.category_id = c.id
      WHERE s.is_active = true
    `);
    const subcategories = subcatsResult.rows;
    
    // Get all products
    const productsResult = await client.query(`
      SELECT p.id, p.name, p.sku, c.slug as category_slug, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
      ORDER BY c.name, p.name
    `);
    const products = productsResult.rows;
    
    console.log(`📦 Found ${products.length} products to process\n`);
    
    let mapped = 0;
    let unmapped = [];
    
    for (const product of products) {
      const productNameLower = product.name.toLowerCase();
      let matchedSubcategory = null;
      
      // Try to find a matching subcategory based on name patterns
      for (const [subcatSlug, patterns] of Object.entries(MAPPING_RULES)) {
        for (const pattern of patterns) {
          if (productNameLower.includes(pattern.toLowerCase())) {
            // Find the subcategory
            matchedSubcategory = subcategories.find(s => s.slug === subcatSlug);
            if (matchedSubcategory) break;
          }
        }
        if (matchedSubcategory) break;
      }
      
      if (matchedSubcategory) {
        // Update the product
        await client.query(
          'UPDATE products SET subcategory_id = $1 WHERE id = $2',
          [matchedSubcategory.id, product.id]
        );
        console.log(`✅ ${product.name} → ${matchedSubcategory.category_name} > ${matchedSubcategory.name}`);
        mapped++;
      } else {
        unmapped.push({ name: product.name, category: product.category_name || 'Geen categorie' });
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Mapped: ${mapped} products`);
    console.log(`⚠️  Unmapped: ${unmapped.length} products`);
    
    if (unmapped.length > 0) {
      console.log(`\n📋 Unmapped products (need manual assignment):`);
      unmapped.forEach(p => console.log(`   - [${p.category}] ${p.name}`));
    }
    
  } finally {
    client.release();
    await pool.end();
  }
}

mapProducts().catch(console.error);
