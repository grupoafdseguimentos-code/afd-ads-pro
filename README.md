# A.F.D Ads Pro SaaS

Produto SaaS para analise, gestao e monetizacao de Shopee Ads com login, planos, assinatura e dados isolados por usuario.

## Stack

- Frontend: React + Vite + Tailwind + Recharts
- Backend: Node.js + Express
- Banco: PostgreSQL + Prisma ORM
- Auth: JWT access token + refresh token
- Pagamentos: Stripe, com estrutura preparada para Mercado Pago no futuro

## Planos

- FREE: limite de 3 anuncios e metricas basicas.
- PRO: anuncios ilimitados, metricas completas e dashboard avancado.
- ELITE: tudo liberado, prioridade e automacoes futuras.

## Rodar localmente

1. Instale dependencias:

```powershell
npm install
```

2. Suba o Postgres:

```powershell
docker compose up -d
```

3. Configure variaveis:

```powershell
copy .env.example server\.env
copy .env.example client\.env
```

4. Rode Prisma:

```powershell
npm run db:migrate
npm run db:seed
```

5. Inicie o produto:

```powershell
npm run dev
```

## Login de teste

O seed cria uma conta PRO simulada:

- Email: `pro@afdadspro.com`
- Senha: `Pro@123456`
- Plano: `PRO`

## Deploy

- Frontend: Vercel apontando para `client`.
- Backend: Railway ou Render apontando para `server`.
- Banco: Supabase, Railway Postgres ou outro PostgreSQL gerenciado.
- Stripe: configurar produtos/precos mensais e webhook para `/api/billing/webhook`.

## Observacao

Este repositorio nao contem chaves reais. Para publicar online, configure variaveis de ambiente reais no Vercel/Railway/Render e os Price IDs do Stripe.

Veja tambem:

- `SAAS_STATUS.md`
- `DEPLOYMENT.md`
