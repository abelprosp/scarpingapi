import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PixBillingService } from './pix-billing.service';
import { Public } from '../../common/decorators/auth.decorator';
import { ConfigService } from '@nestjs/config';
import { Logger, UnauthorizedException } from '@nestjs/common';

@ApiTags('Billing')
@Controller('billing/webhook')
export class EfiWebhookController {
  private readonly logger = new Logger(EfiWebhookController.name);

  constructor(
    private readonly pixBilling: PixBillingService,
    private readonly configService: ConfigService,
  ) {}

  @Post('efi')
  @Public()
  @ApiOperation({ summary: 'Webhook EFI PIX (público)' })
  async handleEfiWebhook(
    @Body() body: { pix?: Array<{ txid?: string; endToEndId?: string }> },
    @Headers('x-efi-signature') signature?: string,
  ) {
    const secret = this.configService.get<string>('efi.webhookSecret');
    if (secret && signature !== secret) {
      this.logger.warn('Webhook EFI rejeitado — assinatura inválida');
      throw new UnauthorizedException('Assinatura inválida');
    }

    return this.pixBilling.handleWebhook(body);
  }
}
