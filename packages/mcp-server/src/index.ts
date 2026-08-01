#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const BASE_URL = (process.env.NOVIQ_BASE_URL || 'https://api.noviqsearch.online/api/v1').replace(
  /\/$/,
  '',
);
const API_KEY = process.env.NOVIQ_API_KEY || process.env.NOVIQSEARCH_API_KEY || '';

async function noviq<T>(path: string, body?: unknown): Promise<T> {
  if (!API_KEY) {
    throw new Error('Defina NOVIQ_API_KEY no ambiente do servidor MCP');
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Noviq API ${res.status}: ${text.slice(0, 400)}`);
  }
  return res.json() as Promise<T>;
}

const server = new McpServer({
  name: 'noviqsearch',
  version: '1.0.0',
});

server.tool(
  'search',
  'Busca web estruturada (SERP) via NoviqSearch',
  {
    q: z.string().describe('Consulta de busca'),
    gl: z.string().optional().describe('País (ex: br)'),
    hl: z.string().optional().describe('Idioma (ex: pt)'),
    num: z.number().int().min(1).max(20).optional(),
  },
  async ({ q, gl, hl, num }) => {
    const data = await noviq('/search', { q, gl: gl ?? 'br', hl: hl ?? 'pt', num: num ?? 10 });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

server.tool(
  'news',
  'Busca notícias recentes',
  {
    q: z.string(),
    gl: z.string().optional(),
    hl: z.string().optional(),
  },
  async ({ q, gl, hl }) => {
    const data = await noviq('/news', { q, gl: gl ?? 'br', hl: hl ?? 'pt' });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

server.tool(
  'maps',
  'Busca locais e mapas',
  {
    q: z.string(),
    gl: z.string().optional(),
  },
  async ({ q, gl }) => {
    const data = await noviq('/maps', { q, gl: gl ?? 'br' });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

server.tool(
  'research',
  'Pesquisa com síntese, fontes e conclusões',
  {
    query: z.string(),
    numSources: z.number().int().optional(),
  },
  async ({ query, numSources }) => {
    const data = await noviq('/research', { query, numSources: numSources ?? 10, gl: 'br', hl: 'pt' });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

server.tool(
  'deep_research',
  'Pesquisa profunda multi-etapas com citações',
  {
    query: z.string(),
    steps: z.number().int().min(1).max(10).optional(),
  },
  async ({ query, steps }) => {
    const data = await noviq('/deep-research', { query, steps: steps ?? 3, gl: 'br', hl: 'pt' });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

server.tool(
  'agent',
  'Agente que orquestra busca e síntese a partir de um goal',
  {
    goal: z.string(),
    maxSteps: z.number().int().min(1).max(5).optional(),
  },
  async ({ goal, maxSteps }) => {
    const data = await noviq('/agent', { goal, maxSteps: maxSteps ?? 3, gl: 'br', hl: 'pt' });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

server.tool(
  'extract',
  'Extrai conteúdo limpo de uma URL',
  { url: z.string().url() },
  async ({ url }) => {
    const data = await noviq('/extract', { url });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

server.tool(
  'prepare',
  'Transforma URL em Markdown/chunks prontos para RAG',
  { url: z.string().url() },
  async ({ url }) => {
    const data = await noviq('/prepare', { url, includeChunks: true });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
