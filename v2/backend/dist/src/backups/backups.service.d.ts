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
        skipped: readonly ["companies", "units", "sectors", "users", "rolePermissions", "categories", "links", "uploadedSchedules", "notes"];
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
        skipped: readonly ["companies", "units", "sectors", "users", "rolePermissions", "categories", "links", "uploadedSchedules", "notes"];
    } | {
        files: {
            restored: number;
            skipped: number;
        };
        restored: Record<string, number>;
        skipped?: undefined;
    }>;
    cleanupOldBackups(directory: string, retentionDays: number): Promise<number>;
    private resolveSelectedEntities;
    private collectUploadRelativePaths;
    private extractUploadRelativePath;
    private sanitizeUploadRelativePath;
    private resolveExistingUploadEntries;
    private getUploadsRoot;
    private isWithinRoot;
    private upsertById;
    private upsertByRole;
}
export {};
