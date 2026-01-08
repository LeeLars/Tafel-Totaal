import createMollieClient, { Payment, PaymentStatus } from '@mollie/api-client';
import { env } from '../config/env';
import { Order } from '../types';

const mollieClient = createMollieClient({ apiKey: env.MOLLIE_API_KEY });

export interface CreatePaymentParams {
  order: Order;
  description: string;
  redirectUrl: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  checkoutUrl?: string;
  error?: string;
}

export interface PaymentStatusResult {
  paymentId: string;
  status: PaymentStatus;
  isPaid: boolean;
  isCanceled: boolean;
  isExpired: boolean;
  isFailed: boolean;
  paidAt?: Date;
  amount: {
    value: string;
    currency: string;
  };
}

export const MollieService = {
  /**
   * Create a new payment for an order
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const { order, description, redirectUrl, metadata } = params;

      const payment = await mollieClient.payments.create({
        amount: {
          currency: 'EUR',
          value: order.total.toFixed(2)
        },
        description,
        redirectUrl,
        webhookUrl: env.MOLLIE_WEBHOOK_URL,
        metadata: {
          order_id: order.id,
          order_number: order.order_number,
          ...metadata
        }
      });

      // Handle both old and new Mollie API versions
      const checkoutUrl = typeof payment.getCheckoutUrl === 'function' 
        ? payment.getCheckoutUrl() 
        : (payment as any)._links?.checkout?.href;

      return {
        success: true,
        paymentId: payment.id,
        checkoutUrl: checkoutUrl || undefined
      };
    } catch (error) {
      console.error('Mollie payment creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed'
      };
    }
  },

  /**
   * Get payment status from Mollie
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResult | null> {
    try {
      const payment = await mollieClient.payments.get(paymentId);

      return {
        paymentId: payment.id,
        status: payment.status,
        isPaid: payment.status === 'paid',
        isCanceled: payment.status === 'canceled',
        isExpired: payment.status === 'expired',
        isFailed: payment.status === 'failed',
        paidAt: payment.paidAt ? new Date(payment.paidAt) : undefined,
        amount: {
          value: payment.amount.value,
          currency: payment.amount.currency
        }
      };
    } catch (error) {
      console.error('Failed to get Mollie payment status:', error);
      return null;
    }
  },

  /**
   * Create a refund for a payment (e.g., deposit return)
   */
  async createRefund(
    paymentId: string,
    amount: number,
    description: string
  ): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      const refund = await mollieClient.paymentRefunds.create({
        paymentId,
        amount: {
          currency: 'EUR',
          value: amount.toFixed(2)
        },
        description
      });

      return {
        success: true,
        refundId: refund.id
      };
    } catch (error) {
      console.error('Mollie refund creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund creation failed'
      };
    }
  },

  /**
   * Verify webhook signature (Mollie doesn't use signatures, but we verify the payment exists)
   */
  async verifyWebhook(paymentId: string): Promise<Payment | null> {
    try {
      const payment = await mollieClient.payments.get(paymentId);
      return payment;
    } catch (error) {
      console.error('Webhook verification failed:', error);
      return null;
    }
  },

  /**
   * Get order ID from payment metadata
   */
  getOrderIdFromPayment(payment: Payment): string | null {
    const metadata = payment.metadata as Record<string, string> | null;
    return metadata?.order_id || null;
  },

  /**
   * Check if payment is in a final state
   */
  isPaymentFinal(status: PaymentStatus): boolean {
    return ['paid', 'expired', 'failed', 'canceled'].includes(status);
  },

  /**
   * Map Mollie status to order status
   */
  mapPaymentStatusToOrderStatus(paymentStatus: PaymentStatus): string {
    switch (paymentStatus) {
      case 'paid':
        return 'confirmed';
      case 'expired':
      case 'canceled':
        return 'cancelled';
      case 'failed':
        return 'payment_failed';
      default:
        return 'pending_payment';
    }
  }
};
