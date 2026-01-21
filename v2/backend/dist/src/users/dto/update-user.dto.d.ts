import { UserRole, UserStatus, SectorRole } from '@prisma/client';
export declare class UpdateUserSectorDto {
    sectorId: string;
    isPrimary?: boolean;
    role?: SectorRole;
}
export declare class UpdateUserDto {
    name?: string;
    username?: string;
    password?: string;
    role?: UserRole;
    status?: UserStatus;
    companyId?: string;
    sectors?: UpdateUserSectorDto[];
    avatarUrl?: string;
    theme?: Record<string, unknown>;
}
