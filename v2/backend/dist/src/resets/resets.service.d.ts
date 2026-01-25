import { type BackupEntity } from '../backups/backups.types';
import { PrismaService } from '../prisma/prisma.service';
export declare class ResetsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    reset(entities: BackupEntity[]): Promise<{
        deleted: Partial<Record<"sectors" | "links" | "notes" | "uploadedImages" | "users" | "units" | "categories" | "companies" | "rolePermissions" | "uploadedSchedules", number>>;
        entities: ("sectors" | "links" | "notes" | "uploadedImages" | "users" | "units" | "categories" | "companies" | "rolePermissions" | "uploadedSchedules")[];
        seeded: boolean;
    }>;
    private detachRelations;
    private clearDependents;
    private deleteEntities;
    private seedAdmCompany;
    private seedRolePermissions;
    private seedSuperAdmin;
}
