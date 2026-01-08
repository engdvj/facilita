import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { EntityStatus } from '@prisma/client';

export class CreateSectorDto {
  @IsUUID()
  companyId!: string;

  @IsUUID()
  unitId!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}