import { Resend } from 'resend';
import { env } from '../config/env';
import { Order, Customer } from '../types';
import { PricingService } from './pricingService';

// Only initialize Resend if API key is provided
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// Helper to check if email is enabled
function isEmailEnabled(): boolean {
  return resend !== null && env.RESEND_API_KEY.length > 0;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export const EmailService = {
  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(
    order: Order & { items?: any[] },
    customer: Customer
  ): Promise<EmailResult> {
    if (!isEmailEnabled()) {
      console.log('📧 Email disabled - skipping order confirmation');
      return { success: true, messageId: 'email-disabled' };
    }
    try {
      const { data, error } = await resend!.emails.send({
        from: env.EMAIL_FROM,
        to: customer.email,
        subject: `Bevestiging bestelling ${order.order_number} - Tafel Totaal`,
        html: this.generateOrderConfirmationHtml(order, customer)
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('Failed to send order confirmation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email sending failed'
      };
    }
  },

  /**
   * Send payment received confirmation
   */
  async sendPaymentConfirmation(
    order: Order,
    customer: Customer
  ): Promise<EmailResult> {
    if (!isEmailEnabled()) {
      console.log('📧 Email disabled - skipping payment confirmation');
      return { success: true, messageId: 'email-disabled' };
    }
    try {
      const { data, error } = await resend!.emails.send({
        from: env.EMAIL_FROM,
        to: customer.email,
        subject: `Betaling ontvangen - ${order.order_number} - Tafel Totaal`,
        html: this.generatePaymentConfirmationHtml(order, customer)
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('Failed to send payment confirmation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email sending failed'
      };
    }
  },

  /**
   * Send delivery reminder (day before)
   */
  async sendDeliveryReminder(
    order: Order,
    customer: Customer
  ): Promise<EmailResult> {
    if (!isEmailEnabled()) {
      console.log('📧 Email disabled - skipping delivery reminder');
      return { success: true, messageId: 'email-disabled' };
    }
    try {
      const { data, error } = await resend!.emails.send({
        from: env.EMAIL_FROM,
        to: customer.email,
        subject: `Herinnering: Levering morgen - ${order.order_number}`,
        html: this.generateDeliveryReminderHtml(order, customer)
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('Failed to send delivery reminder:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email sending failed'
      };
    }
  },

  /**
   * Send return reminder (day of return)
   */
  async sendReturnReminder(
    order: Order,
    customer: Customer
  ): Promise<EmailResult> {
    if (!isEmailEnabled()) {
      console.log('📧 Email disabled - skipping return reminder');
      return { success: true, messageId: 'email-disabled' };
    }
    try {
      const { data, error } = await resend!.emails.send({
        from: env.EMAIL_FROM,
        to: customer.email,
        subject: `Herinnering: Retour vandaag - ${order.order_number}`,
        html: this.generateReturnReminderHtml(order, customer)
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('Failed to send return reminder:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email sending failed'
      };
    }
  },

  /**
   * Send deposit refund confirmation
   */
  async sendDepositRefundConfirmation(
    order: Order,
    customer: Customer,
    refundAmount: number,
    damageCost: number = 0
  ): Promise<EmailResult> {
    if (!isEmailEnabled()) {
      console.log('📧 Email disabled - skipping deposit refund confirmation');
      return { success: true, messageId: 'email-disabled' };
    }
    try {
      const { data, error } = await resend!.emails.send({
        from: env.EMAIL_FROM,
        to: customer.email,
        subject: `Borg terugbetaling - ${order.order_number}`,
        html: this.generateDepositRefundHtml(order, customer, refundAmount, damageCost)
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('Failed to send deposit refund confirmation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email sending failed'
      };
    }
  },

  /**
   * Send admin notification for new order
   */
  async sendAdminNewOrderNotification(order: Order): Promise<EmailResult> {
    if (!isEmailEnabled()) {
      console.log('📧 Email disabled - skipping admin notification');
      return { success: true, messageId: 'email-disabled' };
    }
    try {
      const adminEmail = 'info@tafeltotaal.be'; // TODO: Make configurable
      
      const { data, error } = await resend!.emails.send({
        from: env.EMAIL_FROM,
        to: adminEmail,
        subject: `Nieuwe bestelling: ${order.order_number}`,
        html: `
          <h2>Nieuwe bestelling ontvangen</h2>
          <p><strong>Bestelnummer:</strong> ${order.order_number}</p>
          <p><strong>Totaal:</strong> ${PricingService.formatPrice(order.total)}</p>
          <p><strong>Verhuurperiode:</strong> ${this.formatDate(order.rental_start_date)} - ${this.formatDate(order.rental_end_date)}</p>
          <p><a href="${env.BACKEND_URL}/admin/orders/${order.id}">Bekijk bestelling</a></p>
        `
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('Failed to send admin notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email sending failed'
      };
    }
  },

  // HTML Template generators
  generateOrderConfirmationHtml(order: Order & { items?: any[] }, customer: Customer): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2D5A27; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .total { font-size: 18px; font-weight: bold; color: #2D5A27; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tafel Totaal</h1>
            <p>Bedankt voor je bestelling!</p>
          </div>
          <div class="content">
            <p>Beste ${customer.first_name},</p>
            <p>We hebben je bestelling ontvangen en deze wordt verwerkt zodra de betaling is voltooid.</p>
            
            <div class="order-details">
              <h3>Bestelgegevens</h3>
              <p><strong>Bestelnummer:</strong> ${order.order_number}</p>
              <p><strong>Verhuurperiode:</strong> ${this.formatDate(order.rental_start_date)} - ${this.formatDate(order.rental_end_date)}</p>
              <p><strong>Levering:</strong> ${order.delivery_method === 'DELIVERY' ? 'Bezorging' : 'Afhalen'}</p>
              <hr>
              <p><strong>Subtotaal:</strong> ${PricingService.formatPrice(order.subtotal)}</p>
              <p><strong>Bezorgkosten:</strong> ${PricingService.formatPrice(order.delivery_fee)}</p>
              <p><strong>Borg:</strong> ${PricingService.formatPrice(order.deposit_total)}</p>
              <p class="total">Totaal: ${PricingService.formatPrice(order.total)}</p>
            </div>
            
            <p>Je ontvangt een bevestiging zodra je betaling is verwerkt.</p>
            <p>Heb je vragen? Neem gerust contact met ons op.</p>
          </div>
          <div class="footer">
            <p>Tafel Totaal - Van bord tot glas, zonder afwas!</p>
            <p>info@tafeltotaal.be | +32 xxx xx xx xx</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  generatePaymentConfirmationHtml(order: Order, customer: Customer): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2D5A27; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tafel Totaal</h1>
            <p>Betaling ontvangen</p>
          </div>
          <div class="content">
            <p>Beste ${customer.first_name},</p>
            
            <div class="success">
              <strong>✓ Je betaling is succesvol ontvangen!</strong>
            </div>
            
            <p>Je bestelling <strong>${order.order_number}</strong> is bevestigd en wordt voorbereid.</p>
            
            <p><strong>Verhuurperiode:</strong> ${this.formatDate(order.rental_start_date)} - ${this.formatDate(order.rental_end_date)}</p>
            
            <p>Je ontvangt een dag voor levering nog een herinnering met alle details.</p>
          </div>
          <div class="footer">
            <p>Tafel Totaal - Van bord tot glas, zonder afwas!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  generateDeliveryReminderHtml(order: Order, customer: Customer): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2D5A27; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .reminder { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tafel Totaal</h1>
            <p>Herinnering: Levering morgen</p>
          </div>
          <div class="content">
            <p>Beste ${customer.first_name},</p>
            
            <div class="reminder">
              <strong>📦 Je bestelling wordt morgen geleverd!</strong>
            </div>
            
            <p><strong>Bestelnummer:</strong> ${order.order_number}</p>
            <p><strong>Leveringsdatum:</strong> ${this.formatDate(order.rental_start_date)}</p>
            
            <p>Zorg ervoor dat er iemand aanwezig is om de levering in ontvangst te nemen.</p>
          </div>
          <div class="footer">
            <p>Tafel Totaal - Van bord tot glas, zonder afwas!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  generateReturnReminderHtml(order: Order, customer: Customer): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2D5A27; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .reminder { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tafel Totaal</h1>
            <p>Herinnering: Retour vandaag</p>
          </div>
          <div class="content">
            <p>Beste ${customer.first_name},</p>
            
            <div class="reminder">
              <strong>🔄 Vandaag halen we het materiaal weer op!</strong>
            </div>
            
            <p><strong>Bestelnummer:</strong> ${order.order_number}</p>
            <p><strong>Retourdatum:</strong> ${this.formatDate(order.rental_end_date)}</p>
            
            <p>Zorg ervoor dat alle items klaarstaan voor ophaling. Je hoeft niets af te wassen!</p>
            <p>Na controle van het materiaal wordt je borg teruggestort.</p>
          </div>
          <div class="footer">
            <p>Tafel Totaal - Van bord tot glas, zonder afwas!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  generateDepositRefundHtml(
    order: Order,
    customer: Customer,
    refundAmount: number,
    damageCost: number
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2D5A27; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .refund { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tafel Totaal</h1>
            <p>Borg terugbetaling</p>
          </div>
          <div class="content">
            <p>Beste ${customer.first_name},</p>
            
            <p>Bedankt voor het huren bij Tafel Totaal! Het materiaal is in goede staat retour ontvangen.</p>
            
            <div class="refund">
              <p><strong>Borg:</strong> ${PricingService.formatPrice(order.deposit_total)}</p>
              ${damageCost > 0 ? `<p><strong>Schadekosten:</strong> -${PricingService.formatPrice(damageCost)}</p>` : ''}
              <p><strong>Terugbetaling:</strong> ${PricingService.formatPrice(refundAmount)}</p>
            </div>
            
            <p>Het bedrag wordt binnen 5-7 werkdagen teruggestort op je rekening.</p>
            
            <p>We hopen je snel weer te mogen verwelkomen!</p>
          </div>
          <div class="footer">
            <p>Tafel Totaal - Van bord tot glas, zonder afwas!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  // Helper functions
  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('nl-BE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};
