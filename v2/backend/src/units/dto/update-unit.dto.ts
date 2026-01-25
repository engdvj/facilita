import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { EntityStatus } from '@prisma/client';

export class UpdateUnitDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}
