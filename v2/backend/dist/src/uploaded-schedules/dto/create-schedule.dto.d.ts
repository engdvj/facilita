import { ContentAudience } from '@prisma/client';
export declare class CreateScheduleDto {
    companyId: string;
    userId?: string;
    sectorId?: string;
    categoryId?: string;
    title: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    imageUrl?: string;
    imagePosition?: string;
    imageScale?: number;
    audience?: ContentAudience;
    isPublic?: boolean;
}
