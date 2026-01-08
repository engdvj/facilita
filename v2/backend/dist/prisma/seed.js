"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma_adapter_1 = require("../src/prisma/prisma-adapter");
const prisma = new client_1.PrismaClient({ adapter: (0, prisma_adapter_1.createPrismaAdapter)() });
async function seedRolePermissions() {
    const roles = [
        {
            role: client_1.UserRole.COLLABORATOR,
            canViewLinks: true,
            restrictToOwnSector: true,
        },
        {
            role: client_1.UserRole.MANAGER,
            canViewDashboard: true,
            canAccessAdmin: true,
            canViewUsers: true,
            canCreateUsers: true,
            canEditUsers: true,
            canViewSectors: true,
            canViewLinks: true,
            canManageLinks: true,
            canManageSchedules: true,
            canViewAuditLogs: true,
            restrictToOwnSector: true,
        },
        {
            role: client_1.UserRole.COORDINATOR,
            canViewDashboard: true,
            canAccessAdmin: true,
            canViewUsers: true,
            canCreateUsers: true,
            canEditUsers: true,
            canViewSectors: true,
            canViewLinks: true,
            canManageLinks: true,
            canManageSchedules: true,
            canViewAuditLogs: true,
            restrictToOwnSector: true,
        },
        {
            role: client_1.UserRole.ADMIN,
            canViewDashboard: true,
            canAccessAdmin: true,
            canViewUsers: true,
            canCreateUsers: true,
            canEditUsers: true,
            canDeleteUsers: true,
            canViewSectors: true,
            canManageSectors: true,
            canViewLinks: true,
            canManageLinks: true,
            canManageCategories: true,
            canManageSchedules: true,
            canBackupSystem: true,
            canResetSystem: true,
            canViewAuditLogs: true,
            canManageSystemConfig: true,
            restrictToOwnSector: false,
        },
        {
            role: client_1.UserRole.SUPERADMIN,
            canViewDashboard: true,
            canAccessAdmin: true,
            canViewUsers: true,
            canCreateUsers: true,
            canEditUsers: true,
            canDeleteUsers: true,
            canViewSectors: true,
            canManageSectors: true,
            canViewLinks: true,
            canManageLinks: true,
            canManageCategories: true,
            canManageSchedules: true,
            canBackupSystem: true,
            canResetSystem: true,
            canViewAuditLogs: true,
            canManageSystemConfig: true,
            restrictToOwnSector: false,
        },
    ];
    for (const rolePermission of roles) {
        await prisma.rolePermission.upsert({
            where: { role: rolePermission.role },
            update: rolePermission,
            create: rolePermission,
        });
    }
}
async function seedSuperAdmin() {
    const email = process.env.SUPERADMIN_EMAIL?.trim() || 'superadmin@facilita.local';
    const password = process.env.SUPERADMIN_PASSWORD || 'ChangeMe123!';
    const name = process.env.SUPERADMIN_NAME?.trim() || 'Super Admin';
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            role: client_1.UserRole.SUPERADMIN,
            status: client_1.UserStatus.ACTIVE,
        },
    });
}
async function main() {
    await seedRolePermissions();
    await seedSuperAdmin();
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map