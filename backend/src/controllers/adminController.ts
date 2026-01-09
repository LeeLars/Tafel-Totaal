import { Request, Response } from 'express';
import { query, queryOne } from '../config/database';
import type { Order, Customer } from '../types';
import { ProductModel } from '../models/Product.model';
import { CustomerModel } from '../models/Customer.model';

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
    const { id } = req.params;

    const { OrderModel } = await import('../models/Order.model');
    const { CustomerModel } = await import('../models/Customer.model');
    const { PDFService } = await import('../services/pdfService');

    const order = await OrderModel.findById(id, true);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    const customer = await CustomerModel.findById(order.customer_id);
    if (!customer) {
      res.status(404).json({ success: false, error: 'Customer not found' });
      return;
    }

    const pdfBuffer = await PDFService.generatePickingList(order, customer);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="picking-list-${order.order_number}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Generate picking list error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate picking list' });
  }
}

export async function generateInvoice(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const { OrderModel } = await import('../models/Order.model');
    const { CustomerModel } = await import('../models/Customer.model');
    const { PDFService } = await import('../services/pdfService');

    const order = await OrderModel.findById(id, true);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    const customer = await CustomerModel.findById(order.customer_id);
    if (!customer) {
      res.status(404).json({ success: false, error: 'Customer not found' });
      return;
    }

    let deliveryAddress;
    if (order.delivery_address_id) {
      const addresses = await CustomerModel.getAddresses(order.customer_id);
      deliveryAddress = addresses.find(a => a.id === order.delivery_address_id);
    }

    const pdfBuffer = await PDFService.generateInvoice(order, customer, deliveryAddress);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="factuur-${order.order_number}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate invoice' });
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

// ============================================
// PRODUCT MANAGEMENT
// ============================================

export async function getAllProducts(req: Request, res: Response): Promise<void> {
  try {
    const { search, category_id, is_active, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100);
    const offset = (pageNum - 1) * limitNum;

    const filters: any = {};
    if (search) filters.search = search;
    if (category_id) filters.category_id = category_id;
    if (is_active !== undefined) filters.is_active = is_active === 'true';

    const [products, total] = await Promise.all([
      ProductModel.findAll(filters, limitNum, offset),
      ProductModel.count(filters)
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
}

export async function getProductById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);

    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch product' });
  }
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await ProductModel.update(id, updateData);

    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, error: 'Failed to update product' });
  }
}

// ============================================
// CUSTOMER MANAGEMENT
// ============================================

export async function getAllCustomers(req: Request, res: Response): Promise<void> {
  try {
    const { search, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100);
    const offset = (pageNum - 1) * limitNum;

    let sql = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM orders WHERE customer_id = c.id) as order_count,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE customer_id = c.id AND status = 'completed') as total_spent
      FROM customers c
      WHERE 1=1
    `;

    const params: unknown[] = [];
    let paramIndex = 1;

    if (search) {
      sql += ` AND (c.email ILIKE $${paramIndex} OR c.first_name ILIKE $${paramIndex} OR c.last_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ` ORDER BY c.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limitNum, offset);

    const customers = await query<Customer & { order_count: string; total_spent: string }>(sql, params);

    const countResult = await queryOne<{ total: string }>(
      `SELECT COUNT(*) as total FROM customers` + (search ? ` WHERE email ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1` : ''),
      search ? [`%${search}%`] : []
    );

    const total = parseInt(countResult?.total || '0', 10);

    res.json({
      success: true,
      data: customers.map(c => ({
        ...c,
        order_count: parseInt(c.order_count || '0', 10),
        total_spent: parseFloat(c.total_spent || '0')
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get all customers error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch customers' });
  }
}

export async function getCustomerById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const customer = await CustomerModel.findById(id);

    if (!customer) {
      res.status(404).json({ success: false, error: 'Customer not found' });
      return;
    }

    // Get customer's orders
    const orders = await query<Order>(
      `SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...customer,
        orders
      }
    });
  } catch (error) {
    console.error('Get customer by ID error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch customer' });
  }
}
