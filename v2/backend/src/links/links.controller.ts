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
  ParseUUIDPipe,
} from '@nestjs/common';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { ContentAudience, UserRole } from '@prisma/client';
import { PermissionsService } from '../permissions/permissions.service';

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

@Controller('links')
export class LinksController {
  constructor(
    private readonly linksService: LinksService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COLLABORATOR)
  async create(@Body() createLinkDto: CreateLinkDto, @Request() req: any) {
    const user = req.user;
    const isSuperAdmin = user?.role === UserRole.SUPERADMIN;
    const companyId = isSuperAdmin ? createLinkDto.companyId : user?.companyId;
    const audience = resolveAudience(user?.role, createLinkDto);

    console.log('[LinksController.create] Recebido:', {
      userRole: user?.role,
      userCompanyId: user?.companyId,
      dtoCompanyId: createLinkDto.companyId,
      resolvedCompanyId: companyId,
      audience,
    });

    if (!companyId) {
      throw new ForbiddenException('Empresa obrigatoria.');
    }

    if (!isSuperAdmin && createLinkDto.companyId && createLinkDto.companyId !== companyId) {
      throw new ForbiddenException('Empresa nao autorizada.');
    }

    if (!isAllowedAudience(user?.role, audience)) {
      throw new ForbiddenException('Visibilidade nao autorizada.');
    }

    if (
      user?.role === UserRole.COLLABORATOR &&
      createLinkDto.sectorId &&
      !(await this.linksService.userHasSector(user.id, createLinkDto.sectorId))
    ) {
      throw new ForbiddenException('Setor nao autorizado.');
    }

    if (audience === ContentAudience.SECTOR && !createLinkDto.sectorId) {
      throw new ForbiddenException('Setor obrigatorio para links de setor.');
    }

    return this.linksService.create({
      ...createLinkDto,
      companyId,
      sectorId:
        audience === ContentAudience.SECTOR
          ? createLinkDto.sectorId || undefined
          : undefined,
      unitId:
        audience === ContentAudience.SECTOR
          ? createLinkDto.unitId ?? undefined
          : undefined,
      unitIds:
        audience === ContentAudience.SECTOR
          ? createLinkDto.unitIds ?? undefined
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
    console.log('[LinksController.findAll] Query params:', {
      companyId,
      normalizedCompanyId,
      sectorId,
      categoryId,
      isPublic,
      audience,
      filters,
    });
    const { id, canViewPrivate } = await this.getAccessContext(req?.user);
    const result = await this.linksService.findAll(normalizedCompanyId, filters, {
      id,
      canViewPrivate,
    });
    console.log('[LinksController.findAll] Retornando', result.length, 'links:');
    result.forEach(l => console.log(`  - ${l.title} (companyId: ${l.companyId})`));
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

    const { id, canViewPrivate } = await this.getAccessContext(req.user);
    const result = await this.linksService.findAll(resolvedCompanyId, filters, {
      id,
      canViewPrivate,
    });
    console.log('LinksController.findAllAdmin - resultado:', result.length, 'links');
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
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req?: any,
  ) {
    const { id: userId, canViewPrivate } = await this.getAccessContext(req?.user);
    return this.linksService.findOne(id, { id: userId, canViewPrivate });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COLLABORATOR)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateLinkDto: UpdateLinkDto,
    @Request() req: any,
  ) {
    const actor = await this.getAccessContext(req.user);
    return this.linksService.update(id, updateLinkDto, actor);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COLLABORATOR)
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: { adminMessage?: string } | undefined,
    @Request() req: any,
  ) {
    const actor = await this.getAccessContext(req.user);
    return this.linksService.remove(id, actor, body?.adminMessage);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async restore(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: any,
  ) {
    const actor = await this.getAccessContext(req.user);
    return this.linksService.restore(id, actor);
  }

  @Post(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async activate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: any,
  ) {
    const actor = await this.getAccessContext(req.user);
    return this.linksService.activate(id, actor);
  }

  @Post(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async deactivate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req: any,
  ) {
    const actor = await this.getAccessContext(req.user);
    return this.linksService.deactivate(id, actor);
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
