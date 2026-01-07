import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import * as availabilityController from '../controllers/availabilityController';

const router = Router();

const checkAvailabilityValidation = [
  body('type').isIn(['package', 'product']).withMessage('Type must be package or product'),
  body('id').isUUID().withMessage('Valid item ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('persons').optional().isInt({ min: 1 }),
];

router.post('/check', validate(checkAvailabilityValidation), availabilityController.checkAvailability);

export default router;
