import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
export declare class UnitsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): any;
    findById(id: string): Promise<any>;
    create(data: CreateUnitDto): any;
    update(id: string, data: UpdateUnitDto): Promise<any>;
    getDependencies(id: string): Promise<{
        sectors: any;
        users: any;
        hasAny: boolean;
    }>;
    remove(id: string): Promise<any>;
}
