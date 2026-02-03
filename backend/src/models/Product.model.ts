import { query, queryOne } from '../config/database';
import { Product, ServiceLevel } from '../types';

export interface ProductFilters {
  category_id?: string;
  subcategory_id?: string;
  service_level?: ServiceLevel;
  is_active?: boolean;
  search?: string;
  min_price?: number;
  max_price?: number;
}

export interface ProductWithCategory extends Product {
  category_name?: string;
  subcategory_name?: string;
  reserved_quantity?: number;
}

export const ProductModel = {
  async findById(id: string): Promise<ProductWithCategory | null> {
    return queryOne<ProductWithCategory>(
      `SELECT p.*, c.name as category_name, sc.name as subcategory_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
       WHERE p.id = $1`,
      [id]
    );
  },

  async findBySlug(slug: string): Promise<ProductWithCategory | null> {
    return queryOne<ProductWithCategory>(
      `SELECT p.*, c.name as category_name, sc.name as subcategory_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
       WHERE p.slug = $1`,
      [slug]
    );
  },

  async findBySku(sku: string): Promise<Product | null> {
    return queryOne<Product>(
      'SELECT * FROM products WHERE sku = $1',
      [sku]
    );
  },

  async findAll(filters: ProductFilters = {}, limit = 50, offset = 0): Promise<ProductWithCategory[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (filters.category_id) {
      conditions.push(`p.category_id = $${paramIndex++}`);
      values.push(filters.category_id);
    }
    if (filters.subcategory_id) {
      conditions.push(`p.subcategory_id = $${paramIndex++}`);
      values.push(filters.subcategory_id);
    }
    if (filters.service_level) {
      conditions.push(`p.service_level = $${paramIndex++}`);
      values.push(filters.service_level);
    }
    if (filters.is_active !== undefined) {
      conditions.push(`p.is_active = $${paramIndex++}`);
      values.push(filters.is_active);
    }
    if (filters.search) {
      conditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
      values.push(`%${filters.search}%`);
      paramIndex++;
    }
    if (filters.min_price !== undefined) {
      conditions.push(`p.price_per_day >= $${paramIndex++}`);
      values.push(filters.min_price);
    }
    if (filters.max_price !== undefined) {
      conditions.push(`p.price_per_day <= $${paramIndex++}`);
      values.push(filters.max_price);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    values.push(limit, offset);
    return query<ProductWithCategory>(
      `SELECT p.*, c.name as category_name, sc.name as subcategory_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
       ${whereClause}
       ORDER BY p.name ASC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      values
    );
  },

  async count(filters: ProductFilters = {}): Promise<number> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (filters.category_id) {
      conditions.push(`category_id = $${paramIndex++}`);
      values.push(filters.category_id);
    }
    if (filters.subcategory_id) {
      conditions.push(`subcategory_id = $${paramIndex++}`);
      values.push(filters.subcategory_id);
    }
    if (filters.service_level) {
      conditions.push(`service_level = $${paramIndex++}`);
      values.push(filters.service_level);
    }
    if (filters.is_active !== undefined) {
      conditions.push(`is_active = $${paramIndex++}`);
      values.push(filters.is_active);
    }
    if (filters.search) {
      conditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      values.push(`%${filters.search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const result = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM products ${whereClause}`,
      values
    );
    return parseInt(result?.count || '0', 10);
  },

  async create(data: {
    sku: string;
    name: string;
    slug: string;
    description?: string;
    category_id: string;
    subcategory_id?: string;
    service_level?: ServiceLevel;
    price_per_day: number;
    damage_compensation_per_item?: number;
    stock_total: number;
    stock_buffer?: number;
    turnaround_days?: number;
    images?: string[];
    is_active?: boolean;
  }): Promise<Product> {
    const result = await queryOne<Product>(
      `INSERT INTO products (
        sku, name, slug, description, category_id, subcategory_id, 
        service_level, price_per_day, damage_compensation_per_item, stock_total, 
        stock_buffer, turnaround_days, images, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        data.sku,
        data.name,
        data.slug,
        data.description || null,
        data.category_id,
        data.subcategory_id || null,
        data.service_level || 'STANDAARD',
        data.price_per_day,
        data.damage_compensation_per_item || 0,
        data.stock_total,
        data.stock_buffer || 5,
        data.turnaround_days || 1,
        JSON.stringify(data.images || []),
        data.is_active !== false
      ]
    );

    if (!result) throw new Error('Failed to create product');
    return result;
  },

  async update(id: string, data: Partial<{
    sku: string;
    name: string;
    slug: string;
    description: string;
    category_id: string;
    subcategory_id: string;
    service_level: ServiceLevel;
    price_per_day: number;
    damage_compensation_per_item: number;
    stock_total: number;
    stock_buffer: number;
    turnaround_days: number;
    images: string[];
    is_active: boolean;
  }>): Promise<Product | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'images') {
          fields.push(`${key} = $${paramIndex++}`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = $${paramIndex++}`);
          values.push(value);
        }
      }
    });

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    return queryOne<Product>(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
  },

  async delete(id: string): Promise<boolean> {
    await query('DELETE FROM products WHERE id = $1', [id]);
    return true;
  },

  async updateStock(id: string, stockTotal: number): Promise<Product | null> {
    return queryOne<Product>(
      'UPDATE products SET stock_total = $1 WHERE id = $2 RETURNING *',
      [stockTotal, id]
    );
  },

  async getByCategory(categoryId: string, activeOnly = true): Promise<Product[]> {
    const activeClause = activeOnly ? 'AND is_active = true' : '';
    return query<Product>(
      `SELECT * FROM products WHERE category_id = $1 ${activeClause} ORDER BY name ASC`,
      [categoryId]
    );
  },

  async getFeatured(limit = 8): Promise<ProductWithCategory[]> {
    return query<ProductWithCategory>(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_active = true
       ORDER BY p.created_at DESC
       LIMIT $1`,
      [limit]
    );
  }
};
