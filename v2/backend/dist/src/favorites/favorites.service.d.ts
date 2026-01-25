import { PrismaService } from '../prisma/prisma.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { EntityType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
export declare class FavoritesService {
    private prisma;
    private notificationsService;
    private notificationsGateway;
    constructor(prisma: PrismaService, notificationsService: NotificationsService, notificationsGateway: NotificationsGateway);
    create(userId: string, dto: CreateFavoriteDto): Promise<any>;
    findAllByUser(userId: string): Promise<any>;
    findByUserAndType(userId: string, entityType: EntityType): Promise<any>;
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
