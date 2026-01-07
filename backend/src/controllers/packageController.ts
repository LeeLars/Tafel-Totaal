import { Request, Response } from 'express';
import { query, queryOne } from '../config/database';
import { Package, PackageItem, Product } from '../types';

interface PackageWithItems extends Package {
  items: (PackageItem & { product: Product })[];
}

export async function getAllPackages(req: Request, res: Response): Promise<void> {
  try {
    const { service_level, min_persons, max_persons, is_featured } = req.query;

    let sql = `
      SELECT p.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', pi.id,
              'quantity_per_person', pi.quantity_per_person,
              'is_optional', pi.is_optional,
              'extra_price', pi.extra_price,
              'product', json_build_object(
                'id', pr.id,
                'name', pr.name,
                'sku', pr.sku,
                'images', pr.images
              )
            )
          ) FILTER (WHERE pi.id IS NOT NULL), '[]'
        ) as items
      FROM packages p
      LEFT JOIN package_items pi ON p.id = pi.package_id
      LEFT JOIN products pr ON pi.product_id = pr.id
      WHERE p.is_active = true
    `;

    const params: unknown[] = [];
    let paramIndex = 1;

    if (service_level) {
      sql += ` AND p.service_level = $${paramIndex++}`;
      params.push(service_level);
    }

    if (min_persons) {
      sql += ` AND p.max_persons >= $${paramIndex++}`;
      params.push(parseInt(min_persons as string, 10));
    }

    if (max_persons) {
      sql += ` AND p.min_persons <= $${paramIndex++}`;
      params.push(parseInt(max_persons as string, 10));
    }

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
              'quantity_per_person', pi.quantity_per_person,
              'is_optional', pi.is_optional,
              'extra_price', pi.extra_price,
              'product', json_build_object(
                'id', pr.id,
                'name', pr.name,
                'sku', pr.sku,
                'description', pr.description,
                'images', pr.images,
                'price_per_day', pr.price_per_day
              )
            )
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
