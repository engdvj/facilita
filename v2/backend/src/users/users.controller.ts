import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { UserRole, UserStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { parsePagination } from '../common/utils/pagination';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query('role', new ParseEnumPipe(UserRole, { optional: true })) role?: UserRole,
    @Query('status', new ParseEnumPipe(UserStatus, { optional: true })) status?: UserStatus,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const pagination = parsePagination(page, pageSize, {
      defaultPageSize: 12,
    });

    const { items, total } = await this.usersService.findAll({
      role,
      status,
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
    return this.usersService.findOne(id);
  }

  @Get(':id/dependencies')
  getDependencies(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.getDependencies(id);
  }

  @Post()
  create(@Body() data: CreateUserDto) {
    return this.usersService.create(data);
  }

  @Patch('me')
  @Roles(UserRole.SUPERADMIN, UserRole.USER)
  updateMe(
    @CurrentUser() user: { id: string },
    @Body() data: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, data);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() data: UpdateUserDto,
  ) {
    return this.usersService.update(id, data);
  }

  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() actor: { id: string },
  ) {
    return this.usersService.remove(id, actor.id);
  }
}
