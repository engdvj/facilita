import { Module } from '@nestjs/common';
import { UploadedSchedulesService } from './uploaded-schedules.service';
import { UploadedSchedulesController } from './uploaded-schedules.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UploadedSchedulesController],
  providers: [UploadedSchedulesService],
  exports: [UploadedSchedulesService],
})
export class UploadedSchedulesModule {}
