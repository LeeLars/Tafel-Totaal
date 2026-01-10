import { Request, Response } from 'express';
import { parse } from 'csv-parse/sync';
import { ProductModel } from '../models/Product.model';
import { query } from '../config/database';

interface CSVRow {
  sku: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  service_level?: string;
  price_per_day: string;
  damage_compensation_per_item?: string;
  stock_total: string;
  stock_buffer?: string;
  turnaround_days?: string;
  length_cm?: string;
  width_cm?: string;
  height_cm?: string;
  weight_kg?: string;
  color?: string;
  material?: string;
  units_per_pack?: string;
  pack_type?: string;
  supplier?: string;
  supplier_sku?: string;
  notes?: string;
  is_active?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

/**
 * Parse and validate CSV file
 */
export async function parseProductsCSV(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    const csvContent = req.file.buffer.toString('utf-8');
    
    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true
    }) as CSVRow[];

    if (records.length === 0) {
      res.status(400).json({ success: false, error: 'CSV file is empty' });
      return;
    }

    // Validate and transform records
    const errors: ValidationError[] = [];
    const validRecords = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 2; // +2 because of header row and 0-index

      // Required fields
      if (!row.sku?.trim()) {
        errors.push({ row: rowNum, field: 'sku', message: 'SKU is required' });
      }
      if (!row.name?.trim()) {
        errors.push({ row: rowNum, field: 'name', message: 'Name is required' });
      }
      if (!row.category?.trim()) {
        errors.push({ row: rowNum, field: 'category', message: 'Category is required' });
      }
      if (!row.price_per_day || isNaN(parseFloat(row.price_per_day))) {
        errors.push({ row: rowNum, field: 'price_per_day', message: 'Valid price is required' });
      }
      if (!row.stock_total || isNaN(parseInt(row.stock_total))) {
        errors.push({ row: rowNum, field: 'stock_total', message: 'Valid stock total is required' });
      }

      // If row has critical errors, skip it
      if (errors.filter(e => e.row === rowNum).length > 0) {
        continue;
      }

      // Find category ID
      const category = await query<{ id: string }>(
        'SELECT id FROM categories WHERE LOWER(name) = LOWER($1) OR LOWER(slug) = LOWER($1)',
        [row.category.trim()]
      );

      if (category.length === 0) {
        errors.push({ row: rowNum, field: 'category', message: `Category "${row.category}" not found` });
        continue;
      }

      // Find subcategory ID if provided
      let subcategoryId: string | null = null;
      if (row.subcategory?.trim()) {
        const subcategory = await query<{ id: string }>(
          'SELECT id FROM subcategories WHERE LOWER(name) = LOWER($1) OR LOWER(slug) = LOWER($1)',
          [row.subcategory.trim()]
        );
        if (subcategory.length > 0) {
          subcategoryId = subcategory[0].id;
        }
      }

      validRecords.push({
        sku: row.sku.trim(),
        name: row.name.trim(),
        slug: row.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: row.description?.trim() || null,
        category_id: category[0].id,
        subcategory_id: subcategoryId,
        service_level: (row.service_level?.toUpperCase() === 'LUXE' ? 'LUXE' : 'STANDAARD') as 'STANDAARD' | 'LUXE',
        price_per_day: parseFloat(row.price_per_day),
        damage_compensation_per_item: row.damage_compensation_per_item ? parseFloat(row.damage_compensation_per_item) : 0,
        stock_total: parseInt(row.stock_total),
        stock_buffer: row.stock_buffer ? parseInt(row.stock_buffer) : 5,
        turnaround_days: row.turnaround_days ? parseInt(row.turnaround_days) : 1,
        length_cm: row.length_cm ? parseFloat(row.length_cm) : null,
        width_cm: row.width_cm ? parseFloat(row.width_cm) : null,
        height_cm: row.height_cm ? parseFloat(row.height_cm) : null,
        weight_kg: row.weight_kg ? parseFloat(row.weight_kg) : null,
        color: row.color?.trim() || null,
        material: row.material?.trim() || null,
        units_per_pack: row.units_per_pack ? parseInt(row.units_per_pack) : 1,
        pack_type: row.pack_type?.trim() || null,
        supplier: row.supplier?.trim() || null,
        supplier_sku: row.supplier_sku?.trim() || null,
        notes: row.notes?.trim() || null,
        is_active: row.is_active?.toLowerCase() !== 'false'
      });
    }

    res.json({
      success: true,
      data: {
        total: records.length,
        valid: validRecords.length,
        errors: errors.length,
        records: validRecords,
        validationErrors: errors
      }
    });
  } catch (error) {
    console.error('CSV parse error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to parse CSV file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Import products from validated CSV data
 */
export async function importProducts(req: Request, res: Response): Promise<void> {
  try {
    const { products, mode = 'create' } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      res.status(400).json({ success: false, error: 'No products provided' });
      return;
    }

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as { sku: string; error: string }[]
    };

    for (const product of products) {
      try {
        // Check if product exists
        const existing = await ProductModel.findBySku(product.sku);

        if (existing) {
          if (mode === 'skip') {
            results.skipped++;
            continue;
          } else if (mode === 'update') {
            await ProductModel.update(existing.id, product);
            results.updated++;
          } else {
            results.errors.push({ sku: product.sku, error: 'Product already exists' });
            results.skipped++;
          }
        } else {
          await ProductModel.create(product);
          results.created++;
        }
      } catch (error) {
        results.errors.push({ 
          sku: product.sku, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Import products error:', error);
    res.status(500).json({ success: false, error: 'Failed to import products' });
  }
}

/**
 * Bulk delete products
 */
export async function bulkDeleteProducts(req: Request, res: Response): Promise<void> {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      res.status(400).json({ success: false, error: 'No product IDs provided' });
      return;
    }

    const placeholders = productIds.map((_, i) => `$${i + 1}`).join(',');
    await query(`DELETE FROM products WHERE id IN (${placeholders})`, productIds);

    res.json({
      success: true,
      data: { deleted: productIds.length }
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete products' });
  }
}

/**
 * Bulk update product status
 */
export async function bulkUpdateStatus(req: Request, res: Response): Promise<void> {
  try {
    const { productIds, is_active } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      res.status(400).json({ success: false, error: 'No product IDs provided' });
      return;
    }

    if (typeof is_active !== 'boolean') {
      res.status(400).json({ success: false, error: 'Invalid status value' });
      return;
    }

    const placeholders = productIds.map((_, i) => `$${i + 2}`).join(',');
    await query(
      `UPDATE products SET is_active = $1, updated_at = NOW() WHERE id IN (${placeholders})`,
      [is_active, ...productIds]
    );

    res.json({
      success: true,
      data: { updated: productIds.length }
    });
  } catch (error) {
    console.error('Bulk update status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update products' });
  }
}

/**
 * Export products to CSV
 */
export async function exportProductsCSV(req: Request, res: Response): Promise<void> {
  try {
    const { filters = {} } = req.query;
    
    const products = await ProductModel.findAll(filters as any, 10000, 0);

    // CSV header
    const headers = [
      'sku', 'name', 'description', 'category', 'subcategory', 'service_level',
      'price_per_day', 'damage_compensation_per_item', 'stock_total', 'stock_buffer', 'turnaround_days',
      'length_cm', 'width_cm', 'height_cm', 'weight_kg', 'color', 'material',
      'units_per_pack', 'pack_type', 'supplier', 'supplier_sku', 'notes', 'is_active'
    ];

    // CSV rows
    const rows = products.map(p => [
      p.sku,
      p.name,
      p.description || '',
      p.category_name || '',
      p.subcategory_name || '',
      p.service_level,
      p.price_per_day,
      p.damage_compensation_per_item,
      p.stock_total,
      p.stock_buffer,
      p.turnaround_days,
      p.length_cm || '',
      p.width_cm || '',
      p.height_cm || '',
      p.weight_kg || '',
      p.color || '',
      p.material || '',
      p.units_per_pack,
      p.pack_type || '',
      p.supplier || '',
      p.supplier_sku || '',
      p.notes || '',
      p.is_active
    ]);

    // Build CSV
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="products-export.csv"');
    res.send('\uFEFF' + csv); // BOM for Excel UTF-8 support
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ success: false, error: 'Failed to export products' });
  }
}
