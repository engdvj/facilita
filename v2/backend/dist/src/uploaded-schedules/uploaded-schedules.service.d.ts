import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ContentAudience, UserRole } from '@prisma/client';
type ScheduleActor = {
    id: string;
    role: UserRole;
    companyId?: string | null;
};
export declare class UploadedSchedulesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createScheduleDto: CreateScheduleDto): Promise<{
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
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        deletedAt: Date | null;
        userId: string | null;
        categoryId: string | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }>;
    findAll(companyId?: string, filters?: {
        sectorId?: string;
        categoryId?: string;
        isPublic?: boolean;
        audience?: ContentAudience;
    }): Promise<({
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
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        deletedAt: Date | null;
        userId: string | null;
        categoryId: string | null;
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
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        deletedAt: Date | null;
        userId: string | null;
        categoryId: string | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }>;
    update(id: string, updateScheduleDto: UpdateScheduleDto, actor?: ScheduleActor): Promise<{
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
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        deletedAt: Date | null;
        userId: string | null;
        categoryId: string | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }>;
    remove(id: string, actor?: ScheduleActor): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        deletedAt: Date | null;
        userId: string | null;
        categoryId: string | null;
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
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        deletedAt: Date | null;
        userId: string | null;
        categoryId: string | null;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }>;
    private assertCanMutate;
    private resolveAudienceFromExisting;
    private resolveAudienceForUpdate;
    private assertAudienceAllowed;
}
export {};
