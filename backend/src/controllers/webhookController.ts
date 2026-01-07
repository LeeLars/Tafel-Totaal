import { Request, Response } from 'express';
// import { query, queryOne } from '../config/database';
// import { Order } from '../types';

export async function handleMollieWebhook(req: Request, res: Response): Promise<void> {
  try {
    const { id: paymentId } = req.body;

    if (!paymentId) {
      res.status(400).json({ success: false, error: 'Payment ID required' });
      return;
    }

    // TODO: Implement full Mollie webhook handling
    // 1. Get payment status from Mollie API
    // 2. Find order by mollie_payment_id
    // 3. Update order status based on payment status
    // 4. Convert soft to hard reservations if paid
    // 5. Send confirmation email
    // 6. Release reservations if failed/expired

    console.log('Received Mollie webhook for payment:', paymentId);

    // Always return 200 to Mollie
    res.status(200).send('OK');
  } catch (error) {
    console.error('Mollie webhook error:', error);
    // Still return 200 to prevent Mollie from retrying
    res.status(200).send('OK');
  }
}
