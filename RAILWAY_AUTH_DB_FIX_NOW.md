# Railway Auth Database Fix Now - A.F.D Ads Pro

## Diagnostico real

Testes feitos contra producao:

```txt
GET /api/health -> 200 ok
GET /api/ready -> 200 DATABASE_CONNECTED
POST /api/auth/register -> 503 DATABASE_UNAVAILABLE
```

Isso mostra que:

```txt
O backend esta online.
O PostgreSQL aceita conexao.
O cadastro chega no backend.
O problema esta no Prisma ao acessar as tabelas do app.
```

A causa mais provavel e migration/tabelas pendentes no banco PostgreSQL.

## Correcao aplicada no codigo

O backend agora roda automaticamente, em producao:

```txt
npx prisma migrate deploy
```

antes de montar as rotas principais da aplicacao.

O healthcheck continua online imediatamente:

```txt
/api/health
```

mas cadastro/login so entram depois da tentativa de migration.

## Por que isso e seguro

O comando usado e:

```txt
prisma migrate deploy
```

Ele aplica migrations existentes e pendentes.
Nao apaga banco.
Nao usa reset.
Nao usa force reset.

## O que fazer agora

1. Subir este pacote novo no Railway.
2. Fazer redeploy do backend.
3. Conferir logs do backend. Deve aparecer:

```txt
Running Prisma migrations before mounting application routes...
Prisma migrations applied successfully.
Application routes mounted.
```

4. Testar:

```txt
https://afd-ads-proserver-production.up.railway.app/api/ready
```

5. Testar cadastro no frontend:

```txt
https://afd-ads-pro-client.vercel.app/register
```

## Se ainda falhar

Rode manualmente no Railway, dentro do servico backend:

```txt
npm run db:deploy
npm run db:check
```

O `db:check` agora valida conexao e tambem as tabelas:

```txt
users
refresh_tokens
subscriptions
ads
metrics
```
