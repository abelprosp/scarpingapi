# NoviqSearch — Visão de Produto

> **De:** API Google Search / SERP API  
> **Para:** Infraestrutura brasileira de recuperação de conhecimento para agentes de IA  
> **Promessa:** *A plataforma brasileira para conectar agentes de IA ao mundo.*

---

## O que é hoje

A NoviqSearch já deixou de ser “só busca”. O backend NestJS expõe uma **Web Intelligence Platform** com dezenas de endpoints, billing PIX (EFI), sistema de créditos, dashboard SaaS, MCP server v1 e SDK JS parcial.

| Camada | Estado atual |
|--------|--------------|
| **Search SERP** | Web, Images, News, Videos, Shopping, Maps, Places, Autocomplete, Related, Knowledge Graph, Reverse Image, Batch |
| **Deep Intelligence** | Research, Deep Research, AI Search, Agent API |
| **Web automation** | Crawl, Extract, Screenshot, PDF, Browser (Playwright) |
| **RAG / AI-ready** | Prepare, Embeddings, RAG index/query, Dataset, Memory |
| **Infra** | Redis cache, BullMQ, failover multi-provedor, Prometheus |
| **Produto** | JWT + API Keys, dashboard, PIX billing, créditos por operação |
| **Integrações** | MCP server (`packages/mcp-server`), SDK JS (`packages/sdk-js`) |

---

## Os 23 Imperiums — mapa completo

Cada Imperium é um pilar estratégico. Status: **Feito** · **Parcial** · **Roadmap**.

### I — Posicionamento de mercado
| | |
|---|---|
| **Estado** | Parcial → Phase 1 em curso |
| **Hoje** | Landing e docs migrando de “API de busca” para “infraestrutura para agentes” |
| **Phase 1** | Landing, README, metadata, mensagem unificada |
| **Phase 2** | Case studies, comparativos vs Serper/Exa/Tavily, página “Para agentes” |
| **Phase 3** | Brand internacional, landing EN, parcerias |
| **Técnico** | Frontend Next.js, SEO, OpenGraph, analytics de conversão |

### II — Módulos AI Infrastructure (Search verticals)
| | |
|---|---|
| **Estado** | Parcial |
| **Hoje** | 12 tipos SERP ativos em `src/modules/search/` |
| **Phase 1** | Taxonomia documentada (`docs/api-modules.md`), grid na landing |
| **Phase 2** | Scholar, Patents, Finance, Jobs, Flights |
| **Phase 3** | Government (dados.gov.br), IBGE, Receita/CNPJ marketplace |
| **Técnico** | Novos parsers, providers, DTOs, custos em `credits.config.ts` |

### III — Deep Search
| | |
|---|---|
| **Estado** | Feito (v1) |
| **Hoje** | `POST /deep-research` — multi-etapas, citações, síntese LLM opcional |
| **Phase 2** | Re-ranking semântico, cache por sessão, streaming SSE |
| **Phase 3** | Deep Search como workflow exportável (JSON plan + steps) |
| **Técnico** | `advanced.service.ts`, OpenAI via `ai.service.ts`, 60 créditos/call |

### IV — Research API
| | |
|---|---|
| **Estado** | Feito (v1) |
| **Hoje** | `POST /research` — summary, fontes, pessoas, empresas, timeline |
| **Phase 2** | Templates por vertical (mercado, concorrentes, due diligence) |
| **Phase 3** | Research assíncrono com webhook |
| **Técnico** | Orquestra search + extract + LLM; 25 créditos/call |

### V — Agent API
| | |
|---|---|
| **Estado** | Feito (v1) |
| **Hoje** | `POST /agent` — goal → plano → busca → síntese |
| **Phase 2** | Steps configuráveis, tools registry, memória entre steps |
| **Phase 3** | Agent runtime com filas dedicadas e observabilidade por sessão |
| **Técnico** | 15 créditos/call; integração MCP `agent` tool |

### VI — Memory API
| | |
|---|---|
| **Estado** | Feito (v1) |
| **Hoje** | `POST /memory`, `POST /memory/query` — KV por key |
| **Phase 2** | TTL, namespaces por projeto, busca semântica em memória |
| **Phase 3** | Memória persistente cross-session com embeddings |
| **Técnico** | Postgres JSON; 2 créditos/store |

