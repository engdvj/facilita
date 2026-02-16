import { PassThrough } from 'stream';
import { PrismaService } from '../prisma/prisma.service';
import { BackupEntity, BackupPayload } from './backups.types';
type BackupArchive = {
    stream: PassThrough;
    filename: string;
};
export declare class BackupsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    export(entities: BackupEntity[]): Promise<BackupPayload>;
    exportArchive(entities: BackupEntity[]): Promise<BackupArchive>;
    exportArchiveToFile(entities: BackupEntity[], targetDir: string, prefix?: string): Promise<{
        path: string;
        filename: string;
    }>;
    restore(payload: BackupPayload, entities?: BackupEntity[], mode?: 'merge'): Promise<{
        restored: {};
        skipped: readonly ["users", "rolePermissions", "categories", "links", "uploadedSchedules", "notes", "uploadedImages", "shares", "favorites", "notifications", "systemConfig"];
    } | {
        restored: Partial<Record<"systemConfig" | "categories" | "favorites" | "uploadedImages" | "notifications" | "links" | "notes" | "shares" | "users" | "rolePermissions" | "uploadedSchedules", number>>;
        skipped?: undefined;
    }>;
    restoreFromArchive(filePath: string, entities?: BackupEntity[], mode?: 'merge'): Promise<{
        restored: {};
        skipped: readonly ["users", "rolePermissions", "categories", "links", "uploadedSchedules", "notes", "uploadedImages", "shares", "favorites", "notifications", "systemConfig"];
    } | {
        restored: Partial<Record<"systemConfig" | "categories" | "favorites" | "uploadedImages" | "notifications" | "links" | "notes" | "shares" | "users" | "rolePermissions" | "uploadedSchedules", number>>;
        skipped?: undefined;
    }>;
    cleanupOldBackups(directory: string, retentionDays: number): Promise<number>;
    private upsertById;
    private upsertByRole;
    private upsertByKey;
}
export {};
