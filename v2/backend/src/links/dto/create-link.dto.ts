import { IsString, IsOptional, IsBoolean, IsUUID, IsInt, IsUrl, IsEnum, IsNumber } from 'class-validator';
import { ContentAudience, EntityStatus } from '@prisma/client';

export class CreateLinkDto {
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

  @IsUrl()
  url!: string;

  @IsString()
  @IsOptional()
  description?: string;

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

  @IsInt()
  @IsOptional()
  order?: number;

  @IsEnum(EntityStatus)
  @IsOptional()
  status?: EntityStatus;
}
