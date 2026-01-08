import { Request, Response } from 'express';
// import { query, queryOne } from '../config/database';
import { CartItem, DeliveryMethod } from '../types';
import { SessionModel } from '../models/Session.model';
import { CustomerModel } from '../models/Customer.model';
import { OrderModel } from '../models/Order.model';
import { ReservationModel } from '../models/Reservation.model';
import { AvailabilityService } from '../services/availabilityService';
import { PricingService } from '../services/pricingService';
import { MollieService } from '../services/mollieService';
import { EmailService } from '../services/emailService';
import crypto from 'crypto';
import { env } from '../config/env';

const SESSION_COOKIE_NAME = 'session_id';
const SESSION_DURATION_DAYS = 30;

export async function createOrder(req: Request, res: Response): Promise<void> {
  try {
    const { deliveryMethod, customer, deliveryAddress, notes } = req.body as {
      deliveryMethod: DeliveryMethod;
      customer: {
        email: string;
        first_name: string;
        last_name: string;
        phone: string;
        company_name?: string;
        vat_number?: string;
      };
      deliveryAddress?: {
        street: string;
        house_number: string;
        postal_code: string;
        city: string;
        country?: string;
      };
      notes?: string;
    };
    
    // TODO: Implement full checkout logic
    // 1. Get cart from session
    // 2. Validate items availability
    // 3. Calculate totals (pricing service)
    // 4. Create/get customer
    // 5. Create order
    // 6. Create order items
    // 7. Create soft reservations
    // 8. Create Mollie payment
    // 9. Return payment URL

    const session = await getOrCreateSession(req, res);
    const cartItems = Array.isArray(session.cart_data) ? session.cart_data : [];

    if (cartItems.length === 0) {
      res.status(400).json({ success: false, error: 'Cart is empty' });
      return;
    }

    // Ensure single rental period for now
    const rentalStart = cartItems[0].startDate;
    const rentalEnd = cartItems[0].endDate;
    const hasMixedDates = cartItems.some((i) => i.startDate !== rentalStart || i.endDate !== rentalEnd);
    if (hasMixedDates) {
      res.status(400).json({ success: false, error: 'All cart items must have the same rental period' });
      return;
    }

    // Validate delivery address requirements
    const postalCode = deliveryAddress?.postal_code;
    if (deliveryMethod === 'DELIVERY' && !postalCode) {
      res.status(400).json({ success: false, error: 'postal_code is required for delivery orders' });
      return;
    }

    // (Re)create soft reservations for this session (avoid stale reservations)
    await AvailabilityService.releaseSessionReservations(session.id);

    for (const item of cartItems) {
      const startDate = new Date(item.startDate);
      const endDate = new Date(item.endDate);

      if (item.type === 'product') {
        const ok = await AvailabilityService.createSoftReservationsForProduct(
          item.id,
          session.id,
          item.quantity,
          startDate,
          endDate
        );
        if (!ok) {
          res.status(409).json({ success: false, error: 'One or more items are not available' });
          return;
        }
      } else {
        const ok = await AvailabilityService.createSoftReservationsForPackage(
          item.id,
          session.id,
          item.persons || 1,
          startDate,
          endDate,
          item.addons || []
        );
        if (!ok) {
          res.status(409).json({ success: false, error: 'One or more items are not available' });
          return;
        }
      }
    }

    // Pricing
    const breakdown = await PricingService.calculateCartTotal(cartItems, deliveryMethod, postalCode);

    // Customer
    const customerId = await resolveCustomerId(req, customer);

    // Delivery address (optional)
    let deliveryAddressId: string | undefined;
    if (deliveryMethod === 'DELIVERY' && deliveryAddress) {
      const addr = await CustomerModel.addAddress(customerId, {
        type: 'delivery',
        street: deliveryAddress.street,
        house_number: deliveryAddress.house_number,
        postal_code: deliveryAddress.postal_code,
        city: deliveryAddress.city,
        country: deliveryAddress.country,
        is_default: true
      });
      deliveryAddressId = addr.id;
    }

    // Order
    const order = await OrderModel.create({
      customer_id: customerId,
      subtotal: breakdown.subtotal,
      delivery_fee: breakdown.deliveryFee,
      deposit_total: breakdown.depositTotal,
      total: breakdown.total,
      delivery_method: deliveryMethod,
      delivery_address_id: deliveryAddressId,
      rental_start_date: new Date(rentalStart),
      rental_end_date: new Date(rentalEnd),
      notes
    });

    for (const item of breakdown.items) {
      await OrderModel.addItem(order.id, {
        item_type: item.type,
        package_id: item.type === 'package' ? item.id : undefined,
        product_id: item.type === 'product' ? item.id : undefined,
        quantity: item.quantity,
        persons: item.persons,
        unit_price: item.unitPrice,
        deposit_amount: item.depositAmount,
        line_total: item.lineTotal
      });
    }

    // Attach reservations to order (keep session_id for later conversion)
    await ReservationModel.assignOrderToSessionReservations(session.id, order.id);

    // Create Mollie payment
    const paymentResult = await MollieService.createPayment({
      order: {
        ...order,
        subtotal: Number((order as any).subtotal),
        delivery_fee: Number((order as any).delivery_fee),
        deposit_total: Number((order as any).deposit_total),
        total: Number((order as any).total)
      },
      description: `Tafel Totaal - ${order.order_number}`,
      redirectUrl: `${env.FRONTEND_URL}/checkout/succes?order=${order.id}`
    });

    if (!paymentResult.success || !paymentResult.paymentId || !paymentResult.checkoutUrl) {
      res.status(500).json({ success: false, error: paymentResult.error || 'Failed to create payment' });
      return;
    }

    await OrderModel.setMolliePaymentId(order.id, paymentResult.paymentId);

    // Send initial emails (order received)
    const customerRecord = await CustomerModel.findById(customerId);
    if (customerRecord) {
      await EmailService.sendOrderConfirmation({ ...order, items: breakdown.items as any[] }, customerRecord);
      await EmailService.sendAdminNewOrderNotification(order);
    }

    res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        paymentUrl: paymentResult.checkoutUrl
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
}

export async function calculatePrice(req: Request, res: Response): Promise<void> {
  try {
    const { items, startDate, endDate, deliveryMethod } = req.body;

    // TODO: Implement pricing calculation
    // 1. Fetch package/product prices
    // 2. Calculate rental days
    // 3. Apply forfait or per-day pricing
    // 4. Calculate deposit
    // 5. Add delivery fee if applicable

    const cartItems: CartItem[] = (items as CartItem[]).map((i) => {
      if (i.startDate && i.endDate) return i;
      return { ...i, startDate, endDate };
    });

    const method: DeliveryMethod = deliveryMethod || 'DELIVERY';
    const postalCode = req.body?.postalCode as string | undefined;
    const breakdown = await PricingService.calculateCartTotal(cartItems, method, postalCode);

    res.json({ success: true, data: breakdown });
  } catch (error) {
    console.error('Calculate price error:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate price' });
  }
}

