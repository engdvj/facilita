import { Response } from 'express';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { PermissionsService } from '../permissions/permissions.service';
export declare class NotesController {
    private readonly notesService;
    private readonly permissionsService;
    constructor(notesService: NotesService, permissionsService: PermissionsService);
    create(createNoteDto: CreateNoteDto, req: any): Promise<any>;
    findAll(companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string, req?: any): Promise<any>;
    findAllAdmin(req: any, companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string, search?: string, page?: string, pageSize?: string, res?: Response): Promise<any>;
    findAllAdminAlias(req: any, companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string, search?: string, page?: string, pageSize?: string, res?: Response): Promise<any>;
    findOne(id: string, req?: any): Promise<any>;
    update(id: string, updateNoteDto: UpdateNoteDto, req: any): Promise<any>;
    remove(id: string, body: {
        adminMessage?: string;
    } | undefined, req: any): Promise<any>;
    restore(id: string, req: any): Promise<any>;
    activate(id: string, req: any): Promise<any>;
    deactivate(id: string, req: any): Promise<any>;
    private getAccessContext;
}
