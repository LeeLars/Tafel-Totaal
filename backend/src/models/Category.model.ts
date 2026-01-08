import { query, queryOne } from '../config/database';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CategoryWithSubcategories extends Category {
  subcategories?: Subcategory[];
}

export const CategoryModel = {
  async findById(id: string): Promise<Category | null> {
    return queryOne<Category>(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );
  },

  async findBySlug(slug: string): Promise<Category | null> {
    return queryOne<Category>(
      'SELECT * FROM categories WHERE slug = $1',
      [slug]
    );
  },

  async findAll(activeOnly = true): Promise<Category[]> {
    const whereClause = activeOnly ? 'WHERE is_active = true' : '';
    return query<Category>(
      `SELECT * FROM categories ${whereClause} ORDER BY sort_order ASC, name ASC`
    );
  },

  async findAllWithSubcategories(activeOnly = true): Promise<CategoryWithSubcategories[]> {
    const categories = await this.findAll(activeOnly);
    
    return Promise.all(
      categories.map(async (cat) => ({
        ...cat,
        subcategories: await this.getSubcategories(cat.id, activeOnly)
      }))
    );
  },

  async getSubcategories(categoryId: string, activeOnly = true): Promise<Subcategory[]> {
    const whereClause = activeOnly 
      ? 'WHERE category_id = $1 AND is_active = true' 
      : 'WHERE category_id = $1';
    return query<Subcategory>(
      `SELECT * FROM subcategories ${whereClause} ORDER BY sort_order ASC, name ASC`,
      [categoryId]
    );
  },

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    sort_order?: number;
    is_active?: boolean;
  }): Promise<Category> {
    const result = await queryOne<Category>(
      `INSERT INTO categories (name, slug, description, image_url, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.name,
        data.slug,
        data.description || null,
        data.image_url || null,
        data.sort_order || 0,
        data.is_active !== false
      ]
    );

    if (!result) throw new Error('Failed to create category');
    return result;
  },

  async update(id: string, data: Partial<{
    name: string;
    slug: string;
    description: string;
    image_url: string;
    sort_order: number;
    is_active: boolean;
  }>): Promise<Category | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    });

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    return queryOne<Category>(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
  },

  async delete(id: string): Promise<boolean> {
    await query('DELETE FROM categories WHERE id = $1', [id]);
    return true;
  },

  // Subcategory methods
  async findSubcategoryById(id: string): Promise<Subcategory | null> {
    return queryOne<Subcategory>(
      'SELECT * FROM subcategories WHERE id = $1',
      [id]
    );
  },

  async createSubcategory(data: {
    category_id: string;
    name: string;
    slug: string;
    description?: string;
    sort_order?: number;
    is_active?: boolean;
  }): Promise<Subcategory> {
    const result = await queryOne<Subcategory>(
      `INSERT INTO subcategories (category_id, name, slug, description, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.category_id,
        data.name,
        data.slug,
        data.description || null,
        data.sort_order || 0,
        data.is_active !== false
      ]
    );

    if (!result) throw new Error('Failed to create subcategory');
    return result;
  },

  async updateSubcategory(id: string, data: Partial<{
    name: string;
    slug: string;
    description: string;
    sort_order: number;
    is_active: boolean;
  }>): Promise<Subcategory | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    });

    if (fields.length === 0) return this.findSubcategoryById(id);

    values.push(id);
    return queryOne<Subcategory>(
      `UPDATE subcategories SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
  },

  async deleteSubcategory(id: string): Promise<boolean> {
    await query('DELETE FROM subcategories WHERE id = $1', [id]);
    return true;
  }
};
