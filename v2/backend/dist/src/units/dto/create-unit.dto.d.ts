import { EntityStatus } from '@prisma/client';
export declare class CreateUnitDto {
    companyId: string;
    name: string;
    cnpj?: string;
    status?: EntityStatus;
}
