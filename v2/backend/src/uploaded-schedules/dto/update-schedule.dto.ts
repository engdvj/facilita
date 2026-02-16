import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { ContentVisibility, EntityStatus } from '@prisma/client';

export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  fileSize?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imagePosition?: string;

  @IsOptional()
  @IsNumber()
  imageScale?: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string | null;

  @IsOptional()
  @IsEnum(ContentVisibility)
  visibility?: ContentVisibility;

  @IsOptional()
  @IsString()
  publicToken?: string | null;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}
