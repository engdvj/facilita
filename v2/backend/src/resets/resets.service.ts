import { Injectable } from '@nestjs/common';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { backupEntities, type BackupEntity } from '../backups/backups.types';
import { PrismaService } from '../prisma/prisma.service';

const ADM_COMPANY_ID = '00000000-0000-4000-8000-000000000001';

@Injectable()
export class ResetsService {
  constructor(private readonly prisma: PrismaService) {}

  async reset(entities: BackupEntity[]) {
    const selection = new Set<BackupEntity>(entities);

    if (selection.has('units')) {
      selection.add('sectors');
    }

    if (selection.has('companies')) {
      selection.add('units');
      selection.add('sectors');
      selection.add('categories');
      selection.add('links');
      selection.add('uploadedSchedules');
      selection.add('notes');
      selection.add('uploadedImages');
    }

    const resolvedEntities = Array.from(selection);
    const resetAll = backupEntities.every((entity) => selection.has(entity));
    const shouldSeedUsers = resetAll || selection.has('users');
    const shouldSeedPermissions = resetAll || selection.has('rolePermissions');
    const deleted: Partial<Record<BackupEntity, number>> = {};

    await this.prisma.$transaction(async (tx) => {
      await this.detachRelations(tx, selection);
      await this.clearDependents(tx, selection, deleted);
      await this.deleteEntities(tx, selection, deleted);

      if (shouldSeedUsers) {
        await this.seedAdmCompany(tx);
        await this.seedSuperAdmin(tx);
      }

      if (shouldSeedPermissions) {
        await this.seedRolePermissions(tx);
      }
    });

    return {
      deleted,
      entities: resolvedEntities,
      seeded: shouldSeedUsers || shouldSeedPermissions,
    };
  }

  private async detachRelations(
    tx: Prisma.TransactionClient,
    selection: Set<BackupEntity>,
  ) {
    if (selection.has('categories') && !selection.has('links')) {
      await tx.link.updateMany({
        data: { categoryId: null },
        where: { categoryId: { not: null } },
      });
    }

    if (selection.has('categories') && !selection.has('uploadedSchedules')) {
      await tx.uploadedSchedule.updateMany({
        data: { categoryId: null },
        where: { categoryId: { not: null } },
      });
    }

    if (selection.has('categories') && !selection.has('notes')) {
      await tx.note.updateMany({
        data: { categoryId: null },
        where: { categoryId: { not: null } },
      });
    }

    if (selection.has('sectors') && !selection.has('links')) {
      await tx.link.updateMany({
        data: { sectorId: null },
        where: { sectorId: { not: null } },
      });
    }

    if (selection.has('sectors') && !selection.has('uploadedSchedules')) {
      await tx.uploadedSchedule.updateMany({
        data: { sectorId: null },
        where: { sectorId: { not: null } },
      });
    }

    if (selection.has('sectors') && !selection.has('notes')) {
      await tx.note.updateMany({
        data: { sectorId: null },
        where: { sectorId: { not: null } },
      });
    }

    // UserSector and SectorUnit relationships will be deleted via cascade
    // when sectors or units are deleted, no need to manually update users

    if (selection.has('companies') && !selection.has('users')) {
      await tx.user.updateMany({
        data: { companyId: null },
        where: { companyId: { not: null } },
      });
    }

    if (selection.has('users')) {
      if (!selection.has('links')) {
        await tx.link.updateMany({
          data: { userId: null },
          where: { userId: { not: null } },
        });
      }

      if (!selection.has('uploadedSchedules')) {
        await tx.uploadedSchedule.updateMany({
          data: { userId: null },
          where: { userId: { not: null } },
        });
      }

      if (!selection.has('notes')) {
        await tx.note.updateMany({
          data: { userId: null },
          where: { userId: { not: null } },
        });
      }

      await tx.activityLog.updateMany({
        data: { userId: null },
        where: { userId: { not: null } },
      });

      await tx.auditLog.updateMany({
        data: { userId: null },
        where: { userId: { not: null } },
      });
    }
  }

