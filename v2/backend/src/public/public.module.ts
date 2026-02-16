import { Module } from '@nestjs/common';
import { LinksModule } from '../links/links.module';
import { NotesModule } from '../notes/notes.module';
import { UploadedSchedulesModule } from '../uploaded-schedules/uploaded-schedules.module';
import { PublicController } from './public.controller';

@Module({
  imports: [LinksModule, UploadedSchedulesModule, NotesModule],
  controllers: [PublicController],
})
export class PublicModule {}
