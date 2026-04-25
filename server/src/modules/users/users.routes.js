import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { prisma } from '../../config/prisma.js';

export const userRoutes = Router();

userRoutes.get('/me', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      plan: true,
      createdAt: true,
      subscriptions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          plan: true,
          status: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true
        }
      }
    }
  });

  res.json({ user });
}));
