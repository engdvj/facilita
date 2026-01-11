import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { BackupsService } from './backups.service';
import { ExportBackupDto } from './dto/export-backup.dto';
export declare class BackupsController {
    private readonly backupsService;
    constructor(backupsService: BackupsService);
    export(data: ExportBackupDto, res: Response): Promise<StreamableFile>;
    restore(file: Express.Multer.File | undefined, body: Record<string, unknown>): Promise<{
        restored: {};
        skipped: readonly ["companies", "units", "sectors", "users", "rolePermissions", "categories", "links", "uploadedSchedules", "notes", "tags", "tagOnLink", "tagOnSchedule"];
    } | {
        restored: Record<string, number>;
        skipped?: undefined;
    }>;
    private parseEntities;
    private parsePayload;
}
