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

export async function deleteOrder(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const existing = await queryOne<{ id: string; status: string }>(
      'SELECT id, status FROM orders WHERE id = $1',
      [id]
    );

    if (!existing) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    const result = await query(
      'DELETE FROM orders WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.length === 0) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    res.json({ success: true, data: { id } });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete order' });
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

// ============================================
// INVENTORY MANAGEMENT
// ============================================

export async function getInventory(_req: Request, res: Response): Promise<void> {
  try {
    const inventory = await query<{
      id: string;
      sku: string;
      name: string;
      category_id: string;
      category_name: string;
      stock_total: number;
      stock_buffer: number;
      reserved: number;
      images: string[];
      is_active: boolean;
    }>(`
      SELECT 
        p.id, p.sku, p.name, p.category_id, c.name as category_name,
        p.stock_total, p.stock_buffer, p.images, p.is_active,
        COALESCE(
          (SELECT SUM(ir.quantity) 
           FROM inventory_reservations ir 
           WHERE ir.product_id = p.id 
           AND ir.status IN ('PENDING', 'ACTIVE')
           AND ir.end_date >= CURRENT_DATE), 0
        )::integer as reserved
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.name ASC
    `);

    res.json({
      success: true,
      data: inventory.map(item => ({
        ...item,
        available: item.stock_total - item.stock_buffer - item.reserved,
        rented: item.reserved
      }))
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch inventory' });
  }
}

export async function getInventoryStats(_req: Request, res: Response): Promise<void> {
  try {
    const stats = await queryOne<{
      total_products: string;
      total_stock: string;
      total_reserved: string;
      low_stock_count: string;
    }>(`
      SELECT 
        COUNT(DISTINCT p.id)::text as total_products,
        COALESCE(SUM(p.stock_total), 0)::text as total_stock,
        COALESCE(
          (SELECT SUM(ir.quantity) 
           FROM inventory_reservations ir 
           WHERE ir.status IN ('PENDING', 'ACTIVE')
           AND ir.end_date >= CURRENT_DATE), 0
        )::text as total_reserved,
        COUNT(DISTINCT CASE WHEN p.stock_total - p.stock_buffer <= 10 THEN p.id END)::text as low_stock_count
      FROM products p
    `);

    res.json({
      success: true,
      data: {
        totalProducts: parseInt(stats?.total_products || '0'),
        totalStock: parseInt(stats?.total_stock || '0'),
        totalReserved: parseInt(stats?.total_reserved || '0'),
        lowStockCount: parseInt(stats?.low_stock_count || '0')
      }
    });
  } catch (error) {
    console.error('Get inventory stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch inventory stats' });
  }
}

// ============================================
// REPORTS & ANALYTICS
// ============================================

export async function getRevenueReport(req: Request, res: Response): Promise<void> {
  try {
    const { days = '30' } = req.query;
    const daysNum = parseInt(days as string, 10);

    // Revenue by day
    const dailyRevenue = await query<{ date: string; revenue: string; orders: string }>(`
      SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(total), 0)::text as revenue,
        COUNT(*)::text as orders
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '${daysNum} days'
        AND status NOT IN ('cancelled', 'payment_failed')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Total revenue
    const totals = await queryOne<{ 
      total_revenue: string; 
      total_orders: string;
      avg_order_value: string;
    }>(`
      SELECT 
        COALESCE(SUM(total), 0)::text as total_revenue,
        COUNT(*)::text as total_orders,
        COALESCE(AVG(total), 0)::text as avg_order_value
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '${daysNum} days'
        AND status NOT IN ('cancelled', 'payment_failed')
    `);

    // Previous period for comparison
    const prevTotals = await queryOne<{ 
      total_revenue: string; 
      total_orders: string;
    }>(`
      SELECT 
        COALESCE(SUM(total), 0)::text as total_revenue,
        COUNT(*)::text as total_orders
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '${daysNum * 2} days'
        AND created_at < NOW() - INTERVAL '${daysNum} days'
        AND status NOT IN ('cancelled', 'payment_failed')
    `);

    res.json({
      success: true,
      data: {
        dailyRevenue: dailyRevenue.map(d => ({
          date: d.date,
          revenue: parseFloat(d.revenue),
          orders: parseInt(d.orders)
        })),
        totals: {
          revenue: parseFloat(totals?.total_revenue || '0'),
          orders: parseInt(totals?.total_orders || '0'),
          avgOrderValue: parseFloat(totals?.avg_order_value || '0')
        },
        previousPeriod: {
          revenue: parseFloat(prevTotals?.total_revenue || '0'),
          orders: parseInt(prevTotals?.total_orders || '0')
        }
      }
    });
  } catch (error) {
    console.error('Get revenue report error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch revenue report' });
  }
}

export async function getOrdersReport(req: Request, res: Response): Promise<void> {
  try {
    const { days = '30' } = req.query;
    const daysNum = parseInt(days as string, 10);

    // Orders by status
    const byStatus = await query<{ status: string; count: string }>(`
      SELECT status, COUNT(*)::text as count
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '${daysNum} days'
      GROUP BY status
    `);

    // Orders by day
    const byDay = await query<{ date: string; count: string }>(`
      SELECT DATE(created_at) as date, COUNT(*)::text as count
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '${daysNum} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json({
      success: true,
      data: {
        byStatus: byStatus.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {} as Record<string, number>),
        byDay: byDay.map(d => ({
          date: d.date,
          count: parseInt(d.count)
        }))
      }
    });
  } catch (error) {
    console.error('Get orders report error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders report' });
  }
}

