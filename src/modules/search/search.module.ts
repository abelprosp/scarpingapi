import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { CacheModule } from '../cache/cache.module';
import { BrowserModule } from '../browser/browser.module';
import { ProxyModule } from '../proxy/proxy.module';
import { ParserModule } from '../parser/parser.module';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { CreditsModule } from '../credits/credits.module';
import { NominatimProvider } from './providers/nominatim.provider';
import { DuckDuckGoImagesProvider } from './providers/duckduckgo-images.provider';

@Module({
  imports: [CacheModule, BrowserModule, ProxyModule, ParserModule, AiModule, AuthModule, CreditsModule],
  controllers: [SearchController],
  providers: [SearchService, NominatimProvider, DuckDuckGoImagesProvider],
  exports: [SearchService],
})
export class SearchModule {}
