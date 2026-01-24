import { Request, Response } from 'express';
import { query, queryOne } from '../config/database';
import { Product } from '../types';
import { TagModel } from '../models/Tag.model';

export async function getAllProducts(req: Request, res: Response): Promise<void> {
  try {
    const { category, subcategory, service_level, search, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100);
    const offset = (pageNum - 1) * limitNum;

    let sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             sc.name as subcategory_name, sc.slug as subcategory_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      WHERE p.is_active = true
    `;

    let countSql = `SELECT COUNT(*) as total FROM products p WHERE p.is_active = true`;

    const params: unknown[] = [];
    const countParams: unknown[] = [];
    let paramIndex = 1;

    if (category) {
      const condition = ` AND c.slug = $${paramIndex++}`;
      sql += condition;
      countSql += condition.replace(`$${paramIndex - 1}`, `$${countParams.length + 1}`);
      params.push(category);
      countParams.push(category);
    }

    if (subcategory) {
      const condition = ` AND sc.slug = $${paramIndex++}`;
      sql += condition;
      countSql += condition.replace(`$${paramIndex - 1}`, `$${countParams.length + 1}`);
      params.push(subcategory);
      countParams.push(subcategory);
    }

    if (service_level) {
      const condition = ` AND p.service_level = $${paramIndex++}`;
      sql += condition;
      countSql += condition.replace(`$${paramIndex - 1}`, `$${countParams.length + 1}`);
      params.push(service_level);
      countParams.push(service_level);
    }

    if (search) {
      const condition = ` AND (p.name ILIKE $${paramIndex++} OR p.description ILIKE $${paramIndex++})`;
      sql += condition;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
      countParams.push(searchPattern, searchPattern);
    }

    sql += ` ORDER BY p.name LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limitNum, offset);

    const [products, countResult] = await Promise.all([
      query<Product & { category_name: string; subcategory_name: string }>(sql, params),
      queryOne<{ total: string }>(countSql, countParams),
    ]);

    const total = parseInt(countResult?.total || '0', 10);

    // Fetch tags for all products
    const productsWithTags = await Promise.all(
      products.map(async (product) => {
        const tags = await TagModel.findByProductId(product.id);
        return { ...product, tags };
      })
    );

    res.json({
      success: true,
      data: productsWithTags,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
}

export async function getProductById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const product = await queryOne<Product & { category_name: string; subcategory_name: string }>(
      `SELECT p.*, c.name as category_name, c.slug as category_slug,
              sc.name as subcategory_name, sc.slug as subcategory_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
       WHERE p.id = $1 AND p.is_active = true`,
      [id]
    );

    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch product' });
  }
}
