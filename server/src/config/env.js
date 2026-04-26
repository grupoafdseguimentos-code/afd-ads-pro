import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const fallbackDatabaseUrl = 'postgresql://postgres:postgres@localhost:5432/afd_ads_pro?schema=public';
const fallbackAccessSecret = 'afd-ads-pro-access-secret-fallback';
const fallbackRefreshSecret = 'afd-ads-pro-refresh-secret-fallback';
const isProduction = process.env.NODE_ENV === 'production';

if (!process.env.PORT) process.env.PORT = '3000';
if (!process.env.DATABASE_URL) process.env.DATABASE_URL = fallbackDatabaseUrl;
if (!process.env.JWT_ACCESS_SECRET) process.env.JWT_ACCESS_SECRET = fallbackAccessSecret;
if (!process.env.JWT_REFRESH_SECRET) process.env.JWT_REFRESH_SECRET = fallbackRefreshSecret;

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).catch('development').default('development'),
  PORT: z.coerce.number().int().positive().catch(3000).default(3000),
  CLIENT_URL: z.string().catch('').default(''),
  API_URL: z.string().catch('').default(''),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().catch('15m').default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().catch('30d').default('30d'),
  PASSWORD_RESET_EXPIRES_MINUTES: z.coerce.number().catch(30).default(30),
  STRIPE_SECRET_KEY: z.string().optional().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(''),
  STRIPE_PRICE_PRO_MONTHLY: z.string().optional().default(''),
  STRIPE_PRICE_ELITE_MONTHLY: z.string().optional().default('')
});

const result = schema.safeParse(process.env);

if (!result.success) {
  const details = result.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');

  console.error(`Configuracao de ambiente invalida: ${details}`);
}

export const env = result.success ? result.data : {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 3000,
  CLIENT_URL: process.env.CLIENT_URL || '',
  API_URL: process.env.API_URL || '',
  DATABASE_URL: process.env.DATABASE_URL || fallbackDatabaseUrl,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || fallbackAccessSecret,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || fallbackRefreshSecret,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  PASSWORD_RESET_EXPIRES_MINUTES: Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES) || 30,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  STRIPE_PRICE_PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
  STRIPE_PRICE_ELITE_MONTHLY: process.env.STRIPE_PRICE_ELITE_MONTHLY || ''
};

if (isProduction) {
  const missing = [];
  if (env.DATABASE_URL === fallbackDatabaseUrl) missing.push('DATABASE_URL');
  if (env.JWT_ACCESS_SECRET === fallbackAccessSecret) missing.push('JWT_ACCESS_SECRET');
  if (env.JWT_REFRESH_SECRET === fallbackRefreshSecret) missing.push('JWT_REFRESH_SECRET');

  if (missing.length) {
    console.error(`Production configuration missing: ${missing.join(', ')}. Healthcheck will stay online, but protected API features may fail until these variables are set.`);
  }
}
