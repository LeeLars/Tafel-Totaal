import { Router } from 'express';
import multer from 'multer';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import * as uploadController from '../controllers/uploadController';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (_req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Upload single image
router.post('/image', upload.single('image'), uploadController.uploadImage);

// Upload multiple images
router.post('/images', upload.array('images', 10), uploadController.uploadMultipleImages);

// Delete image
router.delete('/image', uploadController.deleteImage);

export default router;
