import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { MapsResult } from '../../search/interfaces/search-result.interface';

@Injectable()
export class MapsParser {
  parse(html: string, num = 10): MapsResult[] {
    const $ = cheerio.load(html);
    const results: MapsResult[] = [];
    const seen = new Set<string>();

    const selectors = [
      'a[href*="/maps/place/"]',
      'div[role="article"]',
      'div.Nv2PK',
      'div[data-cid]',
      '.section-result',
    ];

    for (const selector of selectors) {
      $(selector).each((_, el) => {
        if (results.length >= num) return false;

        const $el = $(el);
        const parsed = this.parseElement($, $el);
        if (!parsed || seen.has(parsed.name)) return;

        seen.add(parsed.name);
        results.push({ ...parsed, position: results.length + 1 });
      });

      if (results.length >= num) break;
    }

    if (results.length === 0) {
      results.push(...this.parseFromPlaceLinks($, num));
    }

    return results.slice(0, num);
  }

  private parseElement($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): MapsResult | null {
    const linkEl = $el.is('a[href*="/maps/place"]') ? $el : $el.find('a[href*="/maps/place"]').first();
    const href = linkEl.attr('href') || '';

    const name =
      $el.find('.fontHeadlineSmall, .qBF1Pd, .section-result-title, h3, [aria-label]').first().text().trim() ||
      linkEl.attr('aria-label')?.trim() ||
      '';

    if (!name) return null;

    const address = $el.find('.fontBodyMedium, .W4Efsd, .section-result-location').first().text().trim();
    const ratingText = $el.find('.MW4etd, span[aria-label*="estrela"], span[aria-label*="star"]').first().attr('aria-label') || '';
    const phone = $el.find('[data-item-id*="phone"], [data-tooltip*="phone"]').text().trim();
    const website = $el.find('a[data-item-id="authority"]').attr('href');
    const category = $el.find('.DkEaL, .section-result-details-container span').first().text().trim();

    const coords = this.extractCoordsFromHref(href);
    const ratingMatch = ratingText.match(/([\d,.]+)/);
    const reviewMatch = ratingText.match(/(\d[\d.,]*)\s*(?:review|avalia)/i);

    return {
      name,
      address: address || '',
      latitude: coords?.lat ?? 0,
      longitude: coords?.lng ?? 0,
      phone: phone || undefined,
      website: website || undefined,
      rating: ratingMatch ? parseFloat(ratingMatch[1].replace(',', '.')) : undefined,
      reviewCount: reviewMatch ? parseInt(reviewMatch[1].replace(/\D/g, ''), 10) : undefined,
      category: category || undefined,
      position: 0,
    };
  }

  private parseFromPlaceLinks($: cheerio.CheerioAPI, num: number): MapsResult[] {
    const results: MapsResult[] = [];

    $('a[href*="/maps/place"]').each((_, el) => {
      if (results.length >= num) return false;

      const $el = $(el);
      const name = $el.attr('aria-label')?.trim() || $el.text().trim();
      const href = $el.attr('href') || '';
      if (!name || name.length < 2) return;

      const coords = this.extractCoordsFromHref(href);
      results.push({
        name,
        address: '',
        latitude: coords?.lat ?? 0,
        longitude: coords?.lng ?? 0,
        position: results.length + 1,
      });
    });

    return results;
  }

  private extractCoordsFromHref(href: string): { lat: number; lng: number } | null {
    const atMatch = href.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (atMatch) {
      return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    }

    const bangMatch = href.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
    if (bangMatch) {
      return { lat: parseFloat(bangMatch[1]), lng: parseFloat(bangMatch[2]) };
    }

    return null;
  }
}
