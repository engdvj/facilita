import { ContentVisibility, EntityStatus } from '@prisma/client';
export declare class UpdateLinkDto {
    title?: string;
    url?: string;
    description?: string;
    color?: string;
    imageUrl?: string;
    imagePosition?: string;
    imageScale?: number;
    categoryId?: string | null;
    visibility?: ContentVisibility;
    publicToken?: string | null;
    order?: number;
    status?: EntityStatus;
}
