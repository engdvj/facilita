import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        companyId: string | null;
        avatarUrl: string | null;
        theme: import("@prisma/client/runtime/client").JsonValue;
        userSectors: ({
            sector: {
                sectorUnits: ({
                    unit: {
                        id: string;
                        cnpj: string | null;
                        name: string;
                        status: import(".prisma/client").$Enums.EntityStatus;
                        createdAt: Date;
                        updatedAt: Date;
                        companyId: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    sectorId: string;
                    isPrimary: boolean;
                    unitId: string;
                })[];
            } & {
                id: string;
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
                description: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            role: import(".prisma/client").$Enums.SectorRole;
            sectorId: string;
            isPrimary: boolean;
            userId: string;
        })[];
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        companyId: string | null;
        avatarUrl: string | null;
        theme: import("@prisma/client/runtime/client").JsonValue;
        userSectors: ({
            sector: {
                sectorUnits: ({
                    unit: {
                        id: string;
                        cnpj: string | null;
                        name: string;
                        status: import(".prisma/client").$Enums.EntityStatus;
                        createdAt: Date;
                        updatedAt: Date;
                        companyId: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    sectorId: string;
                    isPrimary: boolean;
                    unitId: string;
                })[];
            } & {
                id: string;
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
                description: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            role: import(".prisma/client").$Enums.SectorRole;
            sectorId: string;
            isPrimary: boolean;
            userId: string;
        })[];
    }>;
    getDependencies(id: string): Promise<{
        sectors: number;
        links: number;
        schedules: number;
        notes: number;
        uploadedImages: number;
        linkVersions: number;
        favorites: number;
        refreshTokens: number;
        activityLogs: number;
        auditLogs: number;
        hasAny: boolean;
    }>;
    create(data: CreateUserDto): Promise<{
        id: string;
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        companyId: string | null;
        avatarUrl: string | null;
        theme: import("@prisma/client/runtime/client").JsonValue;
        userSectors: ({
            sector: {
                sectorUnits: ({
                    unit: {
                        id: string;
                        cnpj: string | null;
                        name: string;
                        status: import(".prisma/client").$Enums.EntityStatus;
                        createdAt: Date;
                        updatedAt: Date;
                        companyId: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    sectorId: string;
                    isPrimary: boolean;
                    unitId: string;
                })[];
            } & {
                id: string;
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
                description: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            role: import(".prisma/client").$Enums.SectorRole;
            sectorId: string;
            isPrimary: boolean;
            userId: string;
        })[];
    }>;
    update(id: string, data: UpdateUserDto): Promise<{
        id: string;
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        companyId: string | null;
        avatarUrl: string | null;
        theme: import("@prisma/client/runtime/client").JsonValue;
        userSectors: ({
            sector: {
                sectorUnits: ({
                    unit: {
                        id: string;
                        cnpj: string | null;
                        name: string;
                        status: import(".prisma/client").$Enums.EntityStatus;
                        createdAt: Date;
                        updatedAt: Date;
                        companyId: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    sectorId: string;
                    isPrimary: boolean;
                    unitId: string;
                })[];
            } & {
                id: string;
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
                description: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            role: import(".prisma/client").$Enums.SectorRole;
            sectorId: string;
            isPrimary: boolean;
            userId: string;
        })[];
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        companyId: string | null;
        avatarUrl: string | null;
        theme: import("@prisma/client/runtime/client").JsonValue;
        userSectors: ({
            sector: {
                sectorUnits: ({
                    unit: {
                        id: string;
                        cnpj: string | null;
                        name: string;
                        status: import(".prisma/client").$Enums.EntityStatus;
                        createdAt: Date;
                        updatedAt: Date;
                        companyId: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    sectorId: string;
                    isPrimary: boolean;
                    unitId: string;
                })[];
            } & {
                id: string;
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
                description: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            role: import(".prisma/client").$Enums.SectorRole;
            sectorId: string;
            isPrimary: boolean;
            userId: string;
        })[];
    }>;
}
