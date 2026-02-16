import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { ContentVisibility, EntityStatus } from '@prisma/client';

export class UpdateLinkDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  url?: string;

  @IsOptional()
  @IsString()
  description?: string;

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
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}
