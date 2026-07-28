import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { ShoppingResult } from '../../search/interfaces/search-result.interface';

@Injectable()
export class ShoppingParser {
  parse(html: string, num = 10): ShoppingResult[] {
    const $ = cheerio.load(html);
    const results: ShoppingResult[] = [];

    $('div.sh-dgr__content, g-inner-card, div[data-docid]').each((_, el) => {
      if (results.length >= num) return false;

      const $el = $(el);
      const title = $el.find('h3, h4, .tAxDx').first().text().trim();
      const price = $el.find('.a8Pemb, .price, span[aria-label*="R$"]').first().text().trim();
      const store = $el.find('.E5ocAb, .IuHno, .aULzUe').first().text().trim();
      const image = $el.find('img').first().attr('src');
      const url = $el.find('a[href^="http"]').first().attr('href') || '';
      const ratingText = $el.find('.Rsc7Yb, .yi40Hd').first().text().trim();
      const reviewCount = $el.find('.Q3DXx, .reviews').first().text().trim();

      if (!title || !price) return;

      results.push({
        title,
        price,
        store: store || 'Unknown',
        rating: parseFloat(ratingText) || undefined,
        reviewCount: parseInt(reviewCount.replace(/\D/g, ''), 10) || undefined,
        image,
        url,
        inStock: true,
      });
    });

    return results;
  }
}
