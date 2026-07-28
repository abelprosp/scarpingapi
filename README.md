# Serper Platform

Plataforma SaaS de API de busca em motores de pesquisa (SERP API) com arquitetura moderna, escalável e preparada para produção.

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Backend | NestJS, TypeScript, Fastify |
| Banco | PostgreSQL, Prisma ORM |
| Cache/Fila | Redis, BullMQ |
| Browser | Playwright, Puppeteer |
| Auth | JWT, API Keys, OAuth2-ready |
| Billing | Stripe |
| Monitoramento | Prometheus, Grafana, Sentry |
| Infra | Docker, Kubernetes, Nginx, Cloudflare-ready |

## Início Rápido

### Pré-requisitos

- Node.js 22+
- Docker & Docker Compose
- PostgreSQL 16+ (ou via Docker)
- Redis 7+ (ou via Docker)

### Instalação

```bash
# Clonar e instalar dependências
npm install

# Configurar ambiente
cp .env.example .env

# Subir infraestrutura
docker compose up -d postgres redis

# Migrar banco e seed
npx prisma migrate dev --name init
npm run prisma:seed

# Instalar browsers (Playwright)
npx playwright install chromium

# Desenvolvimento
npm run start:dev
```

A API estará disponível em `http://localhost:3000/api/v1`  
Documentação Swagger em `http://localhost:3000/docs`

### Credenciais padrão (seed)

- **Email:** admin@serper.local
- **Senha:** Admin@123

## Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/search` | Pesquisa web |
| POST | `/images` | Pesquisa de imagens |
| POST | `/news` | Pesquisa de notícias |
| POST | `/shopping` | Shopping |
| POST | `/videos` | Vídeos |
| POST | `/maps` | Mapas |
| POST | `/places` | Locais |
| POST | `/autocomplete` | Autocomplete |
| POST | `/related-searches` | Pesquisas relacionadas |
| POST | `/knowledge-graph` | Knowledge Graph |
| POST | `/reverse-image` | Busca reversa de imagem |
| POST | `/batch` | Busca em lote |
| GET | `/credits` | Créditos disponíveis |
| GET | `/usage` | Histórico de uso |
| GET | `/health` | Health check |
| GET | `/status` | Status da plataforma |

## Autenticação

### JWT Bearer Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@serper.local","password":"Admin@123"}'
```

### API Key

```bash
curl -X POST http://localhost:3000/api/v1/search \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_your_api_key" \
  -d '{"q":"nestjs tutorial","gl":"br","hl":"pt"}'
```

## Exemplo de Busca

```bash
curl -X POST http://localhost:3000/api/v1/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "q": "inteligência artificial brasil",
    "gl": "br",
    "hl": "pt",
    "num": 10
  }'
```

## Arquitetura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Cliente   │────▶│   Nginx     │────▶│  NestJS API │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
              ┌─────▼─────┐           ┌──────▼──────┐           ┌──────▼──────┐
              │   Redis   │           │  PostgreSQL │           │  Playwright │
              │ Cache/Queue│           │   Prisma    │           │  Browser    │
              └───────────┘           └─────────────┘           └─────────────┘
```

### Módulos

- **search** — Orquestração de buscas e endpoints REST
- **parser** — Parsers modulares (Google, News, Images, Videos, Shopping, Maps)
- **cache** — Cache inteligente Redis com TTL por query/idioma/país/dispositivo
- **proxy** — Proxy Manager com rotação, health check, geo targeting, failover
- **browser** — Pool de browsers headless com anti-bot
- **ai** — Normalização, deduplicação, classificação de relevância
- **auth** — JWT + API Keys + RBAC
- **billing** — Planos, Stripe, webhooks, créditos
- **dashboard** — Métricas administrativas
- **queue** — BullMQ para processamento assíncrono/batch

## Planos

| Plano | Créditos/mês | Rate Limit | API Keys |
|-------|-------------|------------|----------|
| Free | 2.500 | 10/min | 1 |
| Starter | 50.000 | 60/min | 3 |
| Pro | 250.000 | 300/min | 10 |
| Enterprise | 2.000.000 | 1000/min | 50 |

## Monitoramento

- **Prometheus:** `http://localhost:9090`
- **Grafana:** `http://localhost:3001` (admin/admin)
- **Métricas API:** `GET /api/v1/metrics`

## Deploy

### Docker Compose (produção)

```bash
cp .env.production.example .env
# Edite .env com senhas fortes

docker compose down
docker compose up -d --build

# Com monitoramento (Prometheus + Grafana)
docker compose --profile monitoring up -d
```

**Importante:** Postgres e Redis **não expõem portas** no host — evita conflito com Redis/PostgreSQL já instalados na VPS. A API se conecta pela rede interna Docker.

Se a porta 80 estiver ocupada, defina no `.env`:
```
HTTP_PORT=8080
```

### Primeiro deploy na VPS

```bash
git pull
docker compose down
docker compose up -d --build
docker compose logs -f api
```

As migrations rodam automaticamente no startup do container.

### Kubernetes

```bash
kubectl apply -f k8s/
```

## Testes

```bash
npm run test          # Unitários
npm run test:e2e      # End-to-end
npm run test:cov      # Cobertura
```

## Segurança

- Rate limiting por IP e API Key
- RBAC (USER, ADMIN, SUPER_ADMIN)
- API Keys com hash bcrypt
- Auditoria de ações (LGPD-ready)
- Helmet + CORS + validação de input

## Licença

MIT
# scarpingapi
