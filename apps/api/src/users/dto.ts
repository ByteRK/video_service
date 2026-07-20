import { IsBoolean, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
export class CreateUserDto {
  @IsString() @Matches(/^[a-zA-Z0-9_.-]+$/) @MinLength(3) @MaxLength(50) username!: string;
  @IsString() @MinLength(8) @MaxLength(128) password!: string;
}
export class UpdateUserDto {
  @IsOptional() @IsString() @Matches(/^[a-zA-Z0-9_.-]+$/) @MinLength(3) @MaxLength(50) username?: string;
  @IsOptional() @IsString() @MinLength(8) @MaxLength(128) password?: string;
  @IsOptional() @IsBoolean() enabled?: boolean;
}
