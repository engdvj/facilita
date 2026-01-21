import { type BackupEntity } from '../backups.types';
export declare class BackupPayloadDto {
    meta: Record<string, unknown>;
    data: Record<string, unknown>;
}
export declare class RestoreBackupDto {
    entities?: BackupEntity[];
    mode?: 'merge';
    backup: BackupPayloadDto;
}
