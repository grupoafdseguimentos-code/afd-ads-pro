# A.F.D Ads Pro - Railway + Vercel

Guia final para expor o backend no Railway e conectar o frontend em producao.

## 1. Backend no Railway

O backend fica em:

```txt
server
```

No Railway, configure o servico do backend assim:

```txt
Root Directory: server
Build Command: npm install && npm run db:generate && npm run build
Start Command: npm start
Healthcheck Path: /api/health
```

O servidor ja escuta a porta do Railway:

```js
app.listen(process.env.PORT || 3000, '0.0.0.0')
```

## 2. Gerar dominio publico

No Railway:

```txt
Settings -> Networking -> Public Networking -> Generate Domain
```

A URL final tera formato parecido com:

```txt
https://afd-ads-pro-production.up.railway.app
```

Use essa URL como `API_URL` do backend.

## 3. Variaveis do backend

Configure no Railway:

```txt
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=uma_senha_grande
JWT_REFRESH_SECRET=outra_senha_grande
CLIENT_URL=https://seu-frontend.vercel.app
API_URL=https://afd-ads-pro-production.up.railway.app
```

Stripe pode ficar vazio ate ativar pagamentos reais:

```txt
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_ELITE_MONTHLY=
```

## 4. Testar endpoints

Validacao automatica:

PowerShell:

```powershell
$env:API_URL='https://afd-ads-pro-production.up.railway.app'; npm run validate:prod
```

Bash:

```bash
API_URL=https://afd-ads-pro-production.up.railway.app npm run validate:prod
```

Teste no navegador:

```txt
https://afd-ads-pro-production.up.railway.app/api/health
```

Resposta esperada:

```txt
ok
```

Teste banco:

```txt
https://afd-ads-pro-production.up.railway.app/api/ready
```

Resposta esperada com banco conectado:

```json
{ "status": "ok", "database": "connected" }
```

Se `/api/health` funciona e `/api/ready` nao, o backend esta online, mas o PostgreSQL ou `DATABASE_URL` precisa ser corrigido.

## 5. Frontend na Vercel

No projeto da Vercel:

```txt
Root Directory: client
Framework: Vite
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

Variaveis do frontend:

```txt
VITE_API_URL=https://afd-ads-pro-production.up.railway.app
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

O build da Vercel valida `VITE_API_URL`. Se a variavel estiver vazia, o deploy falha antes de publicar uma versao quebrada.

O frontend normaliza a URL automaticamente. Pode usar com ou sem `/api`:

```txt
VITE_API_URL=https://afd-ads-pro-production.up.railway.app
VITE_API_URL=https://afd-ads-pro-production.up.railway.app/api
```

## 6. Exemplo de consumo

Fetch:

```js
const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '');
const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
const response = await fetch(`${apiUrl}/health`);
const data = await response.json();
```

Axios usando o service do projeto:

```js
import { api } from './services/api';

const { data } = await api.get('/health');
```

## 7. Checklist final

```txt
[ ] Backend com dominio publico gerado no Railway
[ ] /api/health retorna { "status": "ok" }
[ ] /api/ready retorna database connected
[ ] CLIENT_URL no Railway aponta para a URL da Vercel
[ ] VITE_API_URL na Vercel aponta para a URL do Railway
[ ] Frontend abre sem erro de CORS
```
Se o painel mostrar `npm run db:deploy && npm start`, troque para `npm start`.
