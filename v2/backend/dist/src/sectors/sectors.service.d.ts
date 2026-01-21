import { PrismaService } from '../prisma/prisma.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
export declare class SectorsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): any;
    findById(id: string): Promise<any>;
    create(data: CreateSectorDto): any;
    update(id: string, data: UpdateSectorDto): Promise<any>;
    getDependencies(id: string): Promise<{
        users: any;
        units: any;
        links: any;
        schedules: any;
        notes: any;
        hasAny: boolean;
    }>;
    remove(id: string): Promise<any>;
}
