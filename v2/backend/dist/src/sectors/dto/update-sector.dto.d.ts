import { EntityStatus } from '@prisma/client';
export declare class UpdateSectorUnitDto {
    unitId: string;
    isPrimary?: boolean;
}
export declare class UpdateSectorDto {
    companyId?: string;
    units?: UpdateSectorUnitDto[];
    name?: string;
    description?: string;
    status?: EntityStatus;
}
