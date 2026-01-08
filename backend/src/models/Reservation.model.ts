import { query, queryOne } from '../config/database';
import { Reservation } from '../types';

const SOFT_RESERVATION_MINUTES = 30;

export interface AvailabilityResult {
  available: boolean;
  available_quantity: number;
  stock_total: number;
  reserved_quantity: number;
}

export const ReservationModel = {
  async findById(id: string): Promise<Reservation | null> {
    return queryOne<Reservation>(
      'SELECT * FROM inventory_reservations WHERE id = $1',
      [id]
    );
  },

  async findByOrder(orderId: string): Promise<Reservation[]> {
    return query<Reservation>(
      'SELECT * FROM inventory_reservations WHERE order_id = $1',
      [orderId]
    );
  },

  async findBySession(sessionId: string): Promise<Reservation[]> {
    return query<Reservation>(
      `SELECT * FROM inventory_reservations 
       WHERE session_id = $1 AND status IN ('PENDING', 'ACTIVE')`,
      [sessionId]
    );
  },

  async checkAvailability(
    productId: string,
    startDate: Date,
    endDate: Date,
    quantity: number
  ): Promise<AvailabilityResult> {
    const result = await queryOne<AvailabilityResult>(
      'SELECT * FROM check_product_availability($1, $2, $3, $4)',
      [productId, startDate, endDate, quantity]
    );

    return result || {
      available: false,
      available_quantity: 0,
      stock_total: 0,
      reserved_quantity: 0
    };
  },

  async createSoftReservation(data: {
    product_id: string;
    session_id: string;
    quantity: number;
    start_date: Date;
    end_date: Date;
  }): Promise<Reservation> {
    const expiresAt = new Date(Date.now() + SOFT_RESERVATION_MINUTES * 60 * 1000);

    const result = await queryOne<Reservation>(
      `INSERT INTO inventory_reservations (
        product_id, session_id, quantity, start_date, end_date, type, status, expires_at
      ) VALUES ($1, $2, $3, $4, $5, 'SOFT', 'PENDING', $6)
      RETURNING *`,
      [
        data.product_id,
        data.session_id,
        data.quantity,
        data.start_date,
        data.end_date,
        expiresAt
      ]
    );

    if (!result) throw new Error('Failed to create soft reservation');
    return result;
  },

  async createHardReservation(data: {
    product_id: string;
    order_id: string;
    quantity: number;
    start_date: Date;
    end_date: Date;
  }): Promise<Reservation> {
    const result = await queryOne<Reservation>(
      `INSERT INTO inventory_reservations (
        product_id, order_id, quantity, start_date, end_date, type, status
      ) VALUES ($1, $2, $3, $4, $5, 'HARD', 'ACTIVE')
      RETURNING *`,
      [
        data.product_id,
        data.order_id,
        data.quantity,
        data.start_date,
        data.end_date
      ]
    );

    if (!result) throw new Error('Failed to create hard reservation');
    return result;
  },

  async assignOrderToSessionReservations(sessionId: string, orderId: string): Promise<number> {
    const result = await query<Reservation>(
      `UPDATE inventory_reservations
       SET order_id = $1
       WHERE session_id = $2 AND status = 'PENDING' AND order_id IS NULL
       RETURNING *`,
      [orderId, sessionId]
    );
    return result.length;
  },

  async convertToHardByOrder(orderId: string): Promise<number> {
    const result = await query<Reservation>(
      `UPDATE inventory_reservations
       SET session_id = NULL, type = 'HARD', status = 'ACTIVE', expires_at = NULL
       WHERE order_id = $1 AND status = 'PENDING'
       RETURNING *`,
      [orderId]
    );
    return result.length;
  },

  async convertToHard(sessionId: string, orderId: string): Promise<number> {
    const result = await query<Reservation>(
      `UPDATE inventory_reservations 
       SET order_id = $1, session_id = NULL, type = 'HARD', status = 'ACTIVE', expires_at = NULL
       WHERE session_id = $2 AND status = 'PENDING'
       RETURNING *`,
      [orderId, sessionId]
    );
    return result.length;
  },

  async release(id: string): Promise<boolean> {
    await query(
      `UPDATE inventory_reservations 
       SET status = 'RELEASED', released_at = NOW()
       WHERE id = $1`,
      [id]
    );
    return true;
  },

  async releaseBySession(sessionId: string): Promise<number> {
    const result = await query<Reservation>(
      `UPDATE inventory_reservations 
       SET status = 'RELEASED', released_at = NOW()
       WHERE session_id = $1 AND status IN ('PENDING', 'ACTIVE')
       RETURNING *`,
      [sessionId]
    );
    return result.length;
  },

  async releaseByOrder(orderId: string): Promise<number> {
    const result = await query<Reservation>(
      `UPDATE inventory_reservations 
       SET status = 'RELEASED', released_at = NOW()
       WHERE order_id = $1 AND status IN ('PENDING', 'ACTIVE')
       RETURNING *`,
      [orderId]
    );
    return result.length;
  },

  async complete(orderId: string): Promise<number> {
    const result = await query<Reservation>(
      `UPDATE inventory_reservations 
       SET status = 'COMPLETED'
       WHERE order_id = $1 AND status = 'ACTIVE'
       RETURNING *`,
      [orderId]
    );
    return result.length;
  },

  async cleanupExpired(): Promise<number> {
    const result = await query<Reservation>(
      `UPDATE inventory_reservations 
       SET status = 'RELEASED', released_at = NOW()
       WHERE type = 'SOFT' AND status = 'PENDING' AND expires_at < NOW()
       RETURNING *`
    );
    return result.length;
  },

  async extendSoftReservation(id: string, minutes = SOFT_RESERVATION_MINUTES): Promise<Reservation | null> {
    const expiresAt = new Date(Date.now() + minutes * 60 * 1000);
    return queryOne<Reservation>(
      `UPDATE inventory_reservations 
       SET expires_at = $1
       WHERE id = $2 AND type = 'SOFT' AND status = 'PENDING'
       RETURNING *`,
      [expiresAt, id]
    );
  },

  async getReservedQuantity(
    productId: string,
    startDate: Date,
    endDate: Date,
    excludeSessionId?: string
  ): Promise<number> {
    let queryText = `
      SELECT COALESCE(SUM(quantity), 0) as total
      FROM inventory_reservations
      WHERE product_id = $1
        AND status IN ('PENDING', 'ACTIVE')
        AND start_date <= $3
        AND end_date >= $2
    `;
    const params: unknown[] = [productId, startDate, endDate];

    if (excludeSessionId) {
      queryText += ' AND (session_id IS NULL OR session_id != $4)';
      params.push(excludeSessionId);
    }

    const result = await queryOne<{ total: string }>(queryText, params);
    return parseInt(result?.total || '0', 10);
  },

  async getActiveReservations(productId: string): Promise<Reservation[]> {
    return query<Reservation>(
      `SELECT * FROM inventory_reservations 
       WHERE product_id = $1 AND status IN ('PENDING', 'ACTIVE')
       ORDER BY start_date ASC`,
      [productId]
    );
  }
};
