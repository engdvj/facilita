import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { ContentAudience, UserRole } from '@prisma/client';
import { isCompanyMode, isUserMode } from '../common/app-mode';

const defaultAudienceByRole: Record<UserRole, ContentAudience> = {
  [UserRole.SUPERADMIN]: ContentAudience.COMPANY,
  [UserRole.ADMIN]: ContentAudience.COMPANY,
  [UserRole.COLLABORATOR]: ContentAudience.PRIVATE,
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

const userModeAudienceOptions: ContentAudience[] = [
  ContentAudience.PUBLIC,
  ContentAudience.PRIVATE,
  ContentAudience.ADMIN,
  ContentAudience.SUPERADMIN,
];

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

const normalizeAudience = (audience: ContentAudience) => {
  if (
    isUserMode() &&
    (audience === ContentAudience.COMPANY ||
      audience === ContentAudience.SECTOR)
  ) {
    return ContentAudience.PRIVATE;
  }
  return audience;
};

const isAllowedAudience = (role: UserRole, audience: ContentAudience) => {
  if (isUserMode()) {
    if (role === UserRole.SUPERADMIN) return true;
    if (role === UserRole.ADMIN) {
      return userModeAudienceOptions.includes(audience);
    }
    return audience === ContentAudience.PRIVATE;
  }
  return audienceOptionsByRole[role]?.includes(audience);
};

const parseAudienceParam = (value?: string): ContentAudience | undefined => {
  if (!value) return undefined;
  const candidate = value.toUpperCase() as ContentAudience;
  return Object.values(ContentAudience).includes(candidate)
    ? candidate
    : undefined;
};

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COLLABORATOR)
  async create(@Body() createNoteDto: CreateNoteDto, @Request() req: any) {
    const user = req.user;
    const isSuperAdmin = user?.role === UserRole.SUPERADMIN && isCompanyMode();
    const companyId = isUserMode()
      ? user?.id
      : isSuperAdmin
        ? createNoteDto.companyId
        : user?.companyId;
    const audience = normalizeAudience(
      resolveAudience(user?.role, createNoteDto),
    );

    if (!companyId) {
      throw new ForbiddenException('Empresa obrigatoria.');
    }

    if (!isSuperAdmin && createNoteDto.companyId && createNoteDto.companyId !== companyId) {
      throw new ForbiddenException('Empresa nao autorizada.');
    }

    if (!isAllowedAudience(user?.role, audience)) {
      throw new ForbiddenException('Visibilidade nao autorizada.');
    }

    if (
      isUserMode() &&
      (createNoteDto.sectorId ||
        createNoteDto.unitId ||
        (createNoteDto.unitIds?.length ?? 0) > 0)
    ) {
      throw new ForbiddenException('Setores e unidades nao disponiveis no modo usuario.');
    }

    if (
      user?.role === UserRole.COLLABORATOR &&
      createNoteDto.sectorId &&
      !(await this.notesService.userHasSector(user.id, createNoteDto.sectorId))
    ) {
      throw new ForbiddenException('Setor nao autorizado.');
    }

    if (audience === ContentAudience.SECTOR && !createNoteDto.sectorId) {
      throw new ForbiddenException('Setor obrigatorio para notas de setor.');
    }

    return this.notesService.create({
      ...createNoteDto,
      companyId,
      sectorId:
        audience === ContentAudience.SECTOR
          ? createNoteDto.sectorId || undefined
          : undefined,
      unitId:
        audience === ContentAudience.SECTOR
          ? createNoteDto.unitId ?? undefined
          : undefined,
      unitIds:
        audience === ContentAudience.SECTOR
          ? createNoteDto.unitIds ?? undefined
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
    const normalizedCompanyId = isUserMode()
      ? undefined
      : companyId?.trim() || undefined;
    const parsedAudience = parseAudienceParam(audience);
    const fallbackAudience =
      parsedAudience ??
      (isPublic === 'true' ? ContentAudience.PUBLIC : undefined);
    const normalizedAudience = fallbackAudience
      ? normalizeAudience(fallbackAudience)
      : undefined;
    const filters = {
      sectorId: isUserMode() ? undefined : sectorId,
      unitId: isUserMode() ? undefined : unitId,
      categoryId,
      audience: normalizedAudience,
      isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
    };
    return this.notesService.findAll(normalizedCompanyId, filters);
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
    const isSuperAdmin = req.user?.role === UserRole.SUPERADMIN && isCompanyMode();
    const resolvedCompanyId = isUserMode()
      ? req.user?.id
      : normalizedCompanyId || (!isSuperAdmin ? req.user?.companyId : undefined);

    if (!resolvedCompanyId && !isSuperAdmin) {
      throw new ForbiddenException('Empresa obrigatoria.');
    }

    const parsedAudience = parseAudienceParam(audience);
    const filters = {
      sectorId: isUserMode() ? undefined : sectorId,
      unitId: isUserMode() ? undefined : unitId,
      categoryId,
      audience: parsedAudience ? normalizeAudience(parsedAudience) : undefined,
      isPublic: isPublic ? isPublic === 'true' : undefined,
      includeInactive: true,
    };

    return this.notesService.findAll(resolvedCompanyId, filters);
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
    return this.notesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COLLABORATOR)
  update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @Request() req: any,
  ) {
    return this.notesService.update(id, updateNoteDto, {
      id: req.user.id,
      role: req.user.role,
      companyId: isUserMode() ? req.user.id : req.user.companyId,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COLLABORATOR)
  remove(
    @Param('id') id: string,
    @Body() body: { adminMessage?: string } | undefined,
    @Request() req: any,
  ) {
    return this.notesService.remove(
      id,
      {
        id: req.user.id,
        role: req.user.role,
        companyId: isUserMode() ? req.user.id : req.user.companyId,
      },
      body?.adminMessage,
    );
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  restore(@Param('id') id: string) {
    return this.notesService.restore(id);
  }

  @Post(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  activate(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.notesService.activate(id, {
      id: req.user.id,
      role: req.user.role,
      companyId: isUserMode() ? req.user.id : req.user.companyId,
    });
  }

  @Post(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  deactivate(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.notesService.deactivate(id, {
      id: req.user.id,
      role: req.user.role,
      companyId: isUserMode() ? req.user.id : req.user.companyId,
    });
  }
}
