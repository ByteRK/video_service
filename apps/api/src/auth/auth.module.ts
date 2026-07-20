import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtGuard } from './jwt.guard';
import { SuperAdminGuard } from './super-admin.guard';
@Module({ imports: [JwtModule.registerAsync({ global: true, inject: [ConfigService], useFactory: (config: ConfigService) => ({ secret: config.get<string>('JWT_SECRET') || 'development-only-change-this-secret', signOptions: { expiresIn: 8 * 60 * 60 } }) })], controllers: [AuthController], providers: [AuthService, JwtGuard, SuperAdminGuard], exports: [JwtGuard, SuperAdminGuard] }) export class AuthModule {}
