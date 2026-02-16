import { ContentVisibility, EntityStatus } from '@prisma/client';
export declare class UpdateScheduleDto {
    title?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    color?: string;
    imageUrl?: string;
    imagePosition?: string;
    imageScale?: number;
    categoryId?: string | null;
    visibility?: ContentVisibility;
    publicToken?: string | null;
    status?: EntityStatus;
}
