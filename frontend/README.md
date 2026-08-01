# NoviqSearch Frontend

Landing page + dashboard SaaS para vender planos da API.

## Stack

- Next.js 15 (App Router)
- Tailwind CSS 4
- TypeScript

## Desenvolvimento local

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Abre em `http://localhost:3000`

Configure `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1` (API NestJS rodando).

## Produção (Docker)

```bash
# Na raiz do projeto
docker compose up -d --build web api
```

- Frontend: `http://localhost:3080` (ou `noviqsearch.online` via nginx)
- API: `https://api.noviqsearch.online/api/v1`

**Conflito de porta:** o container `web` usa `WEB_PORT` (padrão `3080`). Se essa porta já estiver em uso na VPS, defina outro valor em `.env` (ex.: `WEB_PORT=3081`) e atualize `proxy_pass` em `docker/nginx/noviqsearch.online.conf` para a mesma porta antes de recarregar o nginx.

## Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Landing + pricing |
| `/register` | Cadastro (500 créditos grátis) |
| `/login` | Login |
| `/dashboard` | Saldo, quick start |
| `/dashboard/keys` | API Keys |
| `/dashboard/usage` | Histórico |
| `/dashboard/billing` | Planos + PIX |

## Planos

| Plano | Preço | Créditos |
|-------|-------|----------|
| Gratuito | R$ 0 | 500 ao cadastrar |
| Starter | R$ 39/mês | 12.000/mês |
| Pro | R$ 149/mês | 50.000/mês |
| Business | R$ 499/mês | 200.000/mês |
