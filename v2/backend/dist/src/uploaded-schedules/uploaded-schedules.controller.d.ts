import { Response } from 'express';
import { UploadedSchedulesService } from './uploaded-schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { PermissionsService } from '../permissions/permissions.service';
export declare class UploadedSchedulesController {
    private readonly schedulesService;
    private readonly permissionsService;
    constructor(schedulesService: UploadedSchedulesService, permissionsService: PermissionsService);
    create(createScheduleDto: CreateScheduleDto, req: any): Promise<any>;
    findAll(companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string, req?: any): Promise<any>;
    findAllAdmin(req: any, companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string, search?: string, page?: string, pageSize?: string, res?: Response): Promise<any>;
    findAllAdminAlias(req: any, companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string, search?: string, page?: string, pageSize?: string, res?: Response): Promise<any>;
    findOne(id: string, req?: any): Promise<any>;
    update(id: string, updateScheduleDto: UpdateScheduleDto, req: any): Promise<any>;
    remove(id: string, body: {
        adminMessage?: string;
    } | undefined, req: any): Promise<any>;
    restore(id: string, req: any): Promise<any>;
    activate(id: string, req: any): Promise<any>;
    deactivate(id: string, req: any): Promise<any>;
    private getAccessContext;
}
