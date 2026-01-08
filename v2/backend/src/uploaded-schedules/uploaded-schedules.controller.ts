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
import { UploadedSchedulesService } from './uploaded-schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('schedules')
export class UploadedSchedulesController {
  constructor(private readonly schedulesService: UploadedSchedulesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COORDINATOR, UserRole.MANAGER)
  create(@Body() createScheduleDto: CreateScheduleDto, @Request() req: any) {
    return this.schedulesService.create({
      ...createScheduleDto,
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
    return this.schedulesService.findAll(companyId, {
      sectorId,
      categoryId,
      isPublic: isPublic === 'true',
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COORDINATOR, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto) {
    return this.schedulesService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COORDINATOR, UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(id);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  restore(@Param('id') id: string) {
    return this.schedulesService.restore(id);
  }
}
