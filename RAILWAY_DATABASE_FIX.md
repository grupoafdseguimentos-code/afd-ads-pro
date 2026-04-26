# Railway Database Fix - A.F.D Ads Pro

O backend ja esta online quando `/api/health` responde `ok`.
Se `/api/ready` retorna `database: "unavailable"`, o problema esta na conexao do servico `server` com o PostgreSQL.

## 1. Colocar DATABASE_URL no servico correto

No Railway, abra o projeto e entre no servico do backend:

```txt
@afd-ads-pro/server
```

Va em:

```txt
Variables -> New Variable
```

Adicione:

```txt
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

Importante: a variavel precisa estar no servico `server`.
Nao basta existir dentro do servico `Postgres`.

Se o nome do banco no Railway nao for `Postgres`, use o nome real exibido no painel:

```txt
DATABASE_URL=${{NOME_DO_SEU_POSTGRES.DATABASE_URL}}
```

Tambem pode colar a URL real do PostgreSQL, mas a referencia do Railway e melhor porque acompanha mudancas internas.

## 2. Variaveis obrigatorias no server

```txt
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_ACCESS_SECRET=gere-uma-chave-grande
JWT_REFRESH_SECRET=gere-outra-chave-grande
CLIENT_URL=https://seu-frontend.vercel.app
API_URL=https://afd-ads-proserver-production.up.railway.app
```

Nao defina `PORT` manualmente. O Railway injeta essa porta sozinho.

## 3. Rodar migrations com seguranca

Depois que `DATABASE_URL` estiver configurada no servico `server`, rode no Railway:

```txt
npx prisma migrate deploy
```

Ou use:

```txt
npm run db:deploy
```

Esse comando cria as tabelas `users`, `refresh_tokens`, `subscriptions`, `ads` e `metrics` sem apagar dados.

## 4. Testar banco

Use no Railway, dentro do servico `server`:

```txt
npm run db:check
```

Resultado esperado:

```txt
Database connection OK.
```

Depois teste no navegador:

```txt
https://afd-ads-proserver-production.up.railway.app/api/ready
```

Resultado esperado:

```json
{
  "status": "ok",
  "database": "connected",
  "code": "DATABASE_CONNECTED"
}
```

## 5. Se continuar unavailable

Veja o campo `code` retornado em `/api/ready`:

```txt
DATABASE_URL_MISSING
```

A variavel nao esta no servico `server`.

```txt
DATABASE_CONNECTION_FAILED
```

A variavel existe, mas a URL esta errada, o banco nao esta pronto, ou o servico Postgres nao esta conectado ao projeto.

## 6. Cadastro e login

O cadastro usa:

```txt
POST /api/auth/register
```

Campos:

```json
{
  "email": "usuario@email.com",
  "password": "senha-com-8-ou-mais-caracteres"
}
```

Quando o banco estiver conectado e as migrations aplicadas, o cadastro cria o usuario na tabela `users` e grava o refresh token em `refresh_tokens`.
