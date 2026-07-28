import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { VideoResult } from '../../search/interfaces/search-result.interface';

@Injectable()
export class VideosParser {
  parse(html: string, num = 10): VideoResult[] {
    const $ = cheerio.load(html);
    const results: VideoResult[] = [];

    $('div.g, g-scrolling-carousel div, div[data-ved]').each((_, el) => {
      if (results.length >= num) return false;

      const $el = $(el);
      const title = $el.find('h3, .LC20lb').first().text().trim();
      const url = $el.find('a[href^="http"]').first().attr('href') || '';
      const thumbnail = $el.find('img').first().attr('src') || '';
      const channel = $el.find('.UPmit, .zEE80b, .yQ8LLe').first().text().trim();
      const duration = $el.find('.TgKVlb, span[style*="duration"]').first().text().trim();
      const views = $el.find('.LIYyPd, .g-hovercard').first().text().trim();
      const date = $el.find('.OSrXXb').first().text().trim();

      if (!title || !url) return;
      if (!url.includes('youtube') && !url.includes('video')) return;

      results.push({
        title,
        duration: duration || '0:00',
        thumbnail,
        channel: channel || 'Unknown',
        views,
        date,
        url,
      });
    });

    return results;
  }
}
