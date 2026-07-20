import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
@Injectable() export class AuditService {
  constructor(private prisma: PrismaService) {}
  record(actorId: string, action: string, targetType: string, targetId?: string, detail?: object, ip?: string) {
    return this.prisma.auditLog.create({ data: { actorId, action, targetType, targetId, detail: detail ? JSON.stringify(detail) : null, ip } });
  }
}
