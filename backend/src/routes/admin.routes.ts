import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import * as adminController from '../controllers/adminController';
import * as csvController from '../controllers/csvController';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.use(authenticateToken);
router.use(requireAdmin);

const getOrdersValidation = [
  query('status').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

const updateOrderStatusValidation = [
  param('id').isUUID().withMessage('Valid order ID is required'),
  body('status').isIn([
    'pending_payment', 'confirmed', 'preparing', 'ready_for_delivery',
    'delivered', 'returned', 'completed', 'cancelled'
  ]).withMessage('Invalid status'),
];

const getProductsValidation = [
  query('search').optional().isString(),
  query('category_id').optional().isUUID(),
  query('is_active').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

const updateProductValidation = [
  param('id').isUUID().withMessage('Valid product ID is required'),
  body('name').optional().trim().notEmpty(),
  body('price_per_day').optional().isFloat({ min: 0 }),
  body('deposit_per_item').optional().isFloat({ min: 0 }),
  body('stock_total').optional().isInt({ min: 0 }),
  body('stock_buffer').optional().isInt({ min: 0 }),
  body('turnaround_days').optional().isInt({ min: 0 }),
  body('is_active').optional().isBoolean(),
];

const getCustomersValidation = [
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

// Orders
router.get('/orders', validate(getOrdersValidation), adminController.getAllOrders);
router.get('/orders/:id', adminController.getOrderDetail);
router.patch('/orders/:id/status', validate(updateOrderStatusValidation), adminController.updateOrderStatus);
router.get('/orders/:id/picking-list', adminController.generatePickingList);
router.get('/orders/:id/invoice', adminController.generateInvoice);

// Products
router.get('/products', validate(getProductsValidation), adminController.getAllProducts);
router.get('/products/:id', adminController.getProductById);
router.patch('/products/:id', validate(updateProductValidation), adminController.updateProduct);

// Customers
router.get('/customers', validate(getCustomersValidation), adminController.getAllCustomers);
router.get('/customers/:id', adminController.getCustomerById);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// CSV Import/Export
router.post('/products/csv/parse', upload.single('file'), csvController.parseProductsCSV);
router.post('/products/csv/import', csvController.importProducts);
router.get('/products/csv/export', csvController.exportProductsCSV);

// Bulk Operations
router.post('/products/bulk/delete', csvController.bulkDeleteProducts);
router.post('/products/bulk/status', csvController.bulkUpdateStatus);

export default router;
