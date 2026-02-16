import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SharesController } from './shares.controller';
import { SharesService } from './shares.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [SharesController],
  providers: [SharesService],
  exports: [SharesService],
})
export class SharesModule {}
