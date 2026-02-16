import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createPrismaAdapter } from '../src/prisma/prisma-adapter';
import { SYSTEM_CONFIG_DEFAULTS } from '../src/system-config/system-config.defaults';

const prisma = new PrismaClient({ adapter: createPrismaAdapter() });

async function seedRolePermissions() {
  const roles = [
    {
      role: UserRole.USER,
      canViewDashboard: false,
      canAccessAdmin: false,
      canViewUsers: false,
      canCreateUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canViewLinks: true,
      canManageLinks: true,
      canManageCategories: true,
      canManageSchedules: true,
      canViewPrivateContent: false,
      canBackupSystem: false,
      canResetSystem: false,
      canViewAuditLogs: false,
      canManageSystemConfig: false,
      canManageShares: true,
    },
    {
      role: UserRole.SUPERADMIN,
      canViewDashboard: true,
      canAccessAdmin: true,
      canViewUsers: true,
      canCreateUsers: true,
      canEditUsers: true,
      canDeleteUsers: true,
      canViewLinks: true,
      canManageLinks: true,
      canManageCategories: true,
      canManageSchedules: true,
      canViewPrivateContent: true,
      canBackupSystem: true,
      canResetSystem: true,
      canViewAuditLogs: true,
      canManageSystemConfig: true,
      canManageShares: false,
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
  const email = process.env.SUPERADMIN_EMAIL || 'superadmin@facilita.local';
  const password = process.env.SUPERADMIN_PASSWORD || 'superadmin';
  const name = process.env.SUPERADMIN_NAME || 'Superadmin';

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: UserRole.SUPERADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      name,
      email,
      passwordHash,
      role: UserRole.SUPERADMIN,
      status: UserStatus.ACTIVE,
    },
  });
}

async function seedSystemConfig() {
  for (const entry of SYSTEM_CONFIG_DEFAULTS) {
    await prisma.systemConfig.upsert({
      where: { key: entry.key },
      update: {
        description: entry.description,
        type: entry.type,
        isEditable: entry.isEditable,
        category: entry.category,
      },
      create: entry,
    });
  }
}

async function main() {
  await seedRolePermissions();
  await seedSuperAdmin();
  await seedSystemConfig();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
