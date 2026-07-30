import { Controller, Get, Post, Body, Req, Headers, RawBodyRequest, UseGuards, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { BillingService } from './billing.service';
import { PixBillingService } from './pix-billing.service';
import { CombinedAuthGuard } from '../auth/guards/combined-auth.guard';
import { Public, CurrentUser, AuthenticatedUser } from '../../common/decorators/auth.decorator';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly pixBilling: PixBillingService,
  ) {}

  @Get('plans')
  @Public()
  @ApiOperation({ summary: 'Listar planos disponíveis' })
  getPlans() {
    return this.billingService.getPlans();
  }

  @Get('profile')
  @UseGuards(CombinedAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perfil de billing (créditos, overage, PIX pendentes)' })
  billingProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.pixBilling.getBillingProfile(user.id);
  }

  @Patch('pay-as-you-go')
  @UseGuards(CombinedAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ativar/desativar pay-as-you-go' })
  setPayAsYouGo(
    @CurrentUser() user: AuthenticatedUser,
    @Body('enabled') enabled: boolean,
  ) {
    return this.pixBilling.setPayAsYouGo(user.id, enabled);
  }

  @Post('pix/subscribe')
  @UseGuards(CombinedAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar PIX para plano mensal R$197' })
  pixSubscribe(@CurrentUser() user: AuthenticatedUser) {
    return this.pixBilling.subscribePix(user.id);
  }

  @Post('pix/buy-credits')
  @UseGuards(CombinedAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar PIX para pacote de créditos (R$5 / 500 créditos)' })
  pixBuyCredits(
    @CurrentUser() user: AuthenticatedUser,
    @Body('quantity') quantity?: number,
  ) {
    return this.pixBilling.buyCreditsPix(user.id, quantity ?? 1);
  }

  @Post('pix/overage')
  @UseGuards(CombinedAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cobrar blocos de overage pendentes via PIX' })
  pixOverage(@CurrentUser() user: AuthenticatedUser) {
    return this.pixBilling.chargeOveragePix(user.id);
  }

  @Get('pix/:txid/status')
  @UseGuards(CombinedAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar status de pagamento PIX' })
  pixStatus(@CurrentUser() user: AuthenticatedUser, @Param('txid') txid: string) {
    return this.pixBilling.getPixStatus(user.id, txid);
  }

  @Post('checkout')
  @UseGuards(CombinedAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar sessão de checkout Stripe (legado)' })
  checkout(@CurrentUser() user: AuthenticatedUser, @Body('planId') planId: string) {
    return this.billingService.createCheckoutSession(user.id, planId);
  }

  @Get('invoices')
  @UseGuards(CombinedAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar faturas' })
  invoices(@CurrentUser() user: AuthenticatedUser) {
    return this.billingService.getInvoices(user.id);
  }

  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Webhook Stripe' })
  webhook(
    @Req() req: RawBodyRequest<FastifyRequest>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.billingService.handleWebhook(req.rawBody as Buffer, signature);
  }
}
