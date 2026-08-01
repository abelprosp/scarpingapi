import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface LlmChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly enabled: boolean;
  private readonly apiKey?: string;
  private readonly model: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('search.aiEnabled', false);
    this.apiKey = this.configService.get<string>('search.openaiApiKey') || process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  }

  get llmAvailable(): boolean {
    return Boolean(this.enabled && this.apiKey);
  }

  async normalizeResults<T extends { title: string; url?: string; description?: string }>(
    results: T[],
  ): Promise<T[]> {
    if (!this.enabled) return results;

    const seen = new Set<string>();
    return results.filter((item) => {
      const key = (item.url || item.title).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return !this.isSpam(item);
    });
  }

  private isSpam(item: { title: string; description?: string }): boolean {
    const spamPatterns = [
      /click here/i,
      /buy now/i,
      /free download/i,
      /casino/i,
      /viagra/i,
    ];
    const text = `${item.title} ${item.description || ''}`;
    return spamPatterns.some((p) => p.test(text));
  }

  async detectLanguage(text: string): Promise<string> {
    const ptPatterns = /\b(de|da|do|para|com|não|uma|em)\b/i;
    const enPatterns = /\b(the|and|for|with|this|that|from)\b/i;

    if (ptPatterns.test(text)) return 'pt';
    if (enPatterns.test(text)) return 'en';
    return 'unknown';
  }

  async summarize(text: string, maxLength = 200): Promise<string> {
    if (this.llmAvailable && text.length > 80) {
      const result = await this.chat([
        {
          role: 'system',
          content: `Resuma de forma objetiva em português, máximo ${maxLength} caracteres. Preserve fatos e nomes.`,
        },
        { role: 'user', content: text.slice(0, 12000) },
      ]);
      if (result) return result.slice(0, maxLength * 2);
    }

    if (!this.enabled || text.length <= maxLength) return text.slice(0, maxLength);
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    return sentences.slice(0, 2).join('. ').slice(0, maxLength);
  }

  async extractEntities(text: string): Promise<string[]> {
    if (this.llmAvailable) {
      const result = await this.chat([
        {
          role: 'system',
          content:
            'Extraia entidades (pessoas, empresas, lugares, tecnologias). Retorne JSON array de strings, sem markdown.',
        },
        { role: 'user', content: text.slice(0, 8000) },
      ]);
      if (result) {
        try {
          const parsed = JSON.parse(result.replace(/```json|```/g, '').trim());
          if (Array.isArray(parsed)) return parsed.map(String).slice(0, 20);
        } catch {
          /* fallback */
        }
      }
    }

    const words = text.split(/\s+/);
    return words.filter((w) => w.length > 3 && w[0] === w[0].toUpperCase()).slice(0, 10);
  }

  async classifyRelevance(
    query: string,
    results: Array<{ title: string; description?: string }>,
  ): Promise<number[]> {
    if (this.llmAvailable && results.length > 0) {
      const payload = results
        .map((r, i) => `${i}. ${r.title} — ${r.description ?? ''}`)
        .join('\n')
        .slice(0, 10000);
      const result = await this.chat([
        {
          role: 'system',
          content:
            'Pontue relevância 0-1 de cada resultado para a query. Retorne JSON array de números na mesma ordem.',
        },
        { role: 'user', content: `Query: ${query}\n\nResultados:\n${payload}` },
      ]);
      if (result) {
        try {
          const parsed = JSON.parse(result.replace(/```json|```/g, '').trim());
          if (Array.isArray(parsed) && parsed.length === results.length) {
            return parsed.map((n) => Math.min(1, Math.max(0, Number(n) || 0)));
          }
        } catch {
          /* fallback */
        }
      }
    }

    const queryTerms = query.toLowerCase().split(/\s+/);
    return results.map((r) => {
      const text = `${r.title} ${r.description || ''}`.toLowerCase();
      const matches = queryTerms.filter((t) => text.includes(t)).length;
      return matches / Math.max(queryTerms.length, 1);
    });
  }

  async synthesizeResearch(params: {
    query: string;
    sources: Array<{ title: string; url: string; snippet?: string }>;
  }): Promise<{
    summary: string;
    keyFindings: string[];
    timeline: string[];
    people: string[];
    companies: string[];
    conclusions: string[];
  }> {
    const sourceBlock = params.sources
      .map((s, i) => `[${i + 1}] ${s.title}\nURL: ${s.url}\n${s.snippet ?? ''}`)
      .join('\n\n')
      .slice(0, 14000);

    if (this.llmAvailable) {
      const result = await this.chat([
        {
          role: 'system',
          content: `Você é um pesquisador. Responda em JSON válido com as chaves:
summary (string), keyFindings (string[]), timeline (string[]), people (string[]), companies (string[]), conclusions (string[]).
Cite fontes pelo índice [n]. Idioma: português do Brasil.`,
        },
        {
          role: 'user',
          content: `Tema: ${params.query}\n\nFontes:\n${sourceBlock}`,
        },
      ]);
      if (result) {
        try {
          const parsed = JSON.parse(result.replace(/```json|```/g, '').trim());
          return {
            summary: String(parsed.summary ?? ''),
            keyFindings: asStringArray(parsed.keyFindings),
            timeline: asStringArray(parsed.timeline),
            people: asStringArray(parsed.people),
            companies: asStringArray(parsed.companies),
            conclusions: asStringArray(parsed.conclusions),
          };
        } catch {
          this.logger.warn('Falha ao parsear síntese LLM; usando fallback');
        }
      }
    }

    const summaries = await Promise.all(
      params.sources.slice(0, 5).map(async (s) => this.summarize(s.snippet ?? s.title, 300)),
    );
    const entities = await this.extractEntities(params.sources.map((s) => s.title).join(' '));

    return {
      summary: summaries.join('\n\n'),
      keyFindings: entities,
      timeline: [],
      people: [],
      companies: [],
      conclusions: summaries.slice(0, 3),
    };
  }

  async planAgentSteps(goal: string): Promise<string[]> {
    if (this.llmAvailable) {
      const result = await this.chat([
        {
          role: 'system',
          content:
            'Planeje até 4 consultas de busca web para atingir o goal. Retorne JSON array de strings em português.',
        },
        { role: 'user', content: goal },
      ]);
      if (result) {
        try {
          const parsed = JSON.parse(result.replace(/```json|```/g, '').trim());
          if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(String).slice(0, 4);
        } catch {
          /* fallback */
        }
      }
    }
    return [goal, `${goal} empresas Brasil`, `${goal} fornecedores`];
  }

  async chat(messages: LlmChatMessage[]): Promise<string | null> {
    if (!this.llmAvailable || !this.apiKey) return null;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.warn(`LLM error ${response.status}: ${errText.slice(0, 200)}`);
        return null;
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return data.choices?.[0]?.message?.content?.trim() ?? null;
    } catch (error) {
      this.logger.warn(`LLM request failed: ${error}`);
      return null;
    }
  }

  async embedTexts(texts: string[]): Promise<number[][]> {
    if (this.llmAvailable && this.apiKey) {
      try {
        const response = await fetch(`${this.baseUrl}/embeddings`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
            input: texts,
          }),
        });
        if (response.ok) {
          const data = (await response.json()) as {
            data?: Array<{ embedding: number[]; index: number }>;
          };
          if (data.data?.length) {
            return data.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
          }
        }
      } catch (error) {
        this.logger.warn(`Embeddings API failed: ${error}`);
      }
    }

    const { simpleEmbed } = await import('../advanced/common/embedding.util');
    return texts.map((t) => simpleEmbed(t));
  }
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String).filter(Boolean).slice(0, 30);
}
