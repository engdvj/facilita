export const backupEntities = [
  'companies',
  'units',
  'sectors',
  'users',
  'rolePermissions',
  'categories',
  'links',
  'uploadedSchedules',
  'notes',
  'uploadedImages',
] as const;

export type BackupEntity = (typeof backupEntities)[number];

export type BackupPayload = {
  meta: {
    version: number;
    createdAt: string;
    entities: BackupEntity[];
  };
  data: Partial<Record<BackupEntity, unknown[]>>;
};
