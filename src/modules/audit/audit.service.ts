import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    action: AuditAction,
    options?: {
      userId?: string;
      resource?: string;
      metadata?: Record<string, unknown>;
      ipAddress?: string;
      userAgent?: string;
    },
  ) {
    await this.prisma.auditLog.create({
      data: {
        action,
        userId: options?.userId,
        resource: options?.resource,
        metadata: (options?.metadata as Prisma.InputJsonValue) ?? undefined,
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent,
      },
    });
  }
}
