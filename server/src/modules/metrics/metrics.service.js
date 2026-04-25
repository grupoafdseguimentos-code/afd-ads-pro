import { prisma } from '../../config/prisma.js';

export async function getDashboard(userId) {
  const metrics = await prisma.metric.findMany({
    where: { userId },
    include: { ad: true },
    orderBy: { date: 'asc' }
  });

  const totals = metrics.reduce((acc, item) => {
    const spend = Number(item.spend);
    const revenue = Number(item.revenue);
    const cost = Number(item.cost);
    const fee = Number(item.fee);
    const freight = Number(item.freight);
    acc.impressions += item.impressions;
    acc.clicks += item.clicks;
    acc.orders += item.orders;
    acc.spend += spend;
    acc.revenue += revenue;
    acc.profit += revenue - spend - cost - fee - freight;
    return acc;
  }, { impressions: 0, clicks: 0, orders: 0, spend: 0, revenue: 0, profit: 0 });

  totals.ctr = divide(totals.clicks, totals.impressions);
  totals.cpc = divide(totals.spend, totals.clicks);
  totals.roas = divide(totals.revenue, totals.spend);
  totals.conversion = divide(totals.orders, totals.clicks);
  totals.margin = divide(totals.profit, totals.revenue);

  const byDate = groupBy(metrics, item => item.date.toISOString().slice(0, 10));
  const series = Object.entries(byDate).map(([date, rows]) => {
    const spend = sum(rows, row => Number(row.spend));
    const revenue = sum(rows, row => Number(row.revenue));
    const profit = sum(rows, row => Number(row.revenue) - Number(row.spend) - Number(row.cost) - Number(row.fee) - Number(row.freight));
    return { date, spend, revenue, profit };
  });

  const ads = Object.entries(groupBy(metrics, item => item.adId)).map(([adId, rows]) => {
    const first = rows[0];
    const spend = sum(rows, row => Number(row.spend));
    const revenue = sum(rows, row => Number(row.revenue));
    const profit = sum(rows, row => Number(row.revenue) - Number(row.spend) - Number(row.cost) - Number(row.fee) - Number(row.freight));
    return {
      adId,
      name: first.ad.name,
      productName: first.ad.productName,
      spend,
      revenue,
      profit,
      roas: divide(revenue, spend),
      ctr: divide(sum(rows, row => row.clicks), sum(rows, row => row.impressions))
    };
  }).sort((a, b) => b.spend - a.spend);

  return { totals, series, ads };
}

export async function createMetric(userId, data) {
  const ad = await prisma.ad.findFirst({ where: { id: data.adId, userId } });
  if (!ad) {
    const error = new Error('Anuncio nao encontrado.');
    error.status = 404;
    throw error;
  }

  return prisma.metric.create({
    data: { ...data, userId }
  });
}

function divide(a, b) {
  return b ? a / b : 0;
}

function groupBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
}

function sum(items, fn) {
  return items.reduce((acc, item) => acc + fn(item), 0);
}
