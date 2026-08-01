export interface NoviqClientOptions {
  apiKey: string;
  baseUrl?: string;
}

export class NoviqClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(options: NoviqClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl || 'https://api.noviqsearch.online/api/v1').replace(/\/$/, '');
  }

  private async request<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`Noviq API ${res.status}: ${(await res.text()).slice(0, 400)}`);
    }
    return res.json() as Promise<T>;
  }

  search(q: string, opts: Record<string, unknown> = {}) {
    return this.request('/search', { q, gl: 'br', hl: 'pt', ...opts });
  }

  news(q: string, opts: Record<string, unknown> = {}) {
    return this.request('/news', { q, gl: 'br', hl: 'pt', ...opts });
  }

  images(q: string, opts: Record<string, unknown> = {}) {
    return this.request('/images', { q, gl: 'br', hl: 'pt', ...opts });
  }

  maps(q: string, opts: Record<string, unknown> = {}) {
    return this.request('/maps', { q, gl: 'br', ...opts });
  }

  research(query: string, opts: Record<string, unknown> = {}) {
    return this.request('/research', { query, gl: 'br', hl: 'pt', ...opts });
  }

  deepResearch(query: string, opts: Record<string, unknown> = {}) {
    return this.request('/deep-research', { query, gl: 'br', hl: 'pt', ...opts });
  }

  agent(goal: string, opts: Record<string, unknown> = {}) {
    return this.request('/agent', { goal, gl: 'br', hl: 'pt', ...opts });
  }

  crawl(url: string, opts: Record<string, unknown> = {}) {
    return this.request('/crawl', { url, ...opts });
  }

  extract(url: string, opts: Record<string, unknown> = {}) {
    return this.request('/extract', { url, ...opts });
  }

  prepare(url: string, opts: Record<string, unknown> = {}) {
    return this.request('/prepare', { url, includeChunks: true, ...opts });
  }

  embeddings(input: string | string[]) {
    return this.request('/embeddings', { input: Array.isArray(input) ? input : [input] });
  }

  memoryStore(key: string, context: Record<string, unknown>) {
    return this.request('/memory', { key, context });
  }

  memoryQuery(key: string) {
    return this.request('/memory/query', { key });
  }

  capabilities() {
    return this.request('/capabilities');
  }
}

export default NoviqClient;
