import { UserRole, UserStatus } from '@prisma/client';
export declare class UpdateUserDto {
    name?: string;
    username?: string;
    password?: string;
    role?: UserRole;
    status?: UserStatus;
    companyId?: string;
    unitId?: string;
    sectorId?: string;
    avatarUrl?: string;
    theme?: Record<string, unknown>;
}
