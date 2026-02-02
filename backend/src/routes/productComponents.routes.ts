import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import * as productComponentController from '../controllers/productComponentController';

const router = Router();

// Validation schemas
const addComponentValidation = [
  param('productId').isUUID().withMessage('Valid product ID is required'),
  body('component_product_id').isUUID().withMessage('Valid component product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

const updateQuantityValidation = [
  param('productId').isUUID().withMessage('Valid product ID is required'),
  param('componentId').isUUID().withMessage('Valid component ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

// Public routes
router.get('/sets', productComponentController.getAllProductSets);
router.get('/:productId/components', productComponentController.getProductComponents);
router.get('/:productId/parents', productComponentController.getProductParents);
router.get('/:productId/availability', productComponentController.calculateSetAvailability);

// Admin routes
router.post(
  '/:productId/components',
  authenticateToken,
  requireAdmin,
  validate(addComponentValidation),
  productComponentController.addProductComponent
);

router.delete(
  '/:productId/components/:componentId',
  authenticateToken,
  requireAdmin,
  productComponentController.removeProductComponent
);

router.patch(
  '/:productId/components/:componentId',
  authenticateToken,
  requireAdmin,
  validate(updateQuantityValidation),
  productComponentController.updateComponentQuantity
);

export default router;
