import { Request, Response } from 'express';
import { query, queryOne } from '../config/database';
import { Package, PackageItem, Product } from '../types';

/**
 * Debug endpoint to check and create packages table if needed
 * Also runs migrations for missing columns
 */
export async function debugPackagesTable(_req: Request, res: Response): Promise<void> {
  try {
    // First, ensure toggle_points column exists (migration)
    try {
      await query(`ALTER TABLE package_items ADD COLUMN IF NOT EXISTS toggle_points INTEGER DEFAULT 0`);
      console.log('toggle_points column ensured');
    } catch (migrationError) {
      console.log('toggle_points migration skipped or failed:', migrationError);
    }

    // Check if packages table exists
    const tableCheck = await queryOne<{ exists: boolean }>(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'packages'
      )`
    );

    if (!tableCheck?.exists) {
      // Create packages table
      await query(`
        CREATE TABLE IF NOT EXISTS packages (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          short_description VARCHAR(500),
          image_url VARCHAR(500),
          price_per_day DECIMAL(10,2) NOT NULL DEFAULT 0,
          persons INTEGER NOT NULL DEFAULT 1,
          is_active BOOLEAN NOT NULL DEFAULT true,
          is_featured BOOLEAN NOT NULL DEFAULT false,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create package_items table
      await query(`
        CREATE TABLE IF NOT EXISTS package_items (
          id SERIAL PRIMARY KEY,
          package_id INTEGER NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
          product_id UUID NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          is_optional BOOLEAN NOT NULL DEFAULT false,
          toggle_points INTEGER NOT NULL DEFAULT 0,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      res.json({ 
        success: true, 
        message: 'Packages tables created successfully',
        tables_created: ['packages', 'package_items']
      });
      return;
    }

    // Get table columns
    const columns = await query<{ column_name: string; data_type: string }>(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'packages'
       ORDER BY ordinal_position`
    );

    // Count existing packages
    const countResult = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM packages');

    res.json({ 
      success: true, 
      message: 'Packages table exists',
      table_exists: true,
      columns: columns,
      package_count: parseInt(countResult?.count || '0')
    });
  } catch (error) {
    console.error('Debug packages table error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: errorMessage });
  }
}

interface PackageWithItems extends Package {
  items: (PackageItem & { product: Product })[];
}

interface CreatePackageBody {
  name: string;
  slug?: string;
  description?: string;
  short_description?: string;
  image_url?: string;
  price_per_day: number;
  persons: number;
  is_active?: boolean;
  is_featured?: boolean;
  sort_order?: number;
}

interface UpdatePackageBody extends Partial<CreatePackageBody> {}

interface AddPackageItemBody {
  product_id: string;
  quantity: number;
  is_optional?: boolean;
  toggle_points?: number;
  sort_order?: number;
}

export async function getAllPackages(req: Request, res: Response): Promise<void> {
  try {
    const { is_featured } = req.query;

    let sql = `
      SELECT p.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', pi.id,
              'product_id', pi.product_id,
              'quantity_per_person', COALESCE(pi.quantity_per_person, 1),
              'is_optional', COALESCE(pi.is_optional, false),
              'extra_price', COALESCE(pi.extra_price, 0),
              'toggle_points', COALESCE(pi.toggle_points, 0),
              'product', json_build_object(
                'id', pr.id,
                'name', pr.name,
                'sku', pr.sku,
                'images', pr.images,
                'price_per_day', pr.price_per_day
              )
            ) ORDER BY pi.id
          ) FILTER (WHERE pi.id IS NOT NULL), '[]'
        ) as items
      FROM packages p
      LEFT JOIN package_items pi ON p.id = pi.package_id
      LEFT JOIN products pr ON pi.product_id = pr.id
      WHERE p.is_active = true
    `;

    const params: unknown[] = [];

    if (is_featured === 'true') {
      sql += ` AND p.is_featured = true`;
    }

    sql += ` GROUP BY p.id ORDER BY p.sort_order, p.name`;

    const packages = await query<PackageWithItems>(sql, params);

    res.json({ success: true, data: packages });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch packages' });
  }
}

export async function getPackageById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const pkg = await queryOne<PackageWithItems>(
      `SELECT p.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', pi.id,
              'product_id', pi.product_id,
              'quantity_per_person', COALESCE(pi.quantity_per_person, 1),
              'is_optional', COALESCE(pi.is_optional, false),
              'extra_price', COALESCE(pi.extra_price, 0),
              'toggle_points', COALESCE(pi.toggle_points, 0),
              'product', json_build_object(
                'id', pr.id,
                'name', pr.name,
                'sku', pr.sku,
                'description', pr.description,
                'images', pr.images,
                'price_per_day', pr.price_per_day
              )
            ) ORDER BY pi.id
          ) FILTER (WHERE pi.id IS NOT NULL), '[]'
        ) as items
      FROM packages p
      LEFT JOIN package_items pi ON p.id = pi.package_id
      LEFT JOIN products pr ON pi.product_id = pr.id
      WHERE p.id = $1 AND p.is_active = true
      GROUP BY p.id`,
      [id]
    );

    if (!pkg) {
      res.status(404).json({ success: false, error: 'Package not found' });
      return;
    }

    res.json({ success: true, data: pkg });
  } catch (error) {
    console.error('Get package by ID error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch package' });
  }
}

