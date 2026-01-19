import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import { optionalAuth, authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import * as loyaltyController from '../controllers/loyaltyController';

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// Get all loyalty tiers (public)
router.get('/tiers', loyaltyController.getTiers);

// ============================================
// AUTHENTICATED ROUTES
// ============================================

// Get current customer's loyalty info
router.get('/customer', authenticateToken, loyaltyController.getCustomerLoyalty);

// Get transaction history
router.get('/history', authenticateToken, loyaltyController.getTransactionHistory);

// Get milestones
router.get('/milestones', authenticateToken, loyaltyController.getMilestones);

// Calculate discount for checkout (works for both auth and non-auth)
router.post(
  '/calculate-discount',
  optionalAuth,
  validate([
    body('subtotal').isFloat({ min: 0 }).withMessage('Valid subtotal is required'),
    body('points_to_redeem').optional().isInt({ min: 0 }).withMessage('Points must be a positive integer')
  ]),
  loyaltyController.calculateDiscount
);

// Redeem points
router.post(
  '/redeem',
  authenticateToken,
  validate([
    body('order_id').isUUID().withMessage('Valid order_id is required'),
    body('points').isInt({ min: 1 }).withMessage('Points must be a positive integer')
  ]),
  loyaltyController.redeemPoints
);

// ============================================
// ADMIN ROUTES
// ============================================

// Admin: Adjust customer points
router.post(
  '/admin/adjust',
  requireAdmin,
  validate([
    body('customer_id').isUUID().withMessage('Valid customer_id is required'),
    body('points').isInt().withMessage('Points must be an integer'),
    body('reason').trim().notEmpty().withMessage('Reason is required')
  ]),
  loyaltyController.adminAdjustPoints
);

// Admin: Get customer loyalty info
router.get('/admin/customer/:customerId', requireAdmin, loyaltyController.adminGetCustomerLoyalty);

export default router;
