import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ResetDto } from './dto/reset.dto';
import { ResetsService } from './resets.service';

@Controller('resets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN)
export class ResetsController {
  constructor(private readonly resetsService: ResetsService) {}

  @Post()
  reset(@Body() data: ResetDto) {
    return this.resetsService.reset(data.entities);
  }
}
