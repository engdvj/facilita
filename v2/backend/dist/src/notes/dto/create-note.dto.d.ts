import { ContentAudience, EntityStatus } from '@prisma/client';
export declare class CreateNoteDto {
    companyId: string;
    userId?: string;
    sectorId?: string;
    unitId?: string | null;
    unitIds?: string[];
    categoryId?: string;
    title: string;
    content: string;
    color?: string;
    imageUrl?: string;
    imagePosition?: string;
    imageScale?: number;
    audience?: ContentAudience;
    isPublic?: boolean;
    status?: EntityStatus;
}
