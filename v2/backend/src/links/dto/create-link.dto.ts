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

export class CreateLinkDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @IsUrl({ require_tld: false })
  url!: string;

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
  categoryId?: string;

  @IsOptional()
  @IsEnum(ContentVisibility)
  visibility?: ContentVisibility;

  @IsOptional()
  @IsString()
  publicToken?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}
