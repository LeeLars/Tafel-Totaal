import { Router } from 'express';
import * as deliveryController from '../controllers/deliveryController';

const router = Router();

router.get('/', deliveryController.getDeliveryZone);
router.get('/cities', deliveryController.getAllCities);
router.get('/cities/:slug', deliveryController.getCityBySlug);

export default router;
