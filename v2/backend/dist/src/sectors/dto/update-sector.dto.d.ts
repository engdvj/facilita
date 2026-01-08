import { EntityStatus } from '@prisma/client';
export declare class UpdateSectorDto {
    companyId?: string;
    unitId?: string;
    name?: string;
    description?: string;
    status?: EntityStatus;
}
