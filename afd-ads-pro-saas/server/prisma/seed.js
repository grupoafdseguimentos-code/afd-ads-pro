import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Pro@123456', 12);

  const user = await prisma.user.upsert({
    where: { email: 'pro@afdadspro.com' },
    update: { plan: 'PRO', passwordHash },
    create: {
      email: 'pro@afdadspro.com',
      passwordHash,
      plan: 'PRO'
    }
  });

  const ad = await prisma.ad.upsert({
    where: { id: 'seed-ad-profit-kit' },
    update: {},
    create: {
      id: 'seed-ad-profit-kit',
      userId: user.id,
      name: 'Kit Lucrativo Shopee Ads',
      productName: 'Produto campeao',
      sku: 'PRO-001'
    }
  });

  await prisma.metric.createMany({
    data: [
      {
        id: 'seed-metric-profit-kit-2026-04-20',
        userId: user.id,
        adId: ad.id,
        date: new Date('2026-04-20'),
        impressions: 12000,
        clicks: 480,
        orders: 38,
        spend: 420,
        revenue: 1890,
        cost: 680,
        fee: 310,
        freight: 180
      },
      {
        id: 'seed-metric-profit-kit-2026-04-21',
        userId: user.id,
        adId: ad.id,
        date: new Date('2026-04-21'),
        impressions: 13400,
        clicks: 520,
        orders: 41,
        spend: 468,
        revenue: 2130,
        cost: 760,
        fee: 345,
        freight: 195
      }
    ],
    skipDuplicates: true
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async error => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