export async function getTopProducts(req: Request, res: Response): Promise<void> {
  try {
    const { days = '30', limit = '10' } = req.query;
    const daysNum = parseInt(days as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const topProducts = await query<{
      product_id: string;
      product_name: string;
      total_quantity: string;
      total_revenue: string;
    }>(`
      SELECT 
        oi.product_id,
        p.name as product_name,
        SUM(oi.quantity)::text as total_quantity,
        SUM(oi.line_total)::text as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE o.created_at >= NOW() - INTERVAL '${daysNum} days'
        AND o.status NOT IN ('cancelled', 'payment_failed')
        AND oi.product_id IS NOT NULL
      GROUP BY oi.product_id, p.name
      ORDER BY total_quantity DESC
      LIMIT ${limitNum}
    `);

    res.json({
      success: true,
      data: topProducts.map(p => ({
        productId: p.product_id,
        name: p.product_name,
        quantity: parseInt(p.total_quantity),
        revenue: parseFloat(p.total_revenue)
      }))
    });
  } catch (error) {
    console.error('Get top products error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch top products' });
  }
}

export async function getTopCustomers(req: Request, res: Response): Promise<void> {
  try {
    const { days = '30', limit = '10' } = req.query;
    const daysNum = parseInt(days as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const topCustomers = await query<{
      customer_id: string;
      first_name: string;
      last_name: string;
      email: string;
      order_count: string;
      total_spent: string;
    }>(`
      SELECT 
        c.id as customer_id,
        c.first_name,
        c.last_name,
        c.email,
        COUNT(o.id)::text as order_count,
        COALESCE(SUM(o.total), 0)::text as total_spent
      FROM customers c
      JOIN orders o ON c.id = o.customer_id
      WHERE o.created_at >= NOW() - INTERVAL '${daysNum} days'
        AND o.status NOT IN ('cancelled', 'payment_failed')
      GROUP BY c.id, c.first_name, c.last_name, c.email
      ORDER BY total_spent DESC
      LIMIT ${limitNum}
    `);

    res.json({
      success: true,
      data: topCustomers.map(c => ({
        customerId: c.customer_id,
        name: `${c.first_name} ${c.last_name}`.trim(),
        email: c.email,
        orderCount: parseInt(c.order_count),
        totalSpent: parseFloat(c.total_spent)
      }))
    });
  } catch (error) {
    console.error('Get top customers error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch top customers' });
  }
}

export async function getNewCustomersReport(req: Request, res: Response): Promise<void> {
  try {
    const { days = '30' } = req.query;
    const daysNum = parseInt(days as string, 10);

    const newCustomers = await queryOne<{ count: string }>(`
      SELECT COUNT(*)::text as count
      FROM customers
      WHERE created_at >= NOW() - INTERVAL '${daysNum} days'
    `);

    const prevNewCustomers = await queryOne<{ count: string }>(`
      SELECT COUNT(*)::text as count
      FROM customers
      WHERE created_at >= NOW() - INTERVAL '${daysNum * 2} days'
        AND created_at < NOW() - INTERVAL '${daysNum} days'
    `);

    res.json({
      success: true,
      data: {
        current: parseInt(newCustomers?.count || '0'),
        previous: parseInt(prevNewCustomers?.count || '0')
      }
    });
  } catch (error) {
    console.error('Get new customers report error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch new customers report' });
  }
}
