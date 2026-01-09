import { SectorsService } from './sectors.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
export declare class SectorsController {
    private readonly sectorsService;
    constructor(sectorsService: SectorsService);
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
        name: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        unitId: string;
        description: string | null;
    })[]>;
    findOne(id: string): Promise<{
        company: {
            id: string;
            cnpj: string | null;
            name: string;
            logoUrl: string | null;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
        };
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
        name: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        unitId: string;
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
        name: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        unitId: string;
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
        name: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        unitId: string;
        description: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        unitId: string;
        description: string | null;
    }>;
}
