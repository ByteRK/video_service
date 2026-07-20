import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
@Injectable() export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    if (context.switchToHttp().getRequest().user?.role !== 'SUPER_ADMIN') throw new ForbiddenException('仅超级管理员可操作');
    return true;
  }
}
