import { Router } from 'express';
import * as deliveryController from '../controllers/deliveryController';

const router = Router();

router.get('/', deliveryController.getDeliveryZone);

export default router;
