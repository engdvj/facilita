import { ContentAudience, EntityStatus } from '@prisma/client';
export declare class CreateLinkDto {
    companyId: string;
    userId?: string;
    sectorId?: string;
    categoryId?: string;
    title: string;
    url: string;
    description?: string;
    color?: string;
    imageUrl?: string;
    imagePosition?: string;
    imageScale?: number;
    audience?: ContentAudience;
    isPublic?: boolean;
    order?: number;
    status?: EntityStatus;
}
