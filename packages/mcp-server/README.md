# @noviqsearch/mcp-server

Servidor MCP **oficial** da NoviqSearch — conecta agentes (Cursor, Claude Desktop, Windsurf, etc.) à Web Intelligence Platform **sem escrever código de integração**.

## Status

| Versão | Estado |
|--------|--------|
| v1 (local) | ✅ Implementado — stdio, 8 tools |
| v2 (npm) | 🔜 Phase 2 — publicação `@noviqsearch/mcp-server` |
| Hosted MCP | 🔜 Phase 3 — SSE + OAuth |

## Ferramentas disponíveis (v1)

| Tool | API | Descrição |
|------|-----|-----------|
| `search` | `POST /search` | Busca web SERP estruturada |
| `news` | `POST /news` | Notícias recentes |
| `maps` | `POST /maps` | Mapas e locais |
| `research` | `POST /research` | Pesquisa com síntese e fontes |
| `deep_research` | `POST /deep-research` | Pesquisa profunda multi-etapas |
| `agent` | `POST /agent` | Goal → plano → resultado |
| `extract` | `POST /extract` | Conteúdo limpo de URL |
| `prepare` | `POST /prepare` | Markdown + chunks RAG-ready |

## Roadmap de tools (Phase 2)

- `crawl` — rastreamento recursivo
- `browser` — automação Chromium
- `memory` / `memory_query` — contexto persistente
- `rag_query` — busca semântica
- `scholar` — papers acadêmicos (quando API disponível)

## Instalação local

```bash
cd packages/mcp-server && npm install
```

## Configuração (Cursor / Claude Desktop)

```json
{
  "mcpServers": {
    "noviqsearch": {
      "command": "npx",
      "args": ["-y", "tsx", "packages/mcp-server/src/index.ts"],
      "env": {
        "NOVIQ_API_KEY": "sk_sua_chave",
        "NOVIQ_BASE_URL": "https://api.noviqsearch.online/api/v1"
      }
    }
  }
}
```

## Variáveis de ambiente

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `NOVIQ_API_KEY` | Sim | API key do dashboard |
| `NOVIQ_BASE_URL` | Não | Default: produção NoviqSearch |

## Créditos

Cada tool consome **créditos de inteligência** conforme a operação equivalente na API REST. Ver [docs/billing-pricing.md](../../docs/billing-pricing.md).

## Links

- [Taxonomia de módulos](../../docs/api-modules.md)
- [Integrações](../../docs/integrations.md)
- [Visão de produto](../../docs/product-vision.md)
