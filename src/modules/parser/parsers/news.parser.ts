import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { NewsResult } from '../../search/interfaces/search-result.interface';

@Injectable()
export class NewsParser {
  parse(html: string, num = 10): NewsResult[] {
    const $ = cheerio.load(html);
    const results: NewsResult[] = [];

    $('article, div[data-news-doc-id], g-card').each((_, el) => {
      if (results.length >= num) return false;

      const $el = $(el);
      const title = $el.find('h3, h4, .JheGif').first().text().trim();
      const url = $el.find('a[href^="http"]').first().attr('href') || '';
      const source = $el.find('.WF4CUc, .wEwyrc, span').first().text().trim();
      const snippet = $el.find('.GI74Re, .Y3v8qd, .st').first().text().trim();
      const thumbnail = $el.find('img').first().attr('src');
      const date = $el.find('time, .OSrXXb').first().text().trim();

      if (!title || !url) return;

      results.push({
        title,
        source: source || 'Unknown',
        date: date || new Date().toISOString(),
        thumbnail,
        snippet: snippet || '',
        url,
      });
    });

    return results;
  }
}
