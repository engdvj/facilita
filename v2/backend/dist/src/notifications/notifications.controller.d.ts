import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(req: any, limit?: string, offset?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        entityType: import(".prisma/client").$Enums.EntityType;
        entityId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        actionUrl: string | null;
        read: boolean;
    }[]>;
    getUnreadCount(req: any): Promise<{
        count: number;
    }>;
    markAsRead(id: string, req: any): Promise<{
        success: boolean;
    }>;
    markAllAsRead(req: any): Promise<{
        success: boolean;
    }>;
    delete(id: string, req: any): Promise<{
        success: boolean;
    }>;
}
