import { Router } from 'express';
import { prisma } from '../../config/prisma.js';
import { enforceAdLimit } from '../../middlewares/plan.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { adSchema } from './ads.schemas.js';

export const adRoutes = Router();

adRoutes.get('/', asyncHandler(async (req, res) => {
  const ads = await prisma.ad.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ ads });
}));

adRoutes.post('/', enforceAdLimit, asyncHandler(async (req, res) => {
  const data = adSchema.parse(req.body);
  const ad = await prisma.ad.create({
    data: { ...data, userId: req.user.id }
  });
  res.status(201).json({ ad });
}));

adRoutes.get('/:id', asyncHandler(async (req, res) => {
  const ad = await prisma.ad.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { metrics: { orderBy: { date: 'desc' }, take: 30 } }
  });
  if (!ad) return res.status(404).json({ message: 'Anuncio nao encontrado.' });
  res.json({ ad });
}));

adRoutes.patch('/:id', asyncHandler(async (req, res) => {
  const data = adSchema.partial().parse(req.body);
  const ad = await prisma.ad.updateMany({
    where: { id: req.params.id, userId: req.user.id },
    data
  });
  if (!ad.count) return res.status(404).json({ message: 'Anuncio nao encontrado.' });
  res.json({ ok: true });
}));

adRoutes.delete('/:id', asyncHandler(async (req, res) => {
  const deleted = await prisma.ad.deleteMany({
    where: { id: req.params.id, userId: req.user.id }
  });
  if (!deleted.count) return res.status(404).json({ message: 'Anuncio nao encontrado.' });
  res.status(204).send();
}));
