import { Router } from 'express';
import { prisma } from '../../config/prisma.js';
import { stripe, stripePrices } from '../../config/stripe.js';
import { env } from '../../config/env.js';
import { requireAuth } from '../../middlewares/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const billingRoutes = Router();

billingRoutes.post('/checkout', requireAuth, asyncHandler(async (req, res) => {
  if (!stripe) return res.status(503).json({ message: 'Stripe nao configurado.' });

  const plan = String(req.body.plan || '').toUpperCase();
  if (!['PRO', 'ELITE'].includes(plan)) {
    return res.status(400).json({ message: 'Plano invalido.' });
  }

  const price = stripePrices[plan];
  if (!price) return res.status(400).json({ message: 'Price ID nao configurado.' });

  let user = await prisma.user.findUnique({ where: { id: req.user.id } });
  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id }
    });
    customerId = customer.id;
    user = await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId }
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    success_url: `${env.CLIENT_URL}/billing?checkout=success`,
    cancel_url: `${env.CLIENT_URL}/billing?checkout=cancel`,
    metadata: { userId: user.id, plan }
  });

  res.json({ url: session.url });
}));

billingRoutes.post('/mercado-pago/checkout', requireAuth, asyncHandler(async (req, res) => {
  res.status(501).json({
    message: 'Mercado Pago esta reservado para a proxima etapa.',
    provider: 'mercado-pago',
    readyForIntegration: true
  });
}));

billingRoutes.post('/webhook', asyncHandler(async (req, res) => {
  if (!stripe) return res.status(503).send('Stripe not configured');

  const signature = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await activateSubscription({
      userId: session.metadata.userId,
      plan: session.metadata.plan,
      stripeSubscriptionId: session.subscription,
      stripeCustomerId: session.customer
    });
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    await syncSubscription(subscription);
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object;
    if (invoice.subscription) {
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: invoice.subscription },
        data: { status: 'PAST_DUE' }
      });
    }
  }

  res.json({ received: true });
}));

async function activateSubscription({ userId, plan, stripeSubscriptionId, stripeCustomerId }) {
  await prisma.user.update({
    where: { id: userId },
    data: { plan, stripeCustomerId }
  });

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId },
    create: {
      userId,
      plan,
      status: 'ACTIVE',
      stripeSubscriptionId
    },
    update: {
      plan,
      status: 'ACTIVE'
    }
  });
}

async function syncSubscription(subscription) {
  const statusMap = {
    active: 'ACTIVE',
    trialing: 'TRIALING',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    incomplete: 'INCOMPLETE'
  };
  const status = statusMap[subscription.status] || 'INCOMPLETE';
  const found = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id }
  });
  if (!found) return;

  await prisma.subscription.update({
    where: { id: found.id },
    data: {
      status,
      currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
      cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end)
    }
  });

  if (status === 'CANCELED' || status === 'PAST_DUE') {
    await prisma.user.update({ where: { id: found.userId }, data: { plan: 'FREE' } });
  }
}
