import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SYSTEM_CONFIG_DEFAULTS } from '../system-config/system-config.defaults';
import { isUserMode } from '../common/app-mode';

@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      await this.ensureBootstrapData();
    } catch (error) {
      this.logger.error('Failed to bootstrap initial data.', error as Error);
    }
  }

  private async ensureBootstrapData() {
    await this.ensureRolePermissions();
    await this.ensureSuperAdmin();
    await this.ensureSystemConfig();
  }

  private async ensureRolePermissions() {
    const roles = [
      {
        role: UserRole.COLLABORATOR,
        canViewLinks: true,
        canManageLinks: true,
        restrictToOwnSector: !isUserMode(),
      },
      {
        role: UserRole.ADMIN,
        canViewDashboard: true,
        canAccessAdmin: true,
        canViewUsers: true,
        canCreateUsers: true,
        canEditUsers: true,
        canDeleteUsers: true,
        canViewSectors: !isUserMode(),
        canManageSectors: !isUserMode(),
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
        canViewSectors: !isUserMode(),
        canManageSectors: !isUserMode(),
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
      await this.prisma.rolePermission.upsert({
        where: { role: rolePermission.role },
        update: rolePermission,
        create: rolePermission,
      });
    }
  }

  private async ensureSuperAdmin() {
    const email =
      this.config.get<string>('SUPERADMIN_EMAIL')?.trim() || 'superadmin';
    const password =
      this.config.get<string>('SUPERADMIN_PASSWORD')?.trim() || 'superadmin';
    const name =
      this.config.get<string>('SUPERADMIN_NAME')?.trim() || 'Superadmin';
    const passwordHash = await bcrypt.hash(password, 12);

    if (isUserMode()) {
      const existing = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existing) {
        await this.prisma.user.update({
          where: { id: existing.id },
          data: {
            name,
            passwordHash,
            role: UserRole.SUPERADMIN,
            status: UserStatus.ACTIVE,
            companyId: existing.id,
          },
        });
      } else {
        const created = await this.prisma.user.create({
          data: {
            name,
            email,
            passwordHash,
            role: UserRole.SUPERADMIN,
            status: UserStatus.ACTIVE,
          },
          select: { id: true },
        });

        await this.prisma.user.update({
          where: { id: created.id },
          data: { companyId: created.id },
        });
      }
    } else {
      await this.prisma.user.upsert({
        where: { email },
        update: {
          name,
          passwordHash,
          role: UserRole.SUPERADMIN,
          status: UserStatus.ACTIVE,
          companyId: '00000000-0000-4000-8000-000000000001',
        },
        create: {
          name,
          email,
          passwordHash,
          role: UserRole.SUPERADMIN,
          status: UserStatus.ACTIVE,
          companyId: '00000000-0000-4000-8000-000000000001',
        },
      });
    }

    this.logger.log(`Superadmin created with email: ${email}`);
  }

  private async ensureSystemConfig() {
    for (const entry of SYSTEM_CONFIG_DEFAULTS) {
      await this.prisma.systemConfig.upsert({
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

}
