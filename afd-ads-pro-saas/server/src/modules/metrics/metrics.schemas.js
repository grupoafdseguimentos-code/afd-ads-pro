import { z } from 'zod';

export const metricSchema = z.object({
  adId: z.string().min(1),
  date: z.coerce.date(),
  impressions: z.coerce.number().int().min(0).default(0),
  clicks: z.coerce.number().int().min(0).default(0),
  orders: z.coerce.number().int().min(0).default(0),
  spend: z.coerce.number().min(0).default(0),
  revenue: z.coerce.number().min(0).default(0),
  cost: z.coerce.number().min(0).default(0),
  fee: z.coerce.number().min(0).default(0),
  freight: z.coerce.number().min(0).default(0)
});
