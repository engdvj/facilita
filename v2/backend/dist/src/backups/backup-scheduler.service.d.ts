import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { BackupsService } from './backups.service';
import { SystemConfigService } from '../system-config/system-config.service';
export declare class BackupSchedulerService implements OnModuleInit, OnModuleDestroy {
    private readonly backupsService;
    private readonly systemConfigService;
    private timer;
    private lastRunKey;
    private running;
    constructor(backupsService: BackupsService, systemConfigService: SystemConfigService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private tick;
    private parseScheduleMinutes;
    private runBackup;
}
