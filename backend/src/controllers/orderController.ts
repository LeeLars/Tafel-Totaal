import { Request, Response } from 'express';
import { query, queryOne } from '../config/database';
import { Order } from '../types';

export async function getMyOrders(req: Request, res: Response): Promise<void> {
  try {
    const customerId = req.user?.userId;

    if (!customerId) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const orders = await query<Order>(
      `SELECT o.*, 
        json_agg(
          json_build_object(
            'id', oi.id,
            'item_type', oi.item_type,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'line_total', oi.line_total
          )
        ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.customer_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [customerId]
    );

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
}

export async function getOrderById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const customerId = req.user?.userId;

    if (!customerId) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const order = await queryOne<Order>(
      `SELECT o.*, 
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
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = $1 AND o.customer_id = $2
       GROUP BY o.id`,
      [id, customerId]
    );

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
}
