import { Router } from 'express';
import * as webhookController from '../controllers/webhookController';

const router = Router();

router.post('/mollie', webhookController.handleMollieWebhook);

export default router;
