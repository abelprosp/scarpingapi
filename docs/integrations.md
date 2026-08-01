# Integrações — NoviqSearch

## MCP (recomendado para agentes)

```bash
cd packages/mcp-server && npm install
```

Config no Cursor / Claude Desktop: ver `packages/mcp-server/README.md`.

Tools: `search`, `news`, `maps`, `research`, `deep_research`, `agent`, `extract`, `prepare`.

## SDK JavaScript / TypeScript

```ts
import { NoviqClient } from '@noviqsearch/sdk';

const noviq = new NoviqClient({ apiKey: process.env.NOVIQ_API_KEY! });

const results = await noviq.search('fornecedores de aço Brasil');
const report = await noviq.agent('Descobrir fornecedores de aço');
```

Pacote: `packages/sdk-js`.

## cURL — Agent API

```bash
curl -X POST "https://api.noviqsearch.online/api/v1/agent" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_..." \
  -d '{"goal":"Descobrir fornecedores de aço no Brasil"}'
```

## Roadmap de plugins

- LangChain / LlamaIndex tools
- CrewAI / AutoGen
- n8n / Zapier / Make
- Open WebUI / Ollama / AnythingLLM
