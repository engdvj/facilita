import { type BackupEntity } from '../backups/backups.types';
import { PrismaService } from '../prisma/prisma.service';
export declare class ResetsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    reset(entities: BackupEntity[]): Promise<{
        deleted: Partial<Record<"systemConfig" | "categories" | "favorites" | "uploadedImages" | "notifications" | "links" | "notes" | "shares" | "users" | "rolePermissions" | "uploadedSchedules", number>>;
        entities: ("systemConfig" | "categories" | "favorites" | "uploadedImages" | "notifications" | "links" | "notes" | "shares" | "users" | "rolePermissions" | "uploadedSchedules")[];
        seeded: boolean;
    }>;
    private seedRolePermissions;
    private seedSuperAdmin;
}
