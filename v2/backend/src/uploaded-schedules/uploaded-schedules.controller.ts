import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { parsePagination } from '../common/utils/pagination';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { UploadedSchedulesService } from './uploaded-schedules.service';

@Controller('schedules')
export class UploadedSchedulesController {
  constructor(private readonly schedulesService: UploadedSchedulesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.USER)
  create(@Body() dto: CreateScheduleDto, @Request() req: any) {
    return this.schedulesService.create(req.user, dto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(
    @Request() req?: any,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    return this.schedulesService.findAll(req?.user, { categoryId, search });
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  async findAllAdmin(
    @Request() req: any,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('includeInactive') includeInactive?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    if (req.user?.role !== UserRole.SUPERADMIN) {
      throw new ForbiddenException('Only superadmin can access this route');
    }

    const pagination = parsePagination(page, pageSize, {
      defaultPageSize: 12,
    });

    const { items, total } = await this.schedulesService.findAllPaginated(
      {
        categoryId,
        search,
        includeInactive: includeInactive === 'true',
      },
      pagination.shouldPaginate
        ? { skip: pagination.skip, take: pagination.take }
        : undefined,
    );

    if (pagination.shouldPaginate && res) {
      res.setHeader('X-Total-Count', total.toString());
    }

    return items;
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  findAllAdminAlias(
    @Request() req: any,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('includeInactive') includeInactive?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    return this.findAllAdmin(
      req,
      categoryId,
      search,
      includeInactive,
      page,
      pageSize,
      res,
    );
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id') id: string, @Request() req?: any) {
    return this.schedulesService.findOne(id, req?.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.USER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto,
    @Request() req: any,
  ) {
    return this.schedulesService.update(id, req.user, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.USER)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.schedulesService.remove(id, req.user);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.USER)
  restore(@Param('id') id: string, @Request() req: any) {
    return this.schedulesService.restore(id, req.user);
  }

  @Post(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.USER)
  activate(@Param('id') id: string, @Request() req: any) {
    return this.schedulesService.activate(id, req.user);
  }

  @Post(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.USER)
  deactivate(@Param('id') id: string, @Request() req: any) {
    return this.schedulesService.deactivate(id, req.user);
  }
}
