import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { SystemConfigService } from './system-config.service';

@Controller('system-config')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN)
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Get()
  findAll() {
    return this.systemConfigService.findAll();
  }

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.systemConfigService.findOne(key);
  }

  @Patch(':key')
  update(@Param('key') key: string, @Body() data: UpdateSystemConfigDto) {
    return this.systemConfigService.update(key, data);
  }
}
