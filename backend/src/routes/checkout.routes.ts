import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import { optionalAuth } from '../middleware/auth.middleware';
import * as checkoutController from '../controllers/checkoutController';

const router = Router();

const checkoutValidation = [
  body('deliveryMethod').isIn(['DELIVERY', 'PICKUP']).withMessage('Delivery method must be DELIVERY or PICKUP'),
  body('customer.email').isEmail().withMessage('Valid email is required'),
  body('customer.first_name').trim().notEmpty().withMessage('First name is required'),
  body('customer.last_name').trim().notEmpty().withMessage('Last name is required'),
  body('customer.phone').trim().notEmpty().withMessage('Phone is required'),
  body('deliveryAddress').optional().isObject(),
  body('deliveryAddress.street').optional().trim().notEmpty(),
  body('deliveryAddress.house_number').optional().trim().notEmpty(),
  body('deliveryAddress.postal_code').optional().trim().notEmpty(),
  body('deliveryAddress.city').optional().trim().notEmpty(),
];

const calculateValidation = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('deliveryMethod').optional().isIn(['DELIVERY', 'PICKUP']),
];

router.use(optionalAuth);

router.post('/', validate(checkoutValidation), checkoutController.createOrder);
router.post('/calculate', validate(calculateValidation), checkoutController.calculatePrice);

export default router;
