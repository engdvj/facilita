import { EntityStatus } from '@prisma/client';
export declare class UpdateCategoryDto {
    name?: string;
    color?: string;
    icon?: string;
    adminOnly?: boolean;
    status?: EntityStatus;
}
