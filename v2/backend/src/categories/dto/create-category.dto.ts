import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @IsUUID()
  companyId!: string;

  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsBoolean()
  @IsOptional()
  adminOnly?: boolean;
}
