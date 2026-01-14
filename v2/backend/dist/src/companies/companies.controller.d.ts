import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
export declare class CompaniesController {
    private readonly companiesService;
    constructor(companiesService: CompaniesService);
    findAll(req: any): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        cnpj: string | null;
        name: string;
        logoUrl: string | null;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        cnpj: string | null;
        name: string;
        logoUrl: string | null;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getDependencies(id: string): Promise<{
        units: number;
        sectors: number;
        users: number;
        categories: number;
        links: number;
        schedules: number;
        notes: number;
        uploadedImages: number;
        hasAny: boolean;
    }>;
    create(data: CreateCompanyDto): import(".prisma/client").Prisma.Prisma__CompanyClient<{
        id: string;
        cnpj: string | null;
        name: string;
        logoUrl: string | null;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, data: UpdateCompanyDto): Promise<{
        id: string;
        cnpj: string | null;
        name: string;
        logoUrl: string | null;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        cnpj: string | null;
        name: string;
        logoUrl: string | null;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
