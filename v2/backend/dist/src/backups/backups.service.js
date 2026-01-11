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
const archiver_1 = require("archiver");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const stream_1 = require("stream");
const promises_2 = require("stream/promises");
const unzipper = require("unzipper");
const prisma_service_1 = require("../prisma/prisma.service");
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
    'tags',
    'tagOnLink',
    'tagOnSchedule',
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
                case 'tags':
                    data.tags = await this.prisma.tag.findMany();
                    break;
                case 'tagOnLink':
                    data.tagOnLink = await this.prisma.tagOnLink.findMany();
                    break;
                case 'tagOnSchedule':
                    data.tagOnSchedule = await this.prisma.tagOnSchedule.findMany();
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
        const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
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
    async restore(payload, entities, mode = 'merge') {
        if (mode !== 'merge') {
            return { restored: {}, skipped: backups_types_1.backupEntities };
        }
        const selectedEntities = this.resolveSelectedEntities(payload, entities);
        const restoreTargets = restoreOrder.filter((entity) => selectedEntities.includes(entity));
        const results = {};
        await this.prisma.$transaction(async (tx) => {
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
                    case 'tags':
                        results.tags = await this.upsertById(tx.tag, items);
                        break;
                    case 'tagOnLink':
                        results.tagOnLink = await this.upsertTagOnLink(tx, items);
                        break;
                    case 'tagOnSchedule':
                        results.tagOnSchedule = await this.upsertTagOnSchedule(tx, items);
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
        return (0, path_1.resolve)(process.cwd(), 'uploads');
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
    async upsertTagOnLink(tx, items) {
        let count = 0;
        for (const item of items) {
            await tx.tagOnLink.upsert({
                where: {
                    linkId_tagId: {
                        linkId: item.linkId,
                        tagId: item.tagId,
                    },
                },
                update: {},
                create: item,
            });
            count += 1;
        }
        return count;
    }
    async upsertTagOnSchedule(tx, items) {
        let count = 0;
        for (const item of items) {
            await tx.tagOnSchedule.upsert({
                where: {
                    scheduleId_tagId: {
                        scheduleId: item.scheduleId,
                        tagId: item.tagId,
                    },
                },
                update: {},
                create: item,
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