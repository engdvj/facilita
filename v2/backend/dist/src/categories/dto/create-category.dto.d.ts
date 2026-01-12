import { EntityStatus } from '@prisma/client';
export declare class CreateCategoryDto {
    companyId: string;
    name: string;
    color?: string;
    icon?: string;
    adminOnly?: boolean;
    status?: EntityStatus;
}
