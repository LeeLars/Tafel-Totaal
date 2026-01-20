import { query, queryOne } from '../config/database';

export interface City {
  id: string;
  name: string;
  slug: string;
  province: string;
  postal_codes: string[];
  delivery_fee: number;
  is_active: boolean;
  
  // SEO & Content
  meta_title?: string;
  meta_description?: string;
  hero_title?: string;
  hero_subtitle?: string;
  description?: string;
  
  // Location
  latitude?: number;
  longitude?: number;
  free_delivery_radius_km?: number;
  
  // Stats
  total_orders?: number;
  avg_rating?: number;
  
  created_at: Date;
  updated_at?: Date;
}

export const CityModel = {
  async findById(id: string): Promise<City | null> {
    return queryOne<City>('SELECT * FROM cities WHERE id = $1', [id]);
  },

  async findBySlug(slug: string): Promise<City | null> {
    return queryOne<City>(
      'SELECT * FROM cities WHERE slug = $1 AND is_active = true',
      [slug]
    );
  },

  async findByPostalCode(postalCode: string): Promise<City | null> {
    const pc = postalCode.trim();
    return queryOne<City>(
      `SELECT * FROM cities
       WHERE is_active = true
         AND postal_codes ? $1
       LIMIT 1`,
      [pc]
    );
  },

  async listActive(): Promise<City[]> {
    return query<City>(
      `SELECT * FROM cities
       WHERE is_active = true
       ORDER BY province ASC, name ASC`,
      []
    );
  },

  async listByProvince(province: string): Promise<City[]> {
    return query<City>(
      `SELECT * FROM cities
       WHERE is_active = true AND province = $1
       ORDER BY name ASC`,
      [province]
    );
  },

  async update(id: string, data: Partial<City>): Promise<City | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    });

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await queryOne<City>(
      `UPDATE cities SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result;
  }
};
