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
const backups_types_1 = require("./backups.types");
let BackupsService = class BackupsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async export(entities) {
        const selected = entities.filter((entity) => backups_types_1.backupEntities.includes(entity));
        const data = {};
        for (const entity of selected) {
            switch (entity) {
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
                case 'shares':
                    data.shares = await this.prisma.share.findMany();
                    break;
                case 'favorites':
                    data.favorites = await this.prisma.favorite.findMany();
                    break;
                case 'notifications':
                    data.notifications = await this.prisma.notification.findMany();
                    break;
                case 'systemConfig':
                    data.systemConfig = await this.prisma.systemConfig.findMany();
                    break;
                default:
                    break;
            }
        }
        return {
            meta: {
                version: 1,
                createdAt: new Date().toISOString(),
                entities: selected,
            },
            data,
        };
    }
    async exportArchive(entities) {
        const payload = await this.export(entities);
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
        const selected = (entities && entities.length > 0
            ? entities
            : payload.meta?.entities || [])
            .filter((entity) => backups_types_1.backupEntities.includes(entity));
        const restored = {};
        await this.prisma.$transaction(async (tx) => {
            for (const entity of selected) {
                const rawItems = payload.data?.[entity];
                const items = Array.isArray(rawItems) ? rawItems : [];
                switch (entity) {
                    case 'users':
                        restored.users = await this.upsertById(tx.user, items);
                        break;
                    case 'rolePermissions':
                        restored.rolePermissions = await this.upsertByRole(tx.rolePermission, items);
                        break;
                    case 'categories':
                        restored.categories = await this.upsertById(tx.category, items);
                        break;
                    case 'links':
                        restored.links = await this.upsertById(tx.link, items);
                        break;
                    case 'uploadedSchedules':
                        restored.uploadedSchedules = await this.upsertById(tx.uploadedSchedule, items);
                        break;
                    case 'notes':
                        restored.notes = await this.upsertById(tx.note, items);
                        break;
                    case 'uploadedImages':
                        restored.uploadedImages = await this.upsertById(tx.uploadedImage, items);
                        break;
                    case 'shares':
                        restored.shares = await this.upsertById(tx.share, items);
                        break;
                    case 'favorites':
                        restored.favorites = await this.upsertById(tx.favorite, items);
                        break;
                    case 'notifications':
                        restored.notifications = await this.upsertById(tx.notification, items);
                        break;
                    case 'systemConfig':
                        restored.systemConfig = await this.upsertByKey(tx.systemConfig, items);
                        break;
                    default:
                        break;
                }
            }
        });
        return { restored };
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
            return this.restore(payload, entities, mode);
        }
        finally {
            try {
                await (0, promises_1.unlink)(filePath);
            }
            catch {
            }
        }
    }
    async cleanupOldBackups(directory, retentionDays) {
        if (retentionDays <= 0)
            return 0;
        const resolvedDir = (0, path_1.isAbsolute)(directory)
            ? directory
            : (0, path_1.resolve)(process.cwd(), directory);
        try {
            const files = await (0, promises_1.readdir)(resolvedDir);
            const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
            let deleted = 0;
            for (const name of files) {
                const path = (0, path_1.resolve)(resolvedDir, name);
                try {
                    const fileStat = await (0, promises_1.stat)(path);
                    if (!fileStat.isFile())
                        continue;
                    if (fileStat.mtime.getTime() >= cutoff)
                        continue;
                    await (0, promises_1.unlink)(path);
                    deleted += 1;
                }
                catch {
                }
            }
            return deleted;
        }
        catch {
            return 0;
        }
    }
    async upsertById(model, items) {
        for (const item of items) {
            const { id, ...rest } = item;
            if (!id || typeof id !== 'string')
                continue;
            await model.upsert({
                where: { id },
                update: rest,
                create: item,
            });
        }
        return items.length;
    }
    async upsertByRole(model, items) {
        for (const item of items) {
            const role = item.role;
            if (!role || typeof role !== 'string')
                continue;
            const { role: _, ...rest } = item;
            await model.upsert({
                where: { role },
                update: rest,
                create: item,
            });
        }
        return items.length;
    }
    async upsertByKey(model, items) {
        for (const item of items) {
            const key = item.key;
            if (!key || typeof key !== 'string')
                continue;
            const { key: _, ...rest } = item;
            await model.upsert({
                where: { key },
                update: rest,
                create: item,
            });
        }
        return items.length;
    }
};
exports.BackupsService = BackupsService;
exports.BackupsService = BackupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BackupsService);
//# sourceMappingURL=backups.service.js.map