import { Router } from 'express';
import { param, query } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import * as productController from '../controllers/productController';

const router = Router();

const getProductsValidation = [
  query('category').optional().isString(),
  query('subcategory').optional().isString(),
  query('service_level').optional().isIn(['STANDAARD', 'LUXE']),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

const getProductByIdValidation = [
  param('id').isUUID().withMessage('Valid product ID is required'),
];

router.get('/', validate(getProductsValidation), productController.getAllProducts);
router.get('/:id', validate(getProductByIdValidation), productController.getProductById);

export default router;
