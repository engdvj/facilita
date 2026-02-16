export declare const backupEntities: readonly ["users", "rolePermissions", "categories", "links", "uploadedSchedules", "notes", "uploadedImages", "shares", "favorites", "notifications", "systemConfig"];
export type BackupEntity = (typeof backupEntities)[number];
export type BackupPayload = {
    meta: {
        version: number;
        createdAt: string;
        entities: BackupEntity[];
    };
    data: Partial<Record<BackupEntity, unknown[]>>;
};
