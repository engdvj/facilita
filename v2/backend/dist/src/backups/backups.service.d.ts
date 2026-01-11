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
    restore(payload: BackupPayload, entities?: BackupEntity[], mode?: 'merge'): Promise<{
        restored: {};
        skipped: readonly ["companies", "units", "sectors", "users", "rolePermissions", "categories", "links", "uploadedSchedules", "notes", "tags", "tagOnLink", "tagOnSchedule"];
    } | {
        restored: Record<string, number>;
        skipped?: undefined;
    }>;
    restoreFromArchive(filePath: string, entities?: BackupEntity[], mode?: 'merge'): Promise<{
        files: {
            restored: number;
            skipped: number;
        };
        restored: {};
        skipped: readonly ["companies", "units", "sectors", "users", "rolePermissions", "categories", "links", "uploadedSchedules", "notes", "tags", "tagOnLink", "tagOnSchedule"];
    } | {
        files: {
            restored: number;
            skipped: number;
        };
        restored: Record<string, number>;
        skipped?: undefined;
    }>;
    private resolveSelectedEntities;
    private collectUploadRelativePaths;
    private extractUploadRelativePath;
    private sanitizeUploadRelativePath;
    private resolveExistingUploadEntries;
    private getUploadsRoot;
    private isWithinRoot;
    private upsertById;
    private upsertByRole;
    private upsertTagOnLink;
    private upsertTagOnSchedule;
}
export {};
