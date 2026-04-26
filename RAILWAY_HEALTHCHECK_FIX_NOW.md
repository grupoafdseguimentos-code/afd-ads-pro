# Railway healthcheck fix now

O retorno do Railway mostrou que o servico ainda esta usando o start antigo:

```txt
npm run db:deploy && npm start
```

Esse comando aparece no log do Railway durante o build/deploy. Enquanto ele existir no painel, o Railway pode ficar sem resposta em `/api/health`, porque tenta rodar migration antes de iniciar o servidor.

## Corrigir no Railway

No servico do backend:

```txt
Settings -> Deploy -> Start Command
```

Troque para:

```txt
npm start
```

Ou remova o override para o Railway usar `server/railway.json`.

## Configuracao final do servico

```txt
Root Directory: server
Build Command: npm install && npm run db:generate && npm run build
Start Command: npm start
Healthcheck Path: /api/health
```

## Healthcheck esperado

```txt
GET /api/health
```

Resposta:

```txt
ok
```

## Blindagem adicionada

Mesmo se o Railway ainda chamar o comando antigo:

```txt
npm run db:deploy && npm start
```

o script `db:deploy` agora nao bloqueia o start por padrao. Ele apenas orienta rodar migrations manualmente.

Para aplicar migrations de verdade, rode depois que o backend estiver saudavel:

```txt
npm run db:deploy:strict
```

Opcionalmente, para permitir migrations automaticas:

```txt
RUN_MIGRATIONS_ON_DEPLOY=1
```

Mas enquanto o healthcheck estiver instavel, mantenha o Start Command como:

```txt
npm start
```
