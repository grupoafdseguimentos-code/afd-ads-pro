# Railway Database Final Steps - A.F.D Ads Pro

O backend ja esta online quando:

```txt
GET /api/health
```

retorna:

```txt
ok
```

Agora o objetivo e fazer:

```txt
GET /api/ready
```

retornar:

```json
{
  "status": "ok",
  "database": "connected",
  "code": "DATABASE_CONNECTED"
}
```

## A. Criar PostgreSQL se ainda nao existir

No Railway:

```txt
+ New -> Database -> Add PostgreSQL
```

Espere o servico Postgres ficar ativo.

## B. Entrar no servico backend

No projeto Railway, abra o servico:

```txt
@afd-ads-pro/server
```

Importante: as variaveis precisam estar no servico backend, nao apenas dentro do servico Postgres.

## C. Abrir Variables

No servico backend:

```txt
Variables -> New Variable
```

Crie:

```txt
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

Se o servico PostgreSQL tiver outro nome, use o nome real do card do Railway:

```txt
DATABASE_URL=${{NOME_DO_SERVICO_POSTGRES.DATABASE_URL}}
```

## D. Conferir variaveis obrigatorias

No servico backend, deixe:

```txt
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_ACCESS_SECRET=senha_grande_com_mais_de_32_caracteres
JWT_REFRESH_SECRET=outra_senha_grande_com_mais_de_32_caracteres
CLIENT_URL=https://afd-ads-pro-client.vercel.app
API_URL=https://afd-ads-proserver-production.up.railway.app
```

Nao crie `PORT` manualmente. O Railway injeta a porta automaticamente.

## E. Salvar e fazer redeploy

Depois de salvar as variaveis:

```txt
Deployments -> Redeploy
```

## F. Rodar migrations sem apagar dados

Dentro do servico backend, rode:

```txt
npm run db:deploy
```

Esse comando executa:

```txt
prisma migrate deploy
```

Ele aplica migrations pendentes com seguranca. Nao use:

```txt
prisma migrate reset
prisma db push --force-reset
```

## G. Diagnosticar banco

Rode:

```txt
npm run db:check
```

Resultado esperado:

```txt
Database connection OK.
```

Se falhar, o erro vira mensagem segura, sem expor senha.

## H. Testar API no navegador

Healthcheck:

```txt
https://afd-ads-proserver-production.up.railway.app/api/health
```

Resultado esperado:

```txt
ok
```

Banco:

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

## I. Como interpretar /api/ready

```txt
DATABASE_URL_MISSING
```

A variavel `DATABASE_URL` nao esta no servico backend.

```txt
DATABASE_CONNECTION_FAILED
```

A variavel existe, mas a URL esta errada, o Postgres ainda nao esta pronto, ou o servico Postgres nao esta conectado ao projeto.

```txt
DATABASE_CONNECTED
```

Banco conectado corretamente.

## J. Testar cadastro

Depois do banco conectado e migrations aplicadas, teste:

```txt
POST /api/auth/register
```

Body:

```json
{
  "email": "teste@afdadspro.com",
  "password": "Senha12345"
}
```

Resultado esperado:

```json
{
  "user": {
    "email": "teste@afdadspro.com",
    "plan": "FREE"
  },
  "accessToken": "...",
  "refreshToken": "..."
}
```

Depois teste login:

```txt
POST /api/auth/login
```

Body:

```json
{
  "email": "teste@afdadspro.com",
  "password": "Senha12345"
}
```

## K. Configuracao final Railway

```txt
Root Directory: server
Build Command: npm install && npm run db:generate && npm run build
Start Command: npm start
Healthcheck Path: /api/health
```

Nao coloque `npm run db:deploy` no Start Command.
