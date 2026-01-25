import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { ContentAudience, UserRole } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
type NoteActor = {
    id: string;
    role: UserRole;
    companyId?: string | null;
    canViewPrivate?: boolean;
};
type NoteViewer = {
    id?: string;
    canViewPrivate?: boolean;
};
export declare class NotesService {
    private prisma;
    private notificationsService;
    private notificationsGateway;
    constructor(prisma: PrismaService, notificationsService: NotificationsService, notificationsGateway: NotificationsGateway);
    create(createNoteDto: CreateNoteDto): Promise<any>;
    findAll(companyId?: string, filters?: {
        sectorId?: string;
        unitId?: string;
        unitIds?: string[];
        categoryId?: string;
        isPublic?: boolean;
        audience?: ContentAudience;
        includeInactive?: boolean;
    }, viewer?: NoteViewer): Promise<any>;
    findAllPaginated(companyId?: string, filters?: {
        sectorId?: string;
        unitId?: string;
        unitIds?: string[];
        categoryId?: string;
        search?: string;
        isPublic?: boolean;
        audience?: ContentAudience;
        includeInactive?: boolean;
    }, viewer?: NoteViewer, pagination?: {
        skip?: number;
        take?: number;
    }): Promise<{
        items: any;
        total: any;
    }>;
    userHasSector(userId: string, sectorId: string): Promise<boolean>;
    findOne(id: string, viewer?: NoteViewer): Promise<any>;
    update(id: string, updateNoteDto: UpdateNoteDto, actor?: NoteActor): Promise<any>;
    remove(id: string, actor?: NoteActor, adminMessage?: string): Promise<any>;
    restore(id: string, actor?: NoteActor): Promise<any>;
    activate(id: string, actor?: NoteActor): Promise<any>;
    deactivate(id: string, actor?: NoteActor): Promise<any>;
    private normalizeUnitIds;
    private assertUnitsAllowed;
    private buildPrivateAccessFilter;
    private assertPrivateAccess;
    private assertCanMutate;
    private resolveAudienceFromExisting;
    private resolveAudienceForUpdate;
    private assertAudienceAllowed;
}
export {};
