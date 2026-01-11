import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { Response } from 'express';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { join } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { BackupsService } from './backups.service';
import { ExportBackupDto } from './dto/export-backup.dto';
import { BackupEntity, BackupPayload, backupEntities } from './backups.types';

const backupUploadDir = join(process.cwd(), 'backups', 'tmp');
const backupStorage = diskStorage({
  destination: (_req, _file, cb) => {
    mkdirSync(backupUploadDir, { recursive: true });
    cb(null, backupUploadDir);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

@Controller('backups')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN)
export class BackupsController {
  constructor(private readonly backupsService: BackupsService) {}

  @Post('export')
  async export(
    @Body() data: ExportBackupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const archive = await this.backupsService.exportArchive(data.entities);
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${archive.filename}"`,
    });
    return new StreamableFile(archive.stream);
  }

  @Post('restore')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: backupStorage,
      limits: { fileSize: 200 * 1024 * 1024 },
    }),
  )
  async restore(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    const entities = this.parseEntities(body.entities);
    const mode = body.mode === 'merge' ? 'merge' : 'merge';

    if (file?.path) {
      return this.backupsService.restoreFromArchive(file.path, entities, mode);
    }

    if (body.backup) {
      const payload = this.parsePayload(body.backup);
      return this.backupsService.restore(payload, entities, mode);
    }

    throw new BadRequestException('Arquivo de backup ausente.');
  }

  private parseEntities(input: unknown): BackupEntity[] | undefined {
    if (!input) {
      return undefined;
    }

    const allowed = new Set(backupEntities);
    const normalize = (values: unknown[]) =>
      values.filter(
        (value): value is BackupEntity =>
          typeof value === 'string' && allowed.has(value as BackupEntity),
      );

    if (Array.isArray(input)) {
      return normalize(input);
    }

    if (typeof input === 'string') {
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) {
          return normalize(parsed);
        }
      } catch {
        // ignore parse error and fallback to csv
      }

      const csvValues = input
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      return normalize(csvValues);
    }

    return undefined;
  }

  private parsePayload(input: unknown): BackupPayload {
    if (typeof input === 'object' && input !== null) {
      return input as BackupPayload;
    }

    if (typeof input === 'string') {
      try {
        return JSON.parse(input) as BackupPayload;
      } catch {
        throw new BadRequestException('Backup invalido.');
      }
    }

    throw new BadRequestException('Backup invalido.');
  }
}
