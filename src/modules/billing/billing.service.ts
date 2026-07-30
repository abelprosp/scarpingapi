import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private stripe: Stripe | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secretKey && secretKey !== 'sk_test_xxx') {
      this.stripe = new Stripe(secretKey);
    }
  }

  async getPlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: 'asc' },
    });
  }

  async createCheckoutSession(userId: string, planId: string) {
    if (!this.stripe) {
      return { message: 'Stripe não configurado. Configure STRIPE_SECRET_KEY.' };
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!user || !plan) throw new Error('Usuário ou plano não encontrado');

    let subscription = await this.prisma.subscription.findUnique({ where: { userId } });
    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: plan.stripePriceId!, quantity: 1 }],
      success_url: `${this.configService.get<string>('app.publicUrl', 'http://localhost:3000').replace('api.', '')}/billing/success`,
      cancel_url: `${this.configService.get<string>('app.publicUrl', 'http://localhost:3000').replace('api.', '')}/billing/cancel`,
      metadata: { userId, planId },
    });

    return { sessionId: session.id, url: session.url };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    if (!this.stripe) return;

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret!);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        if (userId && planId) {
          await this.activateSubscription(userId, planId, session.customer as string);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await this.prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: 'CANCELED', canceledAt: new Date() },
        });
        break;
      }
    }
  }

  private async activateSubscription(userId: string, planId: string, customerId: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) return;

    await this.prisma.subscription.upsert({
      where: { userId },
      update: { planId, status: 'ACTIVE', stripeCustomerId: customerId },
      create: { userId, planId, status: 'ACTIVE', stripeCustomerId: customerId },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: plan.creditsMonthly } },
    });
  }

  async getInvoices(userId: string) {
    return this.prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async applyCoupon(code: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code } });
    if (!coupon || !coupon.isActive) return null;
    if (coupon.validUntil && coupon.validUntil < new Date()) return null;
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return null;
    return coupon;
  }
}
