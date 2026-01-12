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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const client_1 = require("@prisma/client");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const multer_1 = require("multer");
const path_1 = require("path");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const system_config_service_1 = require("../system-config/system-config.service");
const backups_service_1 = require("./backups.service");
const export_backup_dto_1 = require("./dto/export-backup.dto");
const backups_types_1 = require("./backups.types");
const backupUploadDir = (0, path_1.join)(process.cwd(), 'backups', 'tmp');
const backupStorage = (0, multer_1.diskStorage)({
    destination: (_req, _file, cb) => {
        (0, fs_1.mkdirSync)(backupUploadDir, { recursive: true });
        cb(null, backupUploadDir);
    },
    filename: (_req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${Date.now()}-${safeName}`);
    },
});
let BackupsController = class BackupsController {
    constructor(backupsService, systemConfigService) {
        this.backupsService = backupsService;
        this.systemConfigService = systemConfigService;
    }
    async listAutoBackups() {
        const directory = this.resolveAutoBackupDir();
        try {
            const entries = await (0, promises_1.readdir)(directory);
            const files = await Promise.all(entries.map(async (name) => {
                try {
                    const filePath = (0, path_1.join)(directory, name);
                    const info = await (0, promises_1.stat)(filePath);
                    if (!info.isFile())
                        return null;
                    return {
                        name,
                        size: info.size,
                        updatedAt: info.mtime.toISOString(),
                    };
                }
                catch {
                    return null;
                }
            }));
            return {
                directory,
                files: files
                    .filter((file) => Boolean(file))
                    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
            };
        }
        catch {
            return { directory, files: [] };
        }
    }
    async openAutoBackups() {
        const directory = this.resolveAutoBackupDir();
        await (0, promises_1.mkdir)(directory, { recursive: true });
        const platform = process.platform;
        const command = platform === 'win32'
            ? 'explorer.exe'
            : platform === 'darwin'
                ? 'open'
                : 'xdg-open';
        try {
            await new Promise((resolvePromise, reject) => {
                const child = (0, child_process_1.execFile)(command, [directory], (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolvePromise();
                });
                child.on('error', reject);
            });
        }
        catch {
            throw new common_1.InternalServerErrorException('Nao foi possivel abrir o diretorio no servidor.');
        }
        return { opened: true, directory };
    }
    async downloadAutoBackup(name, res) {
        if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
            throw new common_1.BadRequestException('Arquivo invalido.');
        }
        const directory = this.resolveAutoBackupDir();
        const resolvedDir = (0, path_1.resolve)(directory);
        const filePath = (0, path_1.resolve)(directory, name);
        if (!filePath.startsWith(resolvedDir + path_1.sep)) {
            throw new common_1.BadRequestException('Arquivo invalido.');
        }
        let info;
        try {
            info = await (0, promises_1.stat)(filePath);
        }
        catch {
            throw new common_1.NotFoundException('Arquivo nao encontrado.');
        }
        if (!info.isFile()) {
            throw new common_1.NotFoundException('Arquivo nao encontrado.');
        }
        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${name}"`,
        });
        return new common_1.StreamableFile((0, fs_1.createReadStream)(filePath));
    }
    async export(data, res) {
        const archive = await this.backupsService.exportArchive(data.entities);
        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${archive.filename}"`,
        });
        return new common_1.StreamableFile(archive.stream);
    }
    async restore(file, body) {
        const entities = this.parseEntities(body.entities);
        const mode = body.mode === 'merge' ? 'merge' : 'merge';
        if (file?.path) {
            return this.backupsService.restoreFromArchive(file.path, entities, mode);
        }
        if (body.backup) {
            const payload = this.parsePayload(body.backup);
            return this.backupsService.restore(payload, entities, mode);
        }
        throw new common_1.BadRequestException('Arquivo de backup ausente.');
    }
    parseEntities(input) {
        if (!input) {
            return undefined;
        }
        const allowed = new Set(backups_types_1.backupEntities);
        const normalize = (values) => values.filter((value) => typeof value === 'string' && allowed.has(value));
        if (Array.isArray(input)) {
            return normalize(input);
        }
        if (typeof input === 'string') {
            try {
                const parsed = JSON.parse(input);
                if (Array.isArray(parsed)) {
                    return normalize(parsed);
                }
            }
            catch {
            }
            const csvValues = input
                .split(',')
                .map((value) => value.trim())
                .filter(Boolean);
            return normalize(csvValues);
        }
        return undefined;
    }
    parsePayload(input) {
        if (typeof input === 'object' && input !== null) {
            return input;
        }
        if (typeof input === 'string') {
            try {
                return JSON.parse(input);
            }
            catch {
                throw new common_1.BadRequestException('Backup invalido.');
            }
        }
        throw new common_1.BadRequestException('Backup invalido.');
    }
    resolveAutoBackupDir() {
        return this.systemConfigService.resolvePath('backup_directory', 'backups/auto');
    }
};
exports.BackupsController = BackupsController;
__decorate([
    (0, common_1.Get)('auto'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupsController.prototype, "listAutoBackups", null);
__decorate([
    (0, common_1.Post)('auto/open'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupsController.prototype, "openAutoBackups", null);
__decorate([
    (0, common_1.Get)('auto/files/:name'),
    __param(0, (0, common_1.Param)('name')),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BackupsController.prototype, "downloadAutoBackup", null);
__decorate([
    (0, common_1.Post)('export'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [export_backup_dto_1.ExportBackupDto, Object]),
    __metadata("design:returntype", Promise)
], BackupsController.prototype, "export", null);
__decorate([
    (0, common_1.Post)('restore'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: backupStorage,
        limits: { fileSize: 200 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BackupsController.prototype, "restore", null);
exports.BackupsController = BackupsController = __decorate([
    (0, common_1.Controller)('backups'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERADMIN),
    __metadata("design:paramtypes", [backups_service_1.BackupsService,
        system_config_service_1.SystemConfigService])
], BackupsController);
//# sourceMappingURL=backups.controller.js.map