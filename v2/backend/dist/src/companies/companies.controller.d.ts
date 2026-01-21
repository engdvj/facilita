import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
export declare class CompaniesController {
    private readonly companiesService;
    constructor(companiesService: CompaniesService);
    findAll(req: any): any;
    findOne(id: string): Promise<any>;
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
    create(data: CreateCompanyDto): any;
    update(id: string, data: UpdateCompanyDto): Promise<any>;
    remove(id: string): Promise<any>;
}
