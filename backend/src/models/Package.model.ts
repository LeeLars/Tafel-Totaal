import { query, queryOne } from '../config/database';
import { Package, PackageItem, ServiceLevel, PricingType } from '../types';

export interface PackageFilters {
  service_level?: ServiceLevel;
  is_active?: boolean;
  is_featured?: boolean;
  min_persons?: number;
  max_persons?: number;
  search?: string;
}

export interface PackageWithItems extends Package {
  items?: PackageItemWithProduct[];
}

export interface PackageItemWithProduct extends PackageItem {
  product_name?: string;
  product_sku?: string;
  product_price_per_day?: number;
}

export const PackageModel = {
  async findById(id: string, includeItems = true): Promise<PackageWithItems | null> {
    const pkg = await queryOne<Package>(
      'SELECT * FROM packages WHERE id = $1',
      [id]
    );

    if (!pkg) return null;

    if (includeItems) {
      const items = await this.getItems(id);
      return { ...pkg, items };
    }

    return pkg;
  },

  async findBySlug(slug: string, includeItems = true): Promise<PackageWithItems | null> {
    const pkg = await queryOne<Package>(
      'SELECT * FROM packages WHERE slug = $1',
      [slug]
    );

    if (!pkg) return null;

    if (includeItems) {
      const items = await this.getItems(pkg.id);
      return { ...pkg, items };
    }

    return pkg;
  },

  async findAll(filters: PackageFilters = {}, limit = 50, offset = 0): Promise<Package[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (filters.service_level) {
      conditions.push(`service_level = $${paramIndex++}`);
      values.push(filters.service_level);
    }
    if (filters.is_active !== undefined) {
      conditions.push(`is_active = $${paramIndex++}`);
      values.push(filters.is_active);
    }
    if (filters.is_featured !== undefined) {
      conditions.push(`is_featured = $${paramIndex++}`);
      values.push(filters.is_featured);
    }
    if (filters.min_persons !== undefined) {
      conditions.push(`max_persons >= $${paramIndex++}`);
      values.push(filters.min_persons);
    }
    if (filters.max_persons !== undefined) {
      conditions.push(`min_persons <= $${paramIndex++}`);
      values.push(filters.max_persons);
    }
    if (filters.search) {
      conditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      values.push(`%${filters.search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    values.push(limit, offset);
    return query<Package>(
      `SELECT * FROM packages ${whereClause}
       ORDER BY sort_order ASC, name ASC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      values
    );
  },

  async count(filters: PackageFilters = {}): Promise<number> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (filters.service_level) {
      conditions.push(`service_level = $${paramIndex++}`);
      values.push(filters.service_level);
    }
    if (filters.is_active !== undefined) {
      conditions.push(`is_active = $${paramIndex++}`);
      values.push(filters.is_active);
    }
    if (filters.is_featured !== undefined) {
      conditions.push(`is_featured = $${paramIndex++}`);
      values.push(filters.is_featured);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const result = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM packages ${whereClause}`,
      values
    );
    return parseInt(result?.count || '0', 10);
  },

  async getItems(packageId: string): Promise<PackageItemWithProduct[]> {
    return query<PackageItemWithProduct>(
      `SELECT pi.*, p.name as product_name, p.sku as product_sku, p.price_per_day as product_price_per_day
       FROM package_items pi
       JOIN products p ON pi.product_id = p.id
       WHERE pi.package_id = $1
       ORDER BY pi.is_optional ASC, p.name ASC`,
      [packageId]
    );
  },

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    short_description?: string;
    service_level?: ServiceLevel;
    pricing_type?: PricingType;
    base_price: number;
    price_per_extra_day?: number;
    forfait_days?: number;
    min_persons?: number;
    max_persons?: number;
    damage_compensation_percentage?: number;
    images?: string[];
    is_featured?: boolean;
    is_active?: boolean;
    sort_order?: number;
  }): Promise<Package> {
    const result = await queryOne<Package>(
      `INSERT INTO packages (
        name, slug, description, short_description, service_level, pricing_type,
        base_price, price_per_extra_day, forfait_days, min_persons, max_persons,
        damage_compensation_percentage, images, is_featured, is_active, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        data.name,
        data.slug,
        data.description || null,
        data.short_description || null,
        data.service_level || 'STANDAARD',
        data.pricing_type || 'FORFAIT',
        data.base_price,
        data.price_per_extra_day || 0,
        data.forfait_days || 3,
        data.min_persons || 1,
        data.max_persons || 100,
        data.damage_compensation_percentage || 20,
        JSON.stringify(data.images || []),
        data.is_featured || false,
        data.is_active !== false,
        data.sort_order || 0
      ]
    );

    if (!result) throw new Error('Failed to create package');
    return result;
  },

  async update(id: string, data: Partial<{
    name: string;
    slug: string;
    description: string;
    short_description: string;
    service_level: ServiceLevel;
    pricing_type: PricingType;
    base_price: number;
    price_per_extra_day: number;
    forfait_days: number;
    min_persons: number;
    max_persons: number;
    damage_compensation_percentage: number;
    images: string[];
    is_featured: boolean;
    is_active: boolean;
    sort_order: number;
  }>): Promise<Package | null> {
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

    if (fields.length === 0) return this.findById(id, false);

    values.push(id);
    return queryOne<Package>(
      `UPDATE packages SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
  },

  async delete(id: string): Promise<boolean> {
    await query('DELETE FROM packages WHERE id = $1', [id]);
    return true;
  },

  async addItem(packageId: string, data: {
    product_id: string;
    quantity_per_person: number;
    is_optional?: boolean;
    extra_price?: number;
  }): Promise<PackageItem> {
    const result = await queryOne<PackageItem>(
      `INSERT INTO package_items (package_id, product_id, quantity_per_person, is_optional, extra_price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        packageId,
        data.product_id,
        data.quantity_per_person,
        data.is_optional || false,
        data.extra_price || 0
      ]
    );

    if (!result) throw new Error('Failed to add package item');
    return result;
  },

  async updateItem(itemId: string, data: Partial<{
    quantity_per_person: number;
    is_optional: boolean;
    extra_price: number;
  }>): Promise<PackageItem | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    });

    if (fields.length === 0) return null;

    values.push(itemId);
    return queryOne<PackageItem>(
      `UPDATE package_items SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
  },

  async removeItem(itemId: string): Promise<boolean> {
    await query('DELETE FROM package_items WHERE id = $1', [itemId]);
    return true;
  },

  async getFeatured(limit = 4): Promise<PackageWithItems[]> {
    const packages = await query<Package>(
      `SELECT * FROM packages 
       WHERE is_active = true AND is_featured = true
       ORDER BY sort_order ASC
       LIMIT $1`,
      [limit]
    );

    return Promise.all(
      packages.map(async (pkg) => ({
        ...pkg,
        items: await this.getItems(pkg.id)
      }))
    );
  }
};
