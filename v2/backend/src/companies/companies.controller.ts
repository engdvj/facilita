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
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { parsePagination } from '../common/utils/pagination';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const isSuperAdmin = req.user?.role === UserRole.SUPERADMIN;
    const pagination = parsePagination(page, pageSize, {
      defaultPageSize: 12,
    });
    const { items, total } = await this.companiesService.findAll({
      excludeInternal: !isSuperAdmin,
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
    return this.companiesService.findById(id);
  }

  @Get(':id/dependencies')
  getDependencies(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.companiesService.getDependencies(id);
  }

  @Post()
  create(@Body() data: CreateCompanyDto) {
    return this.companiesService.create(data);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() data: UpdateCompanyDto,
  ) {
    return this.companiesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.companiesService.remove(id);
  }
}
