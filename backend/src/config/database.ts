import { Pool, PoolConfig } from 'pg';
import { env, isDevelopment } from './env';

const poolConfig: PoolConfig = {
  connectionString: env.DATABASE_URL,
  ssl: isDevelopment ? false : { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(poolConfig);

pool.on('connect', () => {
  if (isDevelopment) {
    console.log('📦 Database connected');
  }
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  
  if (isDevelopment) {
    console.log('📝 Query executed:', { text: text.substring(0, 50), duration: `${duration}ms`, rows: result.rowCount });
  }
  
  return result.rows as T[];
}

export async function queryOne<T>(text: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

export async function testConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export async function closePool(): Promise<void> {
  await pool.end();
  console.log('📦 Database pool closed');
}
