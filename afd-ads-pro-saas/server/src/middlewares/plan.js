import { PLANS, canAccess } from '../constants/plans.js';
import { prisma } from '../config/prisma.js';

export function requireFeature(feature) {
  return (req, res, next) => {
    if (canAccess(req.user.plan, feature)) return next();
    return res.status(403).json({
      message: 'Seu plano atual nao libera esta funcionalidade.',
      requiredFeature: feature,
      currentPlan: req.user.plan
    });
  };
}

export async function enforceAdLimit(req, res, next) {
  const plan = PLANS[req.user.plan] || PLANS.FREE;
  if (plan.adLimit === Infinity) return next();

  const count = await prisma.ad.count({ where: { userId: req.user.id } });
  if (count < plan.adLimit) return next();

  return res.status(403).json({
    message: `O plano ${plan.name} permite ate ${plan.adLimit} anuncios.`,
    currentPlan: req.user.plan,
    upgrade: true
  });
}