// ============ ADMIN ENDPOINTS ============

/**
 * Get all packages (admin - includes inactive)
 */
export async function adminGetAllPackages(_req: Request, res: Response): Promise<void> {
  try {
    const packages = await query<PackageWithItems>(
      `SELECT p.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', pi.id,
              'product_id', pi.product_id,
              'quantity_per_person', COALESCE(pi.quantity_per_person, 1),
              'is_optional', COALESCE(pi.is_optional, false),
              'extra_price', COALESCE(pi.extra_price, 0),
              'toggle_points', COALESCE(pi.toggle_points, 0),
              'product', json_build_object(
                'id', pr.id,
                'name', pr.name,
                'sku', pr.sku,
                'images', pr.images,
                'price_per_day', pr.price_per_day
              )
            ) ORDER BY pi.id
          ) FILTER (WHERE pi.id IS NOT NULL), '[]'
        ) as items
      FROM packages p
      LEFT JOIN package_items pi ON p.id = pi.package_id
      LEFT JOIN products pr ON pi.product_id = pr.id
      GROUP BY p.id
      ORDER BY p.sort_order, p.name`
    );

    res.json({ success: true, data: packages });
  } catch (error) {
    console.error('Admin get packages error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: 'Failed to fetch packages', details: errorMessage });
  }
}

/**
 * Create new package (admin)
 */
export async function createPackage(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body;
    
    // Generate slug if not provided
    const slug = body.slug || body.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Map frontend fields to database schema
    const result = await queryOne<{ id: string }>(
      `INSERT INTO packages (
        name, slug, description, short_description, service_level, pricing_type,
        base_price, price_per_extra_day, forfait_days, min_persons, max_persons,
        deposit_percentage, images, is_featured, is_active, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id`,
      [
        body.name,
        slug,
        body.description || null,
        body.short_description || null,
        body.service_level || 'STANDAARD',
        body.pricing_type || 'FORFAIT',
        body.base_price || body.price_per_day || 0,
        body.price_per_extra_day || 0,
        body.forfait_days || 3,
        body.min_persons || body.persons || 10,
        body.max_persons || 100,
        body.deposit_percentage || 20,
        body.image_url ? JSON.stringify([body.image_url]) : '[]',
        body.is_featured || false,
        body.is_active !== false,
        body.sort_order || 0
      ]
    );

    if (!result) {
      res.status(500).json({ success: false, error: 'Failed to create package' });
      return;
    }

    res.status(201).json({ 
      success: true, 
      data: { id: result.id },
      message: 'Package created successfully'
    });
  } catch (error) {
    console.error('Create package error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if ((error as any).code === '23505') {
      res.status(400).json({ success: false, error: 'Package slug already exists' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to create package', details: errorMessage });
    }
  }
}

/**
 * Update package (admin)
 */
export async function updatePackage(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const body = req.body as UpdatePackageBody;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(body.name);
    }
    if (body.slug !== undefined) {
      updates.push(`slug = $${paramIndex++}`);
      values.push(body.slug);
    }
    if (body.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(body.description);
    }
    if (body.short_description !== undefined) {
      updates.push(`short_description = $${paramIndex++}`);
      values.push(body.short_description);
    }
    if (body.image_url !== undefined) {
      // Convert single image_url to images array for database
      updates.push(`images = $${paramIndex++}`);
      values.push(body.image_url ? JSON.stringify([body.image_url]) : '[]');
    }
    if (body.price_per_day !== undefined) {
      // Map price_per_day to base_price in database
      updates.push(`base_price = $${paramIndex++}`);
      values.push(body.price_per_day);
    }
    if (body.persons !== undefined) {
      // Map persons to min_persons in database
      updates.push(`min_persons = $${paramIndex++}`);
      values.push(body.persons);
    }
    if (body.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(body.is_active);
    }
    if (body.is_featured !== undefined) {
      updates.push(`is_featured = $${paramIndex++}`);
      values.push(body.is_featured);
    }
    if (body.sort_order !== undefined) {
      updates.push(`sort_order = $${paramIndex++}`);
      values.push(body.sort_order);
    }

    if (updates.length === 0) {
      res.status(400).json({ success: false, error: 'No fields to update' });
      return;
    }

    values.push(id);
    const sql = `UPDATE packages SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id`;

    const result = await queryOne<{ id: number }>(sql, values);

    if (!result) {
      res.status(404).json({ success: false, error: 'Package not found' });
      return;
    }

    res.json({ 
      success: true, 
      data: { id: result.id },
      message: 'Package updated successfully'
    });
  } catch (error) {
    console.error('Update package error:', error);
    if ((error as any).code === '23505') {
      res.status(400).json({ success: false, error: 'Package slug already exists' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to update package' });
    }
  }
}

/**
 * Delete package (admin)
 */
export async function deletePackage(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const result = await queryOne<{ id: number }>(
      'DELETE FROM packages WHERE id = $1 RETURNING id',
      [id]
    );

    if (!result) {
      res.status(404).json({ success: false, error: 'Package not found' });
      return;
    }

    res.json({ 
      success: true, 
      message: 'Package deleted successfully'
    });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete package' });
  }
}

/**
 * Add product to package (admin)
 */
export async function addPackageItem(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const body = req.body as AddPackageItemBody;

    const result = await queryOne<{ id: number }>(
      `INSERT INTO package_items (
        package_id, product_id, quantity, is_optional, toggle_points, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id`,
      [
        id,
        body.product_id,
        body.quantity || 1,
        body.is_optional || false,
        body.toggle_points || 0,
        body.sort_order || 0
      ]
    );

    if (!result) {
      res.status(500).json({ success: false, error: 'Failed to add product to package' });
      return;
    }

    res.status(201).json({ 
      success: true, 
      data: { id: result.id },
      message: 'Product added to package successfully'
    });
  } catch (error) {
    console.error('Add package item error:', error);
    if ((error as any).code === '23505') {
      res.status(400).json({ success: false, error: 'Product already in package' });
    } else if ((error as any).code === '23503') {
      res.status(404).json({ success: false, error: 'Package or product not found' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to add product to package' });
    }
  }
}

/**
 * Update package item (admin)
 */
export async function updatePackageItem(req: Request, res: Response): Promise<void> {
  try {
    const { id, itemId } = req.params;
    const body = req.body as Partial<AddPackageItemBody>;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.quantity !== undefined) {
      updates.push(`quantity = $${paramIndex++}`);
      values.push(body.quantity);
    }
    if (body.is_optional !== undefined) {
      updates.push(`is_optional = $${paramIndex++}`);
      values.push(body.is_optional);
    }
    if (body.toggle_points !== undefined) {
      updates.push(`toggle_points = $${paramIndex++}`);
      values.push(body.toggle_points);
    }
    if (body.sort_order !== undefined) {
      updates.push(`sort_order = $${paramIndex++}`);
      values.push(body.sort_order);
    }

    if (updates.length === 0) {
      res.status(400).json({ success: false, error: 'No fields to update' });
      return;
    }

    values.push(itemId, id);
    const sql = `UPDATE package_items SET ${updates.join(', ')} 
                 WHERE id = $${paramIndex++} AND package_id = $${paramIndex} 
                 RETURNING id`;

    const result = await queryOne<{ id: number }>(sql, values);

    if (!result) {
      res.status(404).json({ success: false, error: 'Package item not found' });
      return;
    }

    res.json({ 
      success: true, 
      data: { id: result.id },
      message: 'Package item updated successfully'
    });
  } catch (error) {
    console.error('Update package item error:', error);
    res.status(500).json({ success: false, error: 'Failed to update package item' });
  }
}

/**
 * Remove product from package (admin)
 */
export async function deletePackageItem(req: Request, res: Response): Promise<void> {
  try {
    const { id, itemId } = req.params;

    const result = await queryOne<{ id: number }>(
      'DELETE FROM package_items WHERE id = $1 AND package_id = $2 RETURNING id',
      [itemId, id]
    );

    if (!result) {
      res.status(404).json({ success: false, error: 'Package item not found' });
      return;
    }

    res.json({ 
      success: true, 
      message: 'Product removed from package successfully'
    });
  } catch (error) {
    console.error('Delete package item error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove product from package' });
  }
}
