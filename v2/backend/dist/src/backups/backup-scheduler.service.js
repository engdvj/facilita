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
        const scheduleTime = this.systemConfigService.getString('backup_schedule_time', '02:00');
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        if (now.getMinutes() === 0) {
            console.log(`[BackupScheduler] Verificando: enabled=${enabled}, scheduleTime=${scheduleTime}, currentTime=${currentTime}, lastRunKey=${this.lastRunKey}`);
        }
        if (!enabled)
            return;
        const scheduleMinutes = this.parseScheduleMinutes(scheduleTime);
        if (scheduleMinutes === null) {
            if (now.getMinutes() === 0) {
                console.warn(`[BackupScheduler] Horario invalido: "${scheduleTime}". Use HH:MM.`);
            }
            return;
        }
        const runKey = now.toISOString().slice(0, 10);
        if (this.lastRunKey === runKey)
            return;
        if (currentMinutes < scheduleMinutes)
            return;
        this.running = true;
        console.log(`[BackupScheduler] Iniciando backup automatico...`);
        try {
            await this.runBackup();
            this.lastRunKey = runKey;
            console.log(`[BackupScheduler] Backup automatico concluido com sucesso.`);
        }
        catch (error) {
            console.error('[BackupScheduler] Falha ao executar backup automatico:', error);
        }
        finally {
            this.running = false;
        }
    }
    parseScheduleMinutes(value) {
        const normalized = String(value ?? '').trim();
        if (!normalized)
            return null;
        const parts = normalized.split(':');
        if (parts.length < 2)
            return null;
        const hours = Number(parts[0]);
        const minutes = Number(parts[1]);
        if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
            return null;
        }
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            return null;
        }
        return hours * 60 + minutes;
    }
    async runBackup() {
        const backupDir = this.systemConfigService.resolvePath('backup_directory', 'backups/auto');
        const retentionDays = this.systemConfigService.getNumber('backup_retention_days', 7);
        console.log(`[BackupScheduler] Diretorio: ${backupDir}, Retencao: ${retentionDays} dias`);
        const result = await this.backupsService.exportArchiveToFile([...backups_types_1.backupEntities], backupDir, 'facilita-auto-backup');
        console.log(`[BackupScheduler] Arquivo criado: ${result.filename}`);
        if (retentionDays > 0) {
            const deleted = await this.backupsService.cleanupOldBackups(backupDir, retentionDays);
            if (deleted > 0) {
                console.log(`[BackupScheduler] ${deleted} backups antigos removidos.`);
            }
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