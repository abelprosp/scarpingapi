import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PixPaymentStatus, PixPaymentType, PlanTier } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { EfiService } from '../efi/efi.service';
import { CreditsService } from '../credits/credits.service';

export interface PixPaymentResponse {
  txid: string;
  qrCode: string;
  copyPaste: string;
  expiresAt: string;
  amount: number;
  creditsGranted: number;
  type: PixPaymentType;
  status: PixPaymentStatus;
}

@Injectable()
export class PixBillingService {
  private readonly logger = new Logger(PixBillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly efi: EfiService,
    private readonly credits: CreditsService,
    private readonly configService: ConfigService,
  ) {}

  private get packPrice(): number {
    return this.configService.get<number>('billing.creditPackPriceCents', 500);
  }

  private get packCredits(): number {
    return this.configService.get<number>('billing.creditPackCredits', 500);
  }

  async subscribePix(
    userId: string,
    tier: PlanTier = PlanTier.STARTER,
  ): Promise<PixPaymentResponse> {
    if (tier === PlanTier.FREE) {
      throw new BadRequestException('Plano gratuito não requer pagamento');
    }

    const plan = await this.prisma.plan.findFirst({
      where: { tier, isActive: true },
    });
    if (!plan) throw new NotFoundException('Plano não encontrado');

    return this.createPayment({
      userId,
      amountCents: plan.priceMonthly,
      creditsGranted: plan.creditsMonthly,
      type: 'SUBSCRIPTION',
      planId: plan.id,
      description: `NoviqSearch — Plano ${plan.name} (R$ ${(plan.priceMonthly / 100).toFixed(2)}/mês)`,
    });
  }

  async buyCreditsPix(userId: string, quantity = 1): Promise<PixPaymentResponse> {
    if (quantity < 1 || quantity > 100) {
      throw new BadRequestException('Quantidade deve ser entre 1 e 100 pacotes');
    }

    return this.createPayment({
      userId,
      amountCents: this.packPrice * quantity,
      creditsGranted: this.packCredits * quantity,
      type: 'CREDIT_PACK',
      quantity,
      description: `NoviqSearch — ${quantity}x pacote ${this.packCredits} créditos`,
    });
  }

  async chargeOveragePix(userId: string): Promise<PixPaymentResponse> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const overageBlock = this.configService.get<number>('billing.overageBlockCredits', 500);
    const blocks = Math.floor(user.overageCreditsPending / overageBlock);
    if (blocks < 1) {
      throw new BadRequestException(
        `Nenhum bloco de overage pendente (mínimo ${overageBlock} créditos)`,
      );
    }

    const creditsToBill = blocks * overageBlock;
    const amountCents = blocks * this.packPrice;

    const existing = await this.prisma.pixPayment.findFirst({
      where: { userId, type: 'OVERAGE', status: 'PENDING' },
    });
    if (existing) {
      return this.toResponse(existing);
    }

