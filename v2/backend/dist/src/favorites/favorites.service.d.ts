import { EntityType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
export declare class FavoritesService {
    private prisma;
    constructor(prisma: PrismaService);
    private assertEntityTypeSupported;
    private canAccessEntity;
    create(userId: string, dto: CreateFavoriteDto): Promise<{
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
    findAllByUser(userId: string): Promise<({
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
    findByUserAndType(userId: string, entityType: EntityType): Promise<({
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
                role: import(".prisma/client").$Enums.UserRole;
                status: import(".prisma/client").$Enums.UserStatus;
                avatarUrl: string | null;
                theme: import("@prisma/client/runtime/client").JsonValue | null;
                id: string;
                email: string;
                createdAt: Date;
                updatedAt: Date;
                cpf: string | null;
                passwordHash: string;
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
                role: import(".prisma/client").$Enums.UserRole;
                status: import(".prisma/client").$Enums.UserStatus;
                avatarUrl: string | null;
                theme: import("@prisma/client/runtime/client").JsonValue | null;
                id: string;
                email: string;
                createdAt: Date;
                updatedAt: Date;
                cpf: string | null;
                passwordHash: string;
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
                role: import(".prisma/client").$Enums.UserRole;
                status: import(".prisma/client").$Enums.UserStatus;
                avatarUrl: string | null;
                theme: import("@prisma/client/runtime/client").JsonValue | null;
                id: string;
                email: string;
                createdAt: Date;
                updatedAt: Date;
                cpf: string | null;
                passwordHash: string;
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
