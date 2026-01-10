import PDFDocument from 'pdfkit';
import { OrderWithItems } from '../models/Order.model';
import { Customer } from '../types';

export interface PDFGenerationOptions {
  includeHeader?: boolean;
  includeFooter?: boolean;
}

export const PDFService = {
  /**
   * Generate picking list PDF for warehouse staff
   * Shows what items need to be prepared for an order
   */
  async generatePickingList(
    order: OrderWithItems,
    customer: Customer,
    options: PDFGenerationOptions = {}
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        if (options.includeHeader !== false) {
          doc
            .fontSize(20)
            .font('Helvetica-Bold')
            .text('TAFEL TOTAAL', { align: 'center' })
            .fontSize(16)
            .text('Picking List', { align: 'center' })
            .moveDown();
        }

        // Order info box
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`Order: ${order.order_number}`, 50, doc.y)
          .text(`Status: ${order.status}`, 300, doc.y - 12)
          .moveDown(0.5);

        doc
          .text(`Klant: ${customer.first_name} ${customer.last_name}`)
          .text(`Email: ${customer.email}`)
          .text(`Telefoon: ${customer.phone || 'N/A'}`)
          .moveDown();

        // Rental period
        doc
          .font('Helvetica-Bold')
          .text('VERHUURPERIODE', { underline: true })
          .font('Helvetica')
          .text(`Ophalen: ${this.formatDate(order.rental_start_date)}`)
          .text(`Retour: ${this.formatDate(order.rental_end_date)}`)
          .moveDown();

        // Delivery info
        doc
          .font('Helvetica-Bold')
          .text('LEVERING', { underline: true })
          .font('Helvetica')
          .text(`Methode: ${order.delivery_method === 'DELIVERY' ? 'Bezorgen' : 'Afhalen'}`)
          .moveDown();

        // Items table
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .text('TE VERZAMELEN ITEMS', { underline: true })
          .moveDown(0.5);

        // Table header
        const tableTop = doc.y;
        const itemX = 50;
        const qtyX = 350;
        const typeX = 420;
        const checkX = 500;

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Item', itemX, tableTop)
          .text('Aantal', qtyX, tableTop)
          .text('Type', typeX, tableTop)
          .text('✓', checkX, tableTop);

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        let yPosition = tableTop + 25;

        // Table rows
        if (order.items && order.items.length > 0) {
          doc.font('Helvetica').fontSize(9);

          for (const item of order.items) {
            // Check if we need a new page
            if (yPosition > 700) {
              doc.addPage();
              yPosition = 50;
            }

            const itemName = item.name || `${item.item_type} ${item.package_id || item.product_id}`;
            const itemType = item.item_type === 'package' ? 'Pakket' : 'Product';
            const quantity = item.item_type === 'package' ? `${item.persons}p` : `${item.quantity}x`;

            doc
              .text(itemName, itemX, yPosition, { width: 280 })
              .text(quantity, qtyX, yPosition)
              .text(itemType, typeX, yPosition)
              .rect(checkX, yPosition - 2, 15, 15)
              .stroke();

            yPosition += 25;
          }
        } else {
          doc.text('Geen items gevonden', itemX, yPosition);
        }

        // Notes section
        if (order.notes || order.admin_notes) {
          doc.moveDown(2);
          doc
            .font('Helvetica-Bold')
            .fontSize(10)
            .text('OPMERKINGEN', { underline: true })
            .font('Helvetica')
            .fontSize(9);

          if (order.notes) {
            doc.text(`Klant: ${order.notes}`);
          }
          if (order.admin_notes) {
            doc.text(`Admin: ${order.admin_notes}`);
          }
        }

        // Footer
        if (options.includeFooter !== false) {
          doc
            .fontSize(8)
            .font('Helvetica')
            .text(
              `Gegenereerd op ${this.formatDateTime(new Date())}`,
              50,
              750,
              { align: 'center' }
            );
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Generate invoice/factuur PDF for customer
   */
  async generateInvoice(
    order: OrderWithItems,
    customer: Customer,
    deliveryAddress?: {
      street: string;
      house_number: string;
      postal_code: string;
      city: string;
      country?: string;
    },
    options: PDFGenerationOptions = {}
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header with company info
        if (options.includeHeader !== false) {
          doc
            .fontSize(20)
            .font('Helvetica-Bold')
            .text('TAFEL TOTAAL', 50, 50)
            .fontSize(10)
            .font('Helvetica')
            .text('Verhuur van servies & tafeldecoratie', 50, 75)
            .text('info@tafeltotaal.be', 50, 90)
            .text('www.tafeltotaal.be', 50, 105)
            .moveDown(2);
        }

        // Invoice title and number
        doc
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('FACTUUR', 400, 50)
          .fontSize(10)
          .font('Helvetica')
          .text(`Factuurnummer: ${order.order_number}`, 400, 80)
          .text(`Datum: ${this.formatDate(order.created_at)}`, 400, 95)
          .text(`Status: ${this.translateOrderStatus(order.status)}`, 400, 110)
          .moveDown(3);

        // Customer info
        const customerY = doc.y;
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('KLANTGEGEVENS', 50, customerY)
          .font('Helvetica')
          .text(`${customer.first_name} ${customer.last_name}`, 50, customerY + 15);

        if (customer.company_name) {
          doc.text(customer.company_name, 50, doc.y + 2);
        }

        doc
          .text(customer.email, 50, doc.y + 2)
          .text(customer.phone || '', 50, doc.y + 2);

        // Delivery address if applicable
        if (order.delivery_method === 'DELIVERY' && deliveryAddress) {
          doc
            .font('Helvetica-Bold')
            .text('BEZORGADRES', 300, customerY)
            .font('Helvetica')
            .text(`${deliveryAddress.street} ${deliveryAddress.house_number}`, 300, customerY + 15)
            .text(`${deliveryAddress.postal_code} ${deliveryAddress.city}`, 300, doc.y + 2)
            .text(deliveryAddress.country || 'België', 300, doc.y + 2);
        }

        doc.moveDown(3);

        // Rental period
        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .text('VERHUURPERIODE', { underline: true })
          .font('Helvetica')
          .fontSize(10)
          .text(`Van: ${this.formatDate(order.rental_start_date)}`)
          .text(`Tot: ${this.formatDate(order.rental_end_date)}`)
          .moveDown(2);

        // Items table
        const tableTop = doc.y;
        const descX = 50;
        const qtyX = 320;
        const priceX = 380;
        const totalX = 480;

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Omschrijving', descX, tableTop)
          .text('Aantal', qtyX, tableTop)
          .text('Prijs', priceX, tableTop)
          .text('Totaal', totalX, tableTop);

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        let yPosition = tableTop + 25;

        // Table rows
        if (order.items && order.items.length > 0) {
          doc.font('Helvetica').fontSize(9);

          for (const item of order.items) {
            if (yPosition > 650) {
              doc.addPage();
              yPosition = 50;
            }

            const itemName = item.name || `${item.item_type} ${item.package_id || item.product_id}`;
            const quantity = item.item_type === 'package' ? `${item.persons} personen` : `${item.quantity}x`;
            const unitPrice = this.formatCurrency(item.unit_price);
            const lineTotal = this.formatCurrency(item.line_total);

            doc
              .text(itemName, descX, yPosition, { width: 250 })
              .text(quantity, qtyX, yPosition)
              .text(unitPrice, priceX, yPosition)
              .text(lineTotal, totalX, yPosition);

            yPosition += 20;
          }
        }

        // Totals section
        yPosition += 20;
        doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
        yPosition += 15;

        const totalsX = 400;
        doc
          .font('Helvetica')
          .text('Subtotaal:', totalsX, yPosition)
          .text(this.formatCurrency(Number(order.subtotal)), totalX, yPosition);

        yPosition += 20;
        doc
          .text('Bezorgkosten:', totalsX, yPosition)
          .text(this.formatCurrency(Number(order.delivery_fee)), totalX, yPosition);

        yPosition += 20;
        doc
          .text('Schadevergoeding:', totalsX, yPosition)
          .text(this.formatCurrency(Number(order.damage_compensation_total)), totalX, yPosition);

        yPosition += 25;
        doc.moveTo(totalsX, yPosition - 5).lineTo(550, yPosition - 5).stroke();

        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .text('TOTAAL:', totalsX, yPosition)
          .text(this.formatCurrency(Number(order.total)), totalX, yPosition);

        // Payment info
        yPosition += 40;
        doc
          .font('Helvetica')
          .fontSize(9)
          .text('Betaalstatus: ' + (order.paid_at ? `Betaald op ${this.formatDate(order.paid_at)}` : 'In afwachting'), 50, yPosition);

        // Notes
        if (order.notes) {
          yPosition += 30;
          doc
            .font('Helvetica-Bold')
            .fontSize(10)
            .text('Opmerkingen:', 50, yPosition)
            .font('Helvetica')
            .fontSize(9)
            .text(order.notes, 50, yPosition + 15, { width: 500 });
        }

        // Footer with terms
        if (options.includeFooter !== false) {
          doc
            .fontSize(8)
            .font('Helvetica')
            .text(
              'Algemene voorwaarden van toepassing. Schadevergoeding wordt alleen in rekening gebracht bij daadwerkelijke schade.',
              50,
              750,
              { align: 'center', width: 500 }
            );
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Helper: Format date as DD/MM/YYYY
   */
  formatDate(date: Date | string): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  },

  /**
   * Helper: Format datetime as DD/MM/YYYY HH:MM
   */
  formatDateTime(date: Date | string): string {
    const d = new Date(date);
    const dateStr = this.formatDate(d);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${dateStr} ${hours}:${minutes}`;
  },

  /**
   * Helper: Format currency as €X.XX
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  },

  /**
   * Helper: Translate order status to Dutch
   */
  translateOrderStatus(status: string): string {
    const translations: Record<string, string> = {
      pending_payment: 'In afwachting van betaling',
      confirmed: 'Bevestigd',
      preparing: 'In voorbereiding',
      ready: 'Klaar voor levering',
      delivered: 'Geleverd',
      returned: 'Geretourneerd',
      completed: 'Voltooid',
      cancelled: 'Geannuleerd',
      payment_failed: 'Betaling mislukt'
    };
    return translations[status] || status;
  }
};
