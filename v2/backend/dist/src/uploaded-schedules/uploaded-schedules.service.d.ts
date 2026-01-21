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
    create(createScheduleDto: CreateScheduleDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        category: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
        } | null;
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            description: string | null;
        } | null;
        scheduleUnits: ({
            unit: {
                id: string;
                cnpj: string | null;
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            unitId: string;
            scheduleId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        deletedAt: Date | null;
        unitId: string | null;
        categoryId: string | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }>;
    findAll(companyId?: string, filters?: {
        sectorId?: string;
        unitId?: string;
        unitIds?: string[];
        categoryId?: string;
        isPublic?: boolean;
        audience?: ContentAudience;
        includeInactive?: boolean;
    }): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        category: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
        } | null;
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            description: string | null;
        } | null;
        scheduleUnits: ({
            unit: {
                id: string;
                cnpj: string | null;
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            unitId: string;
            scheduleId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        deletedAt: Date | null;
        unitId: string | null;
        categoryId: string | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        category: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
        } | null;
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            description: string | null;
        } | null;
        scheduleUnits: ({
            unit: {
                id: string;
                cnpj: string | null;
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            unitId: string;
            scheduleId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        deletedAt: Date | null;
        unitId: string | null;
        categoryId: string | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }>;
    update(id: string, updateScheduleDto: UpdateScheduleDto, actor?: ScheduleActor): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        category: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
        } | null;
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            description: string | null;
        } | null;
        scheduleUnits: ({
            unit: {
                id: string;
                cnpj: string | null;
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            unitId: string;
            scheduleId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        deletedAt: Date | null;
        unitId: string | null;
        categoryId: string | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }>;
    remove(id: string, actor?: ScheduleActor, adminMessage?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        deletedAt: Date | null;
        unitId: string | null;
        categoryId: string | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }>;
    restore(id: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        category: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
        } | null;
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            description: string | null;
        } | null;
        scheduleUnits: ({
            unit: {
                id: string;
                cnpj: string | null;
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            unitId: string;
            scheduleId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        deletedAt: Date | null;
        unitId: string | null;
        categoryId: string | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }>;
    activate(id: string, actor?: ScheduleActor): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        category: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
        } | null;
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            description: string | null;
        } | null;
        scheduleUnits: ({
            unit: {
                id: string;
                cnpj: string | null;
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            unitId: string;
            scheduleId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        deletedAt: Date | null;
        unitId: string | null;
        categoryId: string | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }>;
    deactivate(id: string, actor?: ScheduleActor): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        category: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
        } | null;
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            description: string | null;
        } | null;
        scheduleUnits: ({
            unit: {
                id: string;
                cnpj: string | null;
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            unitId: string;
            scheduleId: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        deletedAt: Date | null;
        unitId: string | null;
        categoryId: string | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }>;
    private normalizeUnitIds;
    private assertUnitsAllowed;
    private assertCanMutate;
    private resolveAudienceFromExisting;
    private resolveAudienceForUpdate;
    private assertAudienceAllowed;
}
export {};
