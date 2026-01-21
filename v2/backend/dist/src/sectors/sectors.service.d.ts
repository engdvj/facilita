import { PrismaService } from '../prisma/prisma.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
export declare class SectorsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        company: {
            id: string;
            cnpj: string | null;
            name: string;
            logoUrl: string | null;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
        };
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
    })[]>;
    findById(id: string): Promise<{
        company: {
            id: string;
            cnpj: string | null;
            name: string;
            logoUrl: string | null;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
        };
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
    }>;
    create(data: CreateSectorDto): import(".prisma/client").Prisma.Prisma__SectorClient<{
        company: {
            id: string;
            cnpj: string | null;
            name: string;
            logoUrl: string | null;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
        };
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
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, data: UpdateSectorDto): Promise<{
        company: {
            id: string;
            cnpj: string | null;
            name: string;
            logoUrl: string | null;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
        };
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
    }>;
    getDependencies(id: string): Promise<{
        users: number;
        units: number;
        links: number;
        schedules: number;
        notes: number;
        hasAny: boolean;
    }>;
    remove(id: string): Promise<{
        company: {
            id: string;
            cnpj: string | null;
            name: string;
            logoUrl: string | null;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
        };
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
    }>;
}
