import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { MapsResult } from '../../search/interfaces/search-result.interface';

@Injectable()
export class MapsParser {
  parse(html: string, num = 10): MapsResult[] {
    const $ = cheerio.load(html);
    const results: MapsResult[] = [];

    $('a[href*="/maps/place"], div[data-cid], div.Nv2PK').each((_, el) => {
      if (results.length >= num) return false;

      const $el = $(el);
      const name = $el.find('.fontHeadlineSmall, .qBF1Pd, h3').first().text().trim();
      const address = $el.find('.fontBodyMedium, .W4Efsd').first().text().trim();
      const ratingText = $el.find('.MW4etd, span[aria-label*="stars"]').first().attr('aria-label') || '';
      const phone = $el.find('[data-item-id*="phone"]').text().trim();
      const website = $el.find('a[data-item-id="authority"]').attr('href');
      const category = $el.find('.DkEaL, .W4Efsd span').first().text().trim();

      if (!name) return;

      const ratingMatch = ratingText.match(/([\d.]+)/);
      const reviewMatch = ratingText.match(/(\d+)\s*review/i);

      results.push({
        name,
        address: address || '',
        latitude: 0,
        longitude: 0,
        phone: phone || undefined,
        website: website || undefined,
        rating: ratingMatch ? parseFloat(ratingMatch[1]) : undefined,
        reviewCount: reviewMatch ? parseInt(reviewMatch[1], 10) : undefined,
        category: category || undefined,
      });
    });

    return results;
  }
}
