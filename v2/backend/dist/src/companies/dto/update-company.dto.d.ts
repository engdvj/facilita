import { EntityStatus } from '@prisma/client';
export declare class UpdateCompanyDto {
    name?: string;
    cnpj?: string;
    logoUrl?: string;
    status?: EntityStatus;
}
