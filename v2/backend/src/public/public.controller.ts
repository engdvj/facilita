import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
} from '@nestjs/common';
import { EntityType } from '@prisma/client';
import { LinksService } from '../links/links.service';
import { NotesService } from '../notes/notes.service';
import { UploadedSchedulesService } from '../uploaded-schedules/uploaded-schedules.service';

@Controller('public')
export class PublicController {
  constructor(
    private readonly linksService: LinksService,
    private readonly schedulesService: UploadedSchedulesService,
    private readonly notesService: NotesService,
  ) {}

  @Get(':entityType/:publicToken')
  async findByToken(
    @Param('entityType', new ParseEnumPipe(EntityType)) entityType: EntityType,
    @Param('publicToken') publicToken: string,
  ) {
    if (entityType === EntityType.LINK) {
      return {
        entityType,
        item: await this.linksService.findPublicByToken(publicToken),
      };
    }

    if (entityType === EntityType.SCHEDULE) {
      return {
        entityType,
        item: await this.schedulesService.findPublicByToken(publicToken),
      };
    }

    if (entityType === EntityType.NOTE) {
      return {
        entityType,
        item: await this.notesService.findPublicByToken(publicToken),
      };
    }

    throw new BadRequestException('Unsupported entity type');
  }
}
