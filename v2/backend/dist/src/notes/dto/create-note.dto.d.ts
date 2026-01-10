import { ContentAudience } from '@prisma/client';
export declare class CreateNoteDto {
    companyId: string;
    userId?: string;
    sectorId?: string;
    categoryId?: string;
    title: string;
    content: string;
    color?: string;
    imageUrl?: string;
    imagePosition?: string;
    imageScale?: number;
    audience?: ContentAudience;
    isPublic?: boolean;
}
