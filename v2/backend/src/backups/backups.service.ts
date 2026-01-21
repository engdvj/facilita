import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import * as archiver from 'archiver';
import { createWriteStream, existsSync } from 'fs';
import { mkdir, readdir, stat, unlink } from 'fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'path';
import { PassThrough } from 'stream';
import { pipeline } from 'stream/promises';
import * as unzipper from 'unzipper';
import { PrismaService } from '../prisma/prisma.service';
import { resolveConfigPath } from '../system-config/system-config.store';
import { BackupEntity, BackupPayload, backupEntities } from './backups.types';
import { isUserMode } from '../common/app-mode';

const restoreOrder: BackupEntity[] = [
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
];

type BackupArchive = {
  stream: PassThrough;
  filename: string;
};

@Injectable()
export class BackupsService {
  constructor(private readonly prisma: PrismaService) {}

  private filterEntities(entities: BackupEntity[]) {
    if (!isUserMode()) return entities;
    return entities.filter(
      (entity) =>
        entity !== 'companies' && entity !== 'units' && entity !== 'sectors',
    );
  }

  async export(entities: BackupEntity[]): Promise<BackupPayload> {
    const data: BackupPayload['data'] = {};
    const resolvedEntities = this.filterEntities(entities);

    for (const entity of resolvedEntities) {
      switch (entity) {
        case 'companies':
          data.companies = await this.prisma.company.findMany();
          break;
        case 'units':
          data.units = await this.prisma.unit.findMany();
          break;
        case 'sectors':
          data.sectors = await this.prisma.sector.findMany();
          break;
        case 'users':
          data.users = await this.prisma.user.findMany();
          break;
        case 'rolePermissions':
          data.rolePermissions = await this.prisma.rolePermission.findMany();
          break;
        case 'categories':
          data.categories = await this.prisma.category.findMany();
          break;
        case 'links':
          data.links = await this.prisma.link.findMany();
          break;
        case 'uploadedSchedules':
          data.uploadedSchedules = await this.prisma.uploadedSchedule.findMany();
          break;
        case 'notes':
          data.notes = await this.prisma.note.findMany();
          break;
        case 'uploadedImages':
          data.uploadedImages = await this.prisma.uploadedImage.findMany();
          break;
        default:
          break;
      }
    }

    return {
      meta: {
        version: 1,
        createdAt: new Date().toISOString(),
        entities: resolvedEntities,
      },
      data,
    };
  }

