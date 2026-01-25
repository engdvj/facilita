import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(req: any, limit?: string, offset?: string): Promise<any>;
    getUnreadCount(req: any): Promise<{
        count: any;
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
