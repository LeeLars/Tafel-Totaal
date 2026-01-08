import { query, queryOne } from '../config/database';
import { Customer, Address } from '../types';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export const CustomerModel = {
  async findById(id: string): Promise<Customer | null> {
    return queryOne<Customer>(
      'SELECT * FROM customers WHERE id = $1',
      [id]
    );
  },

  async findByEmail(email: string): Promise<Customer | null> {
    return queryOne<Customer>(
      'SELECT * FROM customers WHERE email = $1',
      [email.toLowerCase()]
    );
  },

  async create(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    company_name?: string;
    vat_number?: string;
  }): Promise<Customer> {
    const password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);
    
    const result = await queryOne<Customer>(
      `INSERT INTO customers (email, password_hash, first_name, last_name, phone, company_name, vat_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.email.toLowerCase(),
        password_hash,
        data.first_name,
        data.last_name,
        data.phone || null,
        data.company_name || null,
        data.vat_number || null
      ]
    );
    
    if (!result) throw new Error('Failed to create customer');
    return result;
  },

  async update(id: string, data: Partial<{
    first_name: string;
    last_name: string;
    phone: string;
    company_name: string;
    vat_number: string;
  }>): Promise<Customer | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.first_name) {
      fields.push(`first_name = $${paramIndex++}`);
      values.push(data.first_name);
    }
    if (data.last_name) {
      fields.push(`last_name = $${paramIndex++}`);
      values.push(data.last_name);
    }
    if (data.phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(data.phone);
    }
    if (data.company_name !== undefined) {
      fields.push(`company_name = $${paramIndex++}`);
      values.push(data.company_name);
    }
    if (data.vat_number !== undefined) {
      fields.push(`vat_number = $${paramIndex++}`);
      values.push(data.vat_number);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    return queryOne<Customer>(
      `UPDATE customers SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
  },

  async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const result = await query(
      'UPDATE customers SET password_hash = $1 WHERE id = $2',
      [password_hash, id]
    );
    return result.length >= 0;
  },

  async verifyPassword(customer: Customer, password: string): Promise<boolean> {
    return bcrypt.compare(password, customer.password_hash);
  },

  async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM customers WHERE id = $1',
      [id]
    );
    return result.length >= 0;
  },

  async emailExists(email: string): Promise<boolean> {
    const result = await queryOne<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM customers WHERE email = $1) as exists',
      [email.toLowerCase()]
    );
    return result?.exists || false;
  },

  // Address methods
  async getAddresses(customerId: string): Promise<Address[]> {
    return query<Address>(
      'SELECT * FROM customer_addresses WHERE customer_id = $1 ORDER BY is_default DESC, created_at DESC',
      [customerId]
    );
  },

  async addAddress(customerId: string, data: {
    type: 'delivery' | 'billing';
    street: string;
    house_number: string;
    postal_code: string;
    city: string;
    country?: string;
    is_default?: boolean;
  }): Promise<Address> {
    // If this is default, unset other defaults first
    if (data.is_default) {
      await query(
        'UPDATE customer_addresses SET is_default = false WHERE customer_id = $1 AND type = $2',
        [customerId, data.type]
      );
    }

    const result = await queryOne<Address>(
      `INSERT INTO customer_addresses (customer_id, type, street, house_number, postal_code, city, country, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        customerId,
        data.type,
        data.street,
        data.house_number,
        data.postal_code,
        data.city,
        data.country || 'Belgium',
        data.is_default || false
      ]
    );

    if (!result) throw new Error('Failed to create address');
    return result;
  },

  async updateAddress(addressId: string, customerId: string, data: Partial<{
    street: string;
    house_number: string;
    postal_code: string;
    city: string;
    country: string;
    is_default: boolean;
  }>): Promise<Address | null> {
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

    values.push(addressId, customerId);
    return queryOne<Address>(
      `UPDATE customer_addresses SET ${fields.join(', ')} 
       WHERE id = $${paramIndex++} AND customer_id = $${paramIndex}
       RETURNING *`,
      values
    );
  },

  async deleteAddress(addressId: string, customerId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM customer_addresses WHERE id = $1 AND customer_id = $2',
      [addressId, customerId]
    );
    return result.length >= 0;
  }
};
