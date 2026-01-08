import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COORDINATOR, UserRole.MANAGER)
  create(@Body() createLinkDto: CreateLinkDto, @Request() req: any) {
    return this.linksService.create({
      ...createLinkDto,
      userId: req.user.id,
    });
  }

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('sectorId') sectorId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isPublic') isPublic?: string,
  ) {
    return this.linksService.findAll(companyId, {
      sectorId,
      categoryId,
      isPublic: isPublic === 'true',
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.linksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COORDINATOR, UserRole.MANAGER)
  update(
    @Param('id') id: string,
    @Body() updateLinkDto: UpdateLinkDto,
    @Request() req: any,
  ) {
    return this.linksService.update(id, updateLinkDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COORDINATOR, UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.linksService.remove(id);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  restore(@Param('id') id: string) {
    return this.linksService.restore(id);
  }
}
