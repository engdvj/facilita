import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { BackupsService } from './backups.service';
import { ExportBackupDto } from './dto/export-backup.dto';
import { RestoreBackupDto } from './dto/restore-backup.dto';

@Controller('backups')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN)
export class BackupsController {
  constructor(private readonly backupsService: BackupsService) {}

  @Post('export')
  export(@Body() data: ExportBackupDto) {
    return this.backupsService.export(data.entities);
  }

  @Post('restore')
  restore(@Body() data: RestoreBackupDto) {
    return this.backupsService.restore(
      data.backup as any,
      data.entities,
      data.mode,
    );
  }
}
