import { EntityStatus } from '@prisma/client';
export declare class CreateSectorDto {
    companyId: string;
    unitId: string;
    name: string;
    description?: string;
    status?: EntityStatus;
}
