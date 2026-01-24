import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { ContentAudience, EntityStatus, UserRole, NotificationType, EntityType, Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

type NoteActor = {
  id: string;
  role: UserRole;
  companyId?: string | null;
  canViewPrivate?: boolean;
};

type NoteViewer = {
  id?: string;
  canViewPrivate?: boolean;
};

@Injectable()
export class NotesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(createNoteDto: CreateNoteDto) {
    const { unitIds, unitId, ...data } = createNoteDto;
    const normalizedUnitIds = this.normalizeUnitIds(unitIds, unitId);

    await this.assertUnitsAllowed(data.sectorId, normalizedUnitIds);

    const note = await this.prisma.note.create({
      data: {
        ...data,
        unitId: normalizedUnitIds.length === 1 ? normalizedUnitIds[0] : null,
        noteUnits:
          normalizedUnitIds.length > 0
            ? {
                create: normalizedUnitIds.map((itemUnitId) => ({
                  unitId: itemUnitId,
                })),
              }
            : undefined,
      },
      include: {
        category: true,
        sector: true,
        noteUnits: {
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
    viewer?: NoteViewer,
  ) {
    const shouldFilterPublic = filters?.audience === ContentAudience.PUBLIC;
    const filterUnitIds =
      filters?.unitId !== undefined
        ? this.normalizeUnitIds(undefined, filters.unitId)
        : filters?.unitIds;
    const unitFilter =
      filterUnitIds !== undefined
        ? filterUnitIds.length > 0
          ? {
              OR: [
                { unitId: null, noteUnits: { none: {} } },
                { unitId: { in: filterUnitIds } },
                { noteUnits: { some: { unitId: { in: filterUnitIds } } } },
              ],
            }
          : { OR: [{ unitId: null, noteUnits: { none: {} } }] }
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
    const privateFilter = this.buildPrivateAccessFilter(viewer);
    if (privateFilter) {
      andFilters.push(privateFilter);
    }

    const where = {
      deletedAt: null,
      ...(filters?.includeInactive ? {} : { status: EntityStatus.ACTIVE }),
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
        noteUnits: {
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

  async findOne(id: string, viewer?: NoteViewer) {
    const note = await this.prisma.note.findUnique({
      where: { id },
      include: {
        category: true,
        sector: true,
        noteUnits: {
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
      },
    });

    if (!note || note.deletedAt) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    if (viewer !== undefined) {
      this.assertPrivateAccess(note, viewer);
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
      categoryId: _categoryId,
      companyId,
      userId,
      sectorId: _sectorId,
      unitId: _unitId,
      unitIds: _unitIds,
      audience,
      isPublic,
      ...rest
    } = updateNoteDto;
    const sectorId =
      resolvedAudience === ContentAudience.SECTOR
        ? _sectorId ?? existingNote.sectorId ?? undefined
        : undefined;
    const existingUnitIds =
      existingNote.noteUnits?.length
        ? existingNote.noteUnits.map((unit) => unit.unitId)
        : this.normalizeUnitIds(undefined, existingNote.unitId ?? undefined);
    const unitIdsPayload =
      _unitIds !== undefined
        ? _unitIds ?? []
        : _unitId !== undefined
          ? this.normalizeUnitIds(undefined, _unitId)
          : undefined;
    const sectorChanged =
      resolvedAudience === ContentAudience.SECTOR &&
      sectorId &&
      sectorId !== existingNote.sectorId;
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
      throw new ForbiddenException('Setor obrigatorio para notas de setor.');
    }

    await this.assertUnitsAllowed(sectorId, nextUnitIds);

    const updateData: Prisma.NoteUpdateInput = {
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
      updateData.noteUnits = {
        deleteMany: {},
        ...(nextUnitIds.length > 0
          ? {
              create: nextUnitIds.map((itemUnitId) => ({
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

    const updated = await this.prisma.note.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        sector: true,
        noteUnits: {
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

  async restore(id: string, actor?: NoteActor) {
    const note = await this.prisma.note.findUnique({
      where: { id },
      include: {
        category: true,
        sector: true,
        noteUnits: {
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
      },
    });

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    if (actor) {
      this.assertCanMutate(note, actor);
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
        noteUnits: {
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
        noteUnits: {
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
        noteUnits: {
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
        noteUnits: {
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
        noteUnits: {
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

  private buildPrivateAccessFilter(viewer?: NoteViewer): Prisma.NoteWhereInput | undefined {
    if (viewer?.canViewPrivate) {
      return undefined;
    }
    if (viewer?.id) {
      return {
        OR: [
          { audience: { not: ContentAudience.PRIVATE } },
          { userId: viewer.id },
        ],
      };
    }
    return { audience: { not: ContentAudience.PRIVATE } };
  }

  private assertPrivateAccess(
    note: { audience?: ContentAudience | null; userId?: string | null },
    viewer: NoteViewer,
  ) {
    if (note.audience !== ContentAudience.PRIVATE) {
      return;
    }
    if (!viewer.id) {
      throw new ForbiddenException('Nota nao autorizada.');
    }
    if (note.userId !== viewer.id && !viewer.canViewPrivate) {
      throw new ForbiddenException('Nota nao autorizada.');
    }
  }

  private assertCanMutate(
    note: { userId?: string | null; companyId: string; audience?: ContentAudience | null },
    actor?: NoteActor,
  ) {
    if (!actor) return;

    if (
      note.audience === ContentAudience.PRIVATE &&
      note.userId !== actor.id &&
      !actor.canViewPrivate
    ) {
      throw new ForbiddenException('Nota nao autorizada.');
    }

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
