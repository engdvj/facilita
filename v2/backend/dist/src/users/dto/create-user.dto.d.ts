import { UserRole, UserStatus, SectorRole } from '@prisma/client';
export declare class UserSectorDto {
    sectorId: string;
    unitIds?: string[];
    isPrimary?: boolean;
    role?: SectorRole;
}
export declare class CreateUserDto {
    name: string;
    username: string;
    password: string;
    role?: UserRole;
    status?: UserStatus;
    companyId?: string;
    sectors?: UserSectorDto[];
    avatarUrl?: string;
    theme?: Record<string, unknown>;
}
