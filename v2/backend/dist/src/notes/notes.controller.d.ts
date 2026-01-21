import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
export declare class NotesController {
    private readonly notesService;
    constructor(notesService: NotesService);
    create(createNoteDto: CreateNoteDto, req: any): Promise<any>;
    findAll(companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string): Promise<any>;
    findAllAdmin(req: any, companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string): Promise<any>;
    findAllAdminAlias(req: any, companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateNoteDto: UpdateNoteDto, req: any): Promise<any>;
    remove(id: string, body: {
        adminMessage?: string;
    } | undefined, req: any): Promise<any>;
    restore(id: string): Promise<any>;
    activate(id: string, req: any): Promise<any>;
    deactivate(id: string, req: any): Promise<any>;
}
