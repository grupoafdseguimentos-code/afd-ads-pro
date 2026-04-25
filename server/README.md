# Backend A.F.D Ads Pro

API SaaS com Express, Prisma, PostgreSQL, JWT, refresh token, controle de planos e Stripe.

## Principais rotas

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/users/me`
- `GET /api/plans`
- `GET /api/ads`
- `POST /api/ads`
- `GET /api/metrics/dashboard`
- `POST /api/metrics`
- `POST /api/billing/checkout`
- `POST /api/billing/webhook`

## Isolamento multiusuario

Todas as rotas autenticadas usam `req.user.id` como filtro obrigatorio de dados.

## Controle de planos

- `FREE`: ate 3 anuncios e sem escrita de metricas avancadas.
- `PRO`: anuncios ilimitados e metricas completas.
- `ELITE`: tudo liberado e preparado para automacoes.
