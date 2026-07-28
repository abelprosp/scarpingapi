import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateApiKeyDto } from './dto/api-key.dto';

@Injectable()
export class ApiKeysService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateApiKeyDto) {
    const userKeys = await this.prisma.apiKey.count({
      where: { userId, status: 'ACTIVE' },
    });

    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    const maxKeys = subscription?.plan.maxApiKeys ?? 1;
    if (userKeys >= maxKeys) {
      throw new ForbiddenException(`Limite de ${maxKeys} API Keys atingido`);
    }

    const rawKey = `sk_${randomBytes(32).toString('hex')}`;
    const keyHash = await bcrypt.hash(rawKey, 12);
    const keyPrefix = rawKey.slice(0, 10);

    const apiKey = await this.prisma.apiKey.create({
      data: {
        userId,
        name: dto.name,
        keyHash,
        keyPrefix,
        rateLimit: dto.rateLimit ?? 100,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey,
      keyPrefix,
      createdAt: apiKey.createdAt,
      message: 'Guarde esta chave em local seguro. Ela não será exibida novamente.',
    };
  }

  async list(userId: string) {
    return this.prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        status: true,
        lastUsedAt: true,
        expiresAt: true,
        rateLimit: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revoke(userId: string, keyId: string) {
    const key = await this.prisma.apiKey.findFirst({
      where: { id: keyId, userId },
    });
    if (!key) throw new NotFoundException('API Key não encontrada');

    return this.prisma.apiKey.update({
      where: { id: keyId },
      data: { status: 'REVOKED' },
    });
  }
}
