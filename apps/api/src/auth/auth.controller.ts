import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import { JwtGuard } from './jwt.guard';
import { AuthUser, RequestUser } from '../common/auth-user';

@Controller('auth')
export class AuthController {
  private attempts = new Map<string, { count: number; reset: number }>();
  constructor(private auth: AuthService) {}
  @Post('login') async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const ip = req.ip || 'unknown', now = Date.now(), max = Number(process.env.LOGIN_RATE_LIMIT || 10);
    let state = this.attempts.get(ip); if (!state || state.reset < now) state = { count: 0, reset: now + 15 * 60_000 };
    if (state.count >= max) throw new HttpException('登录尝试过多，请稍后再试', HttpStatus.TOO_MANY_REQUESTS);
    try {
      const result = await this.auth.login(dto); this.attempts.delete(ip);
      res.cookie('video_admin_token', result.token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 8 * 60 * 60_000, path: '/' });
      return result.user;
    } catch (error) { state.count++; this.attempts.set(ip, state); throw error; }
  }
  @Post('logout') logout(@Res({ passthrough: true }) res: Response) { res.clearCookie('video_admin_token', { path: '/' }); return { ok: true }; }
  @Get('me') @UseGuards(JwtGuard) me(@AuthUser() user: RequestUser) { return user; }
}
