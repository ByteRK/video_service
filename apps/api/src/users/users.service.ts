import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import * as argon2 from 'argon2';
@Injectable() export class UsersService {
  constructor(private prisma: PrismaService) {}
  list() { return this.prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true, username: true, role: true, enabled: true, createdAt: true, updatedAt: true }, orderBy: { createdAt: 'desc' } }); }
  async create(dto: CreateUserDto) {
    if (await this.prisma.user.findUnique({ where: { username: dto.username } })) throw new ConflictException('用户名已存在');
    return this.prisma.user.create({ data: { username: dto.username, passwordHash: await argon2.hash(dto.password) }, select: { id: true, username: true, role: true, enabled: true, createdAt: true } });
  }
  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findFirst({ where: { id, role: 'ADMIN' } }); if (!user) throw new NotFoundException('账号不存在');
    if (dto.username && dto.username !== user.username && await this.prisma.user.findUnique({ where: { username: dto.username } })) throw new ConflictException('用户名已存在');
    return this.prisma.user.update({ where: { id }, data: { username: dto.username, enabled: dto.enabled, passwordHash: dto.password ? await argon2.hash(dto.password) : undefined }, select: { id: true, username: true, role: true, enabled: true, createdAt: true } });
  }
  async remove(id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, role: 'ADMIN' } }); if (!user) throw new NotFoundException('账号不存在');
    const [videos, uploads, audits] = await Promise.all([this.prisma.video.count({ where: { uploaderId: id } }), this.prisma.uploadSession.count({ where: { uploaderId: id } }), this.prisma.auditLog.count({ where: { actorId: id } })]);
    if (videos || uploads || audits) return this.prisma.user.update({ where: { id }, data: { enabled: false }, select: { id: true, enabled: true } });
    await this.prisma.user.delete({ where: { id } }); return { id, deleted: true };
  }
}
