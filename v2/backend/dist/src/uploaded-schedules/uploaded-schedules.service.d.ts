import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ContentAudience, UserRole } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
type ScheduleActor = {
    id: string;
    role: UserRole;
    companyId?: string | null;
};
export declare class UploadedSchedulesService {
    private prisma;
    private notificationsService;
    private notificationsGateway;
    constructor(prisma: PrismaService, notificationsService: NotificationsService, notificationsGateway: NotificationsGateway);
    private getBaseInclude;
    private normalizeAudienceForUserMode;
    create(createScheduleDto: CreateScheduleDto): Promise<any>;
    findAll(companyId?: string, filters?: {
        sectorId?: string;
        unitId?: string;
        unitIds?: string[];
        categoryId?: string;
        isPublic?: boolean;
        audience?: ContentAudience;
        includeInactive?: boolean;
    }): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateScheduleDto: UpdateScheduleDto, actor?: ScheduleActor): Promise<any>;
    remove(id: string, actor?: ScheduleActor, adminMessage?: string): Promise<any>;
    restore(id: string): Promise<any>;
    activate(id: string, actor?: ScheduleActor): Promise<any>;
    deactivate(id: string, actor?: ScheduleActor): Promise<any>;
    private normalizeUnitIds;
    private assertUnitsAllowed;
    private assertCanMutate;
    private resolveAudienceFromExisting;
    private resolveAudienceForUpdate;
    private assertAudienceAllowed;
}
export {};
