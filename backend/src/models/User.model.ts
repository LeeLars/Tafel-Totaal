import { query, queryOne } from '../config/database';
import { User, UserRole } from '../types';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

interface UserWithPassword extends User {
  password_hash: string;
}

export const UserModel = {
  async findById(id: string): Promise<User | null> {
    return queryOne<User>(
      'SELECT id, email, first_name, last_name, role, is_active, created_at FROM users WHERE id = $1',
      [id]
    );
  },

  async findByEmail(email: string): Promise<UserWithPassword | null> {
    return queryOne<UserWithPassword>(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    );
  },

  async create(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: UserRole;
  }): Promise<User> {
    const password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);
    
    const result = await queryOne<User>(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, role, is_active, created_at`,
      [
        data.email.toLowerCase(),
        password_hash,
        data.first_name,
        data.last_name,
        data.role || 'admin'
      ]
    );
    
    if (!result) throw new Error('Failed to create user');
    return result;
  },

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return null;

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  },

  async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [password_hash, id]
    );
    return true;
  },

  async setActive(id: string, isActive: boolean): Promise<boolean> {
    await query(
      'UPDATE users SET is_active = $1 WHERE id = $2',
      [isActive, id]
    );
    return true;
  }
};
