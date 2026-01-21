import { ContentAudience, EntityStatus } from '@prisma/client';
export declare class CreateScheduleDto {
    companyId: string;
    userId?: string;
    sectorId?: string;
    unitId?: string | null;
    unitIds?: string[];
    categoryId?: string;
    title: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    color?: string;
    imageUrl?: string;
    imagePosition?: string;
    imageScale?: number;
    audience?: ContentAudience;
    isPublic?: boolean;
    status?: EntityStatus;
}
