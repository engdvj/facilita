import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  getRolePermission(role: UserRole) {
    return this.prisma.rolePermission.findUnique({ where: { role } });
  }

  async hasPermissions(role: UserRole, permissions: string[]): Promise<boolean> {
    const rolePermission = await this.getRolePermission(role);

    if (!rolePermission) {
      return false;
    }

    const flags = rolePermission as Record<string, unknown>;
    return permissions.every((permission) => flags[permission] === true);
  }
}
