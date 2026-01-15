import { PrismaService } from '../prisma/prisma.service';
import { NotificationType, EntityType, ContentAudience } from '@prisma/client';
interface CreateNotificationDto {
    userId: string;
    type: NotificationType;
    entityType: EntityType;
    entityId: string;
    title: string;
    message: string;
    actionUrl?: string;
    metadata?: Record<string, any>;
}
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateNotificationDto): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        userId: string;
        title: string;
        entityType: import(".prisma/client").$Enums.EntityType;
        entityId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        message: string;
        actionUrl: string | null;
        read: boolean;
    }>;
    createBulk(userIds: string[], dto: Omit<CreateNotificationDto, 'userId'>): Promise<import(".prisma/client").Prisma.BatchPayload>;
    findByUser(userId: string, limit?: number, offset?: number): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        userId: string;
        title: string;
        entityType: import(".prisma/client").$Enums.EntityType;
        entityId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        message: string;
        actionUrl: string | null;
        read: boolean;
    }[]>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(id: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    delete(id: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    cleanupOld(): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getRecipientsByAudience(companyId: string, sectorId: string | null | undefined, audience: ContentAudience, excludeUserId?: string): Promise<string[]>;
    getUsersWhoFavorited(entityType: EntityType, entityId: string): Promise<string[]>;
}
export {};
