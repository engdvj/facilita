import { UploadedSchedulesService } from './uploaded-schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
export declare class UploadedSchedulesController {
    private readonly schedulesService;
    constructor(schedulesService: UploadedSchedulesService);
    create(createScheduleDto: CreateScheduleDto, req: any): Promise<{
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            unitId: string;
            description: string | null;
        } | null;
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
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        isPublic: boolean;
        deletedAt: Date | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }>;
    findAll(req: any, companyId?: string, sectorId?: string, categoryId?: string, isPublic?: string, audience?: string): Promise<({
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            unitId: string;
            description: string | null;
        } | null;
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
        tags: ({
            tag: {
                id: string;
                name: string;
                createdAt: Date;
                color: string | null;
            };
        } & {
            tagId: string;
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
        audience: import(".prisma/client").$Enums.ContentAudience;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        isPublic: boolean;
        deletedAt: Date | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    })[]>;
    findOne(id: string): Promise<{
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            unitId: string;
            description: string | null;
        } | null;
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
        tags: ({
            tag: {
                id: string;
                name: string;
                createdAt: Date;
                color: string | null;
            };
        } & {
            tagId: string;
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
        audience: import(".prisma/client").$Enums.ContentAudience;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        isPublic: boolean;
        deletedAt: Date | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }>;
    update(id: string, updateScheduleDto: UpdateScheduleDto, req: any): Promise<{
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            unitId: string;
            description: string | null;
        } | null;
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
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        isPublic: boolean;
        deletedAt: Date | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        isPublic: boolean;
        deletedAt: Date | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }>;
    restore(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        isPublic: boolean;
        deletedAt: Date | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }>;
}
