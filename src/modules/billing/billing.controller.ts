import { Controller, Get, Post, Body, Req, Headers, RawBodyRequest, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { BillingService } from './billing.service';
import { CombinedAuthGuard } from '../auth/guards/combined-auth.guard';
import { Public, CurrentUser, AuthenticatedUser } from '../../common/decorators/auth.decorator';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('plans')
  @Public()
  @ApiOperation({ summary: 'Listar planos disponíveis' })
  getPlans() {
    return this.billingService.getPlans();
  }

  @Post('checkout')
  @UseGuards(CombinedAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar sessão de checkout Stripe' })
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
