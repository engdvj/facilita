import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class PermissionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getRolePermission(role: UserRole): import(".prisma/client").Prisma.Prisma__RolePermissionClient<{
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        canViewDashboard: boolean;
        canAccessAdmin: boolean;
        canViewUsers: boolean;
        canCreateUsers: boolean;
        canEditUsers: boolean;
        canDeleteUsers: boolean;
        canViewSectors: boolean;
        canManageSectors: boolean;
        canViewLinks: boolean;
        canManageLinks: boolean;
        canManageCategories: boolean;
        canManageSchedules: boolean;
        canBackupSystem: boolean;
        canResetSystem: boolean;
        canViewAuditLogs: boolean;
        canManageSystemConfig: boolean;
        restrictToOwnSector: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    hasPermissions(role: UserRole, permissions: string[]): Promise<boolean>;
}
