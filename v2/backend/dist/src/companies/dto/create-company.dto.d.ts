import { EntityStatus } from '@prisma/client';
export declare class CreateCompanyDto {
    name: string;
    cnpj?: string;
    logoUrl?: string;
    status?: EntityStatus;
}
