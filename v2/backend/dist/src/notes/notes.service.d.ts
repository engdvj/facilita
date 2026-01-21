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
};
export declare class NotesService {
    private prisma;
    private notificationsService;
    private notificationsGateway;
    constructor(prisma: PrismaService, notificationsService: NotificationsService, notificationsGateway: NotificationsGateway);
    private getBaseInclude;
    private normalizeAudienceForUserMode;
    create(createNoteDto: CreateNoteDto): Promise<any>;
    findAll(companyId?: string, filters?: {
        sectorId?: string;
        unitId?: string;
        unitIds?: string[];
        categoryId?: string;
        isPublic?: boolean;
        audience?: ContentAudience;
        includeInactive?: boolean;
    }): Promise<any>;
    userHasSector(userId: string, sectorId: string): Promise<boolean>;
    findOne(id: string): Promise<any>;
    update(id: string, updateNoteDto: UpdateNoteDto, actor?: NoteActor): Promise<any>;
    remove(id: string, actor?: NoteActor, adminMessage?: string): Promise<any>;
    restore(id: string): Promise<any>;
    activate(id: string, actor?: NoteActor): Promise<any>;
    deactivate(id: string, actor?: NoteActor): Promise<any>;
    private normalizeUnitIds;
    private assertUnitsAllowed;
    private assertCanMutate;
    private resolveAudienceFromExisting;
    private resolveAudienceForUpdate;
    private assertAudienceAllowed;
}
export {};
