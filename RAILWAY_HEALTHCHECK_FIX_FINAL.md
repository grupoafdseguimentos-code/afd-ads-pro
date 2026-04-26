# Railway Healthcheck Fix Final

## Causa encontrada nos logs reais

O HTML salvo do Railway mostra que o deploy falhou na etapa:

```txt
Network -> Healthcheck
```

O log real mostra:

```txt
Starting Healthcheck
Path: /api/health
Attempt #1 failed with service unavailable
...
1/1 replicas never became healthy!
Healthcheck failed!
```

O ponto principal encontrado no log:

```txt
start | npm run db:deploy && npm start
```

Ou seja, o Railway ainda estava usando um Start Command antigo que executava migration antes de iniciar o servidor. Isso deixava `/api/health` indisponivel durante o healthcheck.

Tambem foi identificado que o deploy mostrado no HTML usou:

```txt
Using Nixpacks
```

Por isso, alem de `railway.json`, foi criado `server/nixpacks.toml` para forcar o start correto quando o Railway usar Nixpacks.

## Arquivos alterados

```txt
server/src/server.js
server/src/app.js
server/src/routes.js
server/package.json
server/railway.json
server/nixpacks.toml
railway.json
nixpacks.toml
scripts/validate-production.js
```

## Entrada real do backend

O `server/package.json` usa:

```json
"start": "node index.js"
```

O arquivo `server/index.js` carrega:

```js
import './src/server.js';
```

O arquivo que inicia o Express e abre a porta e:

```txt
server/src/server.js
```

## Porta Railway

Implementacao final:

```js
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
});
```

Nao usa `localhost`.
Nao usa `127.0.0.1`.
Nao usa porta fixa obrigatoria.

## Healthcheck ultra simples

Em `server/src/app.js`:

```js
app.get('/api/health', (req, res) => {
  res.status(200).type('text/plain').send('ok');
});
```

Essa rota:

```txt
Nao consulta banco
Nao usa Prisma
Nao exige JWT
Nao depende de CORS
Nao depende de variavel externa
Responde antes dos middlewares pesados
```

## Rota raiz

```txt
GET /
```

Resposta:

```txt
A.F.D Ads Pro API online
```

## Banco separado do healthcheck

Banco so e testado em:

```txt
GET /api/ready
```

`/api/health` nunca testa banco.

## Configuracao exata Railway

```txt
Root Directory:
server

Build Command:
npm install && npm run db:generate && npm run build

Start Command:
npm start

Healthcheck Path:
/api/health
```

## Importante no painel Railway

Se o painel ainda mostrar:

```txt
npm run db:deploy && npm start
```

troque para:

```txt
npm start
```

Caminho:

```txt
Settings -> Deploy -> Start Command
```

## URL para testar

```txt
https://afd-ads-proserver-production.up.railway.app/api/health
```

Resultado esperado:

```txt
ok
```

## Migrations

Nao rode migration no Start Command enquanto o healthcheck estiver falhando.

Depois que o backend estiver saudavel, rode manualmente:

```txt
npm run db:deploy:strict
```

O script `db:deploy` foi deixado seguro para compatibilidade com start antigo:

```txt
npm run db:deploy
```

Por padrao ele nao bloqueia o start.
