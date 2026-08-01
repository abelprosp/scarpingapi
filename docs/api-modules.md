# NoviqSearch — Taxonomia de Módulos e Endpoints

Base URL: `{BASE_URL}/api/v1`  
Autenticação: header `X-API-Key` ou `Authorization: Bearer {jwt}`

Este documento mapeia os endpoints atuais para a nova taxonomia de **Web Intelligence Platform**.

---

## 1. Search API — recuperação SERP estruturada

Módulo principal de busca. Resultados JSON prontos para agentes, com cache e failover.

| Endpoint | Método | Vertical | Créditos | Status |
|----------|--------|----------|----------|--------|
| `/search` | POST | Web | 2 | ✅ Ativo |
| `/images` | POST | Imagens | 3 | ✅ Ativo |
| `/news` | POST | Notícias | 3 | ✅ Ativo |
| `/videos` | POST | Vídeos | 3 | ✅ Ativo |
| `/shopping` | POST | Shopping | 4 | ✅ Ativo |
| `/maps` | POST | Mapas | 5 | ✅ Ativo |
| `/places` | POST | Locais / negócios | 5 | ✅ Ativo |
| `/autocomplete` | POST | Autocomplete | 1 | ✅ Ativo |
| `/related-searches` | POST | Pesquisas relacionadas | 2 | ✅ Ativo |
| `/knowledge-graph` | POST | Knowledge Graph | 3 | ✅ Ativo |
| `/reverse-image` | POST | Busca reversa | 4 | ✅ Ativo |
| `/batch` | POST | Lote multi-query | por query | ✅ Ativo |
| `/scholar` | POST | Acadêmico | — | 🔜 Roadmap |
| `/patents` | POST | Patentes | — | 🔜 Roadmap |
| `/jobs` | POST | Vagas | — | 🔜 Roadmap |
| `/finance` | POST | Finanças | — | 🔜 Roadmap |

**Utilitários Search**

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/credits` | GET | Saldo de créditos |
| `/usage` | GET | Histórico de consumo |

**Código:** `src/modules/search/search.controller.ts`  
**Parsers:** `src/modules/parser/parsers/`

---

## 2. Deep Search / Research API — inteligência sobre busca

Camada cognitiva: não retorna só links — sintetiza, cita e estrutura conhecimento.

| Endpoint | Método | Módulo | Créditos | Status |
|----------|--------|--------|----------|--------|
| `/research` | POST | Research | 25 | ✅ Ativo |
| `/deep-research` | POST | Deep Research | 60 | ✅ Ativo |
| `/ai-search` | POST | AI Search (re-rank) | 15 | ✅ Ativo |
| `/agent` | POST | Agent (goal → resultado) | 15 | ✅ Ativo |

**Resposta típica:** `summary`, `sources[]`, `keyFindings`, `companies`, `conclusions`, `sessionId`

**Código:** `src/modules/advanced/advanced.controller.ts`  
**LLM:** `src/modules/ai/ai.service.ts` (requer `AI_ENABLED=true`)

---

## 3. Browser API — automação web para agentes

| Endpoint | Método | Descrição | Créditos | Status |
|----------|--------|-----------|----------|--------|
| `/browser/navigate` | POST | Navegar, clicar, esperar, capturar | 10 | ✅ Ativo |

**Stack:** Playwright Chromium  
**Código:** `src/modules/browser/browser.service.ts`

---

## 4. Crawl API — rastreamento recursivo

| Endpoint | Método | Descrição | Créditos | Status |
|----------|--------|-----------|----------|--------|
| `/crawl` | POST | Crawl recursivo por profundidade | 15 | ✅ Ativo |

**Parâmetros:** `url`, `maxDepth`, `maxPages`, `sameDomain`

---

## 5. Extract API — conteúdo limpo de URLs

| Endpoint | Método | Descrição | Créditos | Status |
|----------|--------|-----------|----------|--------|
| `/extract` | POST | HTML → texto/markdown | 5 | ✅ Ativo |
| `/screenshot` | POST | Captura de tela | 8 | ✅ Ativo |
| `/pdf` | POST | Gerar ou extrair PDF | 8 | ✅ Ativo |

---

## 6. RAG / AI-ready content — pronto para vector stores

| Endpoint | Método | Descrição | Créditos | Status |
|----------|--------|-----------|----------|--------|
| `/prepare` | POST | Markdown + chunks + metadata | 5 | ✅ Ativo |
| `/embeddings` | POST | Vetores (OpenAI ou local) | 5 | ✅ Ativo |
| `/rag/index` | POST | Indexar documento | 15 | ✅ Ativo |
| `/rag/query` | POST | Busca semântica | 8 | ✅ Ativo |
| `/dataset/create` | POST | Criar dataset | — | ✅ Ativo |
| `/dataset/:name/ingest` | POST | Ingerir registros | — | ✅ Ativo |
| `/dataset/query` | POST | Consultar dataset | 5 | ✅ Ativo |
| `/memory` | POST | Armazenar contexto KV | 2 | ✅ Ativo |
| `/memory/query` | POST | Recuperar contexto | 2 | ✅ Ativo |

**Roadmap RAG:** pgvector, hybrid search, namespaces por projeto.

---

## 7. MCP Server — integração zero-code para agentes

Não é endpoint HTTP — é servidor MCP stdio que chama a API.

| Tool MCP | API equivalente | Status |
|----------|-----------------|--------|
| `search` | `POST /search` | ✅ v1 |
| `news` | `POST /news` | ✅ v1 |
| `maps` | `POST /maps` | ✅ v1 |
| `research` | `POST /research` | ✅ v1 |
| `deep_research` | `POST /deep-research` | ✅ v1 |
| `agent` | `POST /agent` | ✅ v1 |
| `extract` | `POST /extract` | ✅ v1 |
| `prepare` | `POST /prepare` | ✅ v1 |
| `crawl` | `POST /crawl` | 🔜 Phase 2 |
| `browser` | `POST /browser/navigate` | 🔜 Phase 2 |
| `memory` | `POST /memory` | 🔜 Phase 2 |
| `rag_query` | `POST /rag/query` | 🔜 Phase 2 |
| `scholar` | `POST /scholar` | 🔜 Phase 3 |

**Pacote:** `packages/mcp-server/`  
**Docs:** `packages/mcp-server/README.md`

---

## 8. Billing & conta

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/billing/plans` | GET | Listar planos |
| `/billing/profile` | GET | Saldo, plano, uso |
| `/billing/pay-as-you-go` | PATCH | Ativar PAYG |
| `/billing/pix/subscribe` | POST | PIX assinatura |
| `/billing/pix/buy-credits` | POST | PIX pacote avulso |
| `/billing/pix/overage` | POST | PIX overage |

