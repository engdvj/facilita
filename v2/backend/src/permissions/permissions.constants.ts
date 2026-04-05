import { UserRole } from '@prisma/client';

export const permissionKeys = [
  'canViewHome',
  'canViewDashboard',
  'canViewFavorites',
  'canViewSharesPage',
  'canAccessAdmin',
  'canViewUsers',
  'canCreateUsers',
  'canEditUsers',
  'canDeleteUsers',
  'canViewCategories',
  'canManageCategories',
  'canViewLinks',
  'canManageLinks',
  'canViewSchedules',
  'canManageSchedules',
  'canViewNotes',
  'canManageNotes',
  'canViewImages',
  'canManageImages',
  'canBackupSystem',
  'canResetSystem',
  'canManageSystemConfig',
  'canManageShares',
] as const;

export type PermissionKey = (typeof permissionKeys)[number];

export type PermissionFlags = Record<PermissionKey, boolean>;

const buildPermissionFlags = (enabledKeys: PermissionKey[]): PermissionFlags =>
  permissionKeys.reduce<PermissionFlags>((acc, key) => {
    acc[key] = enabledKeys.includes(key);
    return acc;
  }, {} as PermissionFlags);

export const defaultRolePermissions: Record<UserRole, PermissionFlags> = {
  [UserRole.SUPERADMIN]: buildPermissionFlags([
    'canViewHome',
    'canViewDashboard',
    'canViewFavorites',
    'canAccessAdmin',
    'canViewUsers',
    'canCreateUsers',
    'canEditUsers',
    'canDeleteUsers',
    'canViewCategories',
    'canManageCategories',
    'canViewLinks',
    'canManageLinks',
    'canViewSchedules',
    'canManageSchedules',
    'canViewNotes',
    'canManageNotes',
    'canViewImages',
    'canManageImages',
    'canBackupSystem',
    'canResetSystem',
    'canManageSystemConfig',
  ]),
  [UserRole.USER]: buildPermissionFlags([
    'canViewHome',
    'canViewFavorites',
    'canViewSharesPage',
    'canViewCategories',
    'canAccessAdmin',
    'canViewLinks',
    'canManageLinks',
    'canManageCategories',
    'canViewSchedules',
    'canManageSchedules',
    'canViewNotes',
    'canManageNotes',
    'canViewImages',
    'canManageImages',
    'canManageShares',
  ]),
};
