import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import * as adminController from '../controllers/adminController';
import * as csvController from '../controllers/csvController';
import * as packageController from '../controllers/packageController';
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

const deleteOrderValidation = [
  param('id').isUUID().withMessage('Valid order ID is required'),
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
  body('sku').optional().trim(),
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('category_id').optional().isUUID(),
  body('subcategory_id').optional().isUUID(),
  body('price_per_day').optional().isFloat({ min: 0 }),
  body('damage_compensation_per_item').optional().isFloat({ min: 0 }),
  body('stock_total').optional().isInt({ min: 0 }),
  body('stock_buffer').optional().isInt({ min: 0 }),
  body('turnaround_days').optional().isInt({ min: 0 }),
  body('is_active').optional().isBoolean(),
  body('images').optional().isArray(),
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
router.delete('/orders/:id', validate(deleteOrderValidation), adminController.deleteOrder);
router.get('/orders/:id/picking-list', adminController.generatePickingList);
router.get('/orders/:id/invoice', adminController.generateInvoice);

// Order Picking
router.get('/orders/:id/picking', adminController.getPickingDetails);
router.patch('/orders/:id/picking', adminController.updatePickingStatus);
router.patch('/orders/:id/items/:itemId/pick', adminController.updateItemPicked);

// Products
router.get('/products', validate(getProductsValidation), adminController.getAllProducts);
router.get('/products/:id', adminController.getProductById);
router.post('/products', adminController.createProduct);
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

// Inventory Management
router.get('/inventory', adminController.getInventory);
router.get('/inventory/stats', adminController.getInventoryStats);

// Reports & Analytics
router.get('/reports/revenue', adminController.getRevenueReport);
router.get('/reports/orders', adminController.getOrdersReport);
router.get('/reports/top-products', adminController.getTopProducts);
router.get('/reports/top-customers', adminController.getTopCustomers);
router.get('/reports/new-customers', adminController.getNewCustomersReport);

// ============ PACKAGES MANAGEMENT ============

const createPackageValidation = [
  body('name').trim().notEmpty().withMessage('Package name is required'),
  body('price_per_day').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('persons').isInt({ min: 1 }).withMessage('Valid number of persons is required'),
  body('slug').optional().trim(),
  body('description').optional().trim(),
  body('short_description').optional().trim(),
  body('image_url').optional().trim(),
  body('is_active').optional().isBoolean(),
  body('is_featured').optional().isBoolean(),
  body('sort_order').optional().isInt({ min: 0 }),
];

const updatePackageValidation = [
  param('id').isUUID().withMessage('Valid package ID is required'),
  body('name').optional().trim().notEmpty(),
  body('price_per_day').optional().isFloat({ min: 0 }),
  body('persons').optional().isInt({ min: 1 }),
  body('slug').optional().trim(),
  body('description').optional().trim(),
  body('short_description').optional().trim(),
  body('image_url').optional().trim(),
  body('is_active').optional().isBoolean(),
  body('is_featured').optional().isBoolean(),
  body('sort_order').optional().isInt({ min: 0 }),
];

const deletePackageValidation = [
  param('id').isUUID().withMessage('Valid package ID is required'),
];

const addPackageItemValidation = [
  param('id').isUUID().withMessage('Valid package ID is required'),
  body('product_id').isUUID().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
  body('is_optional').optional().isBoolean(),
  body('sort_order').optional().isInt({ min: 0 }),
];

const updatePackageItemValidation = [
  param('id').isUUID().withMessage('Valid package ID is required'),
  param('itemId').isUUID().withMessage('Valid item ID is required'),
  body('quantity').optional().isInt({ min: 1 }),
  body('is_optional').optional().isBoolean(),
  body('sort_order').optional().isInt({ min: 0 }),
];

const deletePackageItemValidation = [
  param('id').isUUID().withMessage('Valid package ID is required'),
  param('itemId').isUUID().withMessage('Valid item ID is required'),
];

// Package debug route (check/create table)
router.get('/packages/debug', packageController.debugPackagesTable);

// Package CRUD routes
router.get('/packages', packageController.adminGetAllPackages);
router.post('/packages', validate(createPackageValidation), packageController.createPackage);
router.put('/packages/:id', validate(updatePackageValidation), packageController.updatePackage);
router.delete('/packages/:id', validate(deletePackageValidation), packageController.deletePackage);

// Package items routes
router.post('/packages/:id/items', validate(addPackageItemValidation), packageController.addPackageItem);
router.put('/packages/:id/items/:itemId', validate(updatePackageItemValidation), packageController.updatePackageItem);
router.delete('/packages/:id/items/:itemId', validate(deletePackageItemValidation), packageController.deletePackageItem);

export default router;
