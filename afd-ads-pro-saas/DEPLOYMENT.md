# Deploy do A.F.D Ads Pro

## Frontend na Vercel

1. Criar projeto na Vercel.
2. Root directory: `client`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Variaveis:
   - `VITE_API_URL=https://api.seu-dominio.com/api`
   - `VITE_STRIPE_PUBLIC_KEY=pk_live_...`

## Backend na Railway/Render

1. Criar servico Node apontando para `server`.
2. Start command: `npm start`.
3. Build command: `npm run build`.
4. Variaveis:
   - `DATABASE_URL`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `CLIENT_URL`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_PRO_MONTHLY`
   - `STRIPE_PRICE_ELITE_MONTHLY`

## Banco PostgreSQL

Opcoes recomendadas:

- Supabase
- Railway Postgres
- Neon

Depois de configurar `DATABASE_URL`:

```bash
npx prisma migrate deploy
npx prisma db seed
```

## Stripe

1. Criar produto `A.F.D Ads Pro PRO`.
2. Criar produto `A.F.D Ads Pro ELITE`.
3. Criar precos mensais.
4. Copiar Price IDs para variaveis.
5. Criar webhook com eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
6. URL webhook: `https://api.seu-dominio.com/api/billing/webhook`.

## Conta PRO simulada

Use apenas em staging/demo:

- `pro@afdadspro.com`
- `Pro@123456`