  private async clearDependents(
    tx: Prisma.TransactionClient,
    selection: Set<BackupEntity>,
    deleted: Partial<Record<BackupEntity, number>>,
  ) {
    if (selection.has('companies')) {
      // Companies requer deletar uploadedImages porque companyId é obrigatório
      if (!selection.has('uploadedImages')) {
        await tx.uploadedImage.deleteMany();
      }
    }

    if (selection.has('users')) {
      await tx.refreshToken.deleteMany();
      await tx.favorite.deleteMany();

      if (!selection.has('links')) {
        await tx.linkVersion.deleteMany();
      }

      // Users requer deletar uploadedImages porque uploadedBy é obrigatório
      if (!selection.has('uploadedImages')) {
        await tx.uploadedImage.deleteMany();
      }
    } else {
      if (selection.has('links')) {
        await tx.favorite.deleteMany({
          where: { linkId: { not: null } },
        });
      }

      if (selection.has('uploadedSchedules')) {
        await tx.favorite.deleteMany({
          where: { scheduleId: { not: null } },
        });
      }
    }

  }

  private async deleteEntities(
    tx: Prisma.TransactionClient,
    selection: Set<BackupEntity>,
    deleted: Partial<Record<BackupEntity, number>>,
  ) {
    if (selection.has('uploadedSchedules')) {
      deleted.uploadedSchedules = (await tx.uploadedSchedule.deleteMany()).count;
    }

    if (selection.has('notes')) {
      deleted.notes = (await tx.note.deleteMany()).count;
    }

    if (selection.has('links')) {
      deleted.links = (await tx.link.deleteMany()).count;
    }

    if (selection.has('categories')) {
      deleted.categories = (await tx.category.deleteMany()).count;
    }

    if (selection.has('uploadedImages')) {
      deleted.uploadedImages = (await tx.uploadedImage.deleteMany()).count;
    }

    if (selection.has('sectors')) {
      deleted.sectors = (await tx.sector.deleteMany()).count;
    }

    if (selection.has('units')) {
      deleted.units = (await tx.unit.deleteMany()).count;
    }

    if (selection.has('users')) {
      deleted.users = (await tx.user.deleteMany()).count;
    }

    if (selection.has('rolePermissions')) {
      deleted.rolePermissions = (await tx.rolePermission.deleteMany()).count;
    }

    if (selection.has('companies')) {
      deleted.companies = (await tx.company.deleteMany()).count;
    }
  }

  private async seedAdmCompany(tx: Prisma.TransactionClient) {
    await tx.company.upsert({
      where: { id: ADM_COMPANY_ID },
      update: { name: 'ADM', status: 'ACTIVE' },
      create: {
        id: ADM_COMPANY_ID,
        name: 'ADM',
        status: 'ACTIVE',
      },
    });
  }

  private async seedRolePermissions(tx: Prisma.TransactionClient) {
    const roles = [
      {
        role: UserRole.COLLABORATOR,
        canViewLinks: true,
        canManageLinks: true,
        canViewPrivateContent: false,
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
        canViewPrivateContent: false,
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
        canViewPrivateContent: false,
        canBackupSystem: true,
        canResetSystem: true,
        canViewAuditLogs: true,
        canManageSystemConfig: true,
        restrictToOwnSector: false,
      },
    ];

    for (const rolePermission of roles) {
      await tx.rolePermission.upsert({
        where: { role: rolePermission.role },
        update: rolePermission,
        create: rolePermission,
      });
    }
  }

  private async seedSuperAdmin(tx: Prisma.TransactionClient) {
    const email = 'superadmin';
    const password = 'superadmin';
    const name = 'Superadmin';
    const passwordHash = await bcrypt.hash(password, 12);

    await tx.user.upsert({
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
}
