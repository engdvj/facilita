import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
export declare class PermissionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getRolePermission(role: UserRole): any;
    findAll(): any;
    hasPermissions(role: UserRole, permissions: string[]): Promise<boolean>;
    updateRolePermissions(role: UserRole, data: UpdateRolePermissionDto): Promise<any>;
}
