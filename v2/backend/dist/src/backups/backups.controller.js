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
const fs_1 = require("fs");
const multer_1 = require("multer");
const path_1 = require("path");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
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
    constructor(backupsService) {
        this.backupsService = backupsService;
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
};
exports.BackupsController = BackupsController;
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
    __metadata("design:paramtypes", [backups_service_1.BackupsService])
], BackupsController);
//# sourceMappingURL=backups.controller.js.map