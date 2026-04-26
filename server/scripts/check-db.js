import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

function maskDatabaseUrl(value) {
  if (!value) return 'not configured';

  try {
    const url = new URL(value);
    const database = url.pathname.replace(/^\//, '') || 'database';
    return `${url.protocol}//${url.hostname}:${url.port || '5432'}/${database}`;
  } catch {
    return 'configured but invalid format';
  }
}

function sanitizeErrorMessage(message) {
  return String(message || 'Unknown database error')
    .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, 'postgresql://***')
    .replace(/password=([^&\s]+)/gi, 'password=***');
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not configured in this service.');
  console.error('Set DATABASE_URL on the Railway server service, not only on the Postgres service.');
  process.exit(1);
}

console.log('Checking PostgreSQL connection...');
console.log('Database target:', maskDatabaseUrl(databaseUrl));

const prisma = new PrismaClient({
  log: ['error']
});

try {
  await prisma.$queryRaw`SELECT 1`;
  const rows = await prisma.$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('users', 'refresh_tokens', 'subscriptions', 'ads', 'metrics')
  `;
  const found = new Set(rows.map(row => row.table_name));
  const missing = ['users', 'refresh_tokens', 'subscriptions', 'ads', 'metrics']
    .filter(table => !found.has(table));

  if (missing.length) {
    console.error('Database connection OK, but required tables are missing.');
    console.error(`Missing tables: ${missing.join(', ')}`);
    console.error('Run `npm run db:deploy` on the Railway server service.');
    process.exitCode = 1;
  } else {
    console.log('Database connection OK.');
    process.exitCode = 0;
  }
} catch (error) {
  console.error('Database connection failed.');
  console.error('Reason:', sanitizeErrorMessage(error.message));
  process.exitCode = 1;
} finally {
  await prisma.$disconnect().catch(() => {});
}
