import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env, isDevelopment } from './config/env';
import { testConnection, runLoyaltyMigration } from './config/database';
import { runMigrations } from './config/migrations';
import { runPackagesMigration } from './config/packages-migration';

import authRoutes from './routes/auth.routes';
import packagesRoutes from './routes/packages.routes';
import productsRoutes from './routes/products.routes';
import categoriesRoutes from './routes/categories.routes';
import cartRoutes from './routes/cart.routes';
import checkoutRoutes from './routes/checkout.routes';
import ordersRoutes from './routes/orders.routes';
import availabilityRoutes from './routes/availability.routes';
import webhooksRoutes from './routes/webhooks.routes';
import adminRoutes from './routes/admin.routes';
import bezorgzonesRoutes from './routes/bezorgzones.routes';
import uploadRoutes from './routes/upload.routes';
import loyaltyRoutes from './routes/loyalty.routes';
import tagsRoutes from './routes/tags.routes';

const app: Express = express();

// Trust proxy for Railway/Heroku/etc - required for express-rate-limit to work correctly
// This tells Express to trust the X-Forwarded-* headers from the reverse proxy
app.set('trust proxy', 1);

const allowedOrigins = env.CORS_ALLOWED_ORIGINS
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

function isAllowedOrigin(origin: string): boolean {
  if (allowedOrigins.includes(origin)) return true;

  try {
    const url = new URL(origin);
    if (url.hostname.endsWith('.netlify.app')) return true;
    // Allow tafeltotaal.com and www.tafeltotaal.com
    if (url.hostname === 'tafeltotaal.com' || url.hostname === 'www.tafeltotaal.com') return true;
  } catch {
    return false;
  }

  return false;
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: { success: false, error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for auth/me endpoint (used for session checks)
    if (req.path === '/api/auth/me' && req.method === 'GET') return true;
    return false;
  }
});

// Separate stricter limiter for login attempts (prevent brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per 15 minutes
  message: { success: false, error: 'Te veel inlogpogingen. Probeer het over 15 minuten opnieuw.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use('/api/auth/login', loginLimiter);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/packages', packagesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bezorgzones', bezorgzonesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/tags', tagsRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

interface ErrorWithStatus extends Error {
  status?: number;
}

app.use((err: ErrorWithStatus, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Error:', err);
  
  const status = err.status || 500;
  const message = isDevelopment ? err.message : 'Internal server error';
  
  res.status(status).json({
    success: false,
    error: message,
    ...(isDevelopment && { stack: err.stack }),
  });
});

async function startServer(): Promise<void> {
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.error('❌ Could not connect to database. Exiting...');
    process.exit(1);
  }
  
  // Run database migrations on startup
  await runMigrations();
  await runLoyaltyMigration();
  await runPackagesMigration();
  
  app.listen(env.PORT, () => {
    console.log(`
🚀 Tafel Totaal API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Environment: ${env.NODE_ENV}
🌐 Server:      ${env.BACKEND_URL}
📦 Database:    Connected
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  });
}

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

export default app;
