import { Module } from '@nestjs/common';
import { AdvancedApiController } from './advanced.controller';
import { AdvancedApiService } from './advanced.service';
import { AdvancedCreditsService } from './common/advanced-credits.service';
import { BrowserModule } from '../browser/browser.module';
import { SearchModule } from '../search/search.module';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [BrowserModule, SearchModule, AiModule, AuthModule, CreditsModule],
  controllers: [AdvancedApiController],
  providers: [AdvancedApiService, AdvancedCreditsService],
  exports: [AdvancedApiService],
})
export class AdvancedModule {}
