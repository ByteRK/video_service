import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export interface RequestUser { id: string; username: string; role: 'SUPER_ADMIN' | 'ADMIN' }
export const AuthUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestUser => ctx.switchToHttp().getRequest().user);
