import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('search.aiEnabled', false);
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
    if (!this.enabled || text.length <= maxLength) return text.slice(0, maxLength);
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    return sentences.slice(0, 2).join('. ').slice(0, maxLength);
  }

  async extractEntities(text: string): Promise<string[]> {
    const words = text.split(/\s+/);
    return words.filter((w) => w.length > 3 && w[0] === w[0].toUpperCase()).slice(0, 10);
  }

  async classifyRelevance(query: string, results: Array<{ title: string; description?: string }>): Promise<number[]> {
    const queryTerms = query.toLowerCase().split(/\s+/);
    return results.map((r) => {
      const text = `${r.title} ${r.description || ''}`.toLowerCase();
      const matches = queryTerms.filter((t) => text.includes(t)).length;
      return matches / queryTerms.length;
    });
  }
}
