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
};
export declare class LinksService {
    private prisma;
    private notificationsService;
    private notificationsGateway;
    constructor(prisma: PrismaService, notificationsService: NotificationsService, notificationsGateway: NotificationsGateway);
    private getBaseInclude;
    private getIncludeWithVersions;
    private normalizeAudienceForUserMode;
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
    }): Promise<any>;
    findAllByUser(userId: string, companyId?: string): Promise<any>;
    userHasSector(userId: string, sectorId: string): Promise<boolean>;
    findOne(id: string): Promise<any>;
    update(id: string, updateLinkDto: UpdateLinkDto, actor?: LinkActor): Promise<any>;
    remove(id: string, actor?: LinkActor, adminMessage?: string): Promise<any>;
    private normalizeUnitIds;
    private assertUnitsAllowed;
    private assertCanMutate;
    private resolveAudienceFromExisting;
    private resolveAudienceForUpdate;
    private assertAudienceAllowed;
    restore(id: string): Promise<any>;
    activate(id: string, actor?: LinkActor): Promise<any>;
    deactivate(id: string, actor?: LinkActor): Promise<any>;
}
export {};
