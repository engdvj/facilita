import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
export declare class NotesController {
    private readonly notesService;
    constructor(notesService: NotesService);
    create(createNoteDto: CreateNoteDto, req: any): Promise<{
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            unitId: string;
            description: string | null;
        } | null;
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        category: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
        } | null;
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        color: string | null;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        isPublic: boolean;
        deletedAt: Date | null;
        content: string;
    }>;
    findAll(req: any, companyId?: string, sectorId?: string, categoryId?: string, isPublic?: string, audience?: string): Promise<({
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            unitId: string;
            description: string | null;
        } | null;
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        category: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
        } | null;
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        color: string | null;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        isPublic: boolean;
        deletedAt: Date | null;
        content: string;
    })[]>;
    findOne(id: string): Promise<{
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            unitId: string;
            description: string | null;
        } | null;
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        category: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
        } | null;
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        color: string | null;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        isPublic: boolean;
        deletedAt: Date | null;
        content: string;
    }>;
    update(id: string, updateNoteDto: UpdateNoteDto, req: any): Promise<{
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            unitId: string;
            description: string | null;
        } | null;
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        category: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
        } | null;
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        color: string | null;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        isPublic: boolean;
        deletedAt: Date | null;
        content: string;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        color: string | null;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        isPublic: boolean;
        deletedAt: Date | null;
        content: string;
    }>;
    restore(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        color: string | null;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        isPublic: boolean;
        deletedAt: Date | null;
        content: string;
    }>;
}
