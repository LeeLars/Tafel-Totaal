import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { query, queryOne } from '../config/database';
import { Customer, User, JwtPayload, UserRole } from '../types';
import { CustomerModel } from '../models/Customer.model';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, first_name, last_name, phone } = req.body;

     const normalizedEmail = String(email || '').trim().toLowerCase();

    const existingCustomer = await queryOne<Customer>(
      'SELECT id FROM customers WHERE LOWER(email) = LOWER($1)',
      [normalizedEmail]
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
      [normalizedEmail, password_hash, first_name, last_name, phone || null]
    );

    const token = generateTokenForUser(customer.id, customer.email, 'customer');
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      data: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        role: 'customer',
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
    const normalizedEmail = String(email || '').trim().toLowerCase();

    // First, try to find an admin user in the users table
    const adminUser = await queryOne<User & { password_hash: string }>(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [normalizedEmail]
    );

    if (adminUser) {
      const validPassword = await bcrypt.compare(password, adminUser.password_hash);
      if (validPassword) {
        const token = generateTokenForUser(adminUser.id, adminUser.email, adminUser.role);
        setAuthCookie(res, token);

        res.json({
          success: true,
          data: {
            id: adminUser.id,
            email: adminUser.email,
            first_name: adminUser.first_name,
            last_name: adminUser.last_name,
            role: adminUser.role,
          },
        });
        return;
      }
    }

    // If not found or password invalid, try customers table
    const customer = await queryOne<Customer>(
      'SELECT * FROM customers WHERE LOWER(email) = LOWER($1)',
      [normalizedEmail]
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

    const token = generateTokenForUser(customer.id, customer.email, 'customer');
    setAuthCookie(res, token);

    res.json({
      success: true,
      data: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        role: 'customer',
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

    // Check if user is admin
    if (req.user.role === 'admin') {
      const adminUser = await queryOne<User>(
        'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = $1',
        [req.user.userId]
      );

      if (!adminUser) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      res.json({ success: true, data: { ...adminUser, role: 'admin' } });
      return;
    }

    // Otherwise, check customers table
    const customer = await queryOne<Customer>(
      'SELECT id, email, first_name, last_name, phone, company_name, created_at FROM customers WHERE id = $1',
      [req.user.userId]
    );

    if (!customer) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({ success: true, data: { ...customer, role: 'customer' } });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ success: false, error: 'Failed to get user' });
  }
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'customer') {
      res.status(403).json({ success: false, error: 'Only customers can update profile' });
      return;
    }

    const { first_name, last_name, phone, company_name, vat_number } = req.body;
    const customerId = req.user.userId;

    const updatedCustomer = await CustomerModel.update(customerId, {
      first_name,
      last_name,
      phone,
      company_name,
      vat_number
    });

    if (!updatedCustomer) {
      res.status(404).json({ success: false, error: 'Customer not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: updatedCustomer.id,
        email: updatedCustomer.email,
        first_name: updatedCustomer.first_name,
        last_name: updatedCustomer.last_name,
        phone: updatedCustomer.phone,
        company_name: updatedCustomer.company_name,
        vat_number: updatedCustomer.vat_number,
        role: 'customer'
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== 'customer') {
      res.status(403).json({ success: false, error: 'Only customers can change password' });
      return;
    }

    const { current_password, new_password } = req.body;
    const customerId = req.user.userId;

    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      res.status(404).json({ success: false, error: 'Customer not found' });
      return;
    }

    const isValid = await CustomerModel.verifyPassword(customer, current_password);
    if (!isValid) {
      res.status(401).json({ success: false, error: 'Incorrect current password' });
      return;
    }

    const success = await CustomerModel.updatePassword(customerId, new_password);
    if (!success) {
      throw new Error('Failed to update password');
    }

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, error: 'Failed to change password' });
  }
}

function generateTokenForUser(userId: string, email: string, role: UserRole): string {
  const payload: JwtPayload = {
    userId,
    email,
    role,
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
