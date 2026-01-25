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
import { SectorsService } from './sectors.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { parsePagination } from '../common/utils/pagination';

@Controller('sectors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class SectorsController {
  constructor(private readonly sectorsService: SectorsService) {}

  @Get()
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('unitId') unitId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const pagination = parsePagination(page, pageSize, {
      defaultPageSize: 12,
    });
    const { items, total } = await this.sectorsService.findAll({
      companyId,
      unitId,
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
    return this.sectorsService.findById(id);
  }

  @Get(':id/dependencies')
  getDependencies(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.sectorsService.getDependencies(id);
  }

  @Post()
  create(@Body() data: CreateSectorDto) {
    return this.sectorsService.create(data);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() data: UpdateSectorDto,
  ) {
    return this.sectorsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.sectorsService.remove(id);
  }
}
