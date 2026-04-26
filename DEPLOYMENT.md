# Deploy do A.F.D Ads Pro

## Frontend na Vercel

1. Criar projeto na Vercel.
2. Root directory: `client`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Variaveis:
   - `VITE_API_URL=https://seu-backend.up.railway.app`
   - `VITE_STRIPE_PUBLIC_KEY=pk_live_...`

## Backend na Railway/Render

1. Criar servico Node apontando para `server`.
2. Start command: `npm start`.
3. Build command: `npm install && npm run db:generate && npm run build`.
4. Variaveis:
   - `NODE_ENV=production`
   - `DATABASE_URL`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `CLIENT_URL=https://seu-frontend.vercel.app`
   - `API_URL=https://seu-backend.up.railway.app`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_PRO_MONTHLY`
   - `STRIPE_PRICE_ELITE_MONTHLY`

### Railway com monorepo

Opção recomendada:

- Backend service: Root Directory `server`
- Frontend service: Root Directory `client`, preferencialmente na Vercel

Depois do deploy do backend, gere o dominio publico no Railway:

```txt
Settings -> Networking -> Public Networking -> Generate Domain
```

A URL final fica parecida com:

```txt
https://afd-ads-pro-production.up.railway.app
```

Teste no navegador:

```txt
https://afd-ads-pro-production.up.railway.app/api/health
https://afd-ads-pro-production.up.railway.app/api/ready
```

Se o Railway estiver apontando para a raiz `afd-ads-pro-saas`, use o `railway.json` da raiz. Ele roda o backend via workspaces:

- Build: `npm install && npm run db:generate && npm run build --workspace server`
- Start: `npm start`

Erros comuns:

- `Missing script: start`: Railway apontou para a raiz sem script `start`.
- `Could not find Prisma schema`: build rodou fora de `server`.
- `DATABASE_URL required`: variavel do Postgres nao foi conectada ao servico.
- Healthcheck falhando: API nao subiu ou `PORT` nao foi respeitado.

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

No Railway, rode migrations como comando separado ou deploy job depois que o banco estiver conectado. O start principal nao roda migration para nao bloquear o healthcheck nem a geracao do dominio.

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
