import { query, queryOne } from '../config/database';
import { Order, OrderItem, OrderStatus, DeliveryMethod } from '../types';

export interface OrderFilters {
  customer_id?: string;
  status?: OrderStatus;
  status_in?: OrderStatus[];
  from_date?: Date;
  to_date?: Date;
  search?: string;
}

export interface OrderWithItems extends Order {
  items?: OrderItemWithDetails[];
  customer_email?: string;
  customer_name?: string;
}

export interface OrderItemWithDetails extends OrderItem {
  name?: string;
  sku?: string;
}

export const OrderModel = {
  async findById(id: string, includeItems = true): Promise<OrderWithItems | null> {
    const order = await queryOne<OrderWithItems>(
      `SELECT o.*, c.email as customer_email, 
              CONCAT(c.first_name, ' ', c.last_name) as customer_name
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE o.id = $1`,
      [id]
    );

    if (!order) return null;

    if (includeItems) {
      const items = await this.getItems(id);
      return { ...order, items };
    }

    return order;
  },

  async findByOrderNumber(orderNumber: string): Promise<OrderWithItems | null> {
    const order = await queryOne<OrderWithItems>(
      `SELECT o.*, c.email as customer_email,
              CONCAT(c.first_name, ' ', c.last_name) as customer_name
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE o.order_number = $1`,
      [orderNumber]
    );

    if (!order) return null;

    const items = await this.getItems(order.id);
    return { ...order, items };
  },

  async findByMolliePaymentId(paymentId: string): Promise<Order | null> {
    return queryOne<Order>(
      'SELECT * FROM orders WHERE mollie_payment_id = $1',
      [paymentId]
    );
  },

  async findAll(filters: OrderFilters = {}, limit = 50, offset = 0): Promise<OrderWithItems[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (filters.customer_id) {
      conditions.push(`o.customer_id = $${paramIndex++}`);
      values.push(filters.customer_id);
    }
    if (filters.status) {
      conditions.push(`o.status = $${paramIndex++}`);
      values.push(filters.status);
    }
    if (filters.status_in && filters.status_in.length > 0) {
      conditions.push(`o.status = ANY($${paramIndex++})`);
      values.push(filters.status_in);
    }
    if (filters.from_date) {
      conditions.push(`o.rental_start_date >= $${paramIndex++}`);
      values.push(filters.from_date);
    }
    if (filters.to_date) {
      conditions.push(`o.rental_end_date <= $${paramIndex++}`);
      values.push(filters.to_date);
    }
    if (filters.search) {
      conditions.push(`(o.order_number ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex} OR c.first_name ILIKE $${paramIndex} OR c.last_name ILIKE $${paramIndex})`);
      values.push(`%${filters.search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    values.push(limit, offset);
    return query<OrderWithItems>(
      `SELECT o.*, c.email as customer_email,
              CONCAT(c.first_name, ' ', c.last_name) as customer_name
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      values
    );
  },

  async count(filters: OrderFilters = {}): Promise<number> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (filters.customer_id) {
      conditions.push(`customer_id = $${paramIndex++}`);
      values.push(filters.customer_id);
    }
    if (filters.status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(filters.status);
    }
    if (filters.status_in && filters.status_in.length > 0) {
      conditions.push(`status = ANY($${paramIndex++})`);
      values.push(filters.status_in);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const result = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM orders ${whereClause}`,
      values
    );
    return parseInt(result?.count || '0', 10);
  },

  async getItems(orderId: string): Promise<OrderItemWithDetails[]> {
    return query<OrderItemWithDetails>(
      `SELECT oi.*,
              COALESCE(p.name, pkg.name) as name,
              p.sku as sku
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       LEFT JOIN packages pkg ON oi.package_id = pkg.id
       WHERE oi.order_id = $1`,
      [orderId]
    );
  },

  async create(data: {
    customer_id: string;
    subtotal: number;
    delivery_fee: number;
    damage_compensation_total: number;
    total: number;
    delivery_method: DeliveryMethod;
    delivery_address_id?: string;
    rental_start_date: Date;
    rental_end_date: Date;
    notes?: string;
  }): Promise<Order> {
    const result = await queryOne<Order>(
      `INSERT INTO orders (
        customer_id, subtotal, delivery_fee, damage_compensation_total, total,
        delivery_method, delivery_address_id, rental_start_date, rental_end_date, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        data.customer_id,
        data.subtotal,
        data.delivery_fee,
        data.damage_compensation_total,
        data.total,
        data.delivery_method,
        data.delivery_address_id || null,
        data.rental_start_date,
        data.rental_end_date,
        data.notes || null
      ]
    );

    if (!result) throw new Error('Failed to create order');
    return result;
  },

  async addItem(orderId: string, data: {
    item_type: 'package' | 'product';
    package_id?: string;
    product_id?: string;
    quantity: number;
    persons?: number;
    unit_price: number;
    damage_compensation_amount: number;
    line_total: number;
  }): Promise<OrderItem> {
    const result = await queryOne<OrderItem>(
      `INSERT INTO order_items (
        order_id, item_type, package_id, product_id, quantity, persons,
        unit_price, damage_compensation_amount, line_total
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        orderId,
        data.item_type,
        data.package_id || null,
        data.product_id || null,
        data.quantity,
        data.persons || null,
        data.unit_price,
        data.damage_compensation_amount,
        data.line_total
      ]
    );

    if (!result) throw new Error('Failed to add order item');
    return result;
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    return queryOne<Order>(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
  },

  async setMolliePaymentId(id: string, paymentId: string): Promise<Order | null> {
    return queryOne<Order>(
      'UPDATE orders SET mollie_payment_id = $1 WHERE id = $2 RETURNING *',
      [paymentId, id]
    );
  },

  async markPaid(id: string): Promise<Order | null> {
    return queryOne<Order>(
      `UPDATE orders SET status = 'confirmed', paid_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
  },

  async updateAdminNotes(id: string, notes: string): Promise<Order | null> {
    return queryOne<Order>(
      'UPDATE orders SET admin_notes = $1 WHERE id = $2 RETURNING *',
      [notes, id]
    );
  },

  async updateLoyaltyPoints(id: string, pointsEarned: number, pointsRedeemed: number): Promise<Order | null> {
    return queryOne<Order>(
      'UPDATE orders SET loyalty_points_earned = $1, loyalty_points_redeemed = $2 WHERE id = $3 RETURNING *',
      [pointsEarned, pointsRedeemed, id]
    );
  },

  async getByCustomer(customerId: string, limit = 20): Promise<OrderWithItems[]> {
    return query<OrderWithItems>(
      `SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [customerId, limit]
    );
  },

  async getUpcoming(days = 7): Promise<OrderWithItems[]> {
    return query<OrderWithItems>(
      `SELECT o.*, c.email as customer_email,
              CONCAT(c.first_name, ' ', c.last_name) as customer_name
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE o.status IN ('confirmed', 'preparing')
         AND o.rental_start_date BETWEEN NOW() AND NOW() + INTERVAL '${days} days'
       ORDER BY o.rental_start_date ASC`
    );
  },

  async getReturnsToday(): Promise<OrderWithItems[]> {
    return query<OrderWithItems>(
      `SELECT o.*, c.email as customer_email,
              CONCAT(c.first_name, ' ', c.last_name) as customer_name
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE o.status = 'delivered'
         AND o.rental_end_date = CURRENT_DATE
       ORDER BY o.rental_end_date ASC`
    );
  },

  async getStats(): Promise<{
    total_orders: number;
    pending_orders: number;
    active_rentals: number;
    revenue_this_month: number;
  }> {
    const result = await queryOne<{
      total_orders: string;
      pending_orders: string;
      active_rentals: string;
      revenue_this_month: string;
    }>(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'pending_payment') as pending_orders,
        COUNT(*) FILTER (WHERE status IN ('confirmed', 'preparing', 'ready_for_delivery', 'delivered')) as active_rentals,
        COALESCE(SUM(total) FILTER (WHERE status NOT IN ('cancelled', 'payment_failed') AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())), 0) as revenue_this_month
      FROM orders
    `);

    return {
      total_orders: parseInt(result?.total_orders || '0', 10),
      pending_orders: parseInt(result?.pending_orders || '0', 10),
      active_rentals: parseInt(result?.active_rentals || '0', 10),
      revenue_this_month: parseFloat(result?.revenue_this_month || '0')
    };
  }
};
