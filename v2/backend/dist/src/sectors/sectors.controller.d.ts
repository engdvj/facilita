import { SectorsService } from './sectors.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
export declare class SectorsController {
    private readonly sectorsService;
    constructor(sectorsService: SectorsService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        company: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            cnpj: string | null;
            logoUrl: string | null;
        };
        unit: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            companyId: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            cnpj: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        companyId: string;
        unitId: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        description: string | null;
    })[]>;
    findOne(id: string): Promise<{
        company: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            cnpj: string | null;
            logoUrl: string | null;
        };
        unit: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            companyId: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            cnpj: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        companyId: string;
        unitId: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        description: string | null;
    }>;
    create(data: CreateSectorDto): import(".prisma/client").Prisma.Prisma__SectorClient<{
        company: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            cnpj: string | null;
            logoUrl: string | null;
        };
        unit: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            companyId: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            cnpj: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        companyId: string;
        unitId: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        description: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, data: UpdateSectorDto): Promise<{
        company: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            cnpj: string | null;
            logoUrl: string | null;
        };
        unit: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            companyId: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            cnpj: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        companyId: string;
        unitId: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        description: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        companyId: string;
        unitId: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        description: string | null;
    }>;
}
