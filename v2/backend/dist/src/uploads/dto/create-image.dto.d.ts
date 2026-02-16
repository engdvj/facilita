import { EntityStatus } from '@prisma/client';
export declare class CreateImageDto {
    uploadedBy: string;
    filename: string;
    originalName: string;
    url: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    alt?: string;
    tags?: string[];
    status?: EntityStatus;
}
