import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateRolePermissionDto {
  @IsOptional()
  @IsBoolean()
  canViewDashboard?: boolean;

  @IsOptional()
  @IsBoolean()
  canAccessAdmin?: boolean;

  @IsOptional()
  @IsBoolean()
  canViewUsers?: boolean;

  @IsOptional()
  @IsBoolean()
  canCreateUsers?: boolean;

  @IsOptional()
  @IsBoolean()
  canEditUsers?: boolean;

  @IsOptional()
  @IsBoolean()
  canDeleteUsers?: boolean;

  @IsOptional()
  @IsBoolean()
  canViewSectors?: boolean;

  @IsOptional()
  @IsBoolean()
  canManageSectors?: boolean;

  @IsOptional()
  @IsBoolean()
  canViewLinks?: boolean;

  @IsOptional()
  @IsBoolean()
  canManageLinks?: boolean;

  @IsOptional()
  @IsBoolean()
  canManageCategories?: boolean;

  @IsOptional()
  @IsBoolean()
  canManageSchedules?: boolean;

  @IsOptional()
  @IsBoolean()
  canBackupSystem?: boolean;

  @IsOptional()
  @IsBoolean()
  canResetSystem?: boolean;

  @IsOptional()
  @IsBoolean()
  canViewAuditLogs?: boolean;

  @IsOptional()
  @IsBoolean()
  canManageSystemConfig?: boolean;

  @IsOptional()
  @IsBoolean()
  restrictToOwnSector?: boolean;
}
