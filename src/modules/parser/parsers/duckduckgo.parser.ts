import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { WebResult } from '../../search/interfaces/search-result.interface';

@Injectable()
export class DuckDuckGoParser {
  parse(html: string, num = 10): WebResult[] {
    const $ = cheerio.load(html);
    const results: WebResult[] = [];
    let position = 0;

    $('.result, .web-result').each((_, el) => {
      if (position >= num) return false;

      const $el = $(el);
      const linkEl = $el.find('.result__a, a.result__url').first();
      const title = linkEl.text().trim();
      let url = linkEl.attr('href') || '';

      if (url.startsWith('//duckduckgo.com/l/')) {
        try {
          const parsed = new URL(`https:${url}`);
          url = decodeURIComponent(parsed.searchParams.get('uddg') || url);
        } catch {
          /* keep original url */
        }
      } else if (url.startsWith('//')) {
        url = `https:${url}`;
      }

      const description = $el.find('.result__snippet, .result-snippet').text().trim();

      if (!title || !url) return;

      position++;
      let domain = '';
      try {
        domain = new URL(url).hostname.replace('www.', '');
      } catch {
        domain = url;
      }

      results.push({
        title,
        url,
        domain,
        description,
        position,
        favicon: domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : undefined,
      });
    });

    return results;
  }
}
