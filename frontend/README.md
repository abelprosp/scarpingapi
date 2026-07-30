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

- Frontend: `http://localhost:3001` (ou `noviqsearch.online` via nginx)
- API: `https://api.noviqsearch.online/api/v1`

## Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Landing + pricing |
| `/register` | Cadastro (2.700 créditos grátis) |
| `/login` | Login |
| `/dashboard` | Saldo, quick start |
| `/dashboard/keys` | API Keys |
| `/dashboard/usage` | Histórico |
| `/dashboard/billing` | Planos + Stripe checkout |
| `/billing/success` | Retorno Stripe |
| `/billing/cancel` | Cancelamento checkout |

## Planos

| Plano | Preço | Créditos |
|-------|-------|----------|
| Grátis | R$ 0 | 2.700 ao cadastrar |
| Business | R$ 197/mês | 100.000/mês |
| Pro | R$ 497/mês | 350.000/mês |
