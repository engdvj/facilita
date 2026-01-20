import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, IsUUID, MinLength, ValidateNested } from 'class-validator';
import { EntityStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateSectorUnitDto {
  @IsUUID()
  unitId!: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class UpdateSectorDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSectorUnitDto)
  units?: UpdateSectorUnitDto[]; // Array de unidades vinculadas ao setor

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