async function getOrCreateSession(req: Request, res: Response) {
  const sessionToken = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
  const customerId = req.user?.userId;

  if (sessionToken) {
    const existing = await SessionModel.findByToken(sessionToken);
    if (existing) {
      if (customerId && !existing.customer_id) {
        await SessionModel.linkToCustomer(existing.id, customerId);
        existing.customer_id = customerId;
      }
      return existing;
    }
  }

  const created = await SessionModel.create(customerId);

  res.cookie(SESSION_COOKIE_NAME, created.session_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  });

  return created;
}

async function resolveCustomerId(
  req: Request,
  customer: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    company_name?: string;
    vat_number?: string;
  }
): Promise<string> {
  if (req.user?.userId) {
    return req.user.userId;
  }

  const existing = await CustomerModel.findByEmail(customer.email);
  if (existing) {
    await CustomerModel.update(existing.id, {
      first_name: customer.first_name,
      last_name: customer.last_name,
      phone: customer.phone,
      company_name: customer.company_name,
      vat_number: customer.vat_number
    });
    return existing.id;
  }

  const randomPassword = crypto.randomBytes(24).toString('hex');
  const created = await CustomerModel.create({
    email: customer.email,
    password: randomPassword,
    first_name: customer.first_name,
    last_name: customer.last_name,
    phone: customer.phone,
    company_name: customer.company_name,
    vat_number: customer.vat_number
  });
  return created.id;
}
