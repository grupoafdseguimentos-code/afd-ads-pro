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
  console.log('Database connection OK.');
  process.exitCode = 0;
} catch (error) {
  console.error('Database connection failed.');
  console.error('Reason:', sanitizeErrorMessage(error.message));
  process.exitCode = 1;
} finally {
  await prisma.$disconnect().catch(() => {});
}
