import { PrismaService } from '../prisma/prisma.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { EntityType } from '@prisma/client';
export declare class FavoritesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateFavoriteDto): Promise<{
        link: ({
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
            url: string;
            id: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            sectorId: string | null;
            description: string | null;
            userId: string | null;
            audience: import(".prisma/client").$Enums.ContentAudience;
            color: string | null;
            categoryId: string | null;
            title: string;
            imageUrl: string | null;
            imagePosition: string | null;
            imageScale: number | null;
            isPublic: boolean;
            order: number;
            deletedAt: Date | null;
        }) | null;
        note: ({
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
            color: string | null;
            categoryId: string | null;
            title: string;
            imageUrl: string | null;
            imagePosition: string | null;
            imageScale: number | null;
            isPublic: boolean;
            deletedAt: Date | null;
            content: string;
        }) | null;
        schedule: ({
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
            color: string | null;
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
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        linkId: string | null;
        entityType: import(".prisma/client").$Enums.EntityType;
        scheduleId: string | null;
        noteId: string | null;
    }>;
    findAllByUser(userId: string): Promise<({
        link: ({
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
                avatarUrl: string | null;
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
            url: string;
            id: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            sectorId: string | null;
            description: string | null;
            userId: string | null;
            audience: import(".prisma/client").$Enums.ContentAudience;
            color: string | null;
            categoryId: string | null;
            title: string;
            imageUrl: string | null;
            imagePosition: string | null;
            imageScale: number | null;
            isPublic: boolean;
            order: number;
            deletedAt: Date | null;
        }) | null;
        note: ({
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
                avatarUrl: string | null;
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
            color: string | null;
            categoryId: string | null;
            title: string;
            imageUrl: string | null;
            imagePosition: string | null;
            imageScale: number | null;
            isPublic: boolean;
            deletedAt: Date | null;
            content: string;
        }) | null;
        schedule: ({
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
                avatarUrl: string | null;
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
            color: string | null;
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
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        linkId: string | null;
        entityType: import(".prisma/client").$Enums.EntityType;
        scheduleId: string | null;
        noteId: string | null;
    })[]>;
    findByUserAndType(userId: string, entityType: EntityType): Promise<({
        link: ({
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
            url: string;
            id: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            sectorId: string | null;
            description: string | null;
            userId: string | null;
            audience: import(".prisma/client").$Enums.ContentAudience;
            color: string | null;
            categoryId: string | null;
            title: string;
            imageUrl: string | null;
            imagePosition: string | null;
            imageScale: number | null;
            isPublic: boolean;
            order: number;
            deletedAt: Date | null;
        }) | null;
        note: ({
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
            color: string | null;
            categoryId: string | null;
            title: string;
            imageUrl: string | null;
            imagePosition: string | null;
            imageScale: number | null;
            isPublic: boolean;
            deletedAt: Date | null;
            content: string;
        }) | null;
        schedule: ({
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
            color: string | null;
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
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        linkId: string | null;
        entityType: import(".prisma/client").$Enums.EntityType;
        scheduleId: string | null;
        noteId: string | null;
    })[]>;
    isFavorited(userId: string, entityType: EntityType, entityId: string): Promise<boolean>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
    removeByEntity(userId: string, entityType: EntityType, entityId: string): Promise<{
        message: string;
    }>;
    countByUser(userId: string): Promise<number>;
    countByEntity(entityType: EntityType, entityId: string): Promise<number>;
}
