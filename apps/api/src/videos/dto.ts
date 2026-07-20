import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
export class UpdateVideoDto { @IsOptional() @IsString() @MinLength(1) @MaxLength(200) name?: string; @IsOptional() @IsIn(['ACTIVE','DISABLED']) status?: 'ACTIVE'|'DISABLED'; }
