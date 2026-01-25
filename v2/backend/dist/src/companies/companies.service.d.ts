import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
export declare class CompaniesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(options?: {
        excludeInternal?: boolean;
        search?: string;
        skip?: number;
        take?: number;
    }): Promise<{
        items: any;
        total: any;
    }>;
    findById(id: string): Promise<any>;
    create(data: CreateCompanyDto): any;
    update(id: string, data: UpdateCompanyDto): Promise<any>;
    getDependencies(id: string): Promise<{
        units: any;
        sectors: any;
        users: any;
        categories: any;
        links: any;
        schedules: any;
        notes: any;
        uploadedImages: any;
        hasAny: boolean;
    }>;
    remove(id: string): Promise<any>;
}
