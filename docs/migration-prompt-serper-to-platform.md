# Prompt: Migrar software de Serper.dev para Serper Platform API

Use este prompt completo em um agente de IA (Cursor, Copilot, etc.) ou entregue a um desenvolvedor para refatorar qualquer codebase que hoje consome a **Serper.dev** e passar a consumir a **Serper Platform API** self-hosted.

---

## PROMPT (copie a partir da linha abaixo)

```
Você é um engenheiro de software sênior especializado em refatoração de integrações de API.

Sua tarefa é migrar TODO o código que consome a API da Serper.dev (https://google.serper.dev) para a nova API self-hosted **Serper Platform**, mantendo o comportamento funcional do software, com o mínimo de breaking changes no restante da aplicação.

---

## API de destino (nova)

- **Base URL:** `http://72.61.58.208:8080/api/v1` (configurável via env `SERPER_PLATFORM_BASE_URL`)
- **Documentação Swagger:** `{BASE_URL}/../docs` → `http://72.61.58.208:8080/docs`
- **Health check:** `GET {BASE_URL}/health`
- **Autenticação (escolher UMA):**
  - **API Key (recomendado para produção):** header `X-API-Key: sk_...`
  - **JWT:** header `Authorization: Bearer {accessToken}` (obtido via `POST /auth/login`)
- **Método HTTP:** TODOS os endpoints de busca são **POST** (nunca GET)
- **Content-Type:** `application/json`

---

## API de origem (Serper.dev — substituir)

- Base URL: `https://google.serper.dev`
- Auth: header `X-API-KEY: {key}` (note o hífen e KEY em maiúsculas)
- Endpoints: POST `/search`, `/images`, `/news`, `/videos`, `/places`, `/maps`, `/shopping`, `/autocomplete`, etc.

---

## Mapeamento de endpoints

| Serper.dev (antigo) | Serper Platform (novo) | Método |
|---------------------|------------------------|--------|
| `POST https://google.serper.dev/search` | `POST {BASE_URL}/search` | POST |
| `POST .../images` | `POST {BASE_URL}/images` | POST |
| `POST .../news` | `POST {BASE_URL}/news` | POST |
| `POST .../videos` | `POST {BASE_URL}/videos` | POST |
| `POST .../places` | `POST {BASE_URL}/places` | POST |
| `POST .../maps` | `POST {BASE_URL}/maps` | POST |
| `POST .../shopping` | `POST {BASE_URL}/shopping` | POST |
| `POST .../autocomplete` | `POST {BASE_URL}/autocomplete` | POST |
| *(não existe na Serper)* | `POST {BASE_URL}/related-searches` | POST |
| *(não existe na Serper)* | `POST {BASE_URL}/knowledge-graph` | POST |
| *(não existe na Serper)* | `POST {BASE_URL}/reverse-image` | POST |
| *(não existe na Serper)* | `POST {BASE_URL}/batch` | POST |
| *(credits via dashboard)* | `GET {BASE_URL}/credits` | GET |
| *(usage via dashboard)* | `GET {BASE_URL}/usage` | GET |

---

## Mapeamento do body da requisição (request)

Campos **compatíveis** (manter iguais):

| Campo Serper | Campo nova API | Observação |
|--------------|----------------|------------|
| `q` | `q` | Obrigatório |
| `gl` | `gl` | País (ex: `br`) |
| `hl` | `hl` | Idioma (ex: `pt`) |
| `num` | `num` | Qtd. resultados (1–100) |
| `page` | `page` | Paginação |
| `tbs` | `tbs` | Filtro temporal (news) |
| `location` | — | Não implementado; ignorar ou mapear para `gl` |

Campos **novos** (opcionais):

| Campo | Descrição |
|-------|-----------|
| `device` | `desktop` \| `mobile` \| `tablet` |
| `engine` | Motor de busca (default: `google`) |
| `noCache` | `true` para forçar busca fresh |

---

## Mapeamento da resposta (response) — CRÍTICO

Crie uma camada **adapter/normalizer** que converta a resposta da nova API para o formato que o software já espera da Serper, OU atualize todos os consumidores.

### Web Search — resultados orgânicos

| Serper.dev | Serper Platform | Ação no adapter |
|------------|-----------------|-----------------|
| `organic[].link` | `organic[].url` | Renomear `url` → `link` |
| `organic[].snippet` | `organic[].description` | Renomear `description` → `snippet` |
| `organic[].position` | `organic[].position` | Igual |
| `organic[].title` | `organic[].title` | Igual |
| `organic[].date` | `organic[].date` | Igual |
| `organic[].sitelinks` | `organic[].sitelinks` | Igual |
| — | `organic[].domain` | Campo extra (ignorar ou usar) |
| — | `organic[].favicon` | Campo extra (ignorar ou usar) |

### Metadados extras na nova API (ignorar ou expor)

