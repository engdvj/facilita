import { BackupsService } from './backups.service';
import { ExportBackupDto } from './dto/export-backup.dto';
import { RestoreBackupDto } from './dto/restore-backup.dto';
export declare class BackupsController {
    private readonly backupsService;
    constructor(backupsService: BackupsService);
    export(data: ExportBackupDto): Promise<import("./backups.types").BackupPayload>;
    restore(data: RestoreBackupDto): Promise<{
        restored: {};
        skipped: readonly ["companies", "units", "sectors", "users", "rolePermissions", "categories", "links", "uploadedSchedules", "notes", "tags", "tagOnLink", "tagOnSchedule"];
    } | {
        restored: Record<string, number>;
        skipped?: undefined;
    }>;
}
