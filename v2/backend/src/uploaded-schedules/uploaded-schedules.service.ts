import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ContentAudience, EntityStatus, UserRole, NotificationType, EntityType, Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

type ScheduleActor = {
  id: string;
  role: UserRole;
  companyId?: string | null;
};

@Injectable()
export class UploadedSchedulesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(createScheduleDto: CreateScheduleDto) {
    const { unitIds, unitId, ...data } = createScheduleDto;
    const normalizedUnitIds = this.normalizeUnitIds(unitIds, unitId);

    await this.assertUnitsAllowed(data.sectorId, normalizedUnitIds);

    const schedule = await this.prisma.uploadedSchedule.create({
      data: {
        ...data,
        unitId: normalizedUnitIds.length === 1 ? normalizedUnitIds[0] : null,
        scheduleUnits:
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
        scheduleUnits: {
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
        schedule.companyId,
        schedule.sectorId,
        schedule.audience,
        schedule.userId || undefined,
      );

      if (recipients.length > 0) {
        await this.notificationsService.createBulk(recipients, {
          type: NotificationType.CONTENT_CREATED,
          entityType: EntityType.SCHEDULE,
          entityId: schedule.id,
          title: 'Novo Documento Disponível',
          message: `Documento "${schedule.title}" foi publicado`,
          actionUrl: `/?highlight=document-${schedule.id}`,
          metadata: { scheduleTitle: schedule.title, creatorName: schedule.user?.name },
        });

        this.notificationsGateway.emitToUsers(recipients, 'notification', {
          type: 'CONTENT_CREATED',
          entityType: 'SCHEDULE',
          entityId: schedule.id,
          title: 'Novo Documento Disponível',
          message: `Documento "${schedule.title}" foi publicado`,
        });
      }
    } catch (error) {
      console.error('Failed to create notification:', error);
    }

    return schedule;
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
    const filterUnitIds =
      filters?.unitId !== undefined
        ? this.normalizeUnitIds(undefined, filters.unitId)
        : filters?.unitIds;
    const unitFilter =
      filterUnitIds !== undefined
        ? filterUnitIds.length > 0
          ? {
              OR: [
                { unitId: null, scheduleUnits: { none: {} } },
                { unitId: { in: filterUnitIds } },
                { scheduleUnits: { some: { unitId: { in: filterUnitIds } } } },
              ],
            }
          : { OR: [{ unitId: null, scheduleUnits: { none: {} } }] }
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

    console.log('SchedulesService.findAll - where clause:', JSON.stringify(where, null, 2));

    const schedules = await this.prisma.uploadedSchedule.findMany({
      where,
      include: {
        category: true,
        sector: true,
        scheduleUnits: {
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

    console.log('SchedulesService.findAll - schedules encontrados:', schedules.length);
    return schedules;
  }

  async findOne(id: string) {
    const schedule = await this.prisma.uploadedSchedule.findUnique({
      where: { id },
      include: {
        category: true,
        sector: true,
        scheduleUnits: {
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

    if (!schedule || schedule.deletedAt) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    return schedule;
  }

  async update(
    id: string,
    updateScheduleDto: UpdateScheduleDto,
    actor?: ScheduleActor,
  ) {
    const existingSchedule = await this.findOne(id);
    this.assertCanMutate(existingSchedule, actor);

    const existingAudience = this.resolveAudienceFromExisting(existingSchedule);
    const shouldUpdateAudience =
      updateScheduleDto.audience !== undefined ||
      updateScheduleDto.isPublic !== undefined;
    const resolvedAudience = shouldUpdateAudience
      ? this.resolveAudienceForUpdate(existingAudience, updateScheduleDto)
      : existingAudience;

    if (shouldUpdateAudience && actor?.role) {
      this.assertAudienceAllowed(actor.role, resolvedAudience);
    }

    const hasChanges =
      updateScheduleDto.title !== existingSchedule.title;

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
    } = updateScheduleDto;
    const sectorId =
      resolvedAudience === ContentAudience.SECTOR
        ? _sectorId ?? existingSchedule.sectorId ?? undefined
        : undefined;
    const existingUnitIds =
      existingSchedule.scheduleUnits?.length
        ? existingSchedule.scheduleUnits.map((unit) => unit.unitId)
        : this.normalizeUnitIds(undefined, existingSchedule.unitId ?? undefined);
    const unitIdsPayload =
      _unitIds !== undefined
        ? _unitIds ?? []
        : _unitId !== undefined
          ? this.normalizeUnitIds(undefined, _unitId)
          : undefined;
    const sectorChanged =
      resolvedAudience === ContentAudience.SECTOR &&
      sectorId &&
      sectorId !== existingSchedule.sectorId;
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
      throw new ForbiddenException('Setor obrigatorio para documentos de setor.');
    }

    await this.assertUnitsAllowed(sectorId, nextUnitIds);

    const updateData: Prisma.UploadedScheduleUpdateInput = {
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
      updateData.scheduleUnits = {
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

    const updated = await this.prisma.uploadedSchedule.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        sector: true,
        scheduleUnits: {
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
          EntityType.SCHEDULE,
          id,
        );
        const recipients = favoritedBy.filter((uid) => uid !== actor.id);

        if (recipients.length > 0) {
          await this.notificationsService.createBulk(recipients, {
            type: NotificationType.FAVORITE_UPDATED,
            entityType: EntityType.SCHEDULE,
            entityId: id,
            title: 'Documento Favoritado Atualizado',
            message: `Documento "${updated.title}" foi atualizado`,
            actionUrl: `/?highlight=document-${id}`,
            metadata: { scheduleTitle: updated.title, editorId: actor.id },
          });

          this.notificationsGateway.emitToUsers(recipients, 'notification', {
            type: 'FAVORITE_UPDATED',
            entityType: 'SCHEDULE',
            entityId: id,
            title: 'Documento Favoritado Atualizado',
            message: `Documento "${updated.title}" foi atualizado`,
          });
        }
      } catch (error) {
        console.error('Failed to notify favorites:', error);
      }
    }

    return updated;
  }

  async remove(id: string, actor?: ScheduleActor, adminMessage?: string) {
    const existingSchedule = await this.findOne(id);
    this.assertCanMutate(existingSchedule, actor);

    const deleted = await this.prisma.uploadedSchedule.update({
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
          existingSchedule.companyId,
          existingSchedule.sectorId,
          existingSchedule.audience,
          actor.id,
        );

        const message = adminMessage || `Documento "${existingSchedule.title}" foi removido por um administrador`;

        if (recipients.length > 0) {
          await this.notificationsService.createBulk(recipients, {
            type: NotificationType.CONTENT_DELETED,
            entityType: EntityType.SCHEDULE,
            entityId: id,
            title: 'Documento Removido',
            message,
            actionUrl: undefined,
            metadata: {
              scheduleTitle: existingSchedule.title,
              deletedBy: actor.id,
              adminMessage,
            },
          });

          this.notificationsGateway.emitToUsers(recipients, 'notification', {
            type: 'CONTENT_DELETED',
            entityType: 'SCHEDULE',
            entityId: id,
            title: 'Documento Removido',
            message,
          });
        }

        // Notificar favoritos
        const favoritedBy = await this.notificationsService.getUsersWhoFavorited(EntityType.SCHEDULE, id);
        const favoriteRecipients = favoritedBy.filter((uid) => uid !== actor.id && !recipients.includes(uid));

        if (favoriteRecipients.length > 0) {
          await this.notificationsService.createBulk(favoriteRecipients, {
            type: NotificationType.FAVORITE_DELETED,
            entityType: EntityType.SCHEDULE,
            entityId: id,
            title: 'Documento Favoritado Removido',
            message,
            actionUrl: undefined,
            metadata: { scheduleTitle: existingSchedule.title, adminMessage },
          });

          this.notificationsGateway.emitToUsers(favoriteRecipients, 'notification', {
            type: 'FAVORITE_DELETED',
            entityType: 'SCHEDULE',
            entityId: id,
            title: 'Documento Favoritado Removido',
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
    const schedule = await this.prisma.uploadedSchedule.findUnique({
      where: { id },
      include: {
        category: true,
        sector: true,
        scheduleUnits: {
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

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    const restored = await this.prisma.uploadedSchedule.update({
      where: { id },
      data: {
        deletedAt: null,
        status: EntityStatus.ACTIVE,
      },
      include: {
        category: true,
        sector: true,
        scheduleUnits: {
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
          entityType: EntityType.SCHEDULE,
          entityId: restored.id,
          title: 'Documento Restaurado',
          message: `Documento "${restored.title}" foi restaurado e está disponível novamente`,
          actionUrl: `/?highlight=document-${restored.id}`,
          metadata: { scheduleTitle: restored.title },
        });

        this.notificationsGateway.emitToUsers(recipients, 'notification', {
          type: 'CONTENT_RESTORED',
          entityType: 'SCHEDULE',
          entityId: restored.id,
          title: 'Documento Restaurado',
          message: `Documento "${restored.title}" foi restaurado e está disponível novamente`,
          actionUrl: `/?highlight=document-${restored.id}`,
        });
      }
    } catch (error) {
      console.error('Failed to notify restoration:', error);
    }

    return restored;
  }

  async activate(id: string, actor?: ScheduleActor) {
    const schedule = await this.prisma.uploadedSchedule.findUnique({
      where: { id },
      include: {
        category: true,
        sector: true,
        scheduleUnits: {
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

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    // Verificar permissões
    if (actor) {
      this.assertCanMutate(schedule, actor);
    }

    const activated = await this.prisma.uploadedSchedule.update({
      where: { id },
      data: {
        status: EntityStatus.ACTIVE,
      },
      include: {
        category: true,
        sector: true,
        scheduleUnits: {
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
            entityType: EntityType.SCHEDULE,
            entityId: activated.id,
            title: 'Documento Ativado',
            message: `Documento "${activated.title}" foi ativado e está disponível novamente`,
            actionUrl: `/?highlight=document-${activated.id}`,
            metadata: { scheduleTitle: activated.title },
          });

          this.notificationsGateway.emitToUsers(recipients, 'notification', {
            type: 'CONTENT_ACTIVATED',
            entityType: 'SCHEDULE',
            entityId: activated.id,
            title: 'Documento Ativado',
            message: `Documento "${activated.title}" foi ativado e está disponível novamente`,
            actionUrl: `/?highlight=document-${activated.id}`,
          });
        }
      } catch (error) {
        console.error('Failed to notify activation:', error);
      }
    }

    return activated;
  }

  async deactivate(id: string, actor?: ScheduleActor) {
    const schedule = await this.prisma.uploadedSchedule.findUnique({
      where: { id },
      include: {
        category: true,
        sector: true,
        scheduleUnits: {
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

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }

    // Verificar permissões
    if (actor) {
      this.assertCanMutate(schedule, actor);
    }

    const deactivated = await this.prisma.uploadedSchedule.update({
      where: { id },
      data: {
        status: EntityStatus.INACTIVE,
      },
      include: {
        category: true,
        sector: true,
        scheduleUnits: {
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
            entityType: EntityType.SCHEDULE,
            entityId: deactivated.id,
            title: 'Documento Desativado',
            message: `Documento "${deactivated.title}" foi temporariamente desativado`,
            actionUrl: undefined,
            metadata: { scheduleTitle: deactivated.title },
          });

          this.notificationsGateway.emitToUsers(recipients, 'notification', {
            type: 'CONTENT_DEACTIVATED',
            entityType: 'SCHEDULE',
            entityId: deactivated.id,
            title: 'Documento Desativado',
            message: `Documento "${deactivated.title}" foi temporariamente desativado`,
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

  private assertCanMutate(
    schedule: { companyId: string },
    actor?: ScheduleActor,
  ) {
    if (!actor) return;

    if (actor.role === UserRole.SUPERADMIN) {
      return;
    }

    if (actor.role === UserRole.ADMIN) {
      if (actor.companyId && actor.companyId !== schedule.companyId) {
        throw new ForbiddenException('Empresa nao autorizada.');
      }
      return;
    }

    throw new ForbiddenException('Permissao insuficiente.');
  }

  private resolveAudienceFromExisting(schedule: {
    audience?: ContentAudience | null;
    isPublic: boolean;
    sectorId?: string | null;
  }) {
    if (schedule.isPublic) return ContentAudience.PUBLIC;
    if (schedule.audience) return schedule.audience;
    if (schedule.sectorId) return ContentAudience.SECTOR;
    return ContentAudience.COMPANY;
  }

  private resolveAudienceForUpdate(
    existing: ContentAudience,
    updateScheduleDto: UpdateScheduleDto,
  ) {
    if (updateScheduleDto.audience) return updateScheduleDto.audience;
    if (updateScheduleDto.isPublic !== undefined) {
      return updateScheduleDto.isPublic ? ContentAudience.PUBLIC : existing;
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
  }
}
