import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});

export async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection OK');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}
