import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EntityType, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateShareDto } from './dto/create-share.dto';
import { UpdateShareLocalCategoryDto } from './dto/update-share-local-category.dto';
import { SharesService } from './shares.service';

@Controller('shares')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER)
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  @Post()
  create(
    @CurrentUser() user: { id: string; role: UserRole },
    @Body() dto: CreateShareDto,
  ) {
    return this.sharesService.create(user, dto);
  }

  @Get('received')
  findReceived(
    @CurrentUser() user: { id: string; role: UserRole },
    @Query('type', new ParseEnumPipe(EntityType, { optional: true }))
    type?: EntityType,
  ) {
    return this.sharesService.findReceived(user, type);
  }

  @Get('sent')
  findSent(
    @CurrentUser() user: { id: string; role: UserRole },
    @Query('type', new ParseEnumPipe(EntityType, { optional: true }))
    type?: EntityType,
  ) {
    return this.sharesService.findSent(user, type);
  }

  @Get('recipients')
  findRecipients(@CurrentUser() user: { id: string; role: UserRole }) {
    return this.sharesService.findRecipients(user);
  }

  @Patch(':id/local-category')
  updateLocalCategory(
    @CurrentUser() user: { id: string; role: UserRole },
    @Param('id') id: string,
    @Body() dto: UpdateShareLocalCategoryDto,
  ) {
    return this.sharesService.updateLocalCategory(user, id, dto);
  }

  @Delete(':id/remove')
  removeReceived(
    @CurrentUser() user: { id: string; role: UserRole },
    @Param('id') id: string,
  ) {
    return this.sharesService.removeReceived(user, id);
  }

  @Delete(':id/revoke')
  revoke(
    @CurrentUser() user: { id: string; role: UserRole },
    @Param('id') id: string,
  ) {
    return this.sharesService.revoke(user, id);
  }
}
