import { IsString, IsOptional, IsBoolean, IsUUID, IsInt, IsUrl } from 'class-validator';

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

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsInt()
  @IsOptional()
  order?: number;
}
