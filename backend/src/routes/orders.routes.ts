import { Router } from 'express';
import { param } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import * as orderController from '../controllers/orderController';

const router = Router();

const getOrderByIdValidation = [
  param('id').isUUID().withMessage('Valid order ID is required'),
];

router.use(authenticateToken);

router.get('/', orderController.getMyOrders);
router.get('/:id', validate(getOrderByIdValidation), orderController.getOrderById);

export default router;
