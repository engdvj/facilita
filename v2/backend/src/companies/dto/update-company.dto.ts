import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { EntityStatus } from '@prisma/client';

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}