```json
{
  "searchParameters": { "q", "gl", "hl", "type", "engine", "page", "num" },
  "credits": 1,
  "cached": false,
  "responseTime": 1234
}
```

### News

| Serper | Nova API |
|--------|----------|
| `news[].link` | `news[].url` |
| `news[].snippet` | `news[].snippet` |
| `news[].source` | `news[].source` |
| `news[].date` | `news[].date` |
| `news[].imageUrl` | `news[].thumbnail` |

### Images

| Serper | Nova API |
|--------|----------|
| `images[].imageUrl` | `images[].imageUrl` |
| `images[].thumbnailUrl` | `images[].thumbnailUrl` |
| `images[].link` | `images[].originalUrl` |
| `images[].title` | `images[].title` |

### Knowledge Graph

| Serper | Nova API |
|--------|----------|
| `knowledgeGraph.title` | `knowledgeGraph.title` |
| `knowledgeGraph.description` | `knowledgeGraph.description` |
| `knowledgeGraph.imageUrl` | `knowledgeGraph.image` |
| `knowledgeGraph.website` | `knowledgeGraph.website` |
| `knowledgeGraph.attributes` | `knowledgeGraph.attributes` |

### Related Searches

| Serper | Nova API |
|--------|----------|
| `relatedSearches[].query` | `relatedSearches[]` (array de strings) |

**Adapter:** transformar `string[]` em `{ query: string }[]` se o código legado esperar objetos.

### People Also Ask / Answer Box

A nova API **não retorna** `peopleAlsoAsk` nem `answerBox` no momento. No adapter:
- Retornar arrays vazios `[]` ou `null`
- Logar warning para futura implementação
- Não quebrar o fluxo downstream

---

## Variáveis de ambiente — migração

Substituir no `.env`, secrets e CI/CD:

```bash
# ANTES (Serper.dev)
SERPER_API_KEY=abc123...
# ou
SERPER_API_URL=https://google.serper.dev

# DEPOIS (Serper Platform)
SERPER_PLATFORM_BASE_URL=http://72.61.58.208:8080/api/v1
SERPER_PLATFORM_API_KEY=sk_sua_chave_aqui
# OU
SERPER_PLATFORM_EMAIL=user@email.com
SERPER_PLATFORM_PASSWORD=senha
```

---

## Implementação recomendada: Client + Adapter

### 1. Interface única (não acoplar ao provider)

```typescript
interface SearchProvider {
  webSearch(params: WebSearchParams): Promise<SerperCompatibleResponse>;
  imageSearch(params: ImageSearchParams): Promise<SerperCompatibleResponse>;
  newsSearch(params: NewsSearchParams): Promise<SerperCompatibleResponse>;
  // ...
}
```

### 2. Implementação nova (Serper Platform)

```typescript
class SerperPlatformClient implements SearchProvider {
  constructor(
    private baseUrl: string,
    private apiKey: string,
  ) {}

  async webSearch(params: WebSearchParams) {
    const res = await fetch(`${this.baseUrl}/search`, {
      method: 'POST', // OBRIGATÓRIO: POST, nunca GET
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({
        q: params.q,
        gl: params.gl ?? 'br',
        hl: params.hl ?? 'pt',
        num: params.num ?? 10,
        page: params.page ?? 1,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new SearchApiError(res.status, err);
    }

    const data = await res.json();
    return this.normalizeToSerperFormat(data);
  }

  private normalizeToSerperFormat(data: PlatformResponse): SerperCompatibleResponse {
    return {
      searchParameters: data.searchParameters,
      organic: (data.organic ?? []).map((item) => ({
        title: item.title,
        link: item.url,           // url → link
        snippet: item.description, // description → snippet
        position: item.position,
        date: item.date,
        sitelinks: item.sitelinks,
      })),
      knowledgeGraph: data.knowledgeGraph ? {
        title: data.knowledgeGraph.title,
        description: data.knowledgeGraph.description,
        imageUrl: data.knowledgeGraph.image,
        website: data.knowledgeGraph.website,
        attributes: data.knowledgeGraph.attributes,
      } : undefined,
      relatedSearches: (data.relatedSearches ?? []).map((q) => ({ query: q })),
      peopleAlsoAsk: [],  // não disponível ainda
      answerBox: null,    // não disponível ainda
      credits: data.credits,
      cached: data.cached,
    };
  }
}
```

### 3. Factory com feature flag (deploy seguro)

```typescript
function createSearchClient(): SearchProvider {
  const provider = process.env.SEARCH_PROVIDER ?? 'platform';

  if (provider === 'serper') {
    return new SerperDevClient(process.env.SERPER_API_KEY!);
  }
  return new SerperPlatformClient(
    process.env.SERPER_PLATFORM_BASE_URL!,
    process.env.SERPER_PLATFORM_API_KEY!,
  );
}
```

