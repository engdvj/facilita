import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SystemConfigModule } from '../system-config/system-config.module';
import { BackupsController } from './backups.controller';
import { BackupSchedulerService } from './backup-scheduler.service';
import { BackupsService } from './backups.service';

@Module({
  imports: [PrismaModule, SystemConfigModule],
  controllers: [BackupsController],
  providers: [BackupsService, BackupSchedulerService],
})
export class BackupsModule {}
