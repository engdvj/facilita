export declare const backupEntities: readonly ["companies", "units", "sectors", "users", "rolePermissions", "categories", "links", "uploadedSchedules", "notes", "uploadedImages"];
export type BackupEntity = (typeof backupEntities)[number];
export type BackupPayload = {
    meta: {
        version: number;
        createdAt: string;
        entities: BackupEntity[];
    };
    data: Partial<Record<BackupEntity, unknown[]>>;
};
