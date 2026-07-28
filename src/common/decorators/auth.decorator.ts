import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  credits: number;
  apiKeyId?: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest & { user: AuthenticatedUser }>();
    return request.user;
  },
);