### VII — Browser API
| | |
|---|---|
| **Estado** | Feito |
| **Hoje** | `POST /browser/navigate` — Playwright, click, wait, screenshot |
| **Phase 2** | Sessões persistentes, cookies, multi-tab |
| **Phase 3** | Browser pool K8s, stealth profiles, CAPTCHA handoff |
| **Técnico** | `browser.service.ts`; 10 créditos/navegação |

### VIII — Crawl API
| | |
|---|---|
| **Estado** | Feito |
| **Hoje** | `POST /crawl` — recursivo, profundidade configurável |
| **Phase 2** | Sitemap mode, politeness, dedup global |
| **Phase 3** | Crawl schedules + change detection |
| **Técnico** | 15 créditos/crawl base |

### IX — Extract API
| | |
|---|---|
| **Estado** | Feito |
| **Hoje** | `POST /extract` — HTML → texto/markdown estruturado |
| **Phase 2** | Readability++, tabelas, PDF inline |
| **Phase 3** | Extract batch + webhook |
| **Técnico** | Cheerio/Playwright; 5 créditos/URL |

### X — AI-Ready Content (Prepare)
| | |
|---|---|
| **Estado** | Feito (v1) |
| **Hoje** | `POST /prepare` — markdown, chunks, metadata RAG-friendly |
| **Phase 2** | Schema.org, citações inline, language detect |
| **Phase 3** | Pipeline “URL → vector store” one-shot |
| **Técnico** | 5 créditos/call |

### XI — Embeddings API
| | |
|---|---|
| **Estado** | Feito (v1) |
| **Hoje** | `POST /embeddings` — OpenAI ou hash local fallback |
| **Phase 2** | Modelos BR (multilingual), batch, dimensão configurável |
| **Phase 3** | Embeddings cacheados por conteúdo |
| **Técnico** | `embedding.util.ts`; 5 créditos/batch |

### XII — Vector Database / RAG
| | |
|---|---|
| **Estado** | Parcial |
| **Hoje** | `POST /rag/index`, `POST /rag/query` — Postgres JSON + cosine local |
| **Phase 2** | pgvector, namespaces, hybrid search (BM25 + vector) |
| **Phase 3** | RAG managed — index automático pós-crawl |
| **Técnico** | index 15 / query 8 créditos |

### XIII — MCP Server oficial
| | |
|---|---|
| **Estado** | Feito (v1) |
| **Hoje** | `packages/mcp-server` — search, news, maps, research, deep_research, agent, extract, prepare |
| **Phase 1** | README, publicação npm, docs Cursor/Claude |
| **Phase 2** | Tools: crawl, browser, memory, rag_query |
| **Phase 3** | Hosted MCP (SSE), auth OAuth |
| **Técnico** | `@modelcontextprotocol/sdk`, stdio transport |

### XIV — SDKs
| | |
|---|---|
| **Estado** | Parcial |
| **Hoje** | `packages/sdk-js` — search, agent básico |
| **Phase 2** | SDK completo TS, Python (`noviqsearch`), CLI |
| **Phase 3** | Go, Rust; publicação npm/PyPI |
| **Técnico** | Tipos gerados do OpenAPI |

### XV — Integrações (LangChain, n8n, etc.)
| | |
|---|---|
| **Estado** | Roadmap |
| **Hoje** | `docs/integrations.md` stub |
| **Phase 2** | LangChain tools, LlamaIndex, CrewAI |
| **Phase 3** | n8n nodes, Zapier, Make, Dify |
| **Técnico** | Wrappers finos sobre SDK + MCP |

### XVI — Dashboard SaaS
| | |
|---|---|
| **Estado** | Parcial |
| **Hoje** | Keys, usage, billing PIX, perfil |
| **Phase 2** | Heatmaps por endpoint, custo por projeto, alertas |
| **Phase 3** | Multi-tenant, subcontas, RBAC |
| **Técnico** | Next.js dashboard, Prisma, EFI webhooks |

### XVII — Observabilidade
| | |
|---|---|
| **Estado** | Parcial |
| **Hoje** | Prometheus metrics, health checks |
| **Phase 2** | Cache hit/miss no response, tracing OpenTelemetry |
| **Phase 3** | SLA dashboard enterprise, alertas PagerDuty |
| **Técnico** | Grafana, Sentry já wired |

