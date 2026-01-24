import { Router } from 'express';
import { getAllTagGroups, getAllTags, getProductTags, setProductTags } from '../controllers/tagController';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getAllTagGroups);
router.get('/all', getAllTags);
router.get('/product/:productId', getProductTags);

// Admin routes
router.put('/product/:productId', authenticateToken, requireAdmin, setProductTags);

export default router;
