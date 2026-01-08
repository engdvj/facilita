import { IsString, IsOptional, IsBoolean, IsUUID, IsInt } from 'class-validator';

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
  categoryId?: string;

  @IsString()
  title!: string;

  @IsString()
  fileUrl!: string;

  @IsString()
  fileName!: string;

  @IsInt()
  fileSize!: number;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
