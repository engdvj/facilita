import { EntityStatus } from '@prisma/client';
export declare class UpdateUnitDto {
    companyId?: string;
    name?: string;
    cnpj?: string;
    status?: EntityStatus;
}
