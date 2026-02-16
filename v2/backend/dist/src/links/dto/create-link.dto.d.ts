import { ContentVisibility, EntityStatus } from '@prisma/client';
export declare class CreateLinkDto {
    title: string;
    url: string;
    description?: string;
    color?: string;
    imageUrl?: string;
    imagePosition?: string;
    imageScale?: number;
    categoryId?: string;
    visibility?: ContentVisibility;
    publicToken?: string;
    order?: number;
    status?: EntityStatus;
}
