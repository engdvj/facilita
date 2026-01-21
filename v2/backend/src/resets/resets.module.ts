import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ResetsController } from './resets.controller';
import { ResetsService } from './resets.service';

@Module({
  imports: [PrismaModule],
  controllers: [ResetsController],
  providers: [ResetsService],
})
export class ResetsModule {}
