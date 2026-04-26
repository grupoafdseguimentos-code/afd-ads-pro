# Vercel Frontend Fix - A.F.D Ads Pro

O backend e o banco ja estao online quando:

```txt
https://afd-ads-proserver-production.up.railway.app/api/health -> ok
https://afd-ads-proserver-production.up.railway.app/api/ready -> DATABASE_CONNECTED
```

Se o frontend mostra `Servidor temporariamente indisponivel`, o problema esta na URL de API do build Vite ou no CORS.

## 1. Variavel obrigatoria na Vercel

No projeto frontend da Vercel:

```txt
Settings -> Environment Variables -> Production
```

Crie ou confirme:

```txt
VITE_API_URL=https://afd-ads-proserver-production.up.railway.app
```

Tambem pode funcionar com `/api` no final:

```txt
VITE_API_URL=https://afd-ads-proserver-production.up.railway.app/api
```

O frontend normaliza as duas formas e evita `/api/api`.

## 2. Redeploy obrigatorio

Variaveis `VITE_` entram no build do Vite.
Depois de alterar `VITE_API_URL`, faca:

```txt
Deployments -> Redeploy -> Use existing Build Cache: No
```

## 3. Variavel obrigatoria no Railway

No backend Railway `@afd-ads-pro/server`:

```txt
CLIENT_URL=https://afd-ads-pro-client.vercel.app
```

Tambem confirme:

```txt
API_URL=https://afd-ads-proserver-production.up.railway.app
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_ACCESS_SECRET=senha_grande
JWT_REFRESH_SECRET=senha_grande
```

Depois faca redeploy do backend.

## 4. Endpoints usados pelo frontend

O frontend usa:

```txt
GET /api/health
GET /api/ready
POST /api/auth/register
POST /api/auth/login
GET /api/users/me
```

Com a base:

```txt
https://afd-ads-proserver-production.up.railway.app
```

As chamadas finais ficam:

```txt
https://afd-ads-proserver-production.up.railway.app/api/health
https://afd-ads-proserver-production.up.railway.app/api/ready
https://afd-ads-proserver-production.up.railway.app/api/auth/register
https://afd-ads-proserver-production.up.railway.app/api/auth/login
```

## 5. Diagnostico no navegador

Abra o frontend:

```txt
https://afd-ads-pro-client.vercel.app/login
```

Abra o Console do navegador e procure:

```txt
A.F.D Ads Pro API diagnostics
```

Deve aparecer:

```txt
code: API_CONNECTED
health.ok: true
ready.ok: true
```

Se aparecer erro de CORS, o backend precisa estar no deploy novo com a correcao de CORS das rotas publicas.

Se `health` e `ready` estiverem OK, mas cadastro falhar com erro de banco, rode migrations no Railway:

```txt
npm run db:deploy
npm run db:check
```

O `db:check` agora valida conexao e tambem as tabelas obrigatorias:

```txt
users
refresh_tokens
subscriptions
ads
metrics
```

Na versao nova, o backend tambem roda automaticamente:

```txt
npx prisma migrate deploy
```

no start de producao antes de liberar as rotas da aplicacao. Isso nao apaga dados e resolve banco vazio apos o deploy.

## 6. Teste cadastro

Na tela de cadastro, use:

```txt
email valido
senha com 8 ou mais caracteres
```

O backend espera:

```json
{
  "email": "teste@afdadspro.com",
  "password": "Senha12345"
}
```

Resposta esperada:

```txt
usuario criado, accessToken salvo e dashboard/onboarding aberto
```

## 7. Teste login

Use a conta criada no cadastro.

Se o login retornar `Credenciais invalidas`, a API esta funcionando, mas o email/senha nao existem ou estao incorretos.

Se retornar `Servidor temporariamente indisponivel`, confira:

```txt
VITE_API_URL na Vercel
CLIENT_URL no Railway
redeploy dos dois servicos
```
