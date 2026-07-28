import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email já cadastrado');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const freeCredits = this.configService.get<number>('app.defaultFreeCredits', 2500);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        credits: freeCredits,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { user: { id: user.id, email: user.email, name: user.name, credits: user.credits }, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.isActive) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, credits: user.credits },
      ...tokens,
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId, isActive: true },
      select: { id: true, email: true, role: true, credits: true },
    });
  }

  async validateApiKey(apiKey: string) {
    const keys = await this.prisma.apiKey.findMany({
      where: { status: 'ACTIVE' },
      include: { user: { select: { id: true, email: true, role: true, credits: true, isActive: true } } },
    });

    for (const key of keys) {
      const match = await bcrypt.compare(apiKey, key.keyHash);
      if (match && key.user.isActive) {
        await this.prisma.apiKey.update({
          where: { id: key.id },
          data: { lastUsedAt: new Date() },
        });
        return { ...key.user, apiKeyId: key.id };
      }
    }
    return null;
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.secret'),
        expiresIn: this.configService.get('jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
