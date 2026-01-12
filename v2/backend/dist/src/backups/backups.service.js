"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupsService = void 0;
const common_1 = require("@nestjs/common");
const archiver = require("archiver");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const stream_1 = require("stream");
const promises_2 = require("stream/promises");
const unzipper = require("unzipper");
const prisma_service_1 = require("../prisma/prisma.service");
const system_config_store_1 = require("../system-config/system-config.store");
const backups_types_1 = require("./backups.types");
const restoreOrder = [
    'companies',
    'units',
    'sectors',
    'users',
    'rolePermissions',
    'categories',
    'links',
    'uploadedSchedules',
    'notes',
];
let BackupsService = class BackupsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async export(entities) {
        const data = {};
        for (const entity of entities) {
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
                default:
                    break;
            }
        }
        return {
            meta: {
                version: 1,
                createdAt: new Date().toISOString(),
                entities,
            },
            data,
        };
    }
    async exportArchive(entities) {
        const payload = await this.export(entities);
        const selectedEntities = this.resolveSelectedEntities(payload, entities);
        const relativePaths = this.collectUploadRelativePaths(payload, selectedEntities);
        const fileEntries = this.resolveExistingUploadEntries(relativePaths);
        const archive = archiver('zip', { zlib: { level: 9 } });
        const stream = new stream_1.PassThrough();
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
    async exportArchiveToFile(entities, targetDir, prefix = 'facilita-backup') {
        const resolvedDir = (0, path_1.isAbsolute)(targetDir)
            ? targetDir
            : (0, path_1.resolve)(process.cwd(), targetDir);
        await (0, promises_1.mkdir)(resolvedDir, { recursive: true });
        const archive = await this.exportArchive(entities);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${prefix}-${timestamp}.zip`;
        const filePath = (0, path_1.resolve)(resolvedDir, filename);
        await (0, promises_2.pipeline)(archive.stream, (0, fs_1.createWriteStream)(filePath));
        return { path: filePath, filename };
    }
    async restore(payload, entities, mode = 'merge') {
        if (mode !== 'merge') {
            return { restored: {}, skipped: backups_types_1.backupEntities };
        }
        const selectedEntities = this.resolveSelectedEntities(payload, entities);
        const restoreTargets = restoreOrder.filter((entity) => selectedEntities.includes(entity));
        const results = {};
        await this.prisma.$transaction(async (tx) => {
            await this.reconcileUniqueIds(tx, payload);
            for (const entity of restoreTargets) {
                const raw = payload.data?.[entity];
                const items = Array.isArray(raw) ? raw : [];
                switch (entity) {
                    case 'companies':
                        results.companies = await this.upsertById(tx.company, items);
                        break;
                    case 'units':
                        results.units = await this.upsertById(tx.unit, items);
                        break;
                    case 'sectors':
                        results.sectors = await this.upsertById(tx.sector, items);
                        break;
                    case 'users':
                        results.users = await this.upsertById(tx.user, items);
                        break;
                    case 'rolePermissions':
                        results.rolePermissions = await this.upsertByRole(tx.rolePermission, items);
                        break;
                    case 'categories':
                        results.categories = await this.upsertById(tx.category, items);
                        break;
                    case 'links':
                        results.links = await this.upsertById(tx.link, items);
                        break;
                    case 'uploadedSchedules':
                        results.uploadedSchedules = await this.upsertById(tx.uploadedSchedule, items);
                        break;
                    case 'notes':
                        results.notes = await this.upsertById(tx.note, items);
                        break;
                    default:
                        break;
                }
            }
        });
        return { restored: results };
    }
    async restoreFromArchive(filePath, entities, mode = 'merge') {
        try {
            const directory = await unzipper.Open.file(filePath);
            const backupEntry = directory.files.find((entry) => entry.path === 'backup.json');
            if (!backupEntry) {
                throw new common_1.BadRequestException('Arquivo de backup invalido: backup.json ausente.');
            }
            let payload;
            try {
                const raw = await backupEntry.buffer();
                payload = JSON.parse(raw.toString('utf-8'));
            }
            catch {
                throw new common_1.BadRequestException('Arquivo de backup invalido: JSON corrompido.');
            }
            const selectedEntities = this.resolveSelectedEntities(payload, entities);
            const allowedPaths = this.collectUploadRelativePaths(payload, selectedEntities);
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
                const safeRelative = this.sanitizeUploadRelativePath(uploadsRoot, archiveRelative);
                if (!safeRelative || !allowedPaths.has(safeRelative)) {
                    filesSkipped += 1;
                    continue;
                }
                const targetPath = (0, path_1.resolve)(uploadsRoot, ...safeRelative.split('/'));
                if ((0, fs_1.existsSync)(targetPath)) {
                    filesSkipped += 1;
                    continue;
                }
                await (0, promises_1.mkdir)((0, path_1.dirname)(targetPath), { recursive: true });
                await (0, promises_2.pipeline)(entry.stream(), (0, fs_1.createWriteStream)(targetPath));
                filesRestored += 1;
            }
            const result = await this.restore(payload, entities, mode);
            return {
                ...result,
                files: { restored: filesRestored, skipped: filesSkipped },
            };
        }
        finally {
            await (0, promises_1.unlink)(filePath).catch(() => undefined);
        }
    }
    async cleanupOldBackups(directory, retentionDays) {
        if (retentionDays <= 0) {
            return 0;
        }
        const resolvedDir = (0, path_1.isAbsolute)(directory)
            ? directory
            : (0, path_1.resolve)(process.cwd(), directory);
        let entries = [];
        try {
            entries = await (0, promises_1.readdir)(resolvedDir, { withFileTypes: true }).then((items) => items.filter((item) => item.isFile()));
        }
        catch {
            return 0;
        }
        const threshold = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
        let deleted = 0;
        for (const entry of entries) {
            if (!entry.name.endsWith('.zip')) {
                continue;
            }
            const filePath = (0, path_1.resolve)(resolvedDir, entry.name);
            try {
                const fileStat = await (0, promises_1.stat)(filePath);
                if (fileStat.mtimeMs < threshold) {
                    await (0, promises_1.unlink)(filePath);
                    deleted += 1;
                }
            }
            catch {
                continue;
            }
        }
        return deleted;
    }
    resolveSelectedEntities(payload, entities) {
        const fallbackEntities = Object.keys(payload.data || {});
        return entities && entities.length
            ? entities
            : payload.meta?.entities || fallbackEntities;
    }
    collectUploadRelativePaths(payload, entities) {
        const uploadsRoot = this.getUploadsRoot();
        const paths = new Set();
        const addUrl = (value) => {
            if (typeof value !== 'string') {
                return;
            }
            const relativePath = this.extractUploadRelativePath(value);
            if (!relativePath) {
                return;
            }
            const safePath = this.sanitizeUploadRelativePath(uploadsRoot, relativePath);
            if (safePath) {
                paths.add(safePath);
            }
        };
        const addFrom = (entity, keys) => {
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
                const record = item;
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
        return paths;
    }
    async reconcileUniqueIds(tx, payload) {
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
        this.applyIdMap(data.sectors, 'unitId', unitIdMap);
        this.applyIdMap(data.users, 'unitId', unitIdMap);
        this.applyIdMap(data.links, 'userId', userIdMap);
        this.applyIdMap(data.uploadedSchedules, 'userId', userIdMap);
        this.applyIdMap(data.notes, 'userId', userIdMap);
    }
    async buildCompanyIdMap(tx, items) {
        const cnpjs = this.collectStrings(items, 'cnpj');
        if (!cnpjs.length) {
            return new Map();
        }
        const existing = await tx.company.findMany({
            where: { cnpj: { in: cnpjs } },
            select: { id: true, cnpj: true },
        });
        const byCnpj = new Map(existing
            .filter((item) => item.cnpj)
            .map((item) => [item.cnpj, item.id]));
        return this.buildIdMap(items, 'cnpj', byCnpj);
    }
    async buildUnitIdMap(tx, items) {
        const cnpjs = this.collectStrings(items, 'cnpj');
        if (!cnpjs.length) {
            return new Map();
        }
        const existing = await tx.unit.findMany({
            where: { cnpj: { in: cnpjs } },
            select: { id: true, cnpj: true },
        });
        const byCnpj = new Map(existing
            .filter((item) => item.cnpj)
            .map((item) => [item.cnpj, item.id]));
        return this.buildIdMap(items, 'cnpj', byCnpj);
    }
    async buildUserIdMap(tx, items) {
        const emails = this.collectStrings(items, 'email');
        const cpfs = this.collectStrings(items, 'cpf');
        if (!emails.length && !cpfs.length) {
            return new Map();
        }
        const existing = await tx.user.findMany({
            where: {
                OR: [
                    emails.length ? { email: { in: emails } } : undefined,
                    cpfs.length ? { cpf: { in: cpfs } } : undefined,
                ].filter(Boolean),
            },
            select: { id: true, email: true, cpf: true },
        });
        const byEmail = new Map(existing
            .filter((item) => item.email)
            .map((item) => [item.email, item.id]));
        const byCpf = new Map(existing
            .filter((item) => item.cpf)
            .map((item) => [item.cpf, item.id]));
        const map = new Map();
        for (const item of items) {
            if (!item || typeof item !== 'object') {
                continue;
            }
            const record = item;
            const id = typeof record.id === 'string' ? record.id : null;
            if (!id) {
                continue;
            }
            const email = typeof record.email === 'string' ? record.email.trim() : '';
            const cpf = typeof record.cpf === 'string' ? record.cpf.trim() : '';
            const existingId = (email && byEmail.get(email)) || (cpf && byCpf.get(cpf));
            if (existingId && existingId !== id) {
                map.set(id, existingId);
            }
        }
        return map;
    }
    buildIdMap(items, key, byKey) {
        const map = new Map();
        for (const item of items) {
            if (!item || typeof item !== 'object') {
                continue;
            }
            const record = item;
            const id = typeof record.id === 'string' ? record.id : null;
            const rawValue = typeof record[key] === 'string' ? record[key].trim() : '';
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
    collectStrings(items, key) {
        const values = new Set();
        for (const item of items) {
            if (!item || typeof item !== 'object') {
                continue;
            }
            const record = item;
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
    applyIdMap(items, key, map) {
        if (!map.size || !Array.isArray(items)) {
            return;
        }
        for (const item of items) {
            if (!item || typeof item !== 'object') {
                continue;
            }
            const record = item;
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
    extractUploadRelativePath(value) {
        const trimmed = value.trim();
        if (!trimmed) {
            return null;
        }
        let pathname = trimmed;
        if (/^https?:\/\//i.test(trimmed)) {
            try {
                pathname = new URL(trimmed).pathname;
            }
            catch {
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
    sanitizeUploadRelativePath(uploadsRoot, relativePath) {
        const cleaned = relativePath.replace(/^[/\\]+/, '');
        if (!cleaned) {
            return null;
        }
        const target = (0, path_1.resolve)(uploadsRoot, cleaned);
        if (!this.isWithinRoot(uploadsRoot, target)) {
            return null;
        }
        const safeRelative = (0, path_1.relative)(uploadsRoot, target);
        if (!safeRelative) {
            return null;
        }
        return safeRelative.split(path_1.sep).join('/');
    }
    resolveExistingUploadEntries(relativePaths) {
        const uploadsRoot = this.getUploadsRoot();
        const entries = [];
        for (const relativePath of relativePaths) {
            const absolutePath = (0, path_1.resolve)(uploadsRoot, ...relativePath.split('/'));
            if ((0, fs_1.existsSync)(absolutePath)) {
                entries.push({ archivePath: relativePath, absolutePath });
            }
        }
        return entries;
    }
    getUploadsRoot() {
        return (0, system_config_store_1.resolveConfigPath)('upload_directory', 'uploads');
    }
    isWithinRoot(root, target) {
        const relativePath = (0, path_1.relative)(root, target);
        return (relativePath &&
            !relativePath.startsWith('..') &&
            !relativePath.startsWith(`..${path_1.sep}`) &&
            !(0, path_1.isAbsolute)(relativePath));
    }
    async upsertById(model, items) {
        let count = 0;
        for (const item of items) {
            const { id, ...data } = item;
            if (!id) {
                continue;
            }
            await model.upsert({
                where: { id },
                update: data,
                create: { id, ...data },
            });
            count += 1;
        }
        return count;
    }
    async upsertByRole(model, items) {
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
};
exports.BackupsService = BackupsService;
exports.BackupsService = BackupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BackupsService);
//# sourceMappingURL=backups.service.js.map