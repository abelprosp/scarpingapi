import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { CacheModule } from '../cache/cache.module';
import { BrowserModule } from '../browser/browser.module';
import { ProxyModule } from '../proxy/proxy.module';
import { ParserModule } from '../parser/parser.module';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { NominatimProvider } from './providers/nominatim.provider';

@Module({
  imports: [CacheModule, BrowserModule, ProxyModule, ParserModule, AiModule, AuthModule],
  controllers: [SearchController],
  providers: [SearchService, NominatimProvider],
  exports: [SearchService],
})
export class SearchModule {}
