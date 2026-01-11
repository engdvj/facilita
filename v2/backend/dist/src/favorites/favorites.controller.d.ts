import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { EntityType } from '@prisma/client';
export declare class FavoritesController {
    private readonly favoritesService;
    constructor(favoritesService: FavoritesService);
    create(req: any, createFavoriteDto: CreateFavoriteDto): Promise<{
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
    findMyFavorites(req: any, type?: EntityType): Promise<({
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
    countMyFavorites(req: any): Promise<{
        count: number;
    }>;
    checkFavorited(req: any, entityType: EntityType, entityId: string): Promise<{
        isFavorited: boolean;
    }>;
    countByEntity(entityType: EntityType, entityId: string): Promise<{
        count: number;
    }>;
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
    removeByEntity(req: any, entityType: EntityType, entityId: string): Promise<{
        message: string;
    }>;
}
