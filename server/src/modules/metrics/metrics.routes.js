import { Router } from 'express';
import { requireFeature } from '../../middlewares/plan.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { metricSchema } from './metrics.schemas.js';
import { createMetric, getDashboard } from './metrics.service.js';

export const metricRoutes = Router();

metricRoutes.get('/dashboard', asyncHandler(async (req, res) => {
  const dashboard = await getDashboard(req.user.id);
  const advanced = req.user.plan !== 'FREE';

  res.json({
    ...dashboard,
    access: {
      advancedMetrics: advanced,
      plan: req.user.plan
    }
  });
}));

metricRoutes.post('/', requireFeature('advancedMetrics'), asyncHandler(async (req, res) => {
  const metric = await createMetric(req.user.id, metricSchema.parse(req.body));
  res.status(201).json({ metric });
}));
