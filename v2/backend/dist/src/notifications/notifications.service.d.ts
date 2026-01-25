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
    create(dto: CreateNotificationDto): Promise<any>;
    createBulk(userIds: string[], dto: Omit<CreateNotificationDto, 'userId'>): Promise<any>;
    findByUser(userId: string, limit?: number, offset?: number): Promise<any>;
    getUnreadCount(userId: string): Promise<any>;
    markAsRead(id: string, userId: string): Promise<any>;
    markAllAsRead(userId: string): Promise<any>;
    delete(id: string, userId: string): Promise<any>;
    cleanupOld(): Promise<any>;
    getRecipientsByAudience(companyId: string, sectorId: string | null | undefined, audience: ContentAudience, excludeUserId?: string): Promise<string[]>;
    getUsersWhoFavorited(entityType: EntityType, entityId: string): Promise<string[]>;
}
export {};
