# A.F.D Ads Pro - checklist final de deploy

## Ordem correta

```txt
1. Deploy backend no Railway
2. Gerar URL publica do Railway
3. Colocar URL do backend na Vercel
4. Deploy frontend na Vercel
5. Voltar no Railway e colocar CLIENT_URL real da Vercel
6. Redeploy backend no Railway
7. Testar health, ready, login e dashboard
```

## Backend Railway

Pasta correta:

```txt
server
```

Configuracao do servico:

```txt
Root Directory: server
Build Command: npm install && npm run db:generate && npm run build
Start Command: npm start
Healthcheck Path: /api/health
```

Scripts do backend:

```txt
npm run build       -> node scripts/check-syntax.js
npm start           -> node index.js
npm run db:generate -> prisma generate
npm run db:deploy   -> nao bloqueia o start; use apenas para compatibilidade com Railway antigo
npm run db:deploy:strict -> prisma migrate deploy
npm run validate:prod -> valida /api/health e /api/ready em producao
```

Variaveis no Railway:

```txt
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=senha_grande
JWT_REFRESH_SECRET=senha_grande
CLIENT_URL=https://seu-frontend.vercel.app
API_URL=https://nome-do-servico.up.railway.app
```

Stripe, quando ativar pagamento real:

```txt
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_ELITE_MONTHLY=price_...
```

## Gerar dominio publico no Railway

No servico do backend:

```txt
Settings -> Networking -> Public Networking -> Generate Domain
```

Formato esperado:

```txt
https://nome-do-servico.up.railway.app
```

## Testar backend

No navegador:

```txt
https://nome-do-servico.up.railway.app/api/health
```

Resposta esperada:

```json
{ "status": "ok" }
```

Teste de banco:

```txt
https://nome-do-servico.up.railway.app/api/ready
```

Resposta esperada:

```json
{ "status": "ok", "database": "connected" }
```

Se `/api/health` funciona e `/api/ready` falha, o backend esta online, mas o PostgreSQL ou `DATABASE_URL` precisa de ajuste.

## Rodar migrations

Depois que `DATABASE_URL` estiver configurada no Railway, rode como comando separado:

```txt
npm run db:deploy
```

Se precisar aplicar migration manualmente de verdade, use:

```txt
npm run db:deploy:strict
```

`db:deploy` foi mantido seguro para nao bloquear healthcheck caso o Railway ainda esteja com start antigo.

## Frontend Vercel

Pasta correta:

```txt
client
```

Configuracao do projeto:

```txt
Root Directory: client
Framework Preset: Vite
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

SPA fallback ja esta em:

```txt
client/vercel.json
```

Variaveis na Vercel:

```txt
VITE_API_URL=https://nome-do-servico.up.railway.app
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

`VITE_API_URL` deve ser a URL publica do Railway. O frontend aceita com ou sem `/api`.

## CORS

Depois que a Vercel gerar a URL do frontend, volte no Railway e configure:

```txt
CLIENT_URL=https://seu-frontend.vercel.app
```

Depois faca redeploy do backend.

## Validacao final

Com a URL publica do Railway:

PowerShell:

```powershell
$env:API_URL='https://nome-do-servico.up.railway.app'; npm run validate:prod
```

Bash:

```bash
API_URL=https://nome-do-servico.up.railway.app npm run validate:prod
```

```txt
[ ] Railway backend com deploy verde
[ ] Dominio publico Railway gerado
[ ] /api/health retorna ok
[ ] /api/ready retorna database connected
[ ] Migrations rodadas com npm run db:deploy
[ ] Vercel frontend com deploy verde
[ ] VITE_API_URL aponta para Railway
[ ] CLIENT_URL aponta para Vercel
[ ] Login/register funcionam
[ ] Dashboard abre sem tela branca
[ ] Se API cair, o frontend mostra aviso amigavel
```

## Exemplo de consumo no frontend

Camada central:

```js
import { api } from './services/api';

const { data } = await api.get('/health');
```

Fetch manual:

```js
const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '');
const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
const response = await fetch(`${apiUrl}/health`);
const data = await response.json();
```
