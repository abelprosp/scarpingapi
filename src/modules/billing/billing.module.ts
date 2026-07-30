import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { EfiWebhookController } from './efi-webhook.controller';
import { BillingService } from './billing.service';
import { PixBillingService } from './pix-billing.service';
import { AuthModule } from '../auth/auth.module';
import { EfiModule } from '../efi/efi.module';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [AuthModule, EfiModule, CreditsModule],
  controllers: [BillingController, EfiWebhookController],
  providers: [BillingService, PixBillingService],
  exports: [BillingService, PixBillingService],
})
export class BillingModule {}
