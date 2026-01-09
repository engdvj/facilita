import { PrismaService } from '../prisma/prisma.service';
import { BackupEntity, BackupPayload } from './backups.types';
export declare class BackupsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    export(entities: BackupEntity[]): Promise<BackupPayload>;
    restore(payload: BackupPayload, entities?: BackupEntity[], mode?: 'merge'): Promise<{
        restored: {};
        skipped: readonly ["companies", "units", "sectors", "users", "rolePermissions", "categories", "links", "uploadedSchedules", "tags", "tagOnLink", "tagOnSchedule"];
    } | {
        restored: Record<string, number>;
        skipped?: undefined;
    }>;
    private upsertById;
    private upsertByRole;
    private upsertTagOnLink;
    private upsertTagOnSchedule;
}
