import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from '../../../common/decorators/auth.decorator';
import { getAdvancedCreditCost, DEFAULT_SEARCH_CREDIT_COST } from '../../../config/credits.config';
import { CreditsService } from '../../credits/credits.service';

@Injectable()
export class AdvancedCreditsService {
  constructor(
    private readonly creditsService: CreditsService,
    private readonly configService: ConfigService,
  ) {}

  async deduct(user: AuthenticatedUser, credits: number, _operation: string): Promise<number> {
    return this.creditsService.deduct(user, credits);
  }

  costFor(operation: string): number {
    const fallback = this.configService.get<number>('app.creditsPerSearch', DEFAULT_SEARCH_CREDIT_COST);
    return getAdvancedCreditCost(operation, fallback);
  }
}
