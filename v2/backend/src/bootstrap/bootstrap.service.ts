import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SYSTEM_CONFIG_DEFAULTS } from '../system-config/system-config.defaults';

const ADM_COMPANY_ID = '00000000-0000-4000-8000-000000000001';

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
    await this.ensureAdmCompany();
    await this.ensureRolePermissions();
    await this.ensureSuperAdmin();
    await this.ensureSystemConfig();
  }

  private async ensureAdmCompany() {
    await this.prisma.company.upsert({
      where: { id: ADM_COMPANY_ID },
      update: { name: 'ADM', status: 'ACTIVE' },
      create: {
        id: ADM_COMPANY_ID,
        name: 'ADM',
        status: 'ACTIVE',
      },
    });
  }

  private async ensureRolePermissions() {
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
      const existing = await this.prisma.rolePermission.findUnique({
        where: { role: rolePermission.role },
        select: { id: true },
      });
      if (existing) continue;

      await this.prisma.rolePermission.create({
        data: rolePermission,
      });
    }
  }

  private async ensureSuperAdmin() {
    const existing = await this.prisma.user.findFirst({
      where: { role: UserRole.SUPERADMIN },
      select: { id: true },
    });
    if (existing) return;

    const email =
      this.config.get<string>('SUPERADMIN_EMAIL')?.trim() || 'superadmin';
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
