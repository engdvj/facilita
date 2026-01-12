import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { ContentAudience, EntityStatus } from '@prisma/client';

export class CreateNoteDto {
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
  categoryId?: string;

  @IsString()
  title!: string;

  @IsString()
  content!: string;

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
