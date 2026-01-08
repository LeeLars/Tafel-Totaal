import { query, queryOne } from '../config/database';
import { Session, CartItem } from '../types';
import crypto from 'crypto';

const SESSION_DURATION_HOURS = 24 * 7; // 7 days

export const SessionModel = {
  async findByToken(token: string): Promise<Session | null> {
    return queryOne<Session>(
      'SELECT * FROM sessions WHERE session_token = $1 AND expires_at > NOW()',
      [token]
    );
  },

  async findById(id: string): Promise<Session | null> {
    return queryOne<Session>(
      'SELECT * FROM sessions WHERE id = $1 AND expires_at > NOW()',
      [id]
    );
  },

  async create(customerId?: string): Promise<Session> {
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

    const result = await queryOne<Session>(
      `INSERT INTO sessions (session_token, customer_id, cart_data, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [sessionToken, customerId || null, JSON.stringify([]), expiresAt]
    );

    if (!result) throw new Error('Failed to create session');
    return result;
  },

  async getOrCreate(token: string | undefined, customerId?: string): Promise<Session> {
    if (token) {
      const existing = await this.findByToken(token);
      if (existing) {
        // Link to customer if provided and not already linked
        if (customerId && !existing.customer_id) {
          await this.linkToCustomer(existing.id, customerId);
          existing.customer_id = customerId;
        }
        return existing;
      }
    }
    return this.create(customerId);
  },

  async linkToCustomer(sessionId: string, customerId: string): Promise<void> {
    await query(
      'UPDATE sessions SET customer_id = $1 WHERE id = $2',
      [customerId, sessionId]
    );
  },

  async updateCart(sessionId: string, cartData: CartItem[]): Promise<Session | null> {
    return queryOne<Session>(
      'UPDATE sessions SET cart_data = $1 WHERE id = $2 RETURNING *',
      [JSON.stringify(cartData), sessionId]
    );
  },

  async addToCart(sessionId: string, item: CartItem): Promise<Session | null> {
    const session = await this.findById(sessionId);
    if (!session) return null;

    const cartData = Array.isArray(session.cart_data) ? session.cart_data : [];
    
    // Check if item already exists (same type, id, and dates)
    const existingIndex = cartData.findIndex(
      (i) => i.type === item.type && i.id === item.id && 
             i.startDate === item.startDate && i.endDate === item.endDate
    );

    if (existingIndex >= 0) {
      // Update quantity
      cartData[existingIndex].quantity += item.quantity;
      if (item.persons) cartData[existingIndex].persons = item.persons;
    } else {
      cartData.push(item);
    }

    return this.updateCart(sessionId, cartData);
  },

  async updateCartItem(
    sessionId: string, 
    itemIndex: number, 
    updates: Partial<CartItem>
  ): Promise<Session | null> {
    const session = await this.findById(sessionId);
    if (!session) return null;

    const cartData = Array.isArray(session.cart_data) ? session.cart_data : [];
    if (itemIndex < 0 || itemIndex >= cartData.length) return null;

    cartData[itemIndex] = { ...cartData[itemIndex], ...updates };
    return this.updateCart(sessionId, cartData);
  },

  async removeFromCart(sessionId: string, itemIndex: number): Promise<Session | null> {
    const session = await this.findById(sessionId);
    if (!session) return null;

    const cartData = Array.isArray(session.cart_data) ? session.cart_data : [];
    if (itemIndex < 0 || itemIndex >= cartData.length) return null;

    cartData.splice(itemIndex, 1);
    return this.updateCart(sessionId, cartData);
  },

  async clearCart(sessionId: string): Promise<Session | null> {
    return this.updateCart(sessionId, []);
  },

  async extend(sessionId: string): Promise<Session | null> {
    const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000);
    return queryOne<Session>(
      'UPDATE sessions SET expires_at = $1 WHERE id = $2 RETURNING *',
      [expiresAt, sessionId]
    );
  },

  async delete(sessionId: string): Promise<boolean> {
    await query('DELETE FROM sessions WHERE id = $1', [sessionId]);
    return true;
  },

  async deleteByToken(token: string): Promise<boolean> {
    await query('DELETE FROM sessions WHERE session_token = $1', [token]);
    return true;
  },

  async cleanupExpired(): Promise<number> {
    const result = await query<{ count: string }>(
      'WITH deleted AS (DELETE FROM sessions WHERE expires_at < NOW() RETURNING *) SELECT COUNT(*) as count FROM deleted',
      []
    );
    return parseInt(result[0]?.count || '0', 10);
  },

  async mergeGuestCart(guestSessionId: string, customerSessionId: string): Promise<Session | null> {
    const guestSession = await this.findById(guestSessionId);
    const customerSession = await this.findById(customerSessionId);

    if (!guestSession || !customerSession) return customerSession;

    const guestCart = Array.isArray(guestSession.cart_data) ? guestSession.cart_data : [];
    const customerCart = Array.isArray(customerSession.cart_data) ? customerSession.cart_data : [];

    // Merge carts (guest items added to customer cart)
    const mergedCart = [...customerCart];
    for (const guestItem of guestCart) {
      const existingIndex = mergedCart.findIndex(
        (i) => i.type === guestItem.type && i.id === guestItem.id &&
               i.startDate === guestItem.startDate && i.endDate === guestItem.endDate
      );
      if (existingIndex >= 0) {
        mergedCart[existingIndex].quantity += guestItem.quantity;
      } else {
        mergedCart.push(guestItem);
      }
    }

    // Update customer session and delete guest session
    await this.updateCart(customerSession.id, mergedCart);
    await this.delete(guestSessionId);

    return this.findById(customerSession.id);
  }
};
