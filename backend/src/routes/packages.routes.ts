import { Router } from 'express';
import { param, query } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import * as packageController from '../controllers/packageController';

const router = Router();

const getPackagesValidation = [
  query('service_level').optional().isIn(['STANDAARD', 'LUXE']),
  query('min_persons').optional().isInt({ min: 1 }),
  query('max_persons').optional().isInt({ min: 1 }),
  query('is_featured').optional().isBoolean(),
];

const getPackageByIdValidation = [
  param('id').isUUID().withMessage('Valid package ID is required'),
];

router.get('/', validate(getPackagesValidation), packageController.getAllPackages);
router.get('/:id', validate(getPackageByIdValidation), packageController.getPackageById);

export default router;
