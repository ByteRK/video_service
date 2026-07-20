import { Injectable, NotFoundException } from '@nestjs/common'; import { PrismaService } from '../common/prisma.service'; import { resolve } from 'node:path'; import { rm, stat } from 'node:fs/promises'; import { UpdateVideoDto } from './dto';
@Injectable() export class VideosService {
  private storageDir = resolve(process.cwd(), process.env.STORAGE_DIR || '../../data/videos');
  constructor(private prisma: PrismaService) {}
  async list(page = 1, pageSize = 20, keyword = '') { const where = keyword ? { name: { contains: keyword } } : {}; const [items, total] = await this.prisma.$transaction([this.prisma.video.findMany({ where, include: { uploader: { select: { username: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }), this.prisma.video.count({ where })]); return { items, total, page, pageSize }; }
  async update(id: string, dto: UpdateVideoDto) { await this.ensure(id); return this.prisma.video.update({ where: { id }, data: dto }); }
  async remove(id: string) { const video = await this.ensure(id); await rm(resolve(this.storageDir, video.storedName), { force: true }); await this.prisma.video.delete({ where: { id } }); return { deleted: true }; }
  async publicInfo(publicId: string) { const video = await this.prisma.video.findUnique({ where: { publicId }, select: { publicId: true, name: true, mimeType: true, size: true, status: true, createdAt: true } }); if (!video) throw new NotFoundException('视频不存在或已删除'); return video; }
  async streamInfo(publicId: string) { const video = await this.prisma.video.findUnique({ where: { publicId } }); if (!video) throw new NotFoundException('视频不存在或已删除'); if (video.status === 'DISABLED') return { video, disabled: true as const }; const path = resolve(this.storageDir, video.storedName); const info = await stat(path).catch(() => null); if (!info) throw new NotFoundException('视频文件不存在'); return { video, path, size: info.size, disabled: false as const }; }
  private async ensure(id: string) { const video = await this.prisma.video.findUnique({ where: { id } }); if (!video) throw new NotFoundException('视频不存在'); return video; }
}
