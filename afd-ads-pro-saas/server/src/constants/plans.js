export const PLANS = {
  FREE: {
    key: 'FREE',
    name: 'Free',
    adLimit: 3,
    advancedMetrics: false,
    priority: false
  },
  PRO: {
    key: 'PRO',
    name: 'Pro',
    adLimit: Infinity,
    advancedMetrics: true,
    priority: false
  },
  ELITE: {
    key: 'ELITE',
    name: 'Elite',
    adLimit: Infinity,
    advancedMetrics: true,
    priority: true
  }
};

export function canAccess(plan, feature) {
  const current = PLANS[plan || 'FREE'] || PLANS.FREE;
  if (feature === 'advancedMetrics') return current.advancedMetrics;
  if (feature === 'priority') return current.priority;
  return true;
}
