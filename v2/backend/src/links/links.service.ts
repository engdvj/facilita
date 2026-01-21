import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { ContentAudience, EntityStatus, UserRole, NotificationType, EntityType, Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { isUserMode } from '../common/app-mode';

type LinkActor = {
  id: string;
  role: UserRole;
  companyId?: string | null;
};

@Injectable()
export class LinksService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  private getBaseInclude() {
    if (isUserMode()) {
      return {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      };
    }
    return {
      category: true,
      sector: true,
      linkUnits: {
        include: {
          unit: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    };
  }

  private getIncludeWithVersions() {
    return {
      ...this.getBaseInclude(),
      versions: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          changedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    };
  }

  private normalizeAudienceForUserMode(audience: ContentAudience) {
    if (!isUserMode()) return audience;
    if (audience === ContentAudience.COMPANY || audience === ContentAudience.SECTOR) {
      return ContentAudience.PRIVATE;
    }
    return audience;
  }

  async create(createLinkDto: CreateLinkDto) {
    console.log('[LinksService.create] Criando link com dados:', createLinkDto);

    const { unitIds, unitId, ...data } = createLinkDto;
    const normalizedUnitIds = isUserMode()
      ? []
      : this.normalizeUnitIds(unitIds, unitId);

    await this.assertUnitsAllowed(data.sectorId, normalizedUnitIds);
    if (data.audience) {
      data.audience = this.normalizeAudienceForUserMode(data.audience);
      data.isPublic = data.audience === ContentAudience.PUBLIC;
    }

    const link = await this.prisma.link.create({
      data: {
        ...data,
        unitId: isUserMode()
          ? null
          : normalizedUnitIds.length === 1
            ? normalizedUnitIds[0]
            : null,
        linkUnits: isUserMode()
          ? undefined
          : normalizedUnitIds.length > 0
            ? {
                create: normalizedUnitIds.map((itemUnitId) => ({
                  unitId: itemUnitId,
                })),
              }
            : undefined,
      },
      include: this.getBaseInclude(),
    });

    console.log('[LinksService.create] Link criado:', {
      id: link.id,
      title: link.title,
      companyId: link.companyId,
      audience: link.audience,
    });

    // Notificar usuários sobre novo conteúdo
    try {
      const recipients = await this.notificationsService.getRecipientsByAudience(
        link.companyId,
        link.sectorId,
        link.audience,
        link.userId || undefined,
      );

      if (recipients.length > 0) {
        await this.notificationsService.createBulk(recipients, {
          type: NotificationType.CONTENT_CREATED,
          entityType: EntityType.LINK,
          entityId: link.id,
          title: 'Novo Link Disponível',
          message: `Link "${link.title}" foi publicado`,
          actionUrl: `/?highlight=link-${link.id}`,
          metadata: { linkTitle: link.title, creatorName: link.user?.name },
        });

        this.notificationsGateway.emitToUsers(recipients, 'notification', {
          type: 'CONTENT_CREATED',
          entityType: 'LINK',
          entityId: link.id,
          title: 'Novo Link Disponível',
          message: `Link "${link.title}" foi publicado`,
        });
      }
    } catch (error) {
      console.error('Failed to create notification:', error);
    }

    return link;
  }

  async findAll(
    companyId?: string,
    filters?: {
      sectorId?: string;
      sectorIds?: string[]; // Novo: permite filtrar por múltiplos setores
      unitId?: string;
      unitIds?: string[];
      categoryId?: string;
      isPublic?: boolean;
      audience?: ContentAudience;
      includeInactive?: boolean;
    },
  ) {
    const shouldFilterPublic = filters?.audience === ContentAudience.PUBLIC;
    const canUseSectorFilters = !isUserMode();

    // Se sectorIds foi fornecido, filtra por múltiplos setores
    const sectorFilter = canUseSectorFilters
      ? filters?.sectorIds
        ? { sectorId: { in: filters.sectorIds } }
        : filters?.sectorId
          ? { sectorId: filters.sectorId }
          : {}
      : {};

    const filterUnitIds =
      !canUseSectorFilters
        ? undefined
        : filters?.unitId !== undefined
          ? this.normalizeUnitIds(undefined, filters.unitId)
          : filters?.unitIds;
    const unitFilter =
      filterUnitIds !== undefined
        ? filterUnitIds.length > 0
          ? {
              OR: [
                { unitId: null, linkUnits: { none: {} } },
                { unitId: { in: filterUnitIds } },
                { linkUnits: { some: { unitId: { in: filterUnitIds } } } },
              ],
            }
          : { OR: [{ unitId: null, linkUnits: { none: {} } }] }
        : undefined;

    const andFilters = [];
    if (unitFilter) {
      andFilters.push(unitFilter);
    }
    if (shouldFilterPublic) {
      andFilters.push({
        OR: [
          { audience: ContentAudience.PUBLIC },
          { isPublic: true },
        ],
      });
    }

    const where = {
      deletedAt: null,
      ...(companyId ? { companyId } : {}),
      ...sectorFilter,
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(!shouldFilterPublic &&
        filters?.audience && { audience: filters.audience }),
      ...(filters?.isPublic !== undefined &&
        !shouldFilterPublic && { isPublic: filters.isPublic }),
      ...(andFilters.length > 0 ? { AND: andFilters } : {}),
    };

    console.log('LinksService.findAll - where clause:', JSON.stringify(where, null, 2));

    const links = await this.prisma.link.findMany({
      where,
      include: this.getBaseInclude(),
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    console.log('LinksService.findAll - links encontrados:', links.length);
    return links;
  }

  // Método helper para buscar links de todos os setores de um usuário
  async findAllByUser(userId: string, companyId?: string) {
    if (isUserMode()) {
      return this.findAll(companyId);
    }
    // Busca todos os setores do usuário
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userSectors: {
          select: {
            sectorId: true,
            sector: {
              select: {
                sectorUnits: {
                  select: {
                    unitId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return [];
    }

    const sectorIds = user.userSectors.map(
      (us: { sectorId: string }) => us.sectorId,
    );
    const unitIds: string[] = Array.from(
      new Set(
        user.userSectors.flatMap(
          (userSector: {
            sector?: { sectorUnits?: { unitId: string }[] | null } | null;
          }) =>
            userSector.sector?.sectorUnits?.map(
              (unit: { unitId: string }) => unit.unitId,
            ) ?? [],
        ),
      ),
    );

    // Busca links dos setores do usuário + links públicos/company
    return this.findAll(companyId, {
      sectorIds: sectorIds.length > 0 ? sectorIds : undefined,
      unitIds,
    });
  }

  async userHasSector(userId: string, sectorId: string) {
    if (isUserMode()) {
      return false;
    }
    const count = await this.prisma.userSector.count({
      where: {
        userId,
        sectorId,
      },
    });

    return count > 0;
  }

  async findOne(id: string) {
    const link = await this.prisma.link.findUnique({
      where: { id },
      include: this.getIncludeWithVersions(),
    });

    if (!link || link.deletedAt) {
      throw new NotFoundException(`Link with ID ${id} not found`);
    }

    return link;
  }

  async update(id: string, updateLinkDto: UpdateLinkDto, actor?: LinkActor) {
    const existingLink = await this.findOne(id);
    this.assertCanMutate(existingLink, actor);

    const existingAudience = this.normalizeAudienceForUserMode(
      this.resolveAudienceFromExisting(existingLink),
    );
    const shouldUpdateAudience =
      updateLinkDto.audience !== undefined || updateLinkDto.isPublic !== undefined;
    const resolvedAudience = shouldUpdateAudience
      ? this.normalizeAudienceForUserMode(
          this.resolveAudienceForUpdate(existingAudience, updateLinkDto),
        )
      : existingAudience;

    if (shouldUpdateAudience && actor?.role) {
      this.assertAudienceAllowed(actor.role, resolvedAudience);
    }

    // Create version history if title, url or description changed
    const hasChanges =
      updateLinkDto.title !== existingLink.title ||
      updateLinkDto.url !== existingLink.url ||
      updateLinkDto.description !== existingLink.description;

    if (hasChanges && actor?.id) {
      await this.prisma.linkVersion.create({
        data: {
          linkId: id,
          title: existingLink.title,
          url: existingLink.url,
          description: existingLink.description,
          changedBy: actor.id,
        },
      });
    }

    if (isUserMode()) {
      const {
        categoryId: _categoryId,
        companyId: _companyId,
        userId: _userId,
        sectorId: _sectorId,
        unitId: _unitId,
        unitIds: _unitIds,
        audience: _audience,
        isPublic: _isPublic,
        ...rest
      } = updateLinkDto;

      const updateData: Prisma.LinkUpdateInput = {
        ...rest,
      };

      if (_categoryId !== undefined) {
        updateData.category = _categoryId
          ? { connect: { id: _categoryId } }
          : { disconnect: true };
      }

      if (shouldUpdateAudience) {
        updateData.audience = resolvedAudience;
        updateData.isPublic = resolvedAudience === ContentAudience.PUBLIC;
      }

      return this.prisma.link.update({
        where: { id },
        data: updateData,
        include: this.getBaseInclude(),
      });
    }

    const {
      categoryId: _categoryId,
      companyId,
      userId,
      sectorId: _sectorId,
      unitId: _unitId,
      unitIds: _unitIds,
      audience,
      isPublic,
      ...rest
    } = updateLinkDto;
    const sectorId =
      resolvedAudience === ContentAudience.SECTOR
        ? _sectorId ?? existingLink.sectorId ?? undefined
        : undefined;
    const existingUnitIds =
      existingLink.linkUnits?.length
        ? existingLink.linkUnits.map((unit: { unitId: string }) => unit.unitId)
        : this.normalizeUnitIds(undefined, existingLink.unitId ?? undefined);
    const unitIdsPayload =
      _unitIds !== undefined
        ? _unitIds ?? []
        : _unitId !== undefined
          ? this.normalizeUnitIds(undefined, _unitId)
          : undefined;
    const sectorChanged =
      resolvedAudience === ContentAudience.SECTOR &&
      sectorId &&
      sectorId !== existingLink.sectorId;
    let nextUnitIds =
      unitIdsPayload !== undefined
        ? this.normalizeUnitIds(unitIdsPayload, undefined)
        : sectorChanged
          ? []
          : existingUnitIds;
    if (resolvedAudience !== ContentAudience.SECTOR) {
      nextUnitIds = [];
    }
    const unitId =
      resolvedAudience === ContentAudience.SECTOR && nextUnitIds.length === 1
        ? nextUnitIds[0]
        : null;

    if (resolvedAudience === ContentAudience.SECTOR && !sectorId) {
      throw new ForbiddenException('Setor obrigatorio para links de setor.');
    }

    await this.assertUnitsAllowed(sectorId, nextUnitIds);

    const updateData: Prisma.LinkUpdateInput = {
      ...rest,
      sector:
        resolvedAudience === ContentAudience.SECTOR
          ? { connect: { id: sectorId! } }
          : { disconnect: true },
      unit:
        resolvedAudience === ContentAudience.SECTOR && unitId
          ? { connect: { id: unitId } }
          : { disconnect: true },
    };

    if (_categoryId !== undefined) {
      updateData.category = _categoryId
        ? { connect: { id: _categoryId } }
        : { disconnect: true };
    }
    const shouldUpdateUnits =
      resolvedAudience !== ContentAudience.SECTOR || unitIdsPayload !== undefined;

    if (shouldUpdateUnits) {
      updateData.linkUnits = {
        deleteMany: {},
        ...(nextUnitIds.length > 0
          ? {
              create: nextUnitIds.map((itemUnitId: string) => ({
                unitId: itemUnitId,
              })),
            }
          : {}),
      };
    }

    if (shouldUpdateAudience) {
      updateData.audience = resolvedAudience;
      updateData.isPublic = resolvedAudience === ContentAudience.PUBLIC;
    }

    const updated = await this.prisma.link.update({
      where: { id },
      data: updateData,
      include: this.getBaseInclude(),
    });

    // Notificar usuários que favoritaram
    if (hasChanges && actor?.id) {
      try {
        const favoritedBy = await this.notificationsService.getUsersWhoFavorited(
          EntityType.LINK,
          id,
        );
        const recipients = favoritedBy.filter((uid) => uid !== actor.id);

        if (recipients.length > 0) {
          await this.notificationsService.createBulk(recipients, {
            type: NotificationType.FAVORITE_UPDATED,
            entityType: EntityType.LINK,
            entityId: id,
            title: 'Link Favoritado Atualizado',
            message: `Link "${updated.title}" foi atualizado`,
            actionUrl: `/?highlight=link-${id}`,
            metadata: { linkTitle: updated.title, editorId: actor.id },
          });

          this.notificationsGateway.emitToUsers(recipients, 'notification', {
            type: 'FAVORITE_UPDATED',
            entityType: 'LINK',
            entityId: id,
            title: 'Link Favoritado Atualizado',
            message: `Link "${updated.title}" foi atualizado`,
          });
        }
      } catch (error) {
        console.error('Failed to notify favorites:', error);
      }
    }

    return updated;
  }

  async remove(id: string, actor?: LinkActor, adminMessage?: string) {
    const existingLink = await this.findOne(id);
    this.assertCanMutate(existingLink, actor);

    const deleted = await this.prisma.link.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: EntityStatus.INACTIVE,
      },
    });

    // Notificar sobre deleção (se feito por admin/superadmin)
    if (actor?.role && ['ADMIN', 'SUPERADMIN'].includes(actor.role)) {
      try {
        const recipients = await this.notificationsService.getRecipientsByAudience(
          existingLink.companyId,
          existingLink.sectorId,
          existingLink.audience,
          actor.id,
        );

        const message = adminMessage || `Link "${existingLink.title}" foi removido por um administrador`;

        if (recipients.length > 0) {
          await this.notificationsService.createBulk(recipients, {
            type: NotificationType.CONTENT_DELETED,
            entityType: EntityType.LINK,
            entityId: id,
            title: 'Link Removido',
            message,
            actionUrl: undefined,
            metadata: {
              linkTitle: existingLink.title,
              linkUrl: existingLink.url,
              deletedBy: actor.id,
              adminMessage,
            },
          });

          this.notificationsGateway.emitToUsers(recipients, 'notification', {
            type: 'CONTENT_DELETED',
            entityType: 'LINK',
            entityId: id,
            title: 'Link Removido',
            message,
          });
        }

        // Notificar favoritos
        const favoritedBy = await this.notificationsService.getUsersWhoFavorited(EntityType.LINK, id);
        const favoriteRecipients = favoritedBy.filter((uid) => uid !== actor.id && !recipients.includes(uid));

        if (favoriteRecipients.length > 0) {
          await this.notificationsService.createBulk(favoriteRecipients, {
            type: NotificationType.FAVORITE_DELETED,
            entityType: EntityType.LINK,
            entityId: id,
            title: 'Link Favoritado Removido',
            message,
            actionUrl: undefined,
            metadata: { linkTitle: existingLink.title, adminMessage },
          });

          this.notificationsGateway.emitToUsers(favoriteRecipients, 'notification', {
            type: 'FAVORITE_DELETED',
            entityType: 'LINK',
            entityId: id,
            title: 'Link Favoritado Removido',
            message,
          });
        }
      } catch (error) {
        console.error('Failed to notify deletion:', error);
      }
    }

    return deleted;
  }

  private normalizeUnitIds(unitIds?: string[] | null, unitId?: string | null) {
    const combined = [
      ...(unitIds ?? []),
      ...(unitId ? [unitId] : []),
    ].filter(Boolean);
    return Array.from(new Set(combined));
  }

  private async assertUnitsAllowed(
    sectorId?: string | null,
    unitIds?: string[],
  ) {
    if (isUserMode()) {
      return;
    }
    const normalizedUnitIds = this.normalizeUnitIds(unitIds, undefined);
    if (normalizedUnitIds.length === 0) return;
    if (!sectorId) {
      throw new ForbiddenException('Unidade requer setor.');
    }

    const relationCount = await this.prisma.sectorUnit.count({
      where: {
        sectorId,
        unitId: { in: normalizedUnitIds },
      },
    });

    if (relationCount !== normalizedUnitIds.length) {
      throw new ForbiddenException('Unidade nao pertence ao setor.');
    }
  }

  private assertCanMutate(link: { userId?: string | null; companyId: string }, actor?: LinkActor) {
    if (!actor) return;

    if (actor.role === UserRole.SUPERADMIN) {
      return;
    }

    if (actor.role === UserRole.ADMIN) {
      if (actor.companyId && actor.companyId !== link.companyId) {
        throw new ForbiddenException('Empresa nao autorizada.');
      }
      return;
    }

    if (actor.role === UserRole.COLLABORATOR) {
      if (!link.userId || link.userId !== actor.id) {
        throw new ForbiddenException('Link nao autorizado.');
      }
      return;
    }

    throw new ForbiddenException('Permissao insuficiente.');
  }

  private resolveAudienceFromExisting(link: {
    audience?: ContentAudience | null;
    isPublic: boolean;
    sectorId?: string | null;
  }) {
    if (link.isPublic) return ContentAudience.PUBLIC;
    if (link.audience) return link.audience;
    if (link.sectorId) return ContentAudience.SECTOR;
    return ContentAudience.COMPANY;
  }

  private resolveAudienceForUpdate(
    existing: ContentAudience,
    updateLinkDto: UpdateLinkDto,
  ) {
    if (updateLinkDto.audience) return updateLinkDto.audience;
    if (updateLinkDto.isPublic !== undefined) {
      return updateLinkDto.isPublic ? ContentAudience.PUBLIC : existing;
    }
    return existing;
  }

  private assertAudienceAllowed(role: UserRole, audience: ContentAudience) {
    if (isUserMode()) {
      const userModeAllowedAudiences: ContentAudience[] = [
        ContentAudience.PUBLIC,
        ContentAudience.PRIVATE,
        ContentAudience.ADMIN,
        ContentAudience.SUPERADMIN,
      ];
      if (role === UserRole.SUPERADMIN) return;
      if (role === UserRole.ADMIN) {
        if (!userModeAllowedAudiences.includes(audience)) {
          throw new ForbiddenException('Visibilidade nao autorizada.');
        }
        return;
      }
      if (role === UserRole.COLLABORATOR) {
        if (audience !== ContentAudience.PRIVATE) {
          throw new ForbiddenException('Visibilidade nao autorizada.');
        }
        return;
      }
    }
    if (role === UserRole.SUPERADMIN) return;
    if (role === UserRole.ADMIN) {
      if (
        audience !== ContentAudience.COMPANY &&
        audience !== ContentAudience.SECTOR
      ) {
        throw new ForbiddenException('Visibilidade nao autorizada.');
      }
      return;
    }
    if (role === UserRole.COLLABORATOR) {
      if (audience !== ContentAudience.PRIVATE) {
        throw new ForbiddenException('Visibilidade nao autorizada.');
      }
      return;
    }
  }

  async restore(id: string) {
    const link = await this.prisma.link.findUnique({
      where: { id },
      include: this.getBaseInclude(),
    });

    if (!link) {
      throw new NotFoundException(`Link with ID ${id} not found`);
    }

    const restored = await this.prisma.link.update({
      where: { id },
      data: {
        deletedAt: null,
        status: EntityStatus.ACTIVE,
      },
      include: this.getBaseInclude(),
    });

    // Notificar usuários sobre restauração
    try {
      const recipients = await this.notificationsService.getRecipientsByAudience(
        restored.companyId,
        restored.sectorId,
        restored.audience,
        undefined,
      );

      if (recipients.length > 0) {
        await this.notificationsService.createBulk(recipients, {
          type: NotificationType.CONTENT_RESTORED,
          entityType: EntityType.LINK,
          entityId: restored.id,
          title: 'Link Restaurado',
          message: `Link "${restored.title}" foi restaurado e está disponível novamente`,
          actionUrl: `/?highlight=link-${restored.id}`,
          metadata: { linkTitle: restored.title },
        });

        this.notificationsGateway.emitToUsers(recipients, 'notification', {
          type: 'CONTENT_RESTORED',
          entityType: 'LINK',
          entityId: restored.id,
          title: 'Link Restaurado',
          message: `Link "${restored.title}" foi restaurado e está disponível novamente`,
        });
      }
    } catch (error) {
      console.error('Failed to notify restoration:', error);
    }

    return restored;
  }

  async activate(id: string, actor?: LinkActor) {
    const link = await this.prisma.link.findUnique({
      where: { id },
      include: this.getBaseInclude(),
    });

    if (!link) {
      throw new NotFoundException(`Link with ID ${id} not found`);
    }

    // Verificar permissões
    if (actor) {
      this.assertCanMutate(link, actor);
    }

    const activated = await this.prisma.link.update({
      where: { id },
      data: {
        status: EntityStatus.ACTIVE,
      },
      include: this.getBaseInclude(),
    });

    // Notificar usuários sobre ativação (se feito por admin/superadmin)
    if (actor?.role && ['ADMIN', 'SUPERADMIN'].includes(actor.role)) {
      try {
        const recipients = await this.notificationsService.getRecipientsByAudience(
          activated.companyId,
          activated.sectorId,
          activated.audience,
          actor.id,
        );

        if (recipients.length > 0) {
          await this.notificationsService.createBulk(recipients, {
            type: NotificationType.CONTENT_ACTIVATED,
            entityType: EntityType.LINK,
            entityId: activated.id,
            title: 'Link Ativado',
            message: `Link "${activated.title}" foi ativado e está disponível novamente`,
            actionUrl: `/?highlight=link-${activated.id}`,
            metadata: { linkTitle: activated.title },
          });

          this.notificationsGateway.emitToUsers(recipients, 'notification', {
            type: 'CONTENT_ACTIVATED',
            entityType: 'LINK',
            entityId: activated.id,
            title: 'Link Ativado',
            message: `Link "${activated.title}" foi ativado e está disponível novamente`,
            actionUrl: `/?highlight=link-${activated.id}`,
          });
        }
      } catch (error) {
        console.error('Failed to notify activation:', error);
      }
    }

    return activated;
  }

  async deactivate(id: string, actor?: LinkActor) {
    const link = await this.prisma.link.findUnique({
      where: { id },
      include: this.getBaseInclude(),
    });

    if (!link) {
      throw new NotFoundException(`Link with ID ${id} not found`);
    }

    // Verificar permissões
    if (actor) {
      this.assertCanMutate(link, actor);
    }

    const deactivated = await this.prisma.link.update({
      where: { id },
      data: {
        status: EntityStatus.INACTIVE,
      },
      include: this.getBaseInclude(),
    });

    // Notificar usuários sobre desativação (se feito por admin/superadmin)
    if (actor?.role && ['ADMIN', 'SUPERADMIN'].includes(actor.role)) {
      try {
        const recipients = await this.notificationsService.getRecipientsByAudience(
          deactivated.companyId,
          deactivated.sectorId,
          deactivated.audience,
          actor.id,
        );

        if (recipients.length > 0) {
          await this.notificationsService.createBulk(recipients, {
            type: NotificationType.CONTENT_DEACTIVATED,
            entityType: EntityType.LINK,
            entityId: deactivated.id,
            title: 'Link Desativado',
            message: `Link "${deactivated.title}" foi temporariamente desativado`,
            actionUrl: undefined,
            metadata: { linkTitle: deactivated.title },
          });

          this.notificationsGateway.emitToUsers(recipients, 'notification', {
            type: 'CONTENT_DEACTIVATED',
            entityType: 'LINK',
            entityId: deactivated.id,
            title: 'Link Desativado',
            message: `Link "${deactivated.title}" foi temporariamente desativado`,
          });
        }
      } catch (error) {
        console.error('Failed to notify deactivation:', error);
      }
    }

    return deactivated;
  }
}
