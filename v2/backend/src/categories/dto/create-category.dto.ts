import { IsString, IsOptional, IsBoolean, IsUUID, IsEnum } from 'class-validator';
import { EntityStatus } from '@prisma/client';

export class CreateCategoryDto {
  @IsUUID()
  companyId!: string;

  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsBoolean()
  @IsOptional()
  adminOnly?: boolean;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}
