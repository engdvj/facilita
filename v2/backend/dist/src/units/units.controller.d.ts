import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
export declare class UnitsController {
    private readonly unitsService;
    constructor(unitsService: UnitsService);
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        companyId: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        cnpj: string | null;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        companyId: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        cnpj: string | null;
    }>;
    create(data: CreateUnitDto): import(".prisma/client").Prisma.Prisma__UnitClient<{
        company: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            cnpj: string | null;
            logoUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        companyId: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        cnpj: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, data: UpdateUnitDto): Promise<{
        company: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            cnpj: string | null;
            logoUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        companyId: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        cnpj: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        companyId: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        cnpj: string | null;
    }>;
}
