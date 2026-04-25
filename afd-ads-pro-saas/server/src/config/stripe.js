import Stripe from 'stripe';
import { env } from './env.js';

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  : null;

export const stripePrices = {
  PRO: env.STRIPE_PRICE_PRO_MONTHLY,
  ELITE: env.STRIPE_PRICE_ELITE_MONTHLY
};
