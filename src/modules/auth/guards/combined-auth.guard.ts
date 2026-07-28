import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { IS_PUBLIC_KEY } from '../../../common/decorators/auth.decorator';
import { FastifyRequest } from 'fastify';

@Injectable()
export class CombinedAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<FastifyRequest & { user?: unknown }>();

    const apiKey = request.headers['x-api-key'] as string;
    if (apiKey) {
      const user = await this.authService.validateApiKey(apiKey);
      if (user) {
        request.user = user;
        return true;
      }
      throw new UnauthorizedException('API Key inválida');
    }

    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const payload = this.jwtService.verify<{ sub: string }>(token);
        const user = await this.authService.validateUser(payload.sub);
        if (user) {
          request.user = user;
          return true;
        }
      } catch {
        throw new UnauthorizedException('Token inválido');
      }
    }

    throw new UnauthorizedException('Autenticação necessária. Use Bearer token ou X-API-Key');
  }
}
