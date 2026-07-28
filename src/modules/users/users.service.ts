import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        credits: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
        subscription: { include: { plan: true } },
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async updateProfile(id: string, data: { name?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true },
    });
  }
}
