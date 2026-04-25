import { Router } from 'express';
import { PLANS } from '../../constants/plans.js';

export const planRoutes = Router();

planRoutes.get('/', (req, res) => {
  res.json({ plans: Object.values(PLANS) });
});
