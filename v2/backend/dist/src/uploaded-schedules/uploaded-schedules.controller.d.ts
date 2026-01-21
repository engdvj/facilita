import { UploadedSchedulesService } from './uploaded-schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
export declare class UploadedSchedulesController {
    private readonly schedulesService;
    constructor(schedulesService: UploadedSchedulesService);
    create(createScheduleDto: CreateScheduleDto, req: any): Promise<any>;
    findAll(companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string): Promise<any>;
    findAllAdmin(req: any, companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string): Promise<any>;
    findAllAdminAlias(req: any, companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateScheduleDto: UpdateScheduleDto, req: any): Promise<any>;
    remove(id: string, body: {
        adminMessage?: string;
    } | undefined, req: any): Promise<any>;
    restore(id: string): Promise<any>;
    activate(id: string, req: any): Promise<any>;
    deactivate(id: string, req: any): Promise<any>;
}
