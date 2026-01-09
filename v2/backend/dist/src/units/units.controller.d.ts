import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
export declare class UnitsController {
    private readonly unitsService;
    constructor(unitsService: UnitsService);
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
    } & {
        id: string;
        cnpj: string | null;
        name: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
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
    } & {
        id: string;
        cnpj: string | null;
        name: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
    }>;
    create(data: CreateUnitDto): import(".prisma/client").Prisma.Prisma__UnitClient<{
        company: {
            id: string;
            cnpj: string | null;
            name: string;
            logoUrl: string | null;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        cnpj: string | null;
        name: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, data: UpdateUnitDto): Promise<{
        company: {
            id: string;
            cnpj: string | null;
            name: string;
            logoUrl: string | null;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        cnpj: string | null;
        name: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        cnpj: string | null;
        name: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
    }>;
}
