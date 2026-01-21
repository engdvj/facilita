import { UploadedSchedulesService } from './uploaded-schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
export declare class UploadedSchedulesController {
    private readonly schedulesService;
    constructor(schedulesService: UploadedSchedulesService);
    create(createScheduleDto: CreateScheduleDto, req: any): Promise<{
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
    findAll(companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string): Promise<({
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
    findAllAdmin(req: any, companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string): Promise<({
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
    findAllAdminAlias(req: any, companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string): Promise<({
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
    update(id: string, updateScheduleDto: UpdateScheduleDto, req: any): Promise<{
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
    remove(id: string, body: {
        adminMessage?: string;
    } | undefined, req: any): Promise<{
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
    activate(id: string, req: any): Promise<{
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
    deactivate(id: string, req: any): Promise<{
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
}