    return this.createPayment({
      userId,
      amountCents,
      creditsGranted: creditsToBill,
      type: 'OVERAGE',
      quantity: blocks,
      description: `NoviqSearch — Overage ${creditsToBill} créditos (${blocks} bloco(s))`,
    });
  }

  async getPixStatus(userId: string, txid: string) {
    const payment = await this.prisma.pixPayment.findFirst({
      where: { txid, userId },
    });
    if (!payment) throw new NotFoundException('Pagamento PIX não encontrado');

    if (payment.status === 'PENDING' && payment.expiresAt && payment.expiresAt < new Date()) {
      await this.prisma.pixPayment.update({
        where: { id: payment.id },
        data: { status: 'EXPIRED' },
      });
      return { ...this.toResponse(payment), status: 'EXPIRED' as PixPaymentStatus };
    }

    if (payment.status === 'PENDING' && this.efi.isConfigured()) {
      const remote = await this.efi.getChargeStatus(txid);
      if (remote === 'PAID') {
        await this.fulfillPayment(payment.id);
        const updated = await this.prisma.pixPayment.findUnique({ where: { id: payment.id } });
        return this.toResponse(updated!);
      }
      if (remote === 'EXPIRED') {
        await this.prisma.pixPayment.update({
          where: { id: payment.id },
          data: { status: 'EXPIRED' },
        });
        return { ...this.toResponse(payment), status: 'EXPIRED' as PixPaymentStatus };
      }
    }

    return this.toResponse(payment);
  }

  async handleWebhook(body: { pix?: Array<{ txid?: string; endToEndId?: string }> }) {
    const pixList = body?.pix;
    if (!Array.isArray(pixList) || pixList.length === 0) {
      return { received: true };
    }

    for (const pix of pixList) {
      if (!pix.txid) continue;
      const payment = await this.prisma.pixPayment.findUnique({ where: { txid: pix.txid } });
      if (payment && payment.status === 'PENDING') {
        await this.fulfillPayment(payment.id);
        this.logger.log(`PIX confirmado via webhook: ${pix.txid}`);
      }
    }

    return { received: true };
  }

  async getBillingProfile(userId: string) {
    const balance = await this.credits.getBalance(userId);
    const pendingPayments = await this.prisma.pixPayment.findMany({
      where: { userId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      ...balance,
      pendingPixPayments: pendingPayments.map((p) => this.toResponse(p)),
    };
  }

  async setPayAsYouGo(userId: string, enabled: boolean) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { payAsYouGoEnabled: enabled },
      select: { payAsYouGoEnabled: true },
    });
    return user;
  }

  private async createPayment(params: {
    userId: string;
    amountCents: number;
    creditsGranted: number;
    type: PixPaymentType;
    planId?: string;
    quantity?: number;
    description: string;
  }): Promise<PixPaymentResponse> {
    const charge = await this.efi.createPixCharge(params.amountCents, params.description);

    const payment = await this.prisma.pixPayment.create({
      data: {
        userId: params.userId,
        txid: charge.txid,
        amount: params.amountCents,
        creditsGranted: params.creditsGranted,
        type: params.type,
        status: 'PENDING',
        qrCode: charge.qrCode,
        copyPaste: charge.copyPaste,
        planId: params.planId,
        quantity: params.quantity ?? 1,
        expiresAt: charge.expiresAt,
      },
    });

    return this.toResponse(payment);
  }

  async fulfillPayment(paymentId: string): Promise<void> {
    const payment = await this.prisma.pixPayment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.status === 'PAID') return;

    await this.prisma.$transaction(async (tx) => {
      await tx.pixPayment.update({
        where: { id: paymentId },
        data: { status: 'PAID', paidAt: new Date() },
      });

      switch (payment.type) {
        case 'SUBSCRIPTION': {
          if (!payment.planId) break;
          const now = new Date();
          const periodEnd = new Date(now);
          periodEnd.setDate(periodEnd.getDate() + 30);

          await tx.subscription.upsert({
            where: { userId: payment.userId },
            update: {
              planId: payment.planId,
              status: 'ACTIVE',
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
            },
            create: {
              userId: payment.userId,
              planId: payment.planId,
              status: 'ACTIVE',
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
            },
          });

          await tx.user.update({
            where: { id: payment.userId },
            data: {
              monthlyCreditsUsed: 0,
              monthlyCreditsResetAt: periodEnd,
              overageCreditsPending: 0,
            },
          });

          await tx.invoice.create({
            data: {
              userId: payment.userId,
              amount: payment.amount,
              currency: 'brl',
              status: 'paid',
              paidAt: new Date(),
            },
          });
          break;
        }
        case 'CREDIT_PACK':
          await tx.user.update({
            where: { id: payment.userId },
            data: { credits: { increment: payment.creditsGranted } },
          });
          await tx.invoice.create({
            data: {
              userId: payment.userId,
              amount: payment.amount,
              currency: 'brl',
              status: 'paid',
              paidAt: new Date(),
            },
          });
          break;
        case 'OVERAGE':
          await tx.user.update({
            where: { id: payment.userId },
            data: {
              overageCreditsPending: {
                decrement: payment.creditsGranted,
              },
            },
          });
          await tx.invoice.create({
            data: {
              userId: payment.userId,
              amount: payment.amount,
              currency: 'brl',
              status: 'paid',
              paidAt: new Date(),
            },
          });
          break;
      }
    });
  }

  private toResponse(payment: {
    txid: string;
    qrCode: string | null;
    copyPaste: string | null;
    expiresAt: Date | null;
    amount: number;
    creditsGranted: number;
    type: PixPaymentType;
    status: PixPaymentStatus;
  }): PixPaymentResponse {
    return {
      txid: payment.txid,
      qrCode: payment.qrCode || '',
      copyPaste: payment.copyPaste || '',
      expiresAt: payment.expiresAt?.toISOString() || '',
      amount: payment.amount,
      creditsGranted: payment.creditsGranted,
      type: payment.type,
      status: payment.status,
    };
  }
}