Ver `docs/billing-pricing.md` e `docs/roadmap-phases.md`.

---

## 9. Catálogo dinâmico

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/capabilities` | GET | Lista APIs avançadas disponíveis |

---

## 10. Coming soon — verticals e infra

| Módulo | Descrição | Fase |
|--------|-----------|------|
| **Scholar API** | Papers acadêmicos | Phase 2 |
| **Government API** | dados.gov.br, portais BR | Phase 2–3 |
| **CNPJ / CEP / IBGE** | Marketplace APIs BR | Phase 3 |
| **Embeddings managed** | Cache + modelos BR | Phase 2 |
| **Memory semântica** | Busca por embedding em memória | Phase 2 |
| **Hosted MCP** | SSE + OAuth | Phase 3 |
| **SDK Python** | `pip install noviqsearch` | Phase 2 |
| **LangChain tools** | `@noviqsearch/langchain` | Phase 2 |

---

## Mapa visual

```
Search API ──────────────┬── web, images, news, videos, shopping, maps, places
                         └── autocomplete, related, knowledge-graph, batch

Deep Intelligence ───────┬── research, deep-research, ai-search, agent

Web Automation ──────────┬── crawl, extract, screenshot, pdf, browser

RAG / AI-ready ──────────┬── prepare, embeddings, rag/*, dataset/*, memory

Integrações ─────────────┬── MCP Server (v1)
                         └── SDK JS (parcial) · LangChain (roadmap)
```

---

## Exemplo rápido

```bash
# Search
curl -X POST "$BASE/search" \
  -H "X-API-Key: sk_..." \
  -H "Content-Type: application/json" \
  -d '{"q":"agentes de IA Brasil","gl":"br","hl":"pt"}'

# Research
curl -X POST "$BASE/research" \
  -H "X-API-Key: sk_..." \
  -d '{"query":"mercado imobiliário 2026","gl":"br","numSources":8}'

# RAG query
curl -X POST "$BASE/rag/query" \
  -H "X-API-Key: sk_..." \
  -d '{"query":"política de preços","topK":5}'
```
