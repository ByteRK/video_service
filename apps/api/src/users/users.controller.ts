import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard'; import { SuperAdminGuard } from '../auth/super-admin.guard'; import { AuthUser, RequestUser } from '../common/auth-user'; import { AuditService } from '../audit/audit.service';
import { CreateUserDto, UpdateUserDto } from './dto'; import { UsersService } from './users.service';
@Controller('users') @UseGuards(JwtGuard, SuperAdminGuard) export class UsersController {
  constructor(private users: UsersService, private audit: AuditService) {}
  @Get() list() { return this.users.list(); }
  @Post() async create(@Body() dto: CreateUserDto, @AuthUser() actor: RequestUser) { const user = await this.users.create(dto); await this.audit.record(actor.id, 'CREATE', 'USER', user.id, { username: user.username }); return user; }
  @Patch(':id') async update(@Param('id') id: string, @Body() dto: UpdateUserDto, @AuthUser() actor: RequestUser) { const user = await this.users.update(id, dto); await this.audit.record(actor.id, 'UPDATE', 'USER', id, { username: dto.username, enabled: dto.enabled, passwordReset: !!dto.password }); return user; }
  @Delete(':id') async remove(@Param('id') id: string, @AuthUser() actor: RequestUser) { const result = await this.users.remove(id); await this.audit.record(actor.id, 'DELETE', 'USER', id); return result; }
}