---

## Tratamento de erros — diferenças

| HTTP | Serper.dev | Serper Platform |
|------|------------|-----------------|
| 401 | API key inválida | Token/API Key inválida ou ausente |
| 403 | Créditos esgotados | `Créditos insuficientes` |
| 400 | Query inválida | Falha na busca / CAPTCHA / validação |
| 404 | — | Endpoint errado (ex: GET em vez de POST) |
| 429 | Rate limit | Throttler NestJS |

Padronize erros internos:

```typescript
class SearchApiError extends Error {
  constructor(public status: number, public body: unknown) {
    super(`Search API error ${status}`);
  }
}
```

---

## Checklist de migração (executar na ordem)

1. [ ] Buscar no codebase: `serper.dev`, `google.serper`, `SERPER_API`, `X-API-KEY`
2. [ ] Criar `SerperPlatformClient` com adapter de resposta
3. [ ] Adicionar env vars `SERPER_PLATFORM_BASE_URL` e `SERPER_PLATFORM_API_KEY`
4. [ ] Gerar API Key: `POST /api-keys` (autenticado) ou usar JWT em dev
5. [ ] Substituir URL base em todos os HTTP clients
6. [ ] Garantir **POST** em todos os endpoints de busca
7. [ ] Trocar header `X-API-KEY` → `X-API-Key` (case pode importar em proxies)
8. [ ] Implementar normalizer `url→link`, `description→snippet`
9. [ ] Tratar `peopleAlsoAsk` / `answerBox` como opcionais vazios
10. [ ] Adicionar retry com backoff para 400 (CAPTCHA ocasional)
11. [ ] Monitorar créditos via `GET /credits`
12. [ ] Testes: comparar output do adapter com fixture antiga da Serper
13. [ ] Remover código morto da Serper.dev após validação em staging
14. [ ] Atualizar documentação interna e secrets do CI/CD

---

## Testes de validação pós-migração

```bash
# Health
curl -s {BASE_URL}/health

# Login (se usar JWT)
curl -s -X POST {BASE_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"...","password":"..."}'

# Search (API Key)
curl -s -X POST {BASE_URL}/search \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_..." \
  -d '{"q":"teste","gl":"br","hl":"pt","num":3}'

# Credits
curl -s {BASE_URL}/credits -H "X-API-Key: sk_..."
```

---

## Regras para o agente de IA

1. **Não altere lógica de negócio** além do necessário para a troca de provider
2. **Prefira adapter pattern** em vez de editar dezenas de call sites
3. **Preserve interfaces públicas** exportadas pelo módulo de busca
4. **Todo endpoint de busca = POST + JSON body**
5. **Nunca commite API keys** — use env vars
6. **Mantenha feature flag** `SEARCH_PROVIDER=serper|platform` até validação completa
7. **Documente breaking changes** no CHANGELOG
8. **Arquivos típicos a inspecionar:** `*serper*`, `*search*client*`, `.env*`, `docker-compose*`, workflows CI, SDK wrappers, prompts de LLM que mencionem Serper

---

## Exemplo de diff mínimo (Python)

```python
# ANTES
import requests

def search(q: str) -> dict:
    return requests.post(
        "https://google.serper.dev/search",
        headers={"X-API-KEY": os.environ["SERPER_API_KEY"]},
        json={"q": q, "gl": "br", "hl": "pt"},
    ).json()

# DEPOIS
def search(q: str) -> dict:
    data = requests.post(
        f'{os.environ["SERPER_PLATFORM_BASE_URL"]}/search',
        headers={"X-API-Key": os.environ["SERPER_PLATFORM_API_KEY"]},
        json={"q": q, "gl": "br", "hl": "pt"},
    ).json()
    return normalize_to_serper_format(data)
```

---

## Exemplo de diff mínimo (Node.js / fetch)

```javascript
// ANTES
const res = await fetch('https://google.serper.dev/search', {
  method: 'POST',
  headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
  body: JSON.stringify({ q, gl: 'br', hl: 'pt' }),
});

// DEPOIS
const res = await fetch(`${baseUrl}/search`, {
  method: 'POST',
  headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
  body: JSON.stringify({ q, gl: 'br', hl: 'pt' }),
});
```

Execute a migração de forma incremental, com testes automatizados comparando a estrutura normalizada da resposta antes e depois.
```

---

## Como usar este prompt

1. Abra o Cursor no projeto que usa Serper.dev
2. Cole o conteúdo entre as crases do prompt acima
3. Adicione: *"Analise meu codebase e aplique a migração seguindo este guia"*
4. Revise o PR gerado, especialmente o adapter de resposta e as env vars

## Arquivos relacionados neste repositório

- Swagger: `http://72.61.58.208:8080/docs`
- Coleção Postman: `docs/postman-collection.json`
- Exemplos curl: `README.md`
