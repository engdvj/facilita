import { SectorsService } from './sectors.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
export declare class SectorsController {
    private readonly sectorsService;
    constructor(sectorsService: SectorsService);
    findAll(): any;
    findOne(id: string): Promise<any>;
    getDependencies(id: string): Promise<{
        users: any;
        units: any;
        links: any;
        schedules: any;
        notes: any;
        hasAny: boolean;
    }>;
    create(data: CreateSectorDto): any;
    update(id: string, data: UpdateSectorDto): Promise<any>;
    remove(id: string): Promise<any>;
}
