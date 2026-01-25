import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { parsePagination } from '../common/utils/pagination';

@Controller('units')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const pagination = parsePagination(page, pageSize, {
      defaultPageSize: 12,
    });
    const { items, total } = await this.unitsService.findAll({
      companyId,
      search,
      ...(pagination.shouldPaginate
        ? { skip: pagination.skip, take: pagination.take }
        : {}),
    });
    if (pagination.shouldPaginate && res) {
      res.setHeader('X-Total-Count', total.toString());
    }
    return items;
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.unitsService.findById(id);
  }

  @Get(':id/dependencies')
  getDependencies(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.unitsService.getDependencies(id);
  }

  @Post()
  create(@Body() data: CreateUnitDto) {
    return this.unitsService.create(data);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() data: UpdateUnitDto,
  ) {
    return this.unitsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.unitsService.remove(id);
  }
}
