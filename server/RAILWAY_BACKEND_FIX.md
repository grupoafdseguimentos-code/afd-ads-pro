# Railway backend fix

Backend ajustado para passar healthcheck e expor dominio no Railway.

## Railway

Use no servico do backend:

```txt
Root Directory: server
Build Command: npm install && npm run db:generate && npm run build
Start Command: npm start
Healthcheck Path: /api/health
```

## Healthcheck

Endpoint publico:

```txt
GET /api/health
```

Resposta:

```txt
ok
```

Endpoint para conferir o banco depois do deploy:

```txt
GET /api/ready
```

Quando o PostgreSQL estiver conectado:

```json
{ "status": "ok", "database": "connected" }
```

## Banco

O servidor abre porta mesmo que o banco ainda esteja iniciando. As migrations devem ser rodadas como comando separado depois que `DATABASE_URL` estiver configurada:

```bash
npm run db:deploy
```

## Variaveis recomendadas

```txt
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
CLIENT_URL=https://seu-frontend.vercel.app
```
