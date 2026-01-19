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
    customer: Customer,
    deliveryAddress?: {
      street: string;
      house_number: string;
      postal_code: string;
      city: string;
      country?: string;
    },
    timeSlots?: {
      deliveryTime?: string;
      pickupTime?: string;
      selfPickupTime?: string;
      returnTime?: string;
    }
  ): Promise<EmailResult> {
    if (!isEmailEnabled()) {
      console.log('📧 Email disabled - skipping order confirmation');
      return { success: true, messageId: 'email-disabled' };
    }
    try {
      const { data, error } = await resend!.emails.send({
        from: env.EMAIL_FROM,
        to: customer.email,
        subject: `Bevestiging reservering ${order.order_number} - Tafel Totaal`,
        html: this.generateOrderConfirmationHtml(order, customer, deliveryAddress, timeSlots)
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
   * Send damage compensation invoice (only if damage occurred)
   */
  async sendDamageCompensationInvoice(
    order: Order,
    customer: Customer,
    damageCost: number
  ): Promise<EmailResult> {
    if (!isEmailEnabled()) {
      console.log('📧 Email disabled - skipping damage compensation invoice');
      return { success: true, messageId: 'email-disabled' };
    }
    try {
      const { data, error } = await resend!.emails.send({
        from: env.EMAIL_FROM,
        to: customer.email,
        subject: `Schadevergoeding factuur - ${order.order_number}`,
        html: this.generateDamageCompensationHtml(order, customer, damageCost)
      });

      if (error) {
        throw error;
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('Failed to send damage compensation invoice:', error);
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
  generateOrderConfirmationHtml(
    order: Order & { items?: any[] },
    customer: Customer,
    deliveryAddress?: {
      street: string;
      house_number: string;
      postal_code: string;
      city: string;
      country?: string;
    },
    timeSlots?: {
      deliveryTime?: string;
      pickupTime?: string;
      selfPickupTime?: string;
      returnTime?: string;
    }
  ): string {
    const items = Array.isArray(order.items) ? order.items : [];
    const formatDeliveryMethod = order.delivery_method === 'DELIVERY' ? 'Bezorgen + Ophalen' : 'Afhalen + Terugbrengen';
    const orderCreated = this.formatDate(order.created_at);
    const rentalPeriod = `${this.formatDate(order.rental_start_date)} - ${this.formatDate(order.rental_end_date)}`;

    // Customer details section
    const customerDetailsHtml = `
      <tr>
        <td style="padding:0 0 6px 0; font-family: Arial, Helvetica, sans-serif; font-size:12px; color:#4A4A4A; text-transform:uppercase; letter-spacing:0.6px; font-weight:700;">KLANTGEGEVENS</td>
      </tr>
      <tr>
        <td style="padding:0 0 12px 0; font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#1A1A1A; line-height:1.6;">
          <strong>${customer.first_name} ${customer.last_name}</strong><br>
          ${customer.company_name ? `${customer.company_name}<br>` : ''}
          ${customer.email}<br>
          ${customer.phone || ''}
          ${customer.vat_number ? `<br>BTW: ${customer.vat_number}` : ''}
        </td>
      </tr>
    `;

    const addressHtml =
      order.delivery_method === 'DELIVERY' && deliveryAddress
        ? `
            <tr>
              <td style="padding:0 0 6px 0; font-family: Arial, Helvetica, sans-serif; font-size:12px; color:#4A4A4A; text-transform:uppercase; letter-spacing:0.6px; font-weight:700;">BEZORGADRES</td>
            </tr>
            <tr>
              <td style="padding:0; font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#1A1A1A; line-height:1.6;">
                ${deliveryAddress.street} ${deliveryAddress.house_number}<br>
                ${deliveryAddress.postal_code} ${deliveryAddress.city}<br>
                ${deliveryAddress.country || 'België'}
              </td>
            </tr>
          `
        : '';

    // Time slots section
    const timeSlotsHtml = timeSlots && (timeSlots.deliveryTime || timeSlots.selfPickupTime)
      ? `
          <tr>
            <td style="padding:12px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size:12px; color:#4A4A4A; text-transform:uppercase; letter-spacing:0.6px; font-weight:700;">TIJDSLOTS</td>
          </tr>
          <tr>
            <td style="padding:0; font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#1A1A1A; line-height:1.6;">
              ${timeSlots.deliveryTime ? `<strong>Levering:</strong> ${timeSlots.deliveryTime}<br>` : ''}
              ${timeSlots.pickupTime ? `<strong>Ophalen:</strong> ${timeSlots.pickupTime}<br>` : ''}
              ${timeSlots.selfPickupTime ? `<strong>Afhalen:</strong> ${timeSlots.selfPickupTime}<br>` : ''}
              ${timeSlots.returnTime ? `<strong>Terugbrengen:</strong> ${timeSlots.returnTime}` : ''}
            </td>
          </tr>
        `
      : '';

    const itemsHtml =
      items.length > 0
        ? items
            .map((item) => {
              const qty = Number(item.quantity || 0);
              const persons = item.persons ? ` • ${item.persons} pers.` : '';
              const lineTotal = item.lineTotal ?? item.line_total ?? 0;
              const comp = item.damageCompensationAmount ?? item.damage_compensation_amount ?? 0;
              return `
                <tr>
                  <td style="padding:12px 0; border-top:1px solid #E5E5E5; font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#1A1A1A;">
                    <div style="font-weight:700; text-transform:uppercase; letter-spacing:0.3px;">${item.name || 'Item'}</div>
                    <div style="margin-top:4px; font-size:12px; color:#4A4A4A;">${qty}x${persons}</div>
                    <div style="margin-top:4px; font-size:12px; color:#4A4A4A;">Schadevergoeding (referentie): ${PricingService.formatPrice(comp)}</div>
                  </td>
                  <td align="right" style="padding:12px 0; border-top:1px solid #E5E5E5; font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#1A1A1A; font-weight:700; white-space:nowrap;">
                    ${PricingService.formatPrice(lineTotal)}
                  </td>
                </tr>
              `;
            })
            .join('')
        : `
            <tr>
              <td style="padding:12px 0; border-top:1px solid #E5E5E5; font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#4A4A4A;">Je items zijn succesvol geregistreerd. Je ontvangt verdere details per e-mail.</td>
            </tr>
          `;

    return `
      <!doctype html>
      <html lang="nl">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reserveringsbevestiging</title>
        </head>
        <body style="margin:0; padding:0; background:#FAFAFA;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FAFAFA;">
            <tr>
              <td align="center" style="padding:24px 12px;">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; border:1px solid #E5E5E5; background:#FFFFFF;">
                  <tr>
                    <td style="padding:0;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1A1A1A;">
                        <tr>
                          <td style="padding:20px; border-bottom:1px solid #333333;">
                            <div style="font-family: Arial, Helvetica, sans-serif; font-size:22px; letter-spacing:1px; font-weight:800; color:#FFFFFF; text-transform:uppercase;">TAFEL TOTAAL</div>
                            <div style="margin-top:6px; font-family: Arial, Helvetica, sans-serif; font-size:12px; color:#E5E5E5; letter-spacing:0.6px; text-transform:uppercase;">Reserveringsbevestiging</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:0 20px 20px 20px;">
                            <div style="font-family: Arial, Helvetica, sans-serif; font-size:34px; line-height:1.1; font-weight:900; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.5px;">
                              Reservering bevestigd
                            </div>
                            <div style="margin-top:10px; font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#FAFAFA; line-height:1.6;">
                              Bestelnummer: <span style="color:#B56B6C; font-weight:800;">${order.order_number}</span>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:20px;">
                      <div style="font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#1A1A1A; line-height:1.7;">
                        Beste <strong>${customer.first_name}</strong>,<br>
                        We hebben je reservering goed ontvangen.
                      </div>

                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px; border:1px solid #E5E5E5;">
                        <tr>
                          <td style="padding:14px; background:#F4F4F4; border-bottom:1px solid #E5E5E5; font-family: Arial, Helvetica, sans-serif; font-size:12px; text-transform:uppercase; letter-spacing:0.6px; font-weight:800; color:#1A1A1A;">
                            Betaling via factuur na inleveren
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:14px; font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#1A1A1A; line-height:1.7;">
                            Je hoeft nu <strong>niet vooraf te betalen</strong>. Na inlevering controleren wij het materiaal en sturen we een factuur voor de huurprijs. Alleen bij schade of ontbrekende items wordt een vergoeding toegevoegd.
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;">
                        <tr>
                          <td style="padding:0;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E5E5E5;">
                              <tr>
                                <td style="padding:14px; background:#FFFFFF;">
                                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                      <td style="padding:0 0 6px 0; font-family: Arial, Helvetica, sans-serif; font-size:12px; color:#4A4A4A; text-transform:uppercase; letter-spacing:0.6px; font-weight:700;">OVERZICHT</td>
                                    </tr>
                                    <tr>
                                      <td style="padding:0; font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#1A1A1A; line-height:1.6;">
                                        <strong>Datum reservering:</strong> ${orderCreated}<br>
                                        <strong>Verhuurperiode:</strong> ${rentalPeriod}<br>
                                        <strong>Levering:</strong> ${formatDeliveryMethod}
                                      </td>
                                    </tr>
                                    ${customerDetailsHtml}
                                    ${addressHtml}
                                    ${timeSlotsHtml}
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px; border:1px solid #E5E5E5;">
                        <tr>
                          <td style="padding:14px; background:#1A1A1A; font-family: Arial, Helvetica, sans-serif; font-size:12px; color:#FFFFFF; text-transform:uppercase; letter-spacing:0.6px; font-weight:800;">
                            Items
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:0 14px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                              ${itemsHtml}
                            </table>
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px; border:1px solid #E5E5E5;">
                        <tr>
                          <td style="padding:14px; background:#FFFFFF;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="padding:6px 0; font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#1A1A1A;">Subtotaal</td>
                                <td align="right" style="padding:6px 0; font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#1A1A1A; white-space:nowrap; font-weight:700;">${PricingService.formatPrice(order.subtotal)}</td>
                              </tr>
                              <tr>
                                <td style="padding:6px 0; font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#1A1A1A;">Bezorgkosten</td>
                                <td align="right" style="padding:6px 0; font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#1A1A1A; white-space:nowrap; font-weight:700;">${PricingService.formatPrice(order.delivery_fee)}</td>
                              </tr>
                              <tr>
                                <td style="padding:6px 0; font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#1A1A1A;">Schadevergoeding (referentie)</td>
                                <td align="right" style="padding:6px 0; font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#1A1A1A; white-space:nowrap; font-weight:700;">${PricingService.formatPrice(order.damage_compensation_total)}</td>
                              </tr>
                              <tr>
                                <td style="padding:10px 0 0 0; border-top:1px solid #E5E5E5; font-family: Arial, Helvetica, sans-serif; font-size:16px; color:#903D3E; font-weight:900; text-transform:uppercase; letter-spacing:0.4px;">Totaal (huur)</td>
                                <td align="right" style="padding:10px 0 0 0; border-top:1px solid #E5E5E5; font-family: Arial, Helvetica, sans-serif; font-size:16px; color:#903D3E; font-weight:900; white-space:nowrap;">${PricingService.formatPrice(order.total)}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      ${order.notes ? `
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px; border:1px solid #E5E5E5;">
                        <tr>
                          <td style="padding:14px; background:#F4F4F4; border-bottom:1px solid #E5E5E5; font-family: Arial, Helvetica, sans-serif; font-size:12px; text-transform:uppercase; letter-spacing:0.6px; font-weight:800; color:#1A1A1A;">Opmerkingen</td>
                        </tr>
                        <tr>
                          <td style="padding:14px; font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#1A1A1A; line-height:1.7;">${String(order.notes)}</td>
                        </tr>
                      </table>
                      ` : ''}

                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px; border:1px solid #E5E5E5;">
                        <tr>
                          <td style="padding:14px; background:#F4F4F4; font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#1A1A1A; line-height:1.7; text-align:center;">
                            <a href="${env.FRONTEND_URL}/account/bestellingen" style="display:inline-block; background:#903D3E; color:#FFFFFF; padding:12px 24px; text-decoration:none; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">
                              Bekijk Mijn Bestellingen
                            </a>
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;">
                        <tr>
                          <td style="padding:0; font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#1A1A1A; line-height:1.7;">
                            Vragen? Antwoord op deze mail of contacteer ons via <strong>info@tafeltotaal.be</strong>.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:18px 20px; background:#FAFAFA; border-top:1px solid #E5E5E5;">
                      <div style="font-family: Arial, Helvetica, sans-serif; font-size:12px; color:#666666; line-height:1.6;">
                        <strong style="color:#1A1A1A;">Tafel Totaal</strong> — Van bord tot glas, zonder afwas!<br>
                        Parkstraat 44, 8730 Beernem • info@tafeltotaal.be
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
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
            <p>Na controle van het materiaal ontvang je bericht. Alleen bij schade wordt een vergoeding in rekening gebracht.</p>
          </div>
          <div class="footer">
            <p>Tafel Totaal - Van bord tot glas, zonder afwas!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  generateDamageCompensationHtml(
    order: Order,
    customer: Customer,
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
            <p>Schadevergoeding Factuur</p>
          </div>
          <div class="content">
            <p>Beste ${customer.first_name},</p>
            
            <p>Bedankt voor het huren bij Tafel Totaal!</p>
            
            <div class="refund">
              <p>Helaas hebben we schade geconstateerd aan het geretourneerde materiaal voor bestelling <strong>${order.order_number}</strong>.</p>
              <p><strong>Schadekosten:</strong> ${PricingService.formatPrice(damageCost)}</p>
              <p>Deze kosten worden gefactureerd conform onze schadevergoedingsregeling.</p>
            </div>
            
            <p>Het bedrag wordt binnen 5-7 werkdagen gefactureerd.</p>
            
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
