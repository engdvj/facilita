import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  getRolePermission(role: UserRole) {
    return this.prisma.rolePermission.findUnique({ where: { role } });
  }

  findAll() {
    return this.prisma.rolePermission.findMany({
      orderBy: { role: 'asc' },
    });
  }

  async hasPermissions(role: UserRole, permissions: string[]): Promise<boolean> {
    const rolePermission = await this.getRolePermission(role);

    if (!rolePermission) {
      return false;
    }

    const flags = rolePermission as Record<string, unknown>;
    return permissions.every((permission) => flags[permission] === true);
  }

  async updateRolePermissions(
    role: UserRole,
    data: UpdateRolePermissionDto,
  ) {
    return this.prisma.rolePermission.upsert({
      where: { role },
      update: data,
      create: {
        role,
        ...data,
      },
    });
  }
}
