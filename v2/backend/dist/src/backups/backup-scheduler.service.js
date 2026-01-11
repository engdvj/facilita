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
exports.BackupSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const backups_types_1 = require("./backups.types");
const backups_service_1 = require("./backups.service");
const system_config_service_1 = require("../system-config/system-config.service");
let BackupSchedulerService = class BackupSchedulerService {
    constructor(backupsService, systemConfigService) {
        this.backupsService = backupsService;
        this.systemConfigService = systemConfigService;
        this.timer = null;
        this.lastRunKey = null;
        this.running = false;
    }
    onModuleInit() {
        this.timer = setInterval(() => {
            void this.tick();
        }, 60 * 1000);
    }
    onModuleDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
    async tick() {
        if (this.running)
            return;
        const enabled = this.systemConfigService.getBoolean('backup_schedule_enabled', false);
        if (!enabled)
            return;
        const scheduleTime = this.systemConfigService.getString('backup_schedule_time', '02:00');
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        if (currentTime !== scheduleTime)
            return;
        const runKey = now.toISOString().slice(0, 10);
        if (this.lastRunKey === runKey)
            return;
        this.running = true;
        try {
            await this.runBackup();
            this.lastRunKey = runKey;
        }
        catch (error) {
            console.error('Falha ao executar backup automatico.', error);
        }
        finally {
            this.running = false;
        }
    }
    async runBackup() {
        const backupDir = this.systemConfigService.resolvePath('backup_directory', 'backups/auto');
        const retentionDays = this.systemConfigService.getNumber('backup_retention_days', 7);
        await this.backupsService.exportArchiveToFile([...backups_types_1.backupEntities], backupDir, 'facilita-auto-backup');
        if (retentionDays > 0) {
            await this.backupsService.cleanupOldBackups(backupDir, retentionDays);
        }
    }
};
exports.BackupSchedulerService = BackupSchedulerService;
exports.BackupSchedulerService = BackupSchedulerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [backups_service_1.BackupsService,
        system_config_service_1.SystemConfigService])
], BackupSchedulerService);
//# sourceMappingURL=backup-scheduler.service.js.map