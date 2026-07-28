import { Module } from '@nestjs/common';
import { GoogleParser } from './parsers/google.parser';
import { NewsParser } from './parsers/news.parser';
import { ImagesParser } from './parsers/images.parser';
import { VideosParser } from './parsers/videos.parser';
import { ShoppingParser } from './parsers/shopping.parser';
import { MapsParser } from './parsers/maps.parser';
import { DuckDuckGoParser } from './parsers/duckduckgo.parser';
import { ParserFactory } from './parser.factory';

@Module({
  providers: [
    GoogleParser,
    NewsParser,
    ImagesParser,
    VideosParser,
    ShoppingParser,
    MapsParser,
    DuckDuckGoParser,
    ParserFactory,
  ],
  exports: [ParserFactory],
})
export class ParserModule {}
