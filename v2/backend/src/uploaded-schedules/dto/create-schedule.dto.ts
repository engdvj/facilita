import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsInt,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { ContentAudience, EntityStatus } from '@prisma/client';

export class CreateScheduleDto {
  @IsUUID()
  companyId!: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsUUID()
  @IsOptional()
  sectorId?: string;

  @IsUUID()
  @IsOptional()
  unitId?: string | null;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsString()
  title!: string;

  @IsString()
  fileUrl!: string;

  @IsString()
  fileName!: string;

  @IsInt()
  fileSize!: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  imagePosition?: string;

  @IsNumber()
  @IsOptional()
  imageScale?: number;

  @IsEnum(ContentAudience)
  @IsOptional()
  audience?: ContentAudience;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsEnum(EntityStatus)
  @IsOptional()
  status?: EntityStatus;
}
