import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  FRONTEND_URL: string;
  BACKEND_URL: string;
  CORS_ALLOWED_ORIGINS: string;
  COOKIE_DOMAIN?: string;
  COOKIE_SAMESITE: 'lax' | 'none' | 'strict';
  MOLLIE_API_KEY: string;
  MOLLIE_WEBHOOK_URL: string;
  RESEND_API_KEY: string;
  EMAIL_FROM: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvVarAsNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing required environment variable: ${key}`);
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return parsed;
}

export const env: EnvConfig = {
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: getEnvVarAsNumber('PORT', 3000),
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '7d'),
  FRONTEND_URL: getEnvVar('FRONTEND_URL'),
  BACKEND_URL: getEnvVar('BACKEND_URL'),
  CORS_ALLOWED_ORIGINS: getEnvVar('CORS_ALLOWED_ORIGINS', getEnvVar('FRONTEND_URL')),
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
  COOKIE_SAMESITE: (process.env.COOKIE_SAMESITE as EnvConfig['COOKIE_SAMESITE']) || 'lax',
  MOLLIE_API_KEY: getEnvVar('MOLLIE_API_KEY'),
  MOLLIE_WEBHOOK_URL: getEnvVar('MOLLIE_WEBHOOK_URL'),
  RESEND_API_KEY: getEnvVar('RESEND_API_KEY'),
  EMAIL_FROM: getEnvVar('EMAIL_FROM', 'Tafel Totaal <noreply@tafeltotaal.be>'),
  CLOUDINARY_CLOUD_NAME: getEnvVar('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: getEnvVar('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: getEnvVar('CLOUDINARY_API_SECRET'),
  RATE_LIMIT_WINDOW_MS: getEnvVarAsNumber('RATE_LIMIT_WINDOW_MS', 900000),
  RATE_LIMIT_MAX_REQUESTS: getEnvVarAsNumber('RATE_LIMIT_MAX_REQUESTS', 100),
};

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
