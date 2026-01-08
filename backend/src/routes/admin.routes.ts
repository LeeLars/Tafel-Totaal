import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import * as adminController from '../controllers/adminController';

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

router.get('/orders', validate(getOrdersValidation), adminController.getAllOrders);
router.get('/orders/:id', adminController.getOrderDetail);
router.patch('/orders/:id/status', validate(updateOrderStatusValidation), adminController.updateOrderStatus);
router.get('/orders/:id/picking-list', adminController.generatePickingList);
router.get('/orders/:id/invoice', adminController.generateInvoice);

router.get('/dashboard/stats', adminController.getDashboardStats);

export default router;
