# NoviqSearch — Visão e Roadmap

## Posicionamento

**Antes:** API Google Search / SERP API  
**Agora:** Infraestrutura de recuperação de conhecimento para IA

Promessa: *a plataforma brasileira para conectar agentes de IA ao mundo.*

Documentação detalhada:
- [product-vision.md](./product-vision.md) — 23 Imperiums completos
- [api-modules.md](./api-modules.md) — taxonomia de endpoints
- [roadmap-phases.md](./roadmap-phases.md) — fases e monetização

Público: criadores de agentes, automações, chatbots, CRMs inteligentes, SaaS, MCP servers, IDEs, plugins e assistentes corporativos.

## Os 23 Imperiums — status

| # | Imperium | Status | Notas |
|---|----------|--------|-------|
| I | Posicionamento | Feito | Landing, metadata, docs |
| II | Módulos AI Infrastructure | Parcial | Search, Images, News, Videos, Shopping, Maps ativos; Scholar/Patents/Gov roadmap |
| III | Deep Search | Feito (v1) | `POST /deep-research` + síntese LLM opcional |
| IV | Research API | Feito (v1) | `POST /research` com summary, fontes, pessoas, empresas |
| V | Agent API | Feito (v1) | `POST /agent` com goal → plano → síntese |
| VI | Memory | Feito (v1) | `POST /memory` + `/memory/query` |
| VII | Browser API | Feito | `POST /browser/navigate` |
| VIII | Crawl API | Feito | `POST /crawl` |
| IX | Extract API | Feito | `POST /extract` |
| X | AI-Ready Content | Feito (v1) | `POST /prepare` (markdown, chunks, embeddings) |
| XI | Embeddings API | Feito (v1) | `POST /embeddings` (OpenAI ou hash local) |
| XII | Vector Database | Parcial | RAG em Postgres JSON; pgvector roadmap |
| XIII | MCP Server | Feito (v1) | `packages/mcp-server` |
| XIV | SDKs | Parcial | JS em `packages/sdk-js`; Python/Go/etc. próximos |
| XV | Integrações | Roadmap | LangChain, n8n, Zapier, CrewAI… |
| XVI | Dashboard SaaS | Parcial | Keys, usage, billing; heatmaps/analytics avançados a evoluir |
| XVII | Observabilidade | Parcial | Metrics Prometheus; cache hit/miss no response a enriquecer |
| XVIII | Marketplace workflows | Roadmap | Templates de agentes/prompts |
| XIX | Monetização | Feito (v1) | Grátis / Starter 39 / Pro 149 / Business 499 + PAYG |
| XX | Marketplace de APIs | Roadmap | CNPJ, CEP, IBGE, etc. |
| XXI | Enterprise | Roadmap | SSO, IP allowlist, SLA |
| XXII | Crescimento | Contínuo | Docs, snippets, afiliados, hackathons |
| XXIII | Moat | Contínuo | Cache, failover, re-ranking, RAG-friendly |

## Visão de longo prazo

Posicionar a Noviq como a "AWS da recuperação de informação para IA" no mercado lusófono, expandindo depois para clientes internacionais.

## Ativar LLM

```env
AI_ENABLED=true
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

Sem chave, Research/Agent/Embeddings usam fallbacks heurísticos locais.
