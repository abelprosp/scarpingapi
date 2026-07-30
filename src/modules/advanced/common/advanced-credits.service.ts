import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { AuthenticatedUser } from '../../../common/decorators/auth.decorator';
import { getAdvancedCreditCost, DEFAULT_SEARCH_CREDIT_COST } from '../../../config/credits.config';

@Injectable()
export class AdvancedCreditsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async deduct(user: AuthenticatedUser, credits: number, operation: string): Promise<number> {
    const dbUser = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.credits < credits) {
      throw new ForbiddenException(`Créditos insuficientes para ${operation}`);
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: credits } },
    });
    return dbUser.credits - credits;
  }

  costFor(operation: string): number {
    const fallback = this.configService.get<number>('app.creditsPerSearch', DEFAULT_SEARCH_CREDIT_COST);
    return getAdvancedCreditCost(operation, fallback);
  }
}
