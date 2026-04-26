import { Router } from 'express';
import { requireAuth } from './middlewares/auth.js';
import { adRoutes } from './modules/ads/ads.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { billingRoutes } from './modules/billing/billing.routes.js';
import { metricRoutes } from './modules/metrics/metrics.routes.js';
import { planRoutes } from './modules/plans/plans.routes.js';
import { userRoutes } from './modules/users/users.routes.js';

export const routes = Router();

routes.get('/health', (req, res) => {
  res.status(200).send('ok');
});

routes.use('/auth', authRoutes);
routes.use('/plans', planRoutes);
routes.use('/billing', billingRoutes);
routes.use('/users', requireAuth, userRoutes);
routes.use('/ads', requireAuth, adRoutes);
routes.use('/metrics', requireAuth, metricRoutes);
