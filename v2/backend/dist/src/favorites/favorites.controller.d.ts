import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { EntityType } from '@prisma/client';
export declare class FavoritesController {
    private readonly favoritesService;
    constructor(favoritesService: FavoritesService);
    create(req: any, createFavoriteDto: CreateFavoriteDto): Promise<{
        link: ({
            category: {
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                color: string | null;
                icon: string | null;
                adminOnly: boolean;
                ownerId: string;
            } | null;
            owner: {
                name: string;
                id: string;
                email: string;
            };
        } & {
            status: import(".prisma/client").$Enums.EntityStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
            ownerId: string;
            title: string;
            url: string;
            description: string | null;
            imageUrl: string | null;
            imagePosition: string | null;
            imageScale: number | null;
            visibility: import(".prisma/client").$Enums.ContentVisibility;
            publicToken: string | null;
            order: number;
            deletedAt: Date | null;
            categoryId: string | null;
        }) | null;
        note: ({
            category: {
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                color: string | null;
                icon: string | null;
                adminOnly: boolean;
                ownerId: string;
            } | null;
            owner: {
                name: string;
                id: string;
                email: string;
            };
        } & {
            status: import(".prisma/client").$Enums.EntityStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
            ownerId: string;
            title: string;
            imageUrl: string | null;
            imagePosition: string | null;
            imageScale: number | null;
            visibility: import(".prisma/client").$Enums.ContentVisibility;
            publicToken: string | null;
            deletedAt: Date | null;
            categoryId: string | null;
            content: string;
        }) | null;
        schedule: ({
            category: {
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                color: string | null;
                icon: string | null;
                adminOnly: boolean;
                ownerId: string;
            } | null;
            owner: {
                name: string;
                id: string;
                email: string;
            };
        } & {
            status: import(".prisma/client").$Enums.EntityStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
            ownerId: string;
            title: string;
            imageUrl: string | null;
            imagePosition: string | null;
            imageScale: number | null;
            visibility: import(".prisma/client").$Enums.ContentVisibility;
            publicToken: string | null;
            deletedAt: Date | null;
            categoryId: string | null;
            fileUrl: string;
            fileName: string;
            fileSize: number;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        entityType: import(".prisma/client").$Enums.EntityType;
        linkId: string | null;
        scheduleId: string | null;
        noteId: string | null;
    }>;
    findMyFavorites(req: any, type?: EntityType): Promise<({
        link: ({
            category: {
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                color: string | null;
                icon: string | null;
                adminOnly: boolean;
                ownerId: string;
            } | null;
            owner: {
                name: string;
                avatarUrl: string | null;
                id: string;
                email: string;
            };
        } & {
            status: import(".prisma/client").$Enums.EntityStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
            ownerId: string;
            title: string;
            url: string;
            description: string | null;
            imageUrl: string | null;
            imagePosition: string | null;
            imageScale: number | null;
            visibility: import(".prisma/client").$Enums.ContentVisibility;
            publicToken: string | null;
            order: number;
            deletedAt: Date | null;
            categoryId: string | null;
        }) | null;
        note: ({
            category: {
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                color: string | null;
                icon: string | null;
                adminOnly: boolean;
                ownerId: string;
            } | null;
            owner: {
                name: string;
                avatarUrl: string | null;
                id: string;
                email: string;
            };
        } & {
            status: import(".prisma/client").$Enums.EntityStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
            ownerId: string;
            title: string;
            imageUrl: string | null;
            imagePosition: string | null;
            imageScale: number | null;
            visibility: import(".prisma/client").$Enums.ContentVisibility;
            publicToken: string | null;
            deletedAt: Date | null;
            categoryId: string | null;
            content: string;
        }) | null;
        schedule: ({
            category: {
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                color: string | null;
                icon: string | null;
                adminOnly: boolean;
                ownerId: string;
            } | null;
            owner: {
                name: string;
                avatarUrl: string | null;
                id: string;
                email: string;
            };
        } & {
            status: import(".prisma/client").$Enums.EntityStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            color: string | null;
            ownerId: string;
            title: string;
            imageUrl: string | null;
            imagePosition: string | null;
            imageScale: number | null;
            visibility: import(".prisma/client").$Enums.ContentVisibility;
            publicToken: string | null;
            deletedAt: Date | null;
            categoryId: string | null;
            fileUrl: string;
            fileName: string;
            fileSize: number;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        entityType: import(".prisma/client").$Enums.EntityType;
        linkId: string | null;
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
