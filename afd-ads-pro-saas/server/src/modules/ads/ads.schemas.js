import { z } from 'zod';

export const adSchema = z.object({
  name: z.string().min(2),
  productName: z.string().min(2),
  sku: z.string().optional().nullable(),
  channel: z.string().optional().default('Shopee Ads'),
  status: z.string().optional().default('ACTIVE')
});
