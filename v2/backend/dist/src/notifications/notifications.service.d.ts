import { EntityType, NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
interface CreateNotificationDto {
    userId: string;
    type: NotificationType;
    entityType: EntityType;
    entityId: string;
    title: string;
    message: string;
    actionUrl?: string;
    metadata?: Prisma.InputJsonValue;
}
export declare class NotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateNotificationDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        entityType: import(".prisma/client").$Enums.EntityType;
        entityId: string;
        metadata: Prisma.JsonValue | null;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        actionUrl: string | null;
        read: boolean;
    }>;
    createBulk(userIds: string[], dto: Omit<CreateNotificationDto, 'userId'>): Promise<Prisma.BatchPayload>;
    findByUser(userId: string, limit?: number, offset?: number): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        entityType: import(".prisma/client").$Enums.EntityType;
        entityId: string;
        metadata: Prisma.JsonValue | null;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        actionUrl: string | null;
        read: boolean;
    }[]>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(id: string, userId: string): Promise<Prisma.BatchPayload>;
    markAllAsRead(userId: string): Promise<Prisma.BatchPayload>;
    delete(id: string, userId: string): Promise<Prisma.BatchPayload>;
    cleanupOld(): Promise<Prisma.BatchPayload>;
}
export {};
