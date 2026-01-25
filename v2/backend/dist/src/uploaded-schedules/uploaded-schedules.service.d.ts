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
    canViewPrivate?: boolean;
};
type ScheduleViewer = {
    id?: string;
    canViewPrivate?: boolean;
};
export declare class UploadedSchedulesService {
    private prisma;
    private notificationsService;
    private notificationsGateway;
    constructor(prisma: PrismaService, notificationsService: NotificationsService, notificationsGateway: NotificationsGateway);
    create(createScheduleDto: CreateScheduleDto): Promise<any>;
    findAll(companyId?: string, filters?: {
        sectorId?: string;
        unitId?: string;
        unitIds?: string[];
        categoryId?: string;
        isPublic?: boolean;
        audience?: ContentAudience;
        includeInactive?: boolean;
    }, viewer?: ScheduleViewer): Promise<any>;
    findAllPaginated(companyId?: string, filters?: {
        sectorId?: string;
        unitId?: string;
        unitIds?: string[];
        categoryId?: string;
        search?: string;
        isPublic?: boolean;
        audience?: ContentAudience;
        includeInactive?: boolean;
    }, viewer?: ScheduleViewer, pagination?: {
        skip?: number;
        take?: number;
    }): Promise<{
        items: any;
        total: any;
    }>;
    findOne(id: string, viewer?: ScheduleViewer): Promise<any>;
    update(id: string, updateScheduleDto: UpdateScheduleDto, actor?: ScheduleActor): Promise<any>;
    remove(id: string, actor?: ScheduleActor, adminMessage?: string): Promise<any>;
    restore(id: string, actor?: ScheduleActor): Promise<any>;
    activate(id: string, actor?: ScheduleActor): Promise<any>;
    deactivate(id: string, actor?: ScheduleActor): Promise<any>;
    private normalizeUnitIds;
    private assertUnitsAllowed;
    private buildPrivateAccessFilter;
    private assertPrivateAccess;
    private assertCanMutate;
    private resolveAudienceFromExisting;
    private resolveAudienceForUpdate;
    private assertAudienceAllowed;
}
export {};
