# NoviqSearch

**Infraestrutura de recuperação de conhecimento para IA** — a plataforma brasileira para conectar agentes de IA ao mundo.

Web Intelligence Platform para agentes, automações, chatbots, MCP, LangChain e SaaS builders: Search, Deep Research, Crawl, Browser, Embeddings, RAG e MCP Server.

> Visão completa: [docs/product-vision.md](docs/product-vision.md) · Módulos: [docs/api-modules.md](docs/api-modules.md) · Fases: [docs/roadmap-phases.md](docs/roadmap-phases.md)

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Backend | NestJS, TypeScript, Fastify |
| Banco | PostgreSQL, Prisma ORM |
| Cache/Fila | Redis, BullMQ |
| Browser | Playwright, Puppeteer |
| Auth | JWT, API Keys |
| Billing | PIX (EFI) |
| Monitoramento | Prometheus, Grafana, Sentry |
| Agentes | MCP Server oficial, SDK JS |
| Infra | Docker, Kubernetes, Nginx |

## Início Rápido

### Pré-requisitos

- Node.js 22+
- Docker & Docker Compose
- PostgreSQL 16+ (ou via Docker)
- Redis 7+ (ou via Docker)

### Instalação

```bash
npm install
cp .env.example .env
docker compose up -d postgres redis
npx prisma migrate dev
npm run prisma:seed
npx playwright install chromium
npm run start:dev
```

API: `http://localhost:3000/api/v1` · Swagger: `http://localhost:3000/docs`

### Credenciais seed

- **Email:** admin@noviqsearch.local
- **Senha:** Admin@123

## Endpoints principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/search` | Busca web |
| POST | `/images` `/news` `/videos` `/shopping` `/maps` | Módulos SERP |
| POST | `/research` | Pesquisa com síntese |
| POST | `/deep-research` | Pesquisa profunda |
| POST | `/agent` | Agente por goal |
| POST | `/crawl` `/extract` `/prepare` | Conteúdo web |
| POST | `/embeddings` | Vetores |
| POST | `/memory` `/memory/query` | Memória de agentes |
| POST | `/rag/*` `/browser/navigate` | RAG e browser |
| GET | `/capabilities` | Catálogo de APIs |

## Autenticação

```bash
curl -X POST http://localhost:3000/api/v1/search \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_your_api_key" \
  -d '{"q":"agentes de IA Brasil","gl":"br","hl":"pt"}'
```

## MCP Server

```bash
cd packages/mcp-server && npm install
NOVIQ_API_KEY=sk_... npm run dev
```

Ver [packages/mcp-server/README.md](packages/mcp-server/README.md) e [docs/integrations.md](docs/integrations.md).

## SDK JavaScript

```bash
cd packages/sdk-js && npm install && npm run build
```

```ts
import { NoviqClient } from '@noviqsearch/sdk';
const noviq = new NoviqClient({ apiKey: 'sk_...' });
await noviq.agent('Descobrir fornecedores de aço');
```

## Planos

| Plano | Preço | Créditos |
|-------|-------|----------|
| Gratuito | R$ 0 | 500 |
| Starter | R$ 39/mês | 12.000 |
| Pro | R$ 149/mês | 50.000 |
| Business | R$ 499/mês | 200.000 |
| Enterprise | Custom | SLA / white-label |
| Avulso | R$ 5 | 500 créditos |

Detalhes: [docs/billing-pricing.md](docs/billing-pricing.md)

## IA (opcional)

```env
AI_ENABLED=true
OPENAI_API_KEY=sk-...
```

Ativa síntese LLM em Research, Deep Research, Agent e embeddings reais.

## Deploy

```bash
cp .env.production.example .env
docker compose up -d --build
```

Domínio: `https://api.noviqsearch.online` — guia em [docs/vps-domain-setup.md](docs/vps-domain-setup.md)

## Documentação

- [Visão & Roadmap](docs/vision-roadmap.md)
- [APIs avançadas](docs/advanced-apis.md)
- [Integrações](docs/integrations.md)
- [Billing](docs/billing-pricing.md)
- [Arquitetura](docs/architecture.md)

## Licença

MIT
