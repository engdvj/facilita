import { PrismaService } from '../prisma/prisma.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { ContentAudience, UserRole } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
type LinkActor = {
    id: string;
    role: UserRole;
    companyId?: string | null;
    canViewPrivate?: boolean;
};
type LinkViewer = {
    id?: string;
    canViewPrivate?: boolean;
};
export declare class LinksService {
    private prisma;
    private notificationsService;
    private notificationsGateway;
    constructor(prisma: PrismaService, notificationsService: NotificationsService, notificationsGateway: NotificationsGateway);
    create(createLinkDto: CreateLinkDto): Promise<any>;
    findAll(companyId?: string, filters?: {
        sectorId?: string;
        sectorIds?: string[];
        unitId?: string;
        unitIds?: string[];
        categoryId?: string;
        isPublic?: boolean;
        audience?: ContentAudience;
        includeInactive?: boolean;
    }, viewer?: LinkViewer): Promise<any>;
    findAllPaginated(companyId?: string, filters?: {
        sectorId?: string;
        sectorIds?: string[];
        unitId?: string;
        unitIds?: string[];
        categoryId?: string;
        search?: string;
        isPublic?: boolean;
        audience?: ContentAudience;
        includeInactive?: boolean;
    }, viewer?: LinkViewer, pagination?: {
        skip?: number;
        take?: number;
    }): Promise<{
        items: any;
        total: any;
    }>;
    findAllByUser(userId: string, companyId?: string): Promise<any>;
    userHasSector(userId: string, sectorId: string): Promise<boolean>;
    findOne(id: string, viewer?: LinkViewer): Promise<any>;
    update(id: string, updateLinkDto: UpdateLinkDto, actor?: LinkActor): Promise<any>;
    remove(id: string, actor?: LinkActor, adminMessage?: string): Promise<any>;
    private normalizeUnitIds;
    private assertUnitsAllowed;
    private buildPrivateAccessFilter;
    private assertPrivateAccess;
    private assertCanMutate;
    private resolveAudienceFromExisting;
    private resolveAudienceForUpdate;
    private assertAudienceAllowed;
    restore(id: string, actor?: LinkActor): Promise<any>;
    activate(id: string, actor?: LinkActor): Promise<any>;
    deactivate(id: string, actor?: LinkActor): Promise<any>;
}
export {};
