import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { SystemConfigService } from '../system-config/system-config.service';
import { BackupsService } from './backups.service';
import { ExportBackupDto } from './dto/export-backup.dto';
export declare class BackupsController {
    private readonly backupsService;
    private readonly systemConfigService;
    constructor(backupsService: BackupsService, systemConfigService: SystemConfigService);
    listAutoBackups(): Promise<{
        directory: string;
        files: {
            name: string;
            size: number;
            updatedAt: string;
        }[];
    }>;
    openAutoBackups(): Promise<{
        opened: boolean;
        directory: string;
        reason?: undefined;
    } | {
        opened: boolean;
        directory: string;
        reason: string;
    }>;
    downloadAutoBackup(name: string, res: Response): Promise<StreamableFile>;
    export(data: ExportBackupDto, res: Response): Promise<StreamableFile>;
    restore(file: Express.Multer.File | undefined, body: Record<string, unknown>): Promise<{
        restored: {};
        skipped: readonly ["companies", "units", "sectors", "users", "rolePermissions", "categories", "links", "uploadedSchedules", "notes", "uploadedImages"];
    } | {
        restored: Record<string, number>;
        skipped?: undefined;
    }>;
    private parseEntities;
    private parsePayload;
    private resolveAutoBackupDir;
}
