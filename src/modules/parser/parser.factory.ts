import { Injectable } from '@nestjs/common';
import { GoogleParser } from './parsers/google.parser';
import { NewsParser } from './parsers/news.parser';
import { ImagesParser } from './parsers/images.parser';
import { VideosParser } from './parsers/videos.parser';
import { ShoppingParser } from './parsers/shopping.parser';
import { MapsParser } from './parsers/maps.parser';
import { DuckDuckGoParser } from './parsers/duckduckgo.parser';

export type ParserType =
  | 'web'
  | 'news'
  | 'images'
  | 'videos'
  | 'shopping'
  | 'maps'
  | 'places'
  | 'knowledge-graph'
  | 'related-searches'
  | 'autocomplete';

@Injectable()
export class ParserFactory {
  constructor(
    private readonly googleParser: GoogleParser,
    private readonly newsParser: NewsParser,
    private readonly imagesParser: ImagesParser,
    private readonly videosParser: VideosParser,
    private readonly shoppingParser: ShoppingParser,
    private readonly mapsParser: MapsParser,
    private readonly duckDuckGoParser: DuckDuckGoParser,
  ) {}

  getGoogleParser(): GoogleParser {
    return this.googleParser;
  }

  getNewsParser(): NewsParser {
    return this.newsParser;
  }

  getImagesParser(): ImagesParser {
    return this.imagesParser;
  }

  getVideosParser(): VideosParser {
    return this.videosParser;
  }

  getShoppingParser(): ShoppingParser {
    return this.shoppingParser;
  }

  getMapsParser(): MapsParser {
    return this.mapsParser;
  }

  getDuckDuckGoParser(): DuckDuckGoParser {
    return this.duckDuckGoParser;
  }
}
