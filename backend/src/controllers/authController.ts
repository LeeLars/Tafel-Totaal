import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { query, queryOne } from '../config/database';
import { Customer, JwtPayload } from '../types';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, first_name, last_name, phone } = req.body;

    const existingCustomer = await queryOne<Customer>(
      'SELECT id FROM customers WHERE email = $1',
      [email]
    );

    if (existingCustomer) {
      res.status(400).json({ success: false, error: 'Email already registered' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 12);

    const [customer] = await query<Customer>(
      `INSERT INTO customers (email, password_hash, first_name, last_name, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, phone, created_at`,
      [email, password_hash, first_name, last_name, phone || null]
    );

    const token = generateToken(customer);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      data: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    const customer = await queryOne<Customer>(
      'SELECT * FROM customers WHERE email = $1',
      [email]
    );

    if (!customer) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const validPassword = await bcrypt.compare(password, customer.password_hash);

    if (!validPassword) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const token = generateToken(customer);
    setAuthCookie(res, token);

    res.json({
      success: true,
      data: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.json({ success: true, message: 'Logged out successfully' });
}

export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const customer = await queryOne<Customer>(
      'SELECT id, email, first_name, last_name, phone, company_name, created_at FROM customers WHERE id = $1',
      [req.user.userId]
    );

    if (!customer) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ success: false, error: 'Failed to get user' });
  }
}

function generateToken(customer: Customer): string {
  const payload: JwtPayload = {
    userId: customer.id,
    email: customer.email,
    role: 'customer',
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}

function setAuthCookie(res: Response, token: string): void {
  const sameSite = env.COOKIE_SAMESITE;
  const secure = env.NODE_ENV === 'production' || sameSite === 'none';

  res.cookie('auth_token', token, {
    httpOnly: true,
    secure,
    sameSite,
    domain: env.COOKIE_DOMAIN,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}
