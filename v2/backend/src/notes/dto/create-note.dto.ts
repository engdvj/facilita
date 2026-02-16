import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ContentVisibility, EntityStatus } from '@prisma/client';

export class CreateNoteDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(1)
  content!: string;

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
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}
