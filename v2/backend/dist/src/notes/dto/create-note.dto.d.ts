import { ContentVisibility, EntityStatus } from '@prisma/client';
export declare class CreateNoteDto {
    title: string;
    content: string;
    color?: string;
    imageUrl?: string;
    imagePosition?: string;
    imageScale?: number;
    categoryId?: string;
    visibility?: ContentVisibility;
    publicToken?: string;
    status?: EntityStatus;
}
