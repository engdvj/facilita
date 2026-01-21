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
  ForbiddenException,
} from '@nestjs/common';
import { UploadedSchedulesService } from './uploaded-schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { ContentAudience, UserRole } from '@prisma/client';

const defaultAudienceByRole: Record<UserRole, ContentAudience> = {
  [UserRole.SUPERADMIN]: ContentAudience.COMPANY,
  [UserRole.ADMIN]: ContentAudience.COMPANY,
  [UserRole.COLLABORATOR]: ContentAudience.COMPANY,
};

const audienceOptionsByRole: Record<UserRole, ContentAudience[]> = {
  [UserRole.SUPERADMIN]: [
    ContentAudience.PUBLIC,
    ContentAudience.COMPANY,
    ContentAudience.SECTOR,
    ContentAudience.PRIVATE,
    ContentAudience.ADMIN,
    ContentAudience.SUPERADMIN,
  ],
  [UserRole.ADMIN]: [ContentAudience.COMPANY, ContentAudience.SECTOR],
  [UserRole.COLLABORATOR]: [ContentAudience.PRIVATE],
};

const resolveAudience = (
  role: UserRole,
  payload: { audience?: ContentAudience; isPublic?: boolean },
) => {
  if (payload.audience) return payload.audience;
  if (payload.isPublic !== undefined) {
    return payload.isPublic
      ? ContentAudience.PUBLIC
      : defaultAudienceByRole[role];
  }
  return defaultAudienceByRole[role];
};

const isAllowedAudience = (role: UserRole, audience: ContentAudience) => {
  return audienceOptionsByRole[role]?.includes(audience);
};

const parseAudienceParam = (value?: string): ContentAudience | undefined => {
  if (!value) return undefined;
  const candidate = value.toUpperCase() as ContentAudience;
  return Object.values(ContentAudience).includes(candidate) ? candidate : undefined;
};

@Controller('schedules')
export class UploadedSchedulesController {
  constructor(private readonly schedulesService: UploadedSchedulesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  create(@Body() createScheduleDto: CreateScheduleDto, @Request() req: any) {
    const user = req.user;
    const isSuperAdmin = user?.role === UserRole.SUPERADMIN;
    const companyId = isSuperAdmin ? createScheduleDto.companyId : user?.companyId;
    const audience = resolveAudience(user?.role, createScheduleDto);

    if (!companyId) {
      throw new ForbiddenException('Empresa obrigatoria.');
    }

    if (!isSuperAdmin && createScheduleDto.companyId && createScheduleDto.companyId !== companyId) {
      throw new ForbiddenException('Empresa nao autorizada.');
    }

    if (!isAllowedAudience(user?.role, audience)) {
      throw new ForbiddenException('Visibilidade nao autorizada.');
    }

    if (audience === ContentAudience.SECTOR && !createScheduleDto.sectorId) {
      throw new ForbiddenException('Setor obrigatorio para documentos de setor.');
    }

    return this.schedulesService.create({
      ...createScheduleDto,
      companyId,
      sectorId:
        audience === ContentAudience.SECTOR
          ? createScheduleDto.sectorId || undefined
          : undefined,
      unitId:
        audience === ContentAudience.SECTOR
          ? createScheduleDto.unitId ?? undefined
          : undefined,
      unitIds:
        audience === ContentAudience.SECTOR
          ? createScheduleDto.unitIds ?? undefined
          : undefined,
      userId: req.user.id,
      audience,
      isPublic: audience === ContentAudience.PUBLIC,
    });
  }

  @Get()
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('sectorId') sectorId?: string,
    @Query('unitId') unitId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isPublic') isPublic?: string,
    @Query('audience') audience?: string,
  ) {
    const normalizedCompanyId = companyId?.trim() || undefined;
    const parsedAudience = parseAudienceParam(audience);
    const filters = {
      sectorId,
      unitId,
      categoryId,
      audience:
        parsedAudience ||
        (isPublic
          ? isPublic === 'true'
            ? ContentAudience.PUBLIC
            : undefined
          : undefined) ||
        (normalizedCompanyId ? undefined : ContentAudience.PUBLIC),
      isPublic:
        isPublic && isPublic === 'false'
          ? false
          : normalizedCompanyId
            ? undefined
            : true,
    };
    console.log(
      'SchedulesController.findAll - companyId:',
      normalizedCompanyId,
      'filters:',
      filters,
    );
    const result = await this.schedulesService.findAll(normalizedCompanyId, filters);
    console.log('SchedulesController.findAll - resultado:', result.length, 'schedules');
    return result;
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async findAllAdmin(
    @Request() req: any,
    @Query('companyId') companyId?: string,
    @Query('sectorId') sectorId?: string,
    @Query('unitId') unitId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isPublic') isPublic?: string,
    @Query('audience') audience?: string,
  ) {
    const normalizedCompanyId = companyId?.trim() || undefined;
    const isSuperAdmin = req.user?.role === UserRole.SUPERADMIN;
    const resolvedCompanyId = normalizedCompanyId || (!isSuperAdmin ? req.user?.companyId : undefined);

    if (!resolvedCompanyId && !isSuperAdmin) {
      throw new ForbiddenException('Empresa obrigatoria.');
    }

    const parsedAudience = parseAudienceParam(audience);
    const filters = {
      sectorId,
      unitId,
      categoryId,
      audience: parsedAudience,
      isPublic: isPublic ? isPublic === 'true' : undefined,
      includeInactive: true,
    };

    const result = await this.schedulesService.findAll(resolvedCompanyId, filters);
    console.log('SchedulesController.findAllAdmin - resultado:', result.length, 'schedules');
    return result;
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async findAllAdminAlias(
    @Request() req: any,
    @Query('companyId') companyId?: string,
    @Query('sectorId') sectorId?: string,
    @Query('unitId') unitId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isPublic') isPublic?: string,
    @Query('audience') audience?: string,
  ) {
    return this.findAllAdmin(
      req,
      companyId,
      sectorId,
      unitId,
      categoryId,
      isPublic,
      audience,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @Request() req: any,
  ) {
    return this.schedulesService.update(id, updateScheduleDto, {
      id: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  remove(
    @Param('id') id: string,
    @Body() body: { adminMessage?: string } | undefined,
    @Request() req: any,
  ) {
    return this.schedulesService.remove(
      id,
      {
        id: req.user.id,
        role: req.user.role,
        companyId: req.user.companyId,
      },
      body?.adminMessage,
    );
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  restore(@Param('id') id: string) {
    return this.schedulesService.restore(id);
  }

  @Post(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  activate(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.schedulesService.activate(id, {
      id: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId,
    });
  }

  @Post(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  deactivate(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.schedulesService.deactivate(id, {
      id: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId,
    });
  }
}
