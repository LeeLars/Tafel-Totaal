import { pool } from '../config/database';

export interface ProductComponent {
  id: string;
  parent_product_id: string;
  component_product_id: string;
  quantity: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProductWithComponents {
  id: string;
  name: string;
  sku: string;
  components?: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    stock_total: number;
  }>;
}

export const ProductComponentModel = {
  /**
   * Get all components for a product (if it's a set)
   */
  async getComponentsByParentId(parentProductId: string): Promise<any[]> {
    const query = `
      SELECT 
        pc.id,
        pc.component_product_id,
        pc.quantity,
        p.name,
        p.sku,
        p.stock_total,
        p.price_per_day,
        p.images
      FROM product_components pc
      JOIN products p ON pc.component_product_id = p.id
      WHERE pc.parent_product_id = $1
      ORDER BY p.name
    `;
    const result = await pool.query(query, [parentProductId]);
    return result.rows;
  },

  /**
   * Get all parent products (sets) that contain this component
   */
  async getParentsByComponentId(componentProductId: string): Promise<any[]> {
    const query = `
      SELECT 
        pc.id,
        pc.parent_product_id,
        pc.quantity,
        p.name,
        p.sku,
        p.stock_total,
        p.is_set
      FROM product_components pc
      JOIN products p ON pc.parent_product_id = p.id
      WHERE pc.component_product_id = $1
      ORDER BY p.name
    `;
    const result = await pool.query(query, [componentProductId]);
    return result.rows;
  },

  /**
   * Add a component to a product set
   */
  async addComponent(parentProductId: string, componentProductId: string, quantity: number): Promise<ProductComponent> {
    const query = `
      INSERT INTO product_components (parent_product_id, component_product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (parent_product_id, component_product_id) 
      DO UPDATE SET quantity = $3, updated_at = NOW()
      RETURNING *
    `;
    const result = await pool.query(query, [parentProductId, componentProductId, quantity]);
    
    // Mark parent as a set
    await pool.query('UPDATE products SET is_set = true WHERE id = $1', [parentProductId]);
    
    return result.rows[0];
  },

  /**
   * Remove a component from a product set
   */
  async removeComponent(parentProductId: string, componentProductId: string): Promise<void> {
    await pool.query(
      'DELETE FROM product_components WHERE parent_product_id = $1 AND component_product_id = $2',
      [parentProductId, componentProductId]
    );

    // Check if parent still has components, if not, unmark as set
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM product_components WHERE parent_product_id = $1',
      [parentProductId]
    );
    
    if (parseInt(countResult.rows[0].count) === 0) {
      await pool.query('UPDATE products SET is_set = false WHERE id = $1', [parentProductId]);
    }
  },

  /**
   * Update component quantity
   */
  async updateComponentQuantity(parentProductId: string, componentProductId: string, quantity: number): Promise<void> {
    await pool.query(
      'UPDATE product_components SET quantity = $1, updated_at = NOW() WHERE parent_product_id = $2 AND component_product_id = $3',
      [quantity, parentProductId, componentProductId]
    );
  },

  /**
   * Calculate available stock for a set based on its components
   * Returns the maximum number of complete sets that can be made
   */
  async calculateSetAvailability(parentProductId: string, startDate: Date, endDate: Date): Promise<number> {
    const components = await this.getComponentsByParentId(parentProductId);
    
    if (components.length === 0) {
      return 0;
    }

    // For each component, calculate how many sets can be made
    const availabilities = await Promise.all(
      components.map(async (component) => {
        // Get available stock for this component in the date range
        const availableQuery = `
          SELECT 
            p.stock_total - COALESCE(SUM(
              CASE 
                WHEN r.status IN ('PENDING', 'ACTIVE') 
                AND r.start_date < $2 
                AND r.end_date > $1
                THEN r.quantity
                ELSE 0
              END
            ), 0) as available
          FROM products p
          LEFT JOIN reservations r ON r.product_id = p.id
          WHERE p.id = $3
          GROUP BY p.stock_total
        `;
        
        const result = await pool.query(availableQuery, [startDate, endDate, component.component_product_id]);
        const available = result.rows[0]?.available || 0;
        
        // How many complete sets can we make with this component?
        return Math.floor(available / component.quantity);
      })
    );

    // Return the minimum (bottleneck component)
    return Math.min(...availabilities);
  },

  /**
   * Get all product sets (products that have components)
   */
  async getAllSets(): Promise<any[]> {
    const query = `
      SELECT DISTINCT
        p.id,
        p.name,
        p.sku,
        p.stock_total,
        p.price_per_day,
        p.is_active,
        (
          SELECT json_agg(
            json_build_object(
              'id', comp.id,
              'name', comp.name,
              'sku', comp.sku,
              'quantity', pc.quantity,
              'stock_total', comp.stock_total
            )
          )
          FROM product_components pc
          JOIN products comp ON pc.component_product_id = comp.id
          WHERE pc.parent_product_id = p.id
        ) as components
      FROM products p
      WHERE p.is_set = true
      ORDER BY p.name
    `;
    const result = await pool.query(query);
    return result.rows;
  }
};
