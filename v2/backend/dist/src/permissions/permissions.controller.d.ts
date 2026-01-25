import { UserRole } from '@prisma/client';
import { PermissionsService } from './permissions.service';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    findAll(): any;
    update(role: UserRole, data: UpdateRolePermissionDto): Promise<any>;
}
