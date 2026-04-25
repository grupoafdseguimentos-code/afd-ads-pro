# Status de Entrega - A.F.D Ads Pro SaaS

## Pronto no codigo

- Monorepo `client` + `server`.
- Frontend React + Vite + Tailwind + Recharts.
- Backend Node.js + Express.
- Banco PostgreSQL via Prisma ORM.
- Autenticacao com JWT access token e refresh token.
- Cadastro, login, logout, recuperacao e reset de senha.
- Planos `FREE`, `PRO` e `ELITE`.
- Controle de acesso por plano.
- Isolamento multiusuario por `userId`.
- Tabelas Prisma:
  - `users`
  - `subscriptions`
  - `ads`
  - `metrics`
  - `refresh_tokens`
- Stripe Checkout para assinatura mensal.
- Stripe webhook para ativar, atualizar, cancelar e marcar pagamento falho.
- Placeholder de checkout Mercado Pago para futura integracao sem quebrar contratos.
- Seed com conta PRO simulada.
- Configuracao local com Docker Compose para PostgreSQL.
- Configuracao de deploy:
  - Vercel para frontend
  - Render/Railway para backend

## Conta PRO simulada

- Email: `pro@afdadspro.com`
- Senha: `Pro@123456`
- Plano: `PRO`

Criar com:

```powershell
npm run db:seed
```

## Validacoes feitas

```text
A.F.D Ads Pro SaaS structure OK: 14 required files
Server syntax OK: 25 JS files
JSON OK: 5 files
```

## Nao executado neste ambiente

- `npm install`
- build real do Vite
- migracao real no PostgreSQL
- deploy online em Vercel/Railway/Render
- criacao real de produtos/precos no Stripe

Motivo: este desktop ainda nao possui `npm` funcional no runtime local. A estrutura esta pronta para instalar em uma maquina/ambiente com Node+npm completo.

## Para virar URL online funcionando

1. Instalar dependencias com `npm install`.
2. Criar banco PostgreSQL no Supabase/Railway.
3. Configurar `DATABASE_URL`.
4. Rodar `npm run db:migrate`.
5. Rodar `npm run db:seed`.
6. Criar produtos e precos no Stripe.
7. Configurar variaveis no backend.
8. Publicar `client` na Vercel.
9. Publicar `server` na Railway ou Render.
10. Configurar webhook Stripe apontando para `/api/billing/webhook`.
