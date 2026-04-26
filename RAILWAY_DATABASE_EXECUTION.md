# Railway Database Execution - A.F.D Ads Pro

Este documento e a ordem exata para fazer o backend sair de:

```json
{ "status": "unavailable", "database": "unavailable" }
```

para:

```json
{
  "status": "ok",
  "database": "connected",
  "code": "DATABASE_CONNECTED"
}
```

## 1. Confirmar que o backend esta online

Abra no navegador:

```txt
https://afd-ads-proserver-production.up.railway.app/api/health
```

Resultado esperado:

```txt
ok
```

Se isso funciona, o problema nao e mais deploy. E banco.

## 2. Criar PostgreSQL se nao existir

No Railway:

```txt
+ New -> Database -> Add PostgreSQL
```

Espere o servico PostgreSQL ficar pronto.

## 3. Adicionar DATABASE_URL no servico backend

No Railway, entre no servico:

```txt
@afd-ads-pro/server
```

Abra:

```txt
Variables -> New Variable
```

Crie exatamente:

```txt
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

Se o servico PostgreSQL tiver outro nome no Railway, use o nome real:

```txt
DATABASE_URL=${{NOME_DO_SERVICO_POSTGRES.DATABASE_URL}}
```

Ponto critico: essa variavel precisa estar no servico `@afd-ads-pro/server`.
Nao basta estar no servico `Postgres`.

## 4. Conferir variaveis finais do backend

No servico `@afd-ads-pro/server`, deixe:

```txt
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_ACCESS_SECRET=senha_grande_com_mais_de_32_caracteres
JWT_REFRESH_SECRET=outra_senha_grande_com_mais_de_32_caracteres
CLIENT_URL=https://afd-ads-pro-client.vercel.app
API_URL=https://afd-ads-proserver-production.up.railway.app
```

Nao crie `PORT` manualmente. O Railway injeta `PORT`.

## 5. Redeploy backend

Depois de salvar as variaveis:

```txt
Deployments -> Redeploy
```

## 6. Rodar migrations com seguranca

No servico backend, rode:

```txt
npm run db:deploy
```

Esse script executa:

```txt
prisma migrate deploy
```

Ele aplica migrations pendentes sem apagar dados.

Nao use:

```txt
prisma migrate reset
prisma db push --force-reset
```

## 7. Verificar conexao via script

No servico backend, rode:

```txt
npm run db:check
```

Resultado esperado:

```txt
Database connection OK.
```

Se falhar, o script mostra erro sanitizado sem expor a senha do banco.

## 8. Testar /api/ready

Abra no navegador:

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

Se retornar:

```txt
DATABASE_URL_MISSING
```

O `DATABASE_URL` nao esta no servico backend.

Se retornar:

```txt
DATABASE_CONNECTION_FAILED
```

O `DATABASE_URL` existe, mas a referencia esta errada, o Postgres ainda nao esta pronto, ou o servico Postgres nao esta conectado ao projeto.

## 9. Testar cadastro no frontend

Abra o frontend Vercel e crie uma conta nova com:

```txt
email valido
senha com 8 ou mais caracteres
```

O endpoint usado pelo frontend e:

```txt
POST /api/auth/register
```

Body esperado:

```json
{
  "email": "teste@afdadspro.com",
  "password": "Senha12345"
}
```

Quando funcionar, o backend cria:

```txt
users.passwordHash com bcrypt
refresh_tokens.tokenHash
JWT accessToken
JWT refreshToken
```

## 10. Testar login

Depois do cadastro:

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

Resultado esperado:

```txt
Usuario logado e dashboard carregando sem erro de API.
```

## 11. Config Railway final

```txt
Root Directory: server
Build Command: npm install && npm run db:generate && npm run build
Start Command: npm start
Healthcheck Path: /api/health
```

Nao coloque migration no Start Command.
