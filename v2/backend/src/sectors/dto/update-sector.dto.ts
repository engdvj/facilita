import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { EntityStatus } from '@prisma/client';

export class UpdateSectorDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  unitId?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}