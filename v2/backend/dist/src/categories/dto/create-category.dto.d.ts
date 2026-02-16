import { EntityStatus } from '@prisma/client';
export declare class CreateCategoryDto {
    name: string;
    color?: string;
    icon?: string;
    adminOnly?: boolean;
    status?: EntityStatus;
}
