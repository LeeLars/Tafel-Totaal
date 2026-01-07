import { Request, Response } from 'express';
import { query, queryOne } from '../config/database';
import { Order } from '../types';

export async function getAllOrders(req: Request, res: Response): Promise<void> {
  try {
    const { status, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100);
    const offset = (pageNum - 1) * limitNum;

    let sql = `
      SELECT o.*, c.email as customer_email, c.first_name, c.last_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE 1=1
    `;

    const params: unknown[] = [];
    let paramIndex = 1;

    if (status) {
      sql += ` AND o.status = $${paramIndex++}`;
      params.push(status);
    }

    sql += ` ORDER BY o.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limitNum, offset);

    const orders = await query<Order & { customer_email: string; first_name: string; last_name: string }>(sql, params);

    const countResult = await queryOne<{ total: string }>(
      'SELECT COUNT(*) as total FROM orders' + (status ? ' WHERE status = $1' : ''),
      status ? [status] : []
    );

    const total = parseInt(countResult?.total || '0', 10);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
}

export async function getOrderDetail(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const order = await queryOne<Order>(
      `SELECT o.*, c.email as customer_email, c.first_name, c.last_name, c.phone,
        json_agg(
          json_build_object(
            'id', oi.id,
            'item_type', oi.item_type,
            'package_id', oi.package_id,
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'persons', oi.persons,
            'unit_price', oi.unit_price,
            'deposit_amount', oi.deposit_amount,
            'line_total', oi.line_total
          )
        ) as items
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = $1
       GROUP BY o.id, c.email, c.first_name, c.last_name, c.phone`,
      [id]
    );

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Get order detail error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.length === 0) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    res.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
}

export async function generatePickingList(req: Request, res: Response): Promise<void> {
  try {
    const { id: _id } = req.params;

    // TODO: Implement PDF generation
    res.status(501).json({ 
      success: false, 
      error: 'PDF generation not yet implemented',
      message: 'This endpoint will be implemented in Phase 3'
    });
  } catch (error) {
    console.error('Generate picking list error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate picking list' });
  }
}

export async function getDashboardStats(_req: Request, res: Response): Promise<void> {
  try {
    const [
      todayOrders,
      activeRentals,
      pendingReviews,
      monthlyRevenue,
    ] = await Promise.all([
      queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURRENT_DATE`),
      queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM orders WHERE status IN ('delivered', 'ready_for_delivery')`),
      queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM orders WHERE status = 'returned'`),
      queryOne<{ total: string }>(`SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = 'completed' AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)`),
    ]);

    res.json({
      success: true,
      data: {
        todayOrders: parseInt(todayOrders?.count || '0', 10),
        activeRentals: parseInt(activeRentals?.count || '0', 10),
        pendingReviews: parseInt(pendingReviews?.count || '0', 10),
        monthlyRevenue: parseFloat(monthlyRevenue?.total || '0'),
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
}
