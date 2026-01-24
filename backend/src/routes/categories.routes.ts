import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';

const router = Router();

// Get all categories with their subcategories
router.get('/', categoryController.getAllCategories);

// Get category by ID or slug
router.get('/:id', categoryController.getCategoryById);

// Get subcategories for a category
router.get('/:id/subcategories', categoryController.getSubcategories);

export default router;
