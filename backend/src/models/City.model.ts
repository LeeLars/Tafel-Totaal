import { query, queryOne } from '../config/database';

export interface City {
  id: string;
  name: string;
  slug: string;
  province: string;
  postal_codes: string[];
  delivery_fee: number;
  is_active: boolean;
  created_at: Date;
}

export const CityModel = {
  async findById(id: string): Promise<City | null> {
    return queryOne<City>('SELECT * FROM cities WHERE id = $1', [id]);
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
  }
};
