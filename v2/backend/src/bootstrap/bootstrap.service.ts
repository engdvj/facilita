import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SYSTEM_CONFIG_DEFAULTS } from '../system-config/system-config.defaults';

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
      await this.prisma.rolePermission.upsert({
        where: { role: rolePermission.role },
        update: rolePermission,
        create: rolePermission,
      });
    }
  }

  private async ensureSuperAdmin() {
    const email =
      this.config.get<string>('SUPERADMIN_EMAIL')?.trim() || 'superadmin@facilita.local';
    const password =
      this.config.get<string>('SUPERADMIN_PASSWORD')?.trim() || 'superadmin';
    const name =
      this.config.get<string>('SUPERADMIN_NAME')?.trim() || 'Superadmin';
    const passwordHash = await bcrypt.hash(password, 12);

    await this.prisma.user.upsert({
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
