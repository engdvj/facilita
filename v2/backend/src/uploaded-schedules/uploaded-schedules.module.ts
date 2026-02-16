import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadedSchedulesController } from './uploaded-schedules.controller';
import { UploadedSchedulesService } from './uploaded-schedules.service';

@Module({
  imports: [PrismaModule],
  controllers: [UploadedSchedulesController],
  providers: [UploadedSchedulesService],
  exports: [UploadedSchedulesService],
})
export class UploadedSchedulesModule {}