  async exportArchive(entities: BackupEntity[]): Promise<BackupArchive> {
    const payload = await this.export(entities);
    const selectedEntities = this.resolveSelectedEntities(payload, entities);
    const relativePaths = this.collectUploadRelativePaths(
      payload,
      selectedEntities,
    );
    const fileEntries = this.resolveExistingUploadEntries(relativePaths);
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = new PassThrough();

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        return;
      }
      stream.destroy(err);
    });
    archive.on('error', (err) => stream.destroy(err));

    archive.pipe(stream);
    archive.append(JSON.stringify(payload, null, 2), { name: 'backup.json' });

    for (const entry of fileEntries) {
      archive.file(entry.absolutePath, { name: `uploads/${entry.archivePath}` });
    }

    void archive.finalize();

    const date = new Date().toISOString().slice(0, 10);
    return {
      stream,
      filename: `facilita-backup-${date}.zip`,
    };
  }

  async exportArchiveToFile(
    entities: BackupEntity[],
    targetDir: string,
    prefix = 'facilita-backup',
  ) {
    const resolvedDir = isAbsolute(targetDir)
      ? targetDir
      : resolve(process.cwd(), targetDir);
    await mkdir(resolvedDir, { recursive: true });

    const archive = await this.exportArchive(entities);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${prefix}-${timestamp}.zip`;
    const filePath = resolve(resolvedDir, filename);

    await pipeline(archive.stream, createWriteStream(filePath));
    return { path: filePath, filename };
  }

  async restore(
    payload: BackupPayload,
    entities?: BackupEntity[],
    mode: 'merge' = 'merge',
  ) {
    if (mode !== 'merge') {
      return { restored: {}, skipped: backupEntities };
    }

    const selectedEntities = this.filterEntities(
      this.resolveSelectedEntities(payload, entities),
    );
    const restoreTargets = restoreOrder.filter((entity) =>
      selectedEntities.includes(entity),
    );

    const results: Record<string, number> = {};

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await this.reconcileUniqueIds(tx, payload);
      for (const entity of restoreTargets) {
        const raw = payload.data?.[entity];
        const items = Array.isArray(raw) ? raw : [];

        switch (entity) {
          case 'companies':
            results.companies = await this.upsertById(
              tx.company,
              items as Prisma.CompanyUncheckedCreateInput[],
            );
            break;
          case 'units':
            results.units = await this.upsertById(
              tx.unit,
              items as Prisma.UnitUncheckedCreateInput[],
            );
            break;
          case 'sectors':
            results.sectors = await this.upsertById(
              tx.sector,
              items as Prisma.SectorUncheckedCreateInput[],
            );
            break;
          case 'users':
            results.users = await this.upsertById(
              tx.user,
              items as Prisma.UserUncheckedCreateInput[],
            );
            break;
          case 'rolePermissions':
            results.rolePermissions = await this.upsertByRole(
              tx.rolePermission,
              items as Prisma.RolePermissionUncheckedCreateInput[],
            );
            break;
          case 'categories':
            results.categories = await this.upsertById(
              tx.category,
              items as Prisma.CategoryUncheckedCreateInput[],
            );
            break;
          case 'links':
            results.links = await this.upsertById(
              tx.link,
              items as Prisma.LinkUncheckedCreateInput[],
            );
            break;
          case 'uploadedSchedules':
            results.uploadedSchedules = await this.upsertById(
              tx.uploadedSchedule,
              items as Prisma.UploadedScheduleUncheckedCreateInput[],
            );
            break;
          case 'notes':
            results.notes = await this.upsertById(
              tx.note,
              items as Prisma.NoteUncheckedCreateInput[],
            );
            break;
          case 'uploadedImages':
            results.uploadedImages = await this.upsertById(
              tx.uploadedImage,
              items as Prisma.UploadedImageUncheckedCreateInput[],
            );
            break;
          default:
            break;
        }
      }
    });

    return { restored: results };
  }

  async restoreFromArchive(
    filePath: string,
    entities?: BackupEntity[],
    mode: 'merge' = 'merge',
  ) {
    try {
      const directory = await unzipper.Open.file(filePath);
      const backupEntry = directory.files.find(
        (entry) => entry.path === 'backup.json',
      );

      if (!backupEntry) {
        throw new BadRequestException(
          'Arquivo de backup invalido: backup.json ausente.',
        );
      }

      let payload: BackupPayload;
      try {
        const raw = await backupEntry.buffer();
        payload = JSON.parse(raw.toString('utf-8')) as BackupPayload;
      } catch {
        throw new BadRequestException(
          'Arquivo de backup invalido: JSON corrompido.',
        );
      }

      const selectedEntities = this.resolveSelectedEntities(payload, entities);
      const allowedPaths = this.collectUploadRelativePaths(
        payload,
        selectedEntities,
      );
      const uploadsRoot = this.getUploadsRoot();

      let filesRestored = 0;
      let filesSkipped = 0;

      for (const entry of directory.files) {
        if (entry.type !== 'File') {
          continue;
        }
        if (!entry.path.startsWith('uploads/')) {
          continue;
        }

        const archiveRelative = entry.path.slice('uploads/'.length);
        const safeRelative = this.sanitizeUploadRelativePath(
          uploadsRoot,
          archiveRelative,
        );

        if (!safeRelative || !allowedPaths.has(safeRelative)) {
          filesSkipped += 1;
          continue;
        }

        const targetPath = resolve(uploadsRoot, ...safeRelative.split('/'));
        if (existsSync(targetPath)) {
          filesSkipped += 1;
          continue;
        }

        await mkdir(dirname(targetPath), { recursive: true });
        await pipeline(entry.stream(), createWriteStream(targetPath));
        filesRestored += 1;
      }

      const result = await this.restore(payload, entities, mode);
      return {
        ...result,
        files: { restored: filesRestored, skipped: filesSkipped },
      };
    } finally {
      await unlink(filePath).catch(() => undefined);
    }
  }

  async cleanupOldBackups(directory: string, retentionDays: number) {
    if (retentionDays <= 0) {
      return 0;
    }

    const resolvedDir = isAbsolute(directory)
      ? directory
      : resolve(process.cwd(), directory);
    let entries: { name: string }[] = [];

    try {
      entries = await readdir(resolvedDir, { withFileTypes: true }).then(
        (items) => items.filter((item) => item.isFile()),
      );
    } catch {
      return 0;
    }

    const threshold = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    let deleted = 0;

    for (const entry of entries) {
      if (!entry.name.endsWith('.zip')) {
        continue;
      }
      const filePath = resolve(resolvedDir, entry.name);
      try {
        const fileStat = await stat(filePath);
        if (fileStat.mtimeMs < threshold) {
          await unlink(filePath);
          deleted += 1;
        }
      } catch {
        continue;
      }
    }

    return deleted;
  }

  private resolveSelectedEntities(
    payload: BackupPayload,
    entities?: BackupEntity[],
  ) {
    const fallbackEntities = Object.keys(payload.data || {}) as BackupEntity[];
    return entities && entities.length
      ? entities
      : payload.meta?.entities || fallbackEntities;
  }

  private collectUploadRelativePaths(
    payload: BackupPayload,
    entities: BackupEntity[],
  ) {
    const uploadsRoot = this.getUploadsRoot();
    const paths = new Set<string>();

    const addUrl = (value: unknown) => {
      if (typeof value !== 'string') {
        return;
      }
      const relativePath = this.extractUploadRelativePath(value);
      if (!relativePath) {
        return;
      }
      const safePath = this.sanitizeUploadRelativePath(
        uploadsRoot,
        relativePath,
      );
      if (safePath) {
        paths.add(safePath);
      }
    };

    const addFrom = (entity: BackupEntity, keys: string[]) => {
      if (!entities.includes(entity)) {
        return;
      }
      const items = payload.data?.[entity];
      if (!Array.isArray(items)) {
        return;
      }
      for (const item of items) {
        if (!item || typeof item !== 'object') {
          continue;
        }
        const record = item as Record<string, unknown>;
        for (const key of keys) {
          addUrl(record[key]);
        }
      }
    };

    addFrom('companies', ['logoUrl']);
    addFrom('users', ['avatarUrl']);
    addFrom('links', ['imageUrl']);
    addFrom('uploadedSchedules', ['fileUrl', 'imageUrl']);
    addFrom('notes', ['imageUrl']);
    addFrom('uploadedImages', ['url']);

    return paths;
  }

  private async reconcileUniqueIds(
    tx: Prisma.TransactionClient,
    payload: BackupPayload,
  ) {
    const data = payload.data;
    if (!data) {
      return;
    }

    const companyItems = Array.isArray(data.companies) ? data.companies : [];
    const unitItems = Array.isArray(data.units) ? data.units : [];
    const userItems = Array.isArray(data.users) ? data.users : [];

    const companyIdMap = await this.buildCompanyIdMap(tx, companyItems);
    const unitIdMap = await this.buildUnitIdMap(tx, unitItems);
    const userIdMap = await this.buildUserIdMap(tx, userItems);

    this.applyIdMap(companyItems, 'id', companyIdMap);
    this.applyIdMap(unitItems, 'id', unitIdMap);
    this.applyIdMap(userItems, 'id', userIdMap);

    this.applyIdMap(data.units, 'companyId', companyIdMap);
    this.applyIdMap(data.sectors, 'companyId', companyIdMap);
    this.applyIdMap(data.users, 'companyId', companyIdMap);
    this.applyIdMap(data.categories, 'companyId', companyIdMap);
    this.applyIdMap(data.links, 'companyId', companyIdMap);
    this.applyIdMap(data.uploadedSchedules, 'companyId', companyIdMap);
    this.applyIdMap(data.notes, 'companyId', companyIdMap);
    this.applyIdMap(data.uploadedImages, 'companyId', companyIdMap);

    this.applyIdMap(data.sectors, 'unitId', unitIdMap);
    this.applyIdMap(data.users, 'unitId', unitIdMap);

    this.applyIdMap(data.links, 'userId', userIdMap);
    this.applyIdMap(data.uploadedSchedules, 'userId', userIdMap);
    this.applyIdMap(data.notes, 'userId', userIdMap);
    this.applyIdMap(data.uploadedImages, 'uploadedBy', userIdMap);
  }

  private async buildCompanyIdMap(
    tx: Prisma.TransactionClient,
    items: unknown[],
  ) {
    const cnpjs = this.collectStrings(items, 'cnpj');
    if (!cnpjs.length) {
      return new Map<string, string>();
    }

    const existing = await tx.company.findMany({
      where: { cnpj: { in: cnpjs } },
      select: { id: true, cnpj: true },
    });
    const byCnpj = new Map(
      existing
        .filter((item) => item.cnpj)
        .map((item) => [item.cnpj as string, item.id]),
    );

    return this.buildIdMap(items, 'cnpj', byCnpj);
  }

  private async buildUnitIdMap(
    tx: Prisma.TransactionClient,
    items: unknown[],
  ) {
    const cnpjs = this.collectStrings(items, 'cnpj');
    if (!cnpjs.length) {
      return new Map<string, string>();
    }

    const existing = await tx.unit.findMany({
      where: { cnpj: { in: cnpjs } },
      select: { id: true, cnpj: true },
    });
    const byCnpj = new Map(
      existing
        .filter((item) => item.cnpj)
        .map((item) => [item.cnpj as string, item.id]),
    );

    return this.buildIdMap(items, 'cnpj', byCnpj);
  }

  private async buildUserIdMap(
    tx: Prisma.TransactionClient,
    items: unknown[],
  ) {
    const emails = this.collectStrings(items, 'email');
    const cpfs = this.collectStrings(items, 'cpf');
    if (!emails.length && !cpfs.length) {
      return new Map<string, string>();
    }

    const existing = await tx.user.findMany({
      where: {
        OR: [
          emails.length ? { email: { in: emails } } : undefined,
          cpfs.length ? { cpf: { in: cpfs } } : undefined,
        ].filter(Boolean) as Prisma.UserWhereInput[],
      },
      select: { id: true, email: true, cpf: true },
    });

    const byEmail = new Map(
      existing
        .filter((item) => item.email)
        .map((item) => [item.email as string, item.id]),
    );
    const byCpf = new Map(
      existing
        .filter((item) => item.cpf)
        .map((item) => [item.cpf as string, item.id]),
    );

    const map = new Map<string, string>();

    for (const item of items) {
      if (!item || typeof item !== 'object') {
        continue;
      }
      const record = item as Record<string, unknown>;
      const id = typeof record.id === 'string' ? record.id : null;
      if (!id) {
        continue;
      }
      const email =
        typeof record.email === 'string' ? record.email.trim() : '';
      const cpf = typeof record.cpf === 'string' ? record.cpf.trim() : '';
      const existingId = (email && byEmail.get(email)) || (cpf && byCpf.get(cpf));
      if (existingId && existingId !== id) {
        map.set(id, existingId);
      }
    }

    return map;
  }

  private buildIdMap(
    items: unknown[],
    key: string,
    byKey: Map<string, string>,
  ) {
    const map = new Map<string, string>();

    for (const item of items) {
      if (!item || typeof item !== 'object') {
        continue;
      }
      const record = item as Record<string, unknown>;
      const id = typeof record.id === 'string' ? record.id : null;
      const rawValue =
        typeof record[key] === 'string' ? record[key].trim() : '';
      if (!id || !rawValue) {
        continue;
      }
      const existingId = byKey.get(rawValue);
      if (existingId && existingId !== id) {
        map.set(id, existingId);
      }
    }

    return map;
  }

  private collectStrings(items: unknown[], key: string) {
    const values = new Set<string>();
    for (const item of items) {
      if (!item || typeof item !== 'object') {
        continue;
      }
      const record = item as Record<string, unknown>;
      const rawValue = record[key];
      if (typeof rawValue !== 'string') {
        continue;
      }
      const trimmed = rawValue.trim();
      if (trimmed) {
        values.add(trimmed);
      }
    }
    return Array.from(values);
  }

  private applyIdMap(
    items: unknown,
    key: string,
    map: Map<string, string>,
  ) {
    if (!map.size || !Array.isArray(items)) {
      return;
    }
    for (const item of items) {
      if (!item || typeof item !== 'object') {
        continue;
      }
      const record = item as Record<string, unknown>;
      const rawValue = record[key];
      if (typeof rawValue !== 'string') {
        continue;
      }
      const mapped = map.get(rawValue);
      if (mapped) {
        record[key] = mapped;
      }
    }
  }

  private extractUploadRelativePath(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    let pathname = trimmed;
    if (/^https?:\/\//i.test(trimmed)) {
      try {
        pathname = new URL(trimmed).pathname;
      } catch {
        pathname = trimmed;
      }
    }

    const marker = '/uploads/';
    const index = pathname.indexOf(marker);
    if (index >= 0) {
      return pathname.slice(index + marker.length);
    }

    if (pathname.startsWith('uploads/')) {
      return pathname.slice('uploads/'.length);
    }

    if (pathname.startsWith('/uploads/')) {
      return pathname.slice('/uploads/'.length);
    }

    return null;
  }

  private sanitizeUploadRelativePath(
    uploadsRoot: string,
    relativePath: string,
  ) {
    const cleaned = relativePath.replace(/^[/\\]+/, '');
    if (!cleaned) {
      return null;
    }

    const target = resolve(uploadsRoot, cleaned);
    if (!this.isWithinRoot(uploadsRoot, target)) {
      return null;
    }

    const safeRelative = relative(uploadsRoot, target);
    if (!safeRelative) {
      return null;
    }

    return safeRelative.split(sep).join('/');
  }

  private resolveExistingUploadEntries(relativePaths: Set<string>) {
    const uploadsRoot = this.getUploadsRoot();
    const entries: { archivePath: string; absolutePath: string }[] = [];

    for (const relativePath of relativePaths) {
      const absolutePath = resolve(uploadsRoot, ...relativePath.split('/'));
      if (existsSync(absolutePath)) {
        entries.push({ archivePath: relativePath, absolutePath });
      }
    }

    return entries;
  }

  private getUploadsRoot() {
    return resolveConfigPath('upload_directory', 'uploads');
  }

  private isWithinRoot(root: string, target: string) {
    const relativePath = relative(root, target);
    return (
      relativePath &&
      !relativePath.startsWith('..') &&
      !relativePath.startsWith(`..${sep}`) &&
      !isAbsolute(relativePath)
    );
  }

  private async upsertById<T extends { id?: string }>(
    model: {
      upsert: (args: any) => Promise<unknown>;
    },
    items: T[],
  ) {
    let count = 0;
    for (const item of items) {
      const { id, ...data } = item;
      if (!id) {
        continue;
      }
      await model.upsert({
        where: { id },
        update: data,
        create: { id, ...(data as Omit<T, 'id'>) } as T,
      });
      count += 1;
    }
    return count;
  }

  private async upsertByRole(
    model: {
      upsert: (args: {
        where: { role: UserRole };
        update: Omit<Prisma.RolePermissionUncheckedCreateInput, 'role'>;
        create: Prisma.RolePermissionUncheckedCreateInput;
      }) => Promise<unknown>;
    },
    items: Prisma.RolePermissionUncheckedCreateInput[],
  ) {
    let count = 0;
    for (const item of items) {
      const { role, ...data } = item;
      await model.upsert({
        where: { role },
        update: data,
        create: { role, ...data },
      });
      count += 1;
    }
    return count;
  }

}
