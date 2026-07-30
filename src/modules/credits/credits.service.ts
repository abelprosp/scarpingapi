import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuthenticatedUser } from '../../common/decorators/auth.decorator';

@Injectable()
export class CreditsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private get overageBlock(): number {
    return this.configService.get<number>('billing.overageBlockCredits', 500);
  }

  async deduct(user: AuthenticatedUser, amount: number): Promise<number> {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        subscription: {
          include: { plan: true },
        },
      },
    });

    if (!dbUser) {
      throw new ForbiddenException('Usuário não encontrado');
    }

    const subscription = dbUser.subscription;
    const hasActiveSub =
      subscription?.status === 'ACTIVE' && subscription.plan !== null;

    if (hasActiveSub) {
      await this.ensureMonthlyReset(dbUser.id, subscription!.plan!.creditsMonthly);
      const refreshed = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: { subscription: { include: { plan: true } } },
      });
      if (!refreshed) throw new ForbiddenException('Usuário não encontrado');

      const planCredits = refreshed.subscription!.plan!.creditsMonthly;
      const monthlyRemaining = planCredits - refreshed.monthlyCreditsUsed;

      if (amount <= monthlyRemaining) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { monthlyCreditsUsed: { increment: amount } },
        });
        return this.getAvailableCredits(refreshed, planCredits);
      }

      let remaining = amount - Math.max(monthlyRemaining, 0);
      const updates: {
        monthlyCreditsUsed?: number;
        credits?: { decrement: number };
        overageCreditsPending?: { increment: number };
      } = {};

      if (monthlyRemaining > 0) {
        updates.monthlyCreditsUsed = planCredits;
      }

      if (remaining > 0) {
        const poolUse = Math.min(refreshed.credits, remaining);
        if (poolUse > 0) {
          updates.credits = { decrement: poolUse };
          remaining -= poolUse;
        }

        if (remaining > 0) {
          if (!refreshed.payAsYouGoEnabled) {
            throw new ForbiddenException(
              'Créditos mensais esgotados. Ative pay-as-you-go ou compre créditos avulsos.',
            );
          }

          if (refreshed.overageCreditsPending + remaining > this.overageBlock) {
            throw new ForbiddenException(
              `Limite de overage (${this.overageBlock} créditos) atingido. Pague o bloco pendente via PIX.`,
            );
          }

          updates.overageCreditsPending = { increment: remaining };
        }
      }

      await this.prisma.user.update({ where: { id: user.id }, data: updates });
      const after = await this.prisma.user.findUnique({ where: { id: user.id } });
      return after ? this.getAvailableCredits(after, planCredits) : 0;
    }

    if (dbUser.credits < amount) {
      throw new ForbiddenException('Créditos insuficientes');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: amount } },
    });

    return dbUser.credits - amount;
  }

  async getBillingStatus(userId: string) {
    const balance = await this.getBalance(userId);
    if (!balance) return null;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: { include: { plan: true } } },
    });

    const overageBlock = this.overageBlock;

    return {
      ...balance,
      overageBlockSize: overageBlock,
      overageBlocksPending: Math.floor(balance.overagePending / overageBlock),
      plan: user?.subscription
        ? {
            name: user.subscription.plan.name,
            tier: user.subscription.plan.tier,
            priceMonthly: user.subscription.plan.priceMonthly,
            status: user.subscription.status,
          }
        : null,
      periodEnd: user?.subscription?.currentPeriodEnd?.toISOString() ?? null,
    };
  }

  async updateSettings(userId: string, payAsYouGoEnabled: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { payAsYouGoEnabled },
      select: { payAsYouGoEnabled: true },
    });
  }

  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: { include: { plan: true } } },
    });
    if (!user) return null;

    const planCredits =
      user.subscription?.status === 'ACTIVE' ? user.subscription.plan.creditsMonthly : 0;
    const monthlyRemaining = Math.max(planCredits - user.monthlyCreditsUsed, 0);

    return {
      credits: user.credits,
      monthlyAllowance: planCredits,
      monthlyUsed: user.monthlyCreditsUsed,
      monthlyRemaining,
      overagePending: user.overageCreditsPending,
      payAsYouGoEnabled: user.payAsYouGoEnabled,
      totalAvailable: user.credits + monthlyRemaining,
    };
  }

  private async ensureMonthlyReset(userId: string, planCredits: number): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const now = new Date();
    const needsReset =
      !user.monthlyCreditsResetAt || user.monthlyCreditsResetAt <= now;

    if (needsReset) {
      const nextReset = new Date(now);
      nextReset.setDate(nextReset.getDate() + 30);
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          monthlyCreditsUsed: 0,
          monthlyCreditsResetAt: nextReset,
        },
      });
    }
  }

  private getAvailableCredits(
    user: { credits: number; monthlyCreditsUsed: number },
    planCredits: number,
  ): number {
    return user.credits + Math.max(planCredits - user.monthlyCreditsUsed, 0);
  }

  async resetMonthlyOnSubscription(userId: string): Promise<void> {
    const nextReset = new Date();
    nextReset.setDate(nextReset.getDate() + 30);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        monthlyCreditsUsed: 0,
        monthlyCreditsResetAt: nextReset,
        overageCreditsPending: 0,
      },
    });
  }
}
