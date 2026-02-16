import { ContentVisibility, EntityStatus } from '@prisma/client';
export declare class UpdateNoteDto {
    title?: string;
    content?: string;
    color?: string;
    imageUrl?: string;
    imagePosition?: string;
    imageScale?: number;
    categoryId?: string | null;
    visibility?: ContentVisibility;
    publicToken?: string | null;
    status?: EntityStatus;
}
