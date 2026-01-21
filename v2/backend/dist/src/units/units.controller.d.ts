import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
export declare class UnitsController {
    private readonly unitsService;
    constructor(unitsService: UnitsService);
    findAll(): any;
    findOne(id: string): Promise<any>;
    getDependencies(id: string): Promise<{
        sectors: any;
        users: any;
        hasAny: boolean;
    }>;
    create(data: CreateUnitDto): any;
    update(id: string, data: UpdateUnitDto): Promise<any>;
    remove(id: string): Promise<any>;
}
