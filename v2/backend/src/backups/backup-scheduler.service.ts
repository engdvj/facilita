import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { backupEntities } from './backups.types';
import { BackupsService } from './backups.service';
import { SystemConfigService } from '../system-config/system-config.service';

@Injectable()
export class BackupSchedulerService implements OnModuleInit, OnModuleDestroy {
  private timer: NodeJS.Timeout | null = null;
  private lastRunKey: string | null = null;
  private running = false;

  constructor(
    private readonly backupsService: BackupsService,
    private readonly systemConfigService: SystemConfigService,
  ) {}

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

  private async tick() {
    if (this.running) return;

    const enabled = this.systemConfigService.getBoolean(
      'backup_schedule_enabled',
      false,
    );
    if (!enabled) return;

    const scheduleTime = this.systemConfigService.getString(
      'backup_schedule_time',
      '02:00',
    );
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    if (currentTime !== scheduleTime) return;

    const runKey = now.toISOString().slice(0, 10);
    if (this.lastRunKey === runKey) return;

    this.running = true;
    try {
      await this.runBackup();
      this.lastRunKey = runKey;
    } catch (error) {
      console.error('Falha ao executar backup automatico.', error);
    } finally {
      this.running = false;
    }
  }

  private async runBackup() {
    const backupDir = this.systemConfigService.resolvePath(
      'backup_directory',
      'backups/auto',
    );
    const retentionDays = this.systemConfigService.getNumber(
      'backup_retention_days',
      7,
    );

    await this.backupsService.exportArchiveToFile(
      [...backupEntities],
      backupDir,
      'facilita-auto-backup',
    );

    if (retentionDays > 0) {
      await this.backupsService.cleanupOldBackups(backupDir, retentionDays);
    }
  }
}
