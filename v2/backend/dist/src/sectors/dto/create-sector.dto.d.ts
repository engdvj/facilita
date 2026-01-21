import { EntityStatus } from '@prisma/client';
export declare class SectorUnitDto {
    unitId: string;
    isPrimary?: boolean;
}
export declare class CreateSectorDto {
    companyId: string;
    units: SectorUnitDto[];
    name: string;
    description?: string;
    status?: EntityStatus;
}
