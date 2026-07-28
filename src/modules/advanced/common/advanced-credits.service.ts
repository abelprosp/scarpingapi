import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { AuthenticatedUser } from '../../../common/decorators/auth.decorator';

@Injectable()
export class AdvancedCreditsService {
  private readonly defaultCost: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.defaultCost = this.configService.get<number>('app.creditsPerSearch', 1);
  }

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
    const costs: Record<string, number> = {
      crawl: 5,
      extract: 2,
      screenshot: 3,
      pdf: 3,
      research: 10,
      'ai-search': 5,
      'deep-research': 25,
      'dataset-query': 2,
      'rag-index': 5,
      'rag-query': 3,
      browser: 4,
    };
    return costs[operation] ?? this.defaultCost;
  }
}
