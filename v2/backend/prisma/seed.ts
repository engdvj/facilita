import { EntityStatus, PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createPrismaAdapter } from '../src/prisma/prisma-adapter';
import { SYSTEM_CONFIG_DEFAULTS } from '../src/system-config/system-config.defaults';
import { isUserMode } from '../src/common/app-mode';

const prisma = new PrismaClient({ adapter: createPrismaAdapter() });
const ADM_COMPANY_ID = '00000000-0000-4000-8000-000000000001';

async function seedAdmCompany() {
  await prisma.company.upsert({
    where: { id: ADM_COMPANY_ID },
    update: { name: 'ADM', status: 'ACTIVE' },
    create: {
      id: ADM_COMPANY_ID,
      name: 'ADM',
      status: 'ACTIVE',
    },
  });
}

async function seedRolePermissions() {
  const roles = [
    {
      role: UserRole.COLLABORATOR,
      canViewLinks: true,
      canManageLinks: true,
      restrictToOwnSector: true,
    },
    {
      role: UserRole.ADMIN,
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
      role: UserRole.SUPERADMIN,
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
  const email = 'superadmin';
  const password = 'superadmin';
  const name = 'Superadmin';

  const passwordHash = await bcrypt.hash(password, 12);

  if (isUserMode()) {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      await seedPersonalCompany(existing.id, name);
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name,
          passwordHash,
          role: UserRole.SUPERADMIN,
          status: UserStatus.ACTIVE,
          companyId: existing.id,
        },
      });
      return;
    }

    const created = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: UserRole.SUPERADMIN,
        status: UserStatus.ACTIVE,
      },
      select: { id: true },
    });

    await seedPersonalCompany(created.id, name);
    await prisma.user.update({
      where: { id: created.id },
      data: { companyId: created.id },
    });
    return;
  }

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: UserRole.SUPERADMIN,
      status: UserStatus.ACTIVE,
      companyId: ADM_COMPANY_ID,
    },
    create: {
      name,
      email,
      passwordHash,
      role: UserRole.SUPERADMIN,
      status: UserStatus.ACTIVE,
      companyId: ADM_COMPANY_ID,
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

async function seedPersonalCompany(userId: string, userName: string) {
  const companyName = userName?.trim() ? `Usuario ${userName}` : 'Usuario';
  await prisma.company.upsert({
    where: { id: userId },
    update: { name: companyName, status: EntityStatus.ACTIVE },
    create: {
      id: userId,
      name: companyName,
      status: EntityStatus.ACTIVE,
    },
  });
}

async function main() {
  if (!isUserMode()) {
    await seedAdmCompany();
  }
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
