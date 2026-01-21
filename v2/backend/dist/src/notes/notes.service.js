"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const notifications_service_1 = require("../notifications/notifications.service");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
let NotesService = class NotesService {
    constructor(prisma, notificationsService, notificationsGateway) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.notificationsGateway = notificationsGateway;
    }
    async create(createNoteDto) {
        const { unitIds, unitId, ...data } = createNoteDto;
        const normalizedUnitIds = this.normalizeUnitIds(unitIds, unitId);
        await this.assertUnitsAllowed(data.sectorId, normalizedUnitIds);
        const note = await this.prisma.note.create({
            data: {
                ...data,
                unitId: normalizedUnitIds.length === 1 ? normalizedUnitIds[0] : null,
                noteUnits: normalizedUnitIds.length > 0
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
        try {
            const recipients = await this.notificationsService.getRecipientsByAudience(note.companyId, note.sectorId, note.audience, note.userId || undefined);
            if (recipients.length > 0) {
                await this.notificationsService.createBulk(recipients, {
                    type: client_1.NotificationType.CONTENT_CREATED,
                    entityType: client_1.EntityType.NOTE,
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
        }
        catch (error) {
            console.error('Failed to create notification:', error);
        }
        return note;
    }
    async findAll(companyId, filters) {
        const shouldFilterPublic = filters?.audience === client_1.ContentAudience.PUBLIC;
        const filterUnitIds = filters?.unitId !== undefined
            ? this.normalizeUnitIds(undefined, filters.unitId)
            : filters?.unitIds;
        const unitFilter = filterUnitIds !== undefined
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
                    { audience: client_1.ContentAudience.PUBLIC },
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
    async userHasSector(userId, sectorId) {
        const count = await this.prisma.userSector.count({
            where: {
                userId,
                sectorId,
            },
        });
        return count > 0;
    }
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Note with ID ${id} not found`);
        }
        return note;
    }
    async update(id, updateNoteDto, actor) {
        const existingNote = await this.findOne(id);
        this.assertCanMutate(existingNote, actor);
        const existingAudience = this.resolveAudienceFromExisting(existingNote);
        const shouldUpdateAudience = updateNoteDto.audience !== undefined || updateNoteDto.isPublic !== undefined;
        const resolvedAudience = shouldUpdateAudience
            ? this.resolveAudienceForUpdate(existingAudience, updateNoteDto)
            : existingAudience;
        if (shouldUpdateAudience && actor?.role) {
            this.assertAudienceAllowed(actor.role, resolvedAudience);
        }
        const hasChanges = updateNoteDto.title !== existingNote.title ||
            updateNoteDto.content !== existingNote.content;
        const { companyId, userId, sectorId: _sectorId, unitId: _unitId, unitIds: _unitIds, audience, isPublic, ...rest } = updateNoteDto;
        const sectorId = resolvedAudience === client_1.ContentAudience.SECTOR
            ? _sectorId ?? existingNote.sectorId ?? undefined
            : undefined;
        const existingUnitIds = existingNote.noteUnits?.length
            ? existingNote.noteUnits.map((unit) => unit.unitId)
            : this.normalizeUnitIds(undefined, existingNote.unitId ?? undefined);
        const unitIdsPayload = _unitIds !== undefined
            ? _unitIds ?? []
            : _unitId !== undefined
                ? this.normalizeUnitIds(undefined, _unitId)
                : undefined;
        const sectorChanged = resolvedAudience === client_1.ContentAudience.SECTOR &&
            sectorId &&
            sectorId !== existingNote.sectorId;
        let nextUnitIds = unitIdsPayload !== undefined
            ? this.normalizeUnitIds(unitIdsPayload, undefined)
            : sectorChanged
                ? []
                : existingUnitIds;
        if (resolvedAudience !== client_1.ContentAudience.SECTOR) {
            nextUnitIds = [];
        }
        const unitId = resolvedAudience === client_1.ContentAudience.SECTOR && nextUnitIds.length === 1
            ? nextUnitIds[0]
            : null;
        if (resolvedAudience === client_1.ContentAudience.SECTOR && !sectorId) {
            throw new common_1.ForbiddenException('Setor obrigatorio para notas de setor.');
        }
        await this.assertUnitsAllowed(sectorId, nextUnitIds);
        const updateData = {
            ...rest,
            sector: resolvedAudience === client_1.ContentAudience.SECTOR
                ? { connect: { id: sectorId } }
                : { disconnect: true },
            unit: resolvedAudience === client_1.ContentAudience.SECTOR && unitId
                ? { connect: { id: unitId } }
                : { disconnect: true },
        };
        const shouldUpdateUnits = resolvedAudience !== client_1.ContentAudience.SECTOR || unitIdsPayload !== undefined;
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
            updateData.isPublic = resolvedAudience === client_1.ContentAudience.PUBLIC;
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
        if (hasChanges && actor?.id) {
            try {
                const favoritedBy = await this.notificationsService.getUsersWhoFavorited(client_1.EntityType.NOTE, id);
                const recipients = favoritedBy.filter((uid) => uid !== actor.id);
                if (recipients.length > 0) {
                    await this.notificationsService.createBulk(recipients, {
                        type: client_1.NotificationType.FAVORITE_UPDATED,
                        entityType: client_1.EntityType.NOTE,
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
            }
            catch (error) {
                console.error('Failed to notify favorites:', error);
            }
        }
        return updated;
    }
    async remove(id, actor, adminMessage) {
        const existingNote = await this.findOne(id);
        this.assertCanMutate(existingNote, actor);
        const deleted = await this.prisma.note.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: client_1.EntityStatus.INACTIVE,
            },
        });
        if (actor?.role && ['ADMIN', 'SUPERADMIN'].includes(actor.role)) {
            try {
                const recipients = await this.notificationsService.getRecipientsByAudience(existingNote.companyId, existingNote.sectorId, existingNote.audience, actor.id);
                const message = adminMessage || `Nota "${existingNote.title}" foi removida por um administrador`;
                if (recipients.length > 0) {
                    await this.notificationsService.createBulk(recipients, {
                        type: client_1.NotificationType.CONTENT_DELETED,
                        entityType: client_1.EntityType.NOTE,
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
                const favoritedBy = await this.notificationsService.getUsersWhoFavorited(client_1.EntityType.NOTE, id);
                const favoriteRecipients = favoritedBy.filter((uid) => uid !== actor.id && !recipients.includes(uid));
                if (favoriteRecipients.length > 0) {
                    await this.notificationsService.createBulk(favoriteRecipients, {
                        type: client_1.NotificationType.FAVORITE_DELETED,
                        entityType: client_1.EntityType.NOTE,
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
            }
            catch (error) {
                console.error('Failed to notify deletion:', error);
            }
        }
        return deleted;
    }
    async restore(id) {
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
            throw new common_1.NotFoundException(`Note with ID ${id} not found`);
        }
        const restored = await this.prisma.note.update({
            where: { id },
            data: {
                deletedAt: null,
                status: client_1.EntityStatus.ACTIVE,
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
        try {
            const recipients = await this.notificationsService.getRecipientsByAudience(restored.companyId, restored.sectorId, restored.audience, undefined);
            if (recipients.length > 0) {
                await this.notificationsService.createBulk(recipients, {
                    type: client_1.NotificationType.CONTENT_RESTORED,
                    entityType: client_1.EntityType.NOTE,
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
        }
        catch (error) {
            console.error('Failed to notify restoration:', error);
        }
        return restored;
    }
    async activate(id, actor) {
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
            throw new common_1.NotFoundException(`Note with ID ${id} not found`);
        }
        if (actor) {
            this.assertCanMutate(note, actor);
        }
        const activated = await this.prisma.note.update({
            where: { id },
            data: {
                status: client_1.EntityStatus.ACTIVE,
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
        if (actor?.role && ['ADMIN', 'SUPERADMIN'].includes(actor.role)) {
            try {
                const recipients = await this.notificationsService.getRecipientsByAudience(activated.companyId, activated.sectorId, activated.audience, actor.id);
                if (recipients.length > 0) {
                    await this.notificationsService.createBulk(recipients, {
                        type: client_1.NotificationType.CONTENT_ACTIVATED,
                        entityType: client_1.EntityType.NOTE,
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
            }
            catch (error) {
                console.error('Failed to notify activation:', error);
            }
        }
        return activated;
    }
    async deactivate(id, actor) {
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
            throw new common_1.NotFoundException(`Note with ID ${id} not found`);
        }
        if (actor) {
            this.assertCanMutate(note, actor);
        }
        const deactivated = await this.prisma.note.update({
            where: { id },
            data: {
                status: client_1.EntityStatus.INACTIVE,
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
        if (actor?.role && ['ADMIN', 'SUPERADMIN'].includes(actor.role)) {
            try {
                const recipients = await this.notificationsService.getRecipientsByAudience(deactivated.companyId, deactivated.sectorId, deactivated.audience, actor.id);
                if (recipients.length > 0) {
                    await this.notificationsService.createBulk(recipients, {
                        type: client_1.NotificationType.CONTENT_DEACTIVATED,
                        entityType: client_1.EntityType.NOTE,
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
            }
            catch (error) {
                console.error('Failed to notify deactivation:', error);
            }
        }
        return deactivated;
    }
    normalizeUnitIds(unitIds, unitId) {
        const combined = [
            ...(unitIds ?? []),
            ...(unitId ? [unitId] : []),
        ].filter(Boolean);
        return Array.from(new Set(combined));
    }
    async assertUnitsAllowed(sectorId, unitIds) {
        const normalizedUnitIds = this.normalizeUnitIds(unitIds, undefined);
        if (normalizedUnitIds.length === 0)
            return;
        if (!sectorId) {
            throw new common_1.ForbiddenException('Unidade requer setor.');
        }
        const relationCount = await this.prisma.sectorUnit.count({
            where: {
                sectorId,
                unitId: { in: normalizedUnitIds },
            },
        });
        if (relationCount !== normalizedUnitIds.length) {
            throw new common_1.ForbiddenException('Unidade nao pertence ao setor.');
        }
    }
    assertCanMutate(note, actor) {
        if (!actor)
            return;
        if (actor.role === client_1.UserRole.SUPERADMIN) {
            return;
        }
        if (actor.role === client_1.UserRole.ADMIN) {
            if (actor.companyId && actor.companyId !== note.companyId) {
                throw new common_1.ForbiddenException('Empresa nao autorizada.');
            }
            return;
        }
        if (actor.role === client_1.UserRole.COLLABORATOR) {
            if (!note.userId || note.userId !== actor.id) {
                throw new common_1.ForbiddenException('Nota nao autorizada.');
            }
            return;
        }
        throw new common_1.ForbiddenException('Permissao insuficiente.');
    }
    resolveAudienceFromExisting(note) {
        if (note.isPublic)
            return client_1.ContentAudience.PUBLIC;
        if (note.audience)
            return note.audience;
        if (note.sectorId)
            return client_1.ContentAudience.SECTOR;
        return client_1.ContentAudience.COMPANY;
    }
    resolveAudienceForUpdate(existing, updateNoteDto) {
        if (updateNoteDto.audience)
            return updateNoteDto.audience;
        if (updateNoteDto.isPublic !== undefined) {
            return updateNoteDto.isPublic ? client_1.ContentAudience.PUBLIC : existing;
        }
        return existing;
    }
    assertAudienceAllowed(role, audience) {
        if (role === client_1.UserRole.SUPERADMIN)
            return;
        if (role === client_1.UserRole.ADMIN) {
            if (audience !== client_1.ContentAudience.COMPANY &&
                audience !== client_1.ContentAudience.SECTOR) {
                throw new common_1.ForbiddenException('Visibilidade nao autorizada.');
            }
            return;
        }
        if (role === client_1.UserRole.COLLABORATOR) {
            if (audience !== client_1.ContentAudience.PRIVATE) {
                throw new common_1.ForbiddenException('Visibilidade nao autorizada.');
            }
            return;
        }
    }
};
exports.NotesService = NotesService;
exports.NotesService = NotesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        notifications_gateway_1.NotificationsGateway])
], NotesService);
//# sourceMappingURL=notes.service.js.map