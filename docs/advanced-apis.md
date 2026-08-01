# APIs Avançadas — NoviqSearch (Web Intelligence Platform)

Base URL: `{BASE_URL}/api/v1`  
Autenticação: `X-API-Key` ou `Authorization: Bearer {token}`  
Método: **POST** (exceto `/capabilities`)

## Custos em créditos

| API | Créditos |
|-----|----------|
| Busca web | 2 |
| Autocomplete | 1 |
| Imagens / News / Vídeos | 3 |
| Shopping / Reverse image | 4 |
| Mapas / Locais | 5 |
| Extract / Embeddings / Prepare / Memory / Dataset query | 5 |
| Screenshot / PDF / RAG query | 8 |
| Browser | 10 |
| Crawl / AI Search / Agent / RAG Index | 15 |
| Research | 25 |
| Deep Research | 60 |

**Cadastro:** 500 créditos grátis · **Starter R$ 39** · **Pro R$ 149** · **Business R$ 499** · **Avulso R$ 5/500**

---

## Research API
`POST /research`

```json
{
  "query": "mercado imobiliário lajeado 2026",
  "gl": "br",
  "hl": "pt",
  "numSources": 10
}
```

Retorna: summary, keyFindings, timeline, people, companies, conclusions, sources[], sessionId

---

## Agent API
`POST /agent`

```json
{
  "goal": "Descobrir fornecedores de aço no Brasil",
  "maxSteps": 3,
  "gl": "br",
  "hl": "pt"
}
```

Retorna: plan, findings, summary, companies, conclusions, sources[]

---

## Embeddings API
`POST /embeddings`

```json
{ "input": ["fornecedores de aço", "mercado brasileiro"] }
```

---

## Prepare (AI-Ready Content)
`POST /prepare`

```json
{
  "url": "https://example.com/article",
  "includeChunks": true,
  "includeEmbeddings": false
}
```

Retorna: title, author, summary, markdown, chunks, language, categories

---

## Memory API

**Store:** `POST /memory`
```json
{ "key": "empresa-acme", "context": { "links": ["https://acme.com"], "notes": "fornecedor" } }
```

**Query:** `POST /memory/query`
```json
{ "key": "empresa-acme" }
```

---

## Crawl API
`POST /crawl`

```json
{
  "url": "https://example.com",
  "maxDepth": 2,
  "maxPages": 50
}
```

---

## Extract API
`POST /extract`

```json
{
  "url": "https://example.com/article",
  "includeLinks": true,
  "includeMetadata": true
}
```

---

## Screenshot API
`POST /screenshot`

```json
{
  "url": "https://example.com",
  "fullPage": false
}
```

Retorna: `base64` (PNG)

---

## PDF API
`POST /pdf`

```json
{
  "url": "https://example.com/report",
  "generateFromHtml": true
}
```

---

## AI Search API
`POST /ai-search`

```json
{
  "q": "melhor CRM para startups",
  "gl": "br",
  "hl": "pt",
  "instructions": "priorizar soluções brasileiras"
}
```

---

## Deep Research API
`POST /deep-research`

Pesquisa multi-etapas com citações.

```json
{
  "query": "impacto da IA no mercado imobiliário",
  "steps": 3,
  "gl": "br",
  "hl": "pt"
}
```

Retorna: steps[], conclusion, citations[], citationCount

---

## Dataset API

**Criar:** `POST /dataset/create`
```json
{ "name": "imoveis-lajeado", "description": "Base de imóveis", "isPublic": false }
```

**Ingerir:** `POST /dataset/{name}/ingest`
```json
{
  "records": [
    { "bairro": "Igrejinha", "quartos": 2, "preco": 320000, "area_m2": 54 }
  ]
}
```

**Consultar:** `POST /dataset/query`
```json
{
  "dataset": "imoveis-lajeado",
  "filter": { "bairro": "Igrejinha", "quartos": 2 },
  "limit": 50
}
```

---

## RAG API

**Indexar:** `POST /rag/index`
```json
{
  "collection": "docs-produto",
  "content": "Texto longo do documento...",
  "metadata": { "source": "manual.pdf" }
}
```

**Buscar:** `POST /rag/query`
```json
{
  "collection": "docs-produto",
  "query": "Como autenticar na API?",
  "topK": 5
}
```

---

## Browser API
`POST /browser/navigate`

```json
{
  "url": "https://example.com/login",
  "actions": [
    { "type": "fill", "selector": "#email", "value": "user@test.com" },
    { "type": "fill", "selector": "#password", "value": "secret" },
    { "type": "click", "selector": "button[type=submit]" },
    { "type": "wait", "wait": 2000 }
  ]
}
```

---

## Listar capabilities
`GET /capabilities`

---

## Deploy na VPS

Após `git pull`, rode a migration:

```bash
docker compose exec api npx prisma migrate deploy
docker compose up -d --build
```
