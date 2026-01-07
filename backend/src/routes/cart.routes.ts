import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import { optionalAuth } from '../middleware/auth.middleware';
import * as cartController from '../controllers/cartController';

const router = Router();

const addItemValidation = [
  body('type').isIn(['package', 'product']).withMessage('Type must be package or product'),
  body('id').isUUID().withMessage('Valid item ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('persons').optional().isInt({ min: 1 }),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('addons').optional().isArray(),
];

const updateItemValidation = [
  param('itemId').isUUID().withMessage('Valid item ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const removeItemValidation = [
  param('itemId').isUUID().withMessage('Valid item ID is required'),
];

router.use(optionalAuth);

router.get('/', cartController.getCart);
router.post('/items', validate(addItemValidation), cartController.addItem);
router.patch('/items/:itemId', validate(updateItemValidation), cartController.updateItem);
router.delete('/items/:itemId', validate(removeItemValidation), cartController.removeItem);
router.delete('/', cartController.clearCart);

export default router;
