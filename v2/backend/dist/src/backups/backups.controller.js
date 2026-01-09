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
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const backups_service_1 = require("./backups.service");
const export_backup_dto_1 = require("./dto/export-backup.dto");
const restore_backup_dto_1 = require("./dto/restore-backup.dto");
let BackupsController = class BackupsController {
    constructor(backupsService) {
        this.backupsService = backupsService;
    }
    export(data) {
        return this.backupsService.export(data.entities);
    }
    restore(data) {
        return this.backupsService.restore(data.backup, data.entities, data.mode);
    }
};
exports.BackupsController = BackupsController;
__decorate([
    (0, common_1.Post)('export'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [export_backup_dto_1.ExportBackupDto]),
    __metadata("design:returntype", void 0)
], BackupsController.prototype, "export", null);
__decorate([
    (0, common_1.Post)('restore'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [restore_backup_dto_1.RestoreBackupDto]),
    __metadata("design:returntype", void 0)
], BackupsController.prototype, "restore", null);
exports.BackupsController = BackupsController = __decorate([
    (0, common_1.Controller)('backups'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERADMIN),
    __metadata("design:paramtypes", [backups_service_1.BackupsService])
], BackupsController);
//# sourceMappingURL=backups.controller.js.map