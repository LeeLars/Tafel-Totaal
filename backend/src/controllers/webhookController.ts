import { Request, Response } from 'express';
// import { query, queryOne } from '../config/database';
// import { Order } from '../types';
import { MollieService } from '../services/mollieService';
import { OrderModel } from '../models/Order.model';
import { ReservationModel } from '../models/Reservation.model';
import { CustomerModel } from '../models/Customer.model';
import { EmailService } from '../services/emailService';

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

    const paymentStatus = await MollieService.getPaymentStatus(paymentId);
    if (!paymentStatus) {
      console.error('Mollie webhook: could not retrieve payment status for', paymentId);
      res.status(200).send('OK');
      return;
    }

    const order = await OrderModel.findByMolliePaymentId(paymentId);
    if (!order) {
      console.error('Mollie webhook: no order found for payment', paymentId);
      res.status(200).send('OK');
      return;
    }

    // If already in a final state, do nothing (idempotent)
    if (['confirmed', 'cancelled', 'payment_failed'].includes(order.status)) {
      res.status(200).send('OK');
      return;
    }

    const newStatus = MollieService.mapPaymentStatusToOrderStatus(paymentStatus.status);

    if (paymentStatus.isPaid) {
      await OrderModel.markPaid(order.id);
      await ReservationModel.convertToHardByOrder(order.id);

      const customer = await CustomerModel.findById(order.customer_id);
      if (customer) {
        await EmailService.sendPaymentConfirmation(order, customer);
      }
    } else if (paymentStatus.isCanceled || paymentStatus.isExpired || paymentStatus.isFailed) {
      await OrderModel.updateStatus(order.id, newStatus as any);
      await ReservationModel.releaseByOrder(order.id);
    } else {
      // pending/open/authorized -> keep pending_payment
      await OrderModel.updateStatus(order.id, newStatus as any);
    }

    console.log('Processed Mollie webhook:', {
      paymentId,
      orderId: order.id,
      status: paymentStatus.status,
      orderStatus: newStatus
    });

    // Always return 200 to Mollie
    res.status(200).send('OK');
  } catch (error) {
    console.error('Mollie webhook error:', error);
    // Still return 200 to prevent Mollie from retrying
    res.status(200).send('OK');
  }
}
