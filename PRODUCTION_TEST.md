# A.F.D Ads Pro - teste de producao

Use este guia depois que o backend estiver publicado no Railway e o frontend na Vercel.

## 1. Validar backend

Defina a URL publica do Railway.

PowerShell:

```powershell
$env:API_URL='https://nome-do-servico.up.railway.app'
```

Bash:

```bash
export API_URL=https://nome-do-servico.up.railway.app
```

Rode:

```bash
npm run validate:prod
```

O script testa:

```txt
GET /api/health
GET /api/ready
```

Resultado esperado:

```txt
✔ OK /api/health
✔ OK /api/ready
✔ OK Producao validada: backend online e banco conectado.
```

## 2. Testar no navegador

Abra:

```txt
https://nome-do-servico.up.railway.app/api/health
```

Resposta esperada:

```txt
ok
```

Abra:

```txt
https://nome-do-servico.up.railway.app/api/ready
```

Resposta esperada:

```json
{ "status": "ok", "database": "connected" }
```

Se `/api/health` funciona e `/api/ready` falha, o backend esta online, mas o banco ou `DATABASE_URL` precisa de ajuste.

## 3. Validar CORS

No Railway, `CLIENT_URL` deve ser exatamente a URL da Vercel:

```txt
CLIENT_URL=https://seu-frontend.vercel.app
```

Na Vercel, `VITE_API_URL` deve ser exatamente a URL do Railway:

```txt
VITE_API_URL=https://nome-do-servico.up.railway.app
```

Abra o frontend na Vercel e confira:

```txt
1. Nao aparece aviso de API offline.
2. Login abre normalmente.
3. Dashboard carrega depois do login.
```

Se aparecer erro de CORS no console, confira se `CLIENT_URL` no Railway esta igual a URL real da Vercel, sem barra no final.

## 4. Testar login

Teste uma conta cadastrada ou crie uma nova:

```txt
1. Abrir /register
2. Criar conta
3. Confirmar entrada no dashboard
4. Sair
5. Entrar novamente em /login
```

Se o token expirar, o frontend tenta renovar automaticamente. Se o refresh falhar, a sessao e limpa e o usuario volta para login.

## 5. Validar frontend -> backend

No navegador, abra o console da Vercel:

```txt
1. Aba Network
2. Filtrar por /api
3. Confirmar chamadas para o dominio Railway
4. Confirmar que nenhuma chamada vai para localhost
```

O frontend mostra uma mensagem amigavel se o backend cair:

```txt
Servidor temporariamente indisponivel
```

## 6. Checklist rapido

```txt
[ ] Backend Railway deployado
[ ] Dominio publico Railway gerado
[ ] /api/health OK
[ ] /api/ready OK
[ ] npm run validate:prod OK
[ ] Frontend Vercel deployado
[ ] VITE_API_URL aponta para Railway
[ ] CLIENT_URL aponta para Vercel
[ ] Login/register OK
[ ] Sem tela branca
[ ] Sem chamadas para localhost em producao
```
