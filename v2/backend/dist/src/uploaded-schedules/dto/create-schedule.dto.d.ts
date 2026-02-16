import { ContentVisibility, EntityStatus } from '@prisma/client';
export declare class CreateScheduleDto {
    title: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    color?: string;
    imageUrl?: string;
    imagePosition?: string;
    imageScale?: number;
    categoryId?: string;
    visibility?: ContentVisibility;
    publicToken?: string;
    status?: EntityStatus;
}
