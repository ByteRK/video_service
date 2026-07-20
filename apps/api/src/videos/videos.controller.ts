import { Body, Controller, Delete, Get, HttpStatus, Param, ParseIntPipe, Patch, Query, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common'; import type { Request, Response } from 'express'; import { createReadStream } from 'node:fs';
import { JwtGuard } from '../auth/jwt.guard'; import { AuthUser, RequestUser } from '../common/auth-user'; import { AuditService } from '../audit/audit.service'; import { BigIntInterceptor } from '../common/bigint.interceptor'; import { UpdateVideoDto } from './dto'; import { VideosService } from './videos.service';
@Controller('videos') @UseInterceptors(BigIntInterceptor) export class VideosController {
  constructor(private videos: VideosService, private audit: AuditService) {}
  @Get() @UseGuards(JwtGuard) list(@Query('page') page = '1', @Query('pageSize') pageSize = '20', @Query('keyword') keyword = '') { return this.videos.list(Math.max(1, Number(page)), Math.min(100, Math.max(1, Number(pageSize))), keyword); }
  @Patch(':id') @UseGuards(JwtGuard) async update(@Param('id') id: string, @Body() dto: UpdateVideoDto, @AuthUser() user: RequestUser) { const result = await this.videos.update(id, dto); await this.audit.record(user.id, dto.status ? dto.status : 'RENAME', 'VIDEO', id, dto); return result; }
  @Delete(':id') @UseGuards(JwtGuard) async remove(@Param('id') id: string, @AuthUser() user: RequestUser) { const result = await this.videos.remove(id); await this.audit.record(user.id, 'DELETE', 'VIDEO', id); return result; }
  @Get('public/:publicId') info(@Param('publicId') publicId: string) { return this.videos.publicInfo(publicId); }
  @Get('public/:publicId/stream') async stream(@Param('publicId') publicId: string, @Req() req: Request, @Res() res: Response) {
    const data = await this.videos.streamInfo(publicId); if (data.disabled) return res.status(HttpStatus.GONE).json({ message: '视频已停用' });
    const { video, path, size } = data; const range = req.headers.range; res.setHeader('Accept-Ranges', 'bytes'); res.setHeader('Content-Type', video.mimeType || 'application/octet-stream'); res.setHeader('Content-Disposition', 'inline');
    if (!range) { res.setHeader('Content-Length', size); return createReadStream(path).pipe(res); }
    const match = /^bytes=(\d*)-(\d*)$/.exec(range); if (!match) return res.status(416).setHeader('Content-Range', `bytes */${size}`).end();
    const start = match[1] ? Number(match[1]) : 0, end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1; if (start > end || start >= size) return res.status(416).setHeader('Content-Range', `bytes */${size}`).end();
    res.status(206); res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`); res.setHeader('Content-Length', end - start + 1); return createReadStream(path, { start, end }).pipe(res);
  }
}
