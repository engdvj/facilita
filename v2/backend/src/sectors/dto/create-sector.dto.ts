import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, IsUUID, MinLength, ValidateNested } from 'class-validator';
import { EntityStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class SectorUnitDto {
  @IsUUID()
  unitId!: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class CreateSectorDto {
  @IsUUID()
  companyId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectorUnitDto)
  units!: SectorUnitDto[]; // Array de unidades vinculadas ao setor

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}
