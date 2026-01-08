import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
export declare class UploadedSchedulesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createScheduleDto: CreateScheduleDto): Promise<{
        sector: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            companyId: string;
            unitId: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            description: string | null;
        } | null;
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        category: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            companyId: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        status: import(".prisma/client").$Enums.EntityStatus;
        userId: string | null;
        categoryId: string | null;
        title: string;
        isPublic: boolean;
        deletedAt: Date | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }>;
    findAll(companyId: string, filters?: {
        sectorId?: string;
        categoryId?: string;
        isPublic?: boolean;
    }): Promise<({
        sector: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            companyId: string;
            unitId: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            description: string | null;
        } | null;
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        category: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            companyId: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
        } | null;
        tags: ({
            tag: {
                id: string;
                createdAt: Date;
                name: string;
                color: string | null;
            };
        } & {
            tagId: string;
            scheduleId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        status: import(".prisma/client").$Enums.EntityStatus;
        userId: string | null;
        categoryId: string | null;
        title: string;
        isPublic: boolean;
        deletedAt: Date | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    })[]>;
    findOne(id: string): Promise<{
        sector: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            companyId: string;
            unitId: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            description: string | null;
        } | null;
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        category: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            companyId: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
        } | null;
        tags: ({
            tag: {
                id: string;
                createdAt: Date;
                name: string;
                color: string | null;
            };
        } & {
            tagId: string;
            scheduleId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        status: import(".prisma/client").$Enums.EntityStatus;
        userId: string | null;
        categoryId: string | null;
        title: string;
        isPublic: boolean;
        deletedAt: Date | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }>;
    update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<{
        sector: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            companyId: string;
            unitId: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            description: string | null;
        } | null;
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        category: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            companyId: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        status: import(".prisma/client").$Enums.EntityStatus;
        userId: string | null;
        categoryId: string | null;
        title: string;
        isPublic: boolean;
        deletedAt: Date | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        status: import(".prisma/client").$Enums.EntityStatus;
        userId: string | null;
        categoryId: string | null;
        title: string;
        isPublic: boolean;
        deletedAt: Date | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }>;
    restore(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        status: import(".prisma/client").$Enums.EntityStatus;
        userId: string | null;
        categoryId: string | null;
        title: string;
        isPublic: boolean;
        deletedAt: Date | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }>;
}
