import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { WebResult } from '../../search/interfaces/search-result.interface';

@Injectable()
export class GoogleParser {
  parse(html: string, num = 10): WebResult[] {
    const $ = cheerio.load(html);
    const results: WebResult[] = [];
    let position = 0;

    $('div.g, div[data-sokoban-container]').each((_, el) => {
      if (position >= num) return false;

      const $el = $(el);
      const titleEl = $el.find('h3').first();
      const linkEl = $el.find('a[href^="http"]').first();
      const snippetEl = $el.find('div[data-sncf], .VwiC3b, span.st').first();

      const title = titleEl.text().trim();
      const url = linkEl.attr('href') || '';
      const description = snippetEl.text().trim();

      if (!title || !url) return;

      position++;
      let domain = '';
      try {
        domain = new URL(url).hostname.replace('www.', '');
      } catch {
        domain = url;
      }

      const sitelinks: Array<{ title: string; url: string }> = [];
      $el.find('table a').each((_, sl) => {
        const slTitle = $(sl).text().trim();
        const slUrl = $(sl).attr('href') || '';
        if (slTitle && slUrl) sitelinks.push({ title: slTitle, url: slUrl });
      });

      results.push({
        title,
        url,
        domain,
        description,
        position,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        sitelinks: sitelinks.length > 0 ? sitelinks : undefined,
        breadcrumbs: $el.find('.VuuXrf').map((_, b) => $(b).text().trim()).get(),
      });
    });

    return results;
  }

  parseRelatedSearches(html: string): string[] {
    const $ = cheerio.load(html);
    const related: string[] = [];

    $('[data-entityname], .brs_col p, .related-question-pair').each((_, el) => {
      const text = $(el).text().trim();
      if (text) related.push(text);
    });

    $('a[data-q], div[data-alt="Related searches"] a').each((_, el) => {
      const text = $(el).text().trim();
      if (text && !related.includes(text)) related.push(text);
    });

    return related.slice(0, 10);
  }

  parseKnowledgeGraph(html: string) {
    const $ = cheerio.load(html);
    const kgEl = $('[data-attrid="title"], .kno-ecr-rl, .kp-header');

    if (!kgEl.length) return null;

    const title = $('[data-attrid="title"]').text().trim() || $('h2[data-attrid="title"]').text().trim();
    const description = $('[data-attrid="description"] span, .kno-rdesc span').first().text().trim();
    const image = $('img[data-attrid="image"] source, .kno-fb-img img').first().attr('src');

    const attributes: Record<string, string> = {};
    $('[data-attrid] span').each((_, el) => {
      const attr = $(el).attr('data-attrid');
      const value = $(el).text().trim();
      if (attr && value && attr !== 'title' && attr !== 'description') {
        attributes[attr] = value;
      }
    });

    const website = $('a[data-attrid="visit_official_site"] span, .kp-blk a[href^="http"]').first().attr('href');

    return {
      title,
      description: description || undefined,
      image: image || undefined,
      attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
      website: website || undefined,
    };
  }
}
