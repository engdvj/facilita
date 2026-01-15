import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { ContentAudience, EntityStatus, UserRole, NotificationType, EntityType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

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

  async create(createLinkDto: CreateLinkDto) {
    console.log('[LinksService.create] Criando link com dados:', createLinkDto);

    const link = await this.prisma.link.create({
      data: createLinkDto,
      include: {
        category: true,
        sector: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
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
      categoryId?: string;
      isPublic?: boolean;
      audience?: ContentAudience;
      includeInactive?: boolean;
    },
  ) {
    const shouldFilterPublic = filters?.audience === ContentAudience.PUBLIC;
    const where = {
      deletedAt: null,
      ...(companyId ? { companyId } : {}),
      ...(filters?.sectorId && { sectorId: filters.sectorId }),
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(!shouldFilterPublic &&
        filters?.audience && { audience: filters.audience }),
      ...(filters?.isPublic !== undefined &&
        !shouldFilterPublic && { isPublic: filters.isPublic }),
      ...(shouldFilterPublic && {
        OR: [
          { audience: ContentAudience.PUBLIC },
          { isPublic: true },
        ],
      }),
    };

    console.log('LinksService.findAll - where clause:', JSON.stringify(where, null, 2));

    const links = await this.prisma.link.findMany({
      where,
      include: {
        category: true,
        sector: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    console.log('LinksService.findAll - links encontrados:', links.length);
    return links;
  }

  async findOne(id: string) {
    const link = await this.prisma.link.findUnique({
      where: { id },
      include: {
        category: true,
        sector: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
      },
    });

    if (!link || link.deletedAt) {
      throw new NotFoundException(`Link with ID ${id} not found`);
    }

    return link;
  }

  async update(id: string, updateLinkDto: UpdateLinkDto, actor?: LinkActor) {
    const existingLink = await this.findOne(id);
    this.assertCanMutate(existingLink, actor);

    const existingAudience = this.resolveAudienceFromExisting(existingLink);
    const shouldUpdateAudience =
      updateLinkDto.audience !== undefined || updateLinkDto.isPublic !== undefined;
    const resolvedAudience = shouldUpdateAudience
      ? this.resolveAudienceForUpdate(existingAudience, updateLinkDto)
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

    const {
      companyId,
      userId,
      sectorId: _sectorId,
      audience,
      isPublic,
      ...rest
    } = updateLinkDto;
    const sectorId =
      resolvedAudience === ContentAudience.SECTOR
        ? _sectorId ?? existingLink.sectorId ?? undefined
        : undefined;

    if (resolvedAudience === ContentAudience.SECTOR && !sectorId) {
      throw new ForbiddenException('Setor obrigatorio para links de setor.');
    }

    const updateData: UpdateLinkDto = {
      ...rest,
      sectorId,
    };

    if (shouldUpdateAudience) {
      updateData.audience = resolvedAudience;
      updateData.isPublic = resolvedAudience === ContentAudience.PUBLIC;
    }

    const updated = await this.prisma.link.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        sector: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
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
      include: {
        category: true,
        sector: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
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
      include: {
        category: true,
        sector: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
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
      include: {
        category: true,
        sector: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
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
      include: {
        category: true,
        sector: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
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
      include: {
        category: true,
        sector: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
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
      include: {
        category: true,
        sector: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
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
