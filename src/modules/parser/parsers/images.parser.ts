import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { ImageResult } from '../../search/interfaces/search-result.interface';

@Injectable()
export class ImagesParser {
  parse(html: string, num = 10): ImageResult[] {
    const $ = cheerio.load(html);
    const results: ImageResult[] = [];

    $('div.isv-r, div[data-ri], g-img').each((_, el) => {
      if (results.length >= num) return false;

      const $el = $(el);
      const img = $el.find('img').first();
      const imageUrl = img.attr('src') || img.attr('data-src') || '';
      const title = img.attr('alt') || $el.find('.iKJnec').text().trim() || '';
      const link = $el.closest('a').attr('href') || $el.find('a').first().attr('href') || '';

      if (!imageUrl || imageUrl.startsWith('data:')) return;

      let originalUrl = link;
      try {
        if (link.includes('/imgres?')) {
          const urlParams = new URL(link, 'https://google.com');
          originalUrl = urlParams.searchParams.get('imgurl') || link;
        }
      } catch {
        originalUrl = link;
      }

      let domain = '';
      try {
        domain = new URL(originalUrl).hostname.replace('www.', '');
      } catch {
        domain = '';
      }

      results.push({
        imageUrl,
        thumbnailUrl: imageUrl,
        title,
        source: domain,
        domain,
        originalUrl,
        width: parseInt(img.attr('width') || '0', 10) || undefined,
        height: parseInt(img.attr('height') || '0', 10) || undefined,
      });
    });

    return results;
  }
}
