import { Injectable } from '@nestjs/common';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { backupEntities, type BackupEntity } from '../backups/backups.types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResetsService {
  constructor(private readonly prisma: PrismaService) {}

  async reset(entities: BackupEntity[]) {
    const selection = new Set<BackupEntity>(entities);
    const resetAll = backupEntities.every((entity) => selection.has(entity));
    const shouldSeedUsers = resetAll || selection.has('users');
    const shouldSeedPermissions = resetAll || selection.has('rolePermissions');

    const deleted: Partial<Record<BackupEntity, number>> = {};

    await this.prisma.$transaction(async (tx) => {
      if (selection.has('favorites')) {
        deleted.favorites = (await tx.favorite.deleteMany()).count;
      }

      if (selection.has('shares')) {
        deleted.shares = (await tx.share.deleteMany()).count;
      }

      if (selection.has('notifications')) {
        deleted.notifications = (await tx.notification.deleteMany()).count;
      }

      if (selection.has('links')) {
        deleted.links = (await tx.link.deleteMany()).count;
      }

      if (selection.has('uploadedSchedules')) {
        deleted.uploadedSchedules = (await tx.uploadedSchedule.deleteMany()).count;
      }

      if (selection.has('notes')) {
        deleted.notes = (await tx.note.deleteMany()).count;
      }

      if (selection.has('uploadedImages')) {
        deleted.uploadedImages = (await tx.uploadedImage.deleteMany()).count;
      }

      if (selection.has('categories')) {
        deleted.categories = (await tx.category.deleteMany()).count;
      }

      if (selection.has('systemConfig')) {
        deleted.systemConfig = (await tx.systemConfig.deleteMany()).count;
      }

      if (selection.has('users')) {
        await tx.refreshToken.deleteMany();
        deleted.users = (await tx.user.deleteMany()).count;
      }

      if (selection.has('rolePermissions')) {
        deleted.rolePermissions = (await tx.rolePermission.deleteMany()).count;
      }

      if (shouldSeedUsers) {
        await this.seedSuperAdmin(tx);
      }

      if (shouldSeedPermissions) {
        await this.seedRolePermissions(tx);
      }
    });

    return {
      deleted,
      entities: Array.from(selection),
      seeded: shouldSeedUsers || shouldSeedPermissions,
    };
  }

  private async seedRolePermissions(tx: Prisma.TransactionClient) {
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
      await tx.rolePermission.upsert({
        where: { role: rolePermission.role },
        update: rolePermission,
        create: rolePermission,
      });
    }
  }

  private async seedSuperAdmin(tx: Prisma.TransactionClient) {
    const email = process.env.SUPERADMIN_EMAIL || 'superadmin@facilita.local';
    const password = process.env.SUPERADMIN_PASSWORD || 'superadmin';
    const name = process.env.SUPERADMIN_NAME || 'Superadmin';
    const passwordHash = await bcrypt.hash(password, 12);

    await tx.user.upsert({
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
}
