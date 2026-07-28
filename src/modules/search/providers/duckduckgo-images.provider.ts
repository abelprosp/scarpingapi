import { Injectable, Logger } from '@nestjs/common';
import { ImageResult } from '../interfaces/search-result.interface';

interface DdgImageItem {
  title?: string;
  image?: string;
  thumbnail?: string;
  url?: string;
  width?: number;
  height?: number;
  source?: string;
}

@Injectable()
export class DuckDuckGoImagesProvider {
  private readonly logger = new Logger(DuckDuckGoImagesProvider.name);

  async searchImages(
    query: string,
    limit: number,
    gl: string,
    hl: string,
    page = 1,
  ): Promise<ImageResult[]> {
    const locale = this.toLocale(gl, hl);
    const vqd = await this.fetchVqd(query);
    if (!vqd) {
      this.logger.warn('Não foi possível obter token vqd do DuckDuckGo Images');
      return [];
    }

    const params = new URLSearchParams({
      l: locale,
      o: 'json',
      q: query,
      vqd,
      p: String(page),
    });

    const url = `https://duckduckgo.com/i.js?${params.toString()}`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent(),
          Accept: 'application/json',
          Referer: 'https://duckduckgo.com/',
        },
      });

      if (!response.ok) {
        this.logger.warn(`DuckDuckGo Images HTTP ${response.status}`);
        return [];
      }

      const data = (await response.json()) as { results?: DdgImageItem[] };
      return (data.results ?? []).slice(0, limit).map((item) => this.toImageResult(item));
    } catch (error) {
      this.logger.warn(`DuckDuckGo Images error: ${error}`);
      return [];
    }
  }

  private async fetchVqd(query: string): Promise<string | null> {
    const params = new URLSearchParams({
      q: query,
      iax: 'images',
      ia: 'images',
    });

    try {
      const response = await fetch(`https://duckduckgo.com/?${params.toString()}`, {
        headers: {
          'User-Agent': this.userAgent(),
          Accept: 'text/html',
        },
      });

      if (!response.ok) return null;

      const html = await response.text();
      const match = html.match(/vqd=["']?([\d-]+)/);
      return match?.[1] ?? null;
    } catch (error) {
      this.logger.warn(`DuckDuckGo vqd error: ${error}`);
      return null;
    }
  }

  private toImageResult(item: DdgImageItem): ImageResult {
    const originalUrl = item.url || item.image || '';
    let domain = '';
    try {
      domain = new URL(originalUrl).hostname.replace('www.', '');
    } catch {
      domain = item.source?.toLowerCase() || '';
    }

    return {
      imageUrl: item.image || item.thumbnail || '',
      thumbnailUrl: item.thumbnail || item.image || '',
      title: item.title || '',
      source: domain || item.source || '',
      domain,
      originalUrl,
      width: item.width,
      height: item.height,
    };
  }

  private toLocale(gl: string, hl: string): string {
    const country = gl.toLowerCase();
    const lang = hl.toLowerCase();
    return `${country}-${lang}`;
  }

  private userAgent(): string {
    return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
  }
}
