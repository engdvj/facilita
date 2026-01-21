import { Module } from '@nestjs/common';
import { UploadedSchedulesService } from './uploaded-schedules.service';
import { UploadedSchedulesController } from './uploaded-schedules.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [UploadedSchedulesController],
  providers: [UploadedSchedulesService],
  exports: [UploadedSchedulesService],
})
export class UploadedSchedulesModule {}
