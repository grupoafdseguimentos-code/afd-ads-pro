import { PrismaClient } from '@prisma/client';
import { env, envStatus } from './env.js';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});

function maskDatabaseUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value);
    const database = url.pathname.replace(/^\//, '') || 'database';
    return `${url.protocol}//${url.hostname}:${url.port || '5432'}/${database}`;
  } catch {
    return 'invalid-format';
  }
}

function sanitizeDatabaseError(error) {
  return String(error?.message || 'Unknown database error')
    .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, 'postgresql://***')
    .replace(/password=([^&\s]+)/gi, 'password=***');
}

async function getMissingCoreTables() {
  const requiredTables = ['users', 'refresh_tokens', 'subscriptions', 'ads', 'metrics'];
  const rows = await prisma.$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('users', 'refresh_tokens', 'subscriptions', 'ads', 'metrics')
  `;

  const found = new Set(rows.map(row => row.table_name));
  return requiredTables.filter(table => !found.has(table));
}

export async function getDatabaseStatus() {
  if (!envStatus.databaseUrlConfigured) {
    return {
      ok: false,
      code: 'DATABASE_URL_MISSING',
      message: 'DATABASE_URL nao esta configurada no servico server do Railway.',
      target: null
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    const missingTables = await getMissingCoreTables();

    if (missingTables.length) {
      const message = `PostgreSQL conectado, mas migrations pendentes. Tabelas ausentes: ${missingTables.join(', ')}. Rode npm run db:deploy no Railway.`;
      console.error('Database schema check failed:', message);
      return {
        ok: false,
        code: 'DATABASE_CONNECTION_FAILED',
        message,
        target: maskDatabaseUrl(env.DATABASE_URL)
      };
    }

    console.log('Database connection OK');
    return {
      ok: true,
      code: 'DATABASE_CONNECTED',
      message: 'PostgreSQL conectado.',
      target: maskDatabaseUrl(env.DATABASE_URL)
    };
  } catch (error) {
    const message = sanitizeDatabaseError(error);
    console.error('Database connection failed:', message);
    return {
      ok: false,
      code: 'DATABASE_CONNECTION_FAILED',
      message,
      target: maskDatabaseUrl(env.DATABASE_URL)
    };
  }
}

export async function checkDatabase() {
  const status = await getDatabaseStatus();
  return status.ok;
}