### XVIII — Marketplace de workflows
| | |
|---|---|
| **Estado** | Roadmap |
| **Phase 2** | Templates: “due diligence”, “monitoramento concorrente” |
| **Phase 3** | Community templates + revenue share |
| **Técnico** | JSON workflows + Agent API |

### XIX — Monetização
| | |
|---|---|
| **Estado** | Feito (v1) + evolução documentada |
| **Hoje** | Créditos por operação; PIX EFI; planos em seed |
| **Phase 1** | `docs/roadmap-phases.md` — tiers Starter/Pro/Business |
| **Phase 2** | Migrar billing UI para novos tiers; manter oferta launch |
| **Phase 3** | Stripe internacional, faturamento NF-e |
| **Técnico** | `pix-billing.service.ts`, `credits.config.ts`, Prisma Plan |

### XX — Marketplace de APIs brasileiras
| | |
|---|---|
| **Estado** | Roadmap |
| **Phase 2** | CEP, CNPJ, IBGE wrappers unificados |
| **Phase 3** | API partners revenue share |
| **Técnico** | Gateway + créditos unificados |

### XXI — Enterprise
| | |
|---|---|
| **Estado** | Roadmap |
| **Phase 2** | SSO (SAML/OIDC), IP allowlist |
| **Phase 3** | SLA 99.9%, dedicated infra, white-label |
| **Técnico** | Auth module extension, rate limits por contrato |

### XXII — Crescimento
| | |
|---|---|
| **Estado** | Contínuo |
| **Phase 1** | Docs PT, snippets landing, WhatsApp vendas |
| **Phase 2** | Hackathons agentes, afiliados dev |
| **Phase 3** | Conteúdo EN, conferências AI |
| **Técnico** | Marketing site, blog técnico |

### XXIII — Moat técnico
| | |
|---|---|
| **Estado** | Contínuo |
| **Hoje** | Cache Redis, failover DuckDuckGo/Nominatim, formato RAG |
| **Phase 2** | Re-ranking IA, cache semântico, dedup global |
| **Phase 3** | Proprietary ranking BR, dados locais enriquecidos |
| **Técnico** | `cache.service.ts`, `proxy-manager`, parsers BR |

---

## Prioridades por fase

### Phase 1 — Actionable now (reposicionamento)
- [x] Landing: headline “Infraestrutura de recuperação de conhecimento para IA”
- [x] Docs: `product-vision.md`, `api-modules.md`, `roadmap-phases.md`
- [x] README opening alinhado
- [x] MCP README stub
- [ ] Alinhar `DEFAULT_FREE_CREDITS=2700` em prod (docker-compose já usa; app default 500)

### Phase 2 — Integração agentes (90 dias)
1. **MCP server** — publicar npm, +tools (crawl, memory, rag)
2. **SDK JS/Python** — cobertura completa OpenAPI
3. **LangChain / LlamaIndex** — pacote `@noviqsearch/langchain`
4. **Novos verticals** — Scholar, Government stub
5. **pgvector** — RAG production-grade
6. **Billing tiers** — Starter/Pro/Business no PIX

### Phase 3 — Escala (6–12 meses)
1. Hosted MCP + OAuth
2. Enterprise (SSO, SLA)
3. Marketplace workflows + APIs BR
4. Re-ranking proprietário
5. Expansão lusófona → global

---

## Arquitetura mental

```
Agente (Cursor, LangChain, SaaS)
        │
        ├── MCP Server ──► NoviqSearch API
        ├── SDK JS/Python ──► NoviqSearch API
        └── HTTP direto ──► NoviqSearch API
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              Search SERP    Deep Intelligence   Web/RAG
                    │               │               │
                    └───────────────┴───────────────┘
                                    │
                          Cache · Queue · Browser
                                    │
                              Créditos · PIX · Audit
```

---

## Referências no repositório

| Recurso | Caminho |
|---------|---------|
| Search module | `src/modules/search/` |
| Advanced APIs | `src/modules/advanced/` |
| Browser | `src/modules/browser/` |
| Créditos | `src/config/credits.config.ts` |
| Billing PIX | `src/modules/billing/` |
| MCP | `packages/mcp-server/` |
| SDK | `packages/sdk-js/` |
| Frontend | `frontend/` |
| Status resumido | `docs/vision-roadmap.md` |
| Preços e fases | `docs/roadmap-phases.md` |
