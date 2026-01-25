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
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { UploadedSchedulesService } from './uploaded-schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { ContentAudience, UserRole } from '@prisma/client';
import { PermissionsService } from '../permissions/permissions.service';
import { parsePagination } from '../common/utils/pagination';

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
  constructor(
    private readonly schedulesService: UploadedSchedulesService,
    private readonly permissionsService: PermissionsService,
  ) {}

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
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('sectorId') sectorId?: string,
    @Query('unitId') unitId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isPublic') isPublic?: string,
    @Query('audience') audience?: string,
    @Request() req?: any,
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
    const { id, canViewPrivate } = await this.getAccessContext(req?.user);
    const result = await this.schedulesService.findAll(normalizedCompanyId, filters, {
      id,
      canViewPrivate,
    });
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
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Res({ passthrough: true }) res?: Response,
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

    const { id, canViewPrivate } = await this.getAccessContext(req.user);
    const pagination = parsePagination(page, pageSize, {
      defaultPageSize: 12,
    });
    const { items, total } = await this.schedulesService.findAllPaginated(
      resolvedCompanyId,
      { ...filters, search },
      { id, canViewPrivate },
      pagination.shouldPaginate
        ? { skip: pagination.skip, take: pagination.take }
        : undefined,
    );
    if (pagination.shouldPaginate && res) {
      res.setHeader('X-Total-Count', total.toString());
    }
    console.log('SchedulesController.findAllAdmin - resultado:', items.length, 'schedules');
    return items;
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
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    return this.findAllAdmin(
      req,
      companyId,
      sectorId,
      unitId,
      categoryId,
      isPublic,
      audience,
      search,
      page,
      pageSize,
      res,
    );
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(
    @Param('id') id: string,
    @Request() req?: any,
  ) {
    const { id: userId, canViewPrivate } = await this.getAccessContext(req?.user);
    return this.schedulesService.findOne(id, { id: userId, canViewPrivate });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @Request() req: any,
  ) {
    const actor = await this.getAccessContext(req.user);
    return this.schedulesService.update(id, updateScheduleDto, actor);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async remove(
    @Param('id') id: string,
    @Body() body: { adminMessage?: string } | undefined,
    @Request() req: any,
  ) {
    const actor = await this.getAccessContext(req.user);
    return this.schedulesService.remove(id, actor, body?.adminMessage);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async restore(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const actor = await this.getAccessContext(req.user);
    return this.schedulesService.restore(id, actor);
  }

  @Post(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async activate(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const actor = await this.getAccessContext(req.user);
    return this.schedulesService.activate(id, actor);
  }

  @Post(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async deactivate(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const actor = await this.getAccessContext(req.user);
    return this.schedulesService.deactivate(id, actor);
  }

  private async getAccessContext(user?: any) {
    if (!user) {
      return {
        id: undefined,
        role: undefined,
        companyId: undefined,
        canViewPrivate: false,
      };
    }

    const canViewPrivate = await this.permissionsService.hasPermissions(
      user.role,
      ['canViewPrivateContent'],
    );

    return {
      id: user.id,
      role: user.role,
      companyId: user.companyId,
      canViewPrivate,
    };
  }
}
