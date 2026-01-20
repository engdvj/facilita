import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { ContentAudience, EntityStatus, UserRole, NotificationType, EntityType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

type NoteActor = {
  id: string;
  role: UserRole;
  companyId?: string | null;
};

@Injectable()
export class NotesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(createNoteDto: CreateNoteDto) {
    await this.assertUnitAllowed(createNoteDto.sectorId, createNoteDto.unitId ?? undefined);

    const note = await this.prisma.note.create({
      data: createNoteDto,
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

    // Notificar usuários sobre novo conteúdo
    try {
      const recipients = await this.notificationsService.getRecipientsByAudience(
        note.companyId,
        note.sectorId,
        note.audience,
        note.userId || undefined,
      );

      if (recipients.length > 0) {
        await this.notificationsService.createBulk(recipients, {
          type: NotificationType.CONTENT_CREATED,
          entityType: EntityType.NOTE,
          entityId: note.id,
          title: 'Nova Nota Disponível',
          message: `Nota "${note.title}" foi publicada`,
          actionUrl: `/?highlight=note-${note.id}`,
          metadata: { noteTitle: note.title, creatorName: note.user?.name },
        });

        this.notificationsGateway.emitToUsers(recipients, 'notification', {
          type: 'CONTENT_CREATED',
          entityType: 'NOTE',
          entityId: note.id,
          title: 'Nova Nota Disponível',
          message: `Nota "${note.title}" foi publicada`,
        });
      }
    } catch (error) {
      console.error('Failed to create notification:', error);
    }

    return note;
  }

  async findAll(
    companyId?: string,
    filters?: {
      sectorId?: string;
      unitId?: string;
      unitIds?: string[];
      categoryId?: string;
      isPublic?: boolean;
      audience?: ContentAudience;
      includeInactive?: boolean;
    },
  ) {
    const shouldFilterPublic = filters?.audience === ContentAudience.PUBLIC;
    const unitFilter =
      filters?.unitId !== undefined
        ? {
            OR: [
              { unitId: null },
              { unitId: filters.unitId },
            ],
          }
        : filters?.unitIds !== undefined
          ? {
              OR: [
                { unitId: null },
                { unitId: { in: filters.unitIds } },
              ],
            }
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
      ...(filters?.sectorId && { sectorId: filters.sectorId }),
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(!shouldFilterPublic &&
        filters?.audience && { audience: filters.audience }),
      ...(filters?.isPublic !== undefined &&
        !shouldFilterPublic && { isPublic: filters.isPublic }),
      ...(andFilters.length > 0 ? { AND: andFilters } : {}),
    };

    return this.prisma.note.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async userHasSector(userId: string, sectorId: string) {
    const count = await this.prisma.userSector.count({
      where: {
        userId,
        sectorId,
      },
    });

    return count > 0;
  }

  async findOne(id: string) {
    const note = await this.prisma.note.findUnique({
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

    if (!note || note.deletedAt) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto, actor?: NoteActor) {
    const existingNote = await this.findOne(id);
    this.assertCanMutate(existingNote, actor);

    const existingAudience = this.resolveAudienceFromExisting(existingNote);
    const shouldUpdateAudience =
      updateNoteDto.audience !== undefined || updateNoteDto.isPublic !== undefined;
    const resolvedAudience = shouldUpdateAudience
      ? this.resolveAudienceForUpdate(existingAudience, updateNoteDto)
      : existingAudience;

    if (shouldUpdateAudience && actor?.role) {
      this.assertAudienceAllowed(actor.role, resolvedAudience);
    }

    const hasChanges =
      updateNoteDto.title !== existingNote.title ||
      updateNoteDto.content !== existingNote.content;

    const {
      companyId,
      userId,
      sectorId: _sectorId,
      unitId: _unitId,
      audience,
      isPublic,
      ...rest
    } = updateNoteDto;
    const sectorId =
      resolvedAudience === ContentAudience.SECTOR
        ? _sectorId ?? existingNote.sectorId ?? undefined
        : undefined;
    const unitId =
      resolvedAudience === ContentAudience.SECTOR
        ? (_unitId !== undefined ? _unitId : existingNote.unitId) ?? undefined
        : null;

    if (resolvedAudience === ContentAudience.SECTOR && !sectorId) {
      throw new ForbiddenException('Setor obrigatorio para notas de setor.');
    }

    await this.assertUnitAllowed(sectorId, unitId ?? undefined);

    const updateData: UpdateNoteDto = {
      ...rest,
      sectorId,
      unitId,
    };

    if (shouldUpdateAudience) {
      updateData.audience = resolvedAudience;
      updateData.isPublic = resolvedAudience === ContentAudience.PUBLIC;
    }

    const updated = await this.prisma.note.update({
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
          EntityType.NOTE,
          id,
        );
        const recipients = favoritedBy.filter((uid) => uid !== actor.id);

        if (recipients.length > 0) {
          await this.notificationsService.createBulk(recipients, {
            type: NotificationType.FAVORITE_UPDATED,
            entityType: EntityType.NOTE,
            entityId: id,
            title: 'Nota Favoritada Atualizada',
            message: `Nota "${updated.title}" foi atualizada`,
            actionUrl: `/?highlight=note-${id}`,
            metadata: { noteTitle: updated.title, editorId: actor.id },
          });

          this.notificationsGateway.emitToUsers(recipients, 'notification', {
            type: 'FAVORITE_UPDATED',
            entityType: 'NOTE',
            entityId: id,
            title: 'Nota Favoritada Atualizada',
            message: `Nota "${updated.title}" foi atualizada`,
          });
        }
      } catch (error) {
        console.error('Failed to notify favorites:', error);
      }
    }

    return updated;
  }

  async remove(id: string, actor?: NoteActor, adminMessage?: string) {
    const existingNote = await this.findOne(id);
    this.assertCanMutate(existingNote, actor);

    const deleted = await this.prisma.note.update({
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
          existingNote.companyId,
          existingNote.sectorId,
          existingNote.audience,
          actor.id,
        );

        const message = adminMessage || `Nota "${existingNote.title}" foi removida por um administrador`;

        if (recipients.length > 0) {
          await this.notificationsService.createBulk(recipients, {
            type: NotificationType.CONTENT_DELETED,
            entityType: EntityType.NOTE,
            entityId: id,
            title: 'Nota Removida',
            message,
            actionUrl: undefined,
            metadata: {
              noteTitle: existingNote.title,
              deletedBy: actor.id,
              adminMessage,
            },
          });

          this.notificationsGateway.emitToUsers(recipients, 'notification', {
            type: 'CONTENT_DELETED',
            entityType: 'NOTE',
            entityId: id,
            title: 'Nota Removida',
            message,
          });
        }

        // Notificar favoritos
        const favoritedBy = await this.notificationsService.getUsersWhoFavorited(EntityType.NOTE, id);
        const favoriteRecipients = favoritedBy.filter((uid) => uid !== actor.id && !recipients.includes(uid));

        if (favoriteRecipients.length > 0) {
          await this.notificationsService.createBulk(favoriteRecipients, {
            type: NotificationType.FAVORITE_DELETED,
            entityType: EntityType.NOTE,
            entityId: id,
            title: 'Nota Favoritada Removida',
            message,
            actionUrl: undefined,
            metadata: { noteTitle: existingNote.title, adminMessage },
          });

          this.notificationsGateway.emitToUsers(favoriteRecipients, 'notification', {
            type: 'FAVORITE_DELETED',
            entityType: 'NOTE',
            entityId: id,
            title: 'Nota Favoritada Removida',
            message,
          });
        }
      } catch (error) {
        console.error('Failed to notify deletion:', error);
      }
    }

    return deleted;
  }

  async restore(id: string) {
    const note = await this.prisma.note.findUnique({
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

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    const restored = await this.prisma.note.update({
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
          entityType: EntityType.NOTE,
          entityId: restored.id,
          title: 'Nota Restaurada',
          message: `Nota "${restored.title}" foi restaurada e está disponível novamente`,
          actionUrl: `/?highlight=note-${restored.id}`,
          metadata: { noteTitle: restored.title },
        });

        this.notificationsGateway.emitToUsers(recipients, 'notification', {
          type: 'CONTENT_RESTORED',
          entityType: 'NOTE',
          entityId: restored.id,
          title: 'Nota Restaurada',
          message: `Nota "${restored.title}" foi restaurada e está disponível novamente`,
          actionUrl: `/?highlight=note-${restored.id}`,
        });
      }
    } catch (error) {
      console.error('Failed to notify restoration:', error);
    }

    return restored;
  }

  async activate(id: string, actor?: NoteActor) {
    const note = await this.prisma.note.findUnique({
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

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    // Verificar permissões
    if (actor) {
      this.assertCanMutate(note, actor);
    }

    const activated = await this.prisma.note.update({
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
            entityType: EntityType.NOTE,
            entityId: activated.id,
            title: 'Nota Ativada',
            message: `Nota "${activated.title}" foi ativada e está disponível novamente`,
            actionUrl: `/?highlight=note-${activated.id}`,
            metadata: { noteTitle: activated.title },
          });

          this.notificationsGateway.emitToUsers(recipients, 'notification', {
            type: 'CONTENT_ACTIVATED',
            entityType: 'NOTE',
            entityId: activated.id,
            title: 'Nota Ativada',
            message: `Nota "${activated.title}" foi ativada e está disponível novamente`,
            actionUrl: `/?highlight=note-${activated.id}`,
          });
        }
      } catch (error) {
        console.error('Failed to notify activation:', error);
      }
    }

    return activated;
  }

  async deactivate(id: string, actor?: NoteActor) {
    const note = await this.prisma.note.findUnique({
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

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    // Verificar permissões
    if (actor) {
      this.assertCanMutate(note, actor);
    }

    const deactivated = await this.prisma.note.update({
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
            entityType: EntityType.NOTE,
            entityId: deactivated.id,
            title: 'Nota Desativada',
            message: `Nota "${deactivated.title}" foi temporariamente desativada`,
            actionUrl: undefined,
            metadata: { noteTitle: deactivated.title },
          });

          this.notificationsGateway.emitToUsers(recipients, 'notification', {
            type: 'CONTENT_DEACTIVATED',
            entityType: 'NOTE',
            entityId: deactivated.id,
            title: 'Nota Desativada',
            message: `Nota "${deactivated.title}" foi temporariamente desativada`,
          });
        }
      } catch (error) {
        console.error('Failed to notify deactivation:', error);
      }
    }

    return deactivated;
  }

  private async assertUnitAllowed(
    sectorId?: string | null,
    unitId?: string,
  ) {
    if (!unitId) return;
    if (!sectorId) {
      throw new ForbiddenException('Unidade requer setor.');
    }

    const relation = await this.prisma.sectorUnit.findFirst({
      where: {
        sectorId,
        unitId,
      },
    });

    if (!relation) {
      throw new ForbiddenException('Unidade nao pertence ao setor.');
    }
  }

  private assertCanMutate(
    note: { userId?: string | null; companyId: string },
    actor?: NoteActor,
  ) {
    if (!actor) return;

    if (actor.role === UserRole.SUPERADMIN) {
      return;
    }

    if (actor.role === UserRole.ADMIN) {
      if (actor.companyId && actor.companyId !== note.companyId) {
        throw new ForbiddenException('Empresa nao autorizada.');
      }
      return;
    }

    if (actor.role === UserRole.COLLABORATOR) {
      if (!note.userId || note.userId !== actor.id) {
        throw new ForbiddenException('Nota nao autorizada.');
      }
      return;
    }

    throw new ForbiddenException('Permissao insuficiente.');
  }

  private resolveAudienceFromExisting(note: {
    audience?: ContentAudience | null;
    isPublic: boolean;
    sectorId?: string | null;
  }) {
    if (note.isPublic) return ContentAudience.PUBLIC;
    if (note.audience) return note.audience;
    if (note.sectorId) return ContentAudience.SECTOR;
    return ContentAudience.COMPANY;
  }

  private resolveAudienceForUpdate(
    existing: ContentAudience,
    updateNoteDto: UpdateNoteDto,
  ) {
    if (updateNoteDto.audience) return updateNoteDto.audience;
    if (updateNoteDto.isPublic !== undefined) {
      return updateNoteDto.isPublic ? ContentAudience.PUBLIC : existing;
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
}
