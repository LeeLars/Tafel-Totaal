import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from '../config/database';
import { Session, CartItem } from '../types';
import { CustomerModel } from '../models/Customer.model';

const SESSION_COOKIE_NAME = 'session_id';
const SESSION_DURATION_DAYS = 30;

export async function getCart(req: Request, res: Response): Promise<void> {
  try {
    const session = await getOrCreateSession(req, res);
    res.json({ success: true, data: session.cart_data });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, error: 'Failed to get cart' });
  }
}

async function resolveAuthenticatedCustomerId(req: Request): Promise<string | null> {
  if (!req.user) return null;

  // Some environments store a non-customer id in JWT (e.g. a separate users table).
  // Sessions.customer_id has an FK to customers(id), so we must only use a valid customers.id.
  const byId = req.user.userId ? await CustomerModel.findById(req.user.userId) : null;
  if (byId?.id) return byId.id;

  const byEmail = req.user.email ? await CustomerModel.findByEmail(req.user.email) : null;
  if (byEmail?.id) return byEmail.id;

  return null;
}

export async function addItem(req: Request, res: Response): Promise<void> {
  try {
    const session = await getOrCreateSession(req, res);
    const newItem: CartItem = req.body;

    const existingIndex = session.cart_data.findIndex(
      (item) => item.type === newItem.type && item.id === newItem.id
    );

    if (existingIndex >= 0) {
      session.cart_data[existingIndex].quantity += newItem.quantity;
    } else {
      session.cart_data.push(newItem);
    }

    await updateSessionCart(session.id, session.cart_data);

    res.json({ success: true, data: session.cart_data });
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({ success: false, error: 'Failed to add item' });
  }
}

export async function updateItem(req: Request, res: Response): Promise<void> {
  try {
    const session = await getOrCreateSession(req, res);
    const { itemId } = req.params;
    const { quantity } = req.body;

    const itemIndex = session.cart_data.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      res.status(404).json({ success: false, error: 'Item not found in cart' });
      return;
    }

    session.cart_data[itemIndex].quantity = quantity;
    await updateSessionCart(session.id, session.cart_data);

    res.json({ success: true, data: session.cart_data });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ success: false, error: 'Failed to update item' });
  }
}

export async function removeItem(req: Request, res: Response): Promise<void> {
  try {
    const session = await getOrCreateSession(req, res);
    const { itemId } = req.params;

    session.cart_data = session.cart_data.filter((item) => item.id !== itemId);
    await updateSessionCart(session.id, session.cart_data);

    res.json({ success: true, data: session.cart_data });
  } catch (error) {
    console.error('Remove item error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove item' });
  }
}

export async function clearCart(req: Request, res: Response): Promise<void> {
  try {
    const session = await getOrCreateSession(req, res);
    session.cart_data = [];
    await updateSessionCart(session.id, session.cart_data);

    res.json({ success: true, data: [] });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ success: false, error: 'Failed to clear cart' });
  }
}

async function getOrCreateSession(req: Request, res: Response): Promise<Session> {
  const sessionToken = req.cookies?.[SESSION_COOKIE_NAME];
  const customerId = await resolveAuthenticatedCustomerId(req);

  if (sessionToken) {
    const session = await queryOne<Session>(
      'SELECT * FROM sessions WHERE session_token = $1 AND expires_at > NOW()',
      [sessionToken]
    );

    if (session) {
      if (customerId && !session.customer_id) {
        await query(
          'UPDATE sessions SET customer_id = $1, updated_at = NOW() WHERE id = $2',
          [customerId, session.id]
        );
        session.customer_id = customerId;
      }
      return session;
    }
  }

  const newToken = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  const [newSession] = await query<Session>(
    `INSERT INTO sessions (session_token, customer_id, cart_data, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [newToken, customerId, JSON.stringify([]), expiresAt]
  );

  res.cookie(SESSION_COOKIE_NAME, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
  });

  return newSession;
}

async function updateSessionCart(sessionId: string, cartData: CartItem[]): Promise<void> {
  await query(
    'UPDATE sessions SET cart_data = $1, updated_at = NOW() WHERE id = $2',
    [JSON.stringify(cartData), sessionId]
  );
}
