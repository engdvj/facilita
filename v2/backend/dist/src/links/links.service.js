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
exports.LinksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const notifications_service_1 = require("../notifications/notifications.service");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
let LinksService = class LinksService {
    constructor(prisma, notificationsService, notificationsGateway) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.notificationsGateway = notificationsGateway;
    }
    async create(createLinkDto) {
        console.log('[LinksService.create] Criando link com dados:', createLinkDto);
        const { unitIds, unitId, ...data } = createLinkDto;
        const normalizedUnitIds = this.normalizeUnitIds(unitIds, unitId);
        await this.assertUnitsAllowed(data.sectorId, normalizedUnitIds);
        const link = await this.prisma.link.create({
            data: {
                ...data,
                unitId: normalizedUnitIds.length === 1 ? normalizedUnitIds[0] : null,
                linkUnits: normalizedUnitIds.length > 0
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
            },
        });
        console.log('[LinksService.create] Link criado:', {
            id: link.id,
            title: link.title,
            companyId: link.companyId,
            audience: link.audience,
        });
        try {
            const recipients = await this.notificationsService.getRecipientsByAudience(link.companyId, link.sectorId, link.audience, link.userId || undefined);
            if (recipients.length > 0) {
                await this.notificationsService.createBulk(recipients, {
                    type: client_1.NotificationType.CONTENT_CREATED,
                    entityType: client_1.EntityType.LINK,
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
        }
        catch (error) {
            console.error('Failed to create notification:', error);
        }
        return link;
    }
    async findAll(companyId, filters) {
        const shouldFilterPublic = filters?.audience === client_1.ContentAudience.PUBLIC;
        const sectorFilter = filters?.sectorIds
            ? { sectorId: { in: filters.sectorIds } }
            : filters?.sectorId
                ? { sectorId: filters.sectorId }
                : {};
        const filterUnitIds = filters?.unitId !== undefined
            ? this.normalizeUnitIds(undefined, filters.unitId)
            : filters?.unitIds;
        const unitFilter = filterUnitIds !== undefined
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
                    { audience: client_1.ContentAudience.PUBLIC },
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
            include: {
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
            },
            orderBy: [
                { order: 'asc' },
                { createdAt: 'desc' },
            ],
        });
        console.log('LinksService.findAll - links encontrados:', links.length);
        return links;
    }
    async findAllByUser(userId, companyId) {
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
        const sectorIds = user.userSectors.map((us) => us.sectorId);
        const unitIds = Array.from(new Set(user.userSectors.flatMap((userSector) => userSector.sector?.sectorUnits?.map((unit) => unit.unitId) || [])));
        return this.findAll(companyId, {
            sectorIds: sectorIds.length > 0 ? sectorIds : undefined,
            unitIds,
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
        const link = await this.prisma.link.findUnique({
            where: { id },
            include: {
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
            throw new common_1.NotFoundException(`Link with ID ${id} not found`);
        }
        return link;
    }
    async update(id, updateLinkDto, actor) {
        const existingLink = await this.findOne(id);
        this.assertCanMutate(existingLink, actor);
        const existingAudience = this.resolveAudienceFromExisting(existingLink);
        const shouldUpdateAudience = updateLinkDto.audience !== undefined || updateLinkDto.isPublic !== undefined;
        const resolvedAudience = shouldUpdateAudience
            ? this.resolveAudienceForUpdate(existingAudience, updateLinkDto)
            : existingAudience;
        if (shouldUpdateAudience && actor?.role) {
            this.assertAudienceAllowed(actor.role, resolvedAudience);
        }
        const hasChanges = updateLinkDto.title !== existingLink.title ||
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
        const { companyId, userId, sectorId: _sectorId, unitId: _unitId, unitIds: _unitIds, audience, isPublic, ...rest } = updateLinkDto;
        const sectorId = resolvedAudience === client_1.ContentAudience.SECTOR
            ? _sectorId ?? existingLink.sectorId ?? undefined
            : undefined;
        const existingUnitIds = existingLink.linkUnits?.length
            ? existingLink.linkUnits.map((unit) => unit.unitId)
            : this.normalizeUnitIds(undefined, existingLink.unitId ?? undefined);
        const unitIdsPayload = _unitIds !== undefined
            ? _unitIds ?? []
            : _unitId !== undefined
                ? this.normalizeUnitIds(undefined, _unitId)
                : undefined;
        const sectorChanged = resolvedAudience === client_1.ContentAudience.SECTOR &&
            sectorId &&
            sectorId !== existingLink.sectorId;
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
            throw new common_1.ForbiddenException('Setor obrigatorio para links de setor.');
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
            updateData.linkUnits = {
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
        const updated = await this.prisma.link.update({
            where: { id },
            data: updateData,
            include: {
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
            },
        });
        if (hasChanges && actor?.id) {
            try {
                const favoritedBy = await this.notificationsService.getUsersWhoFavorited(client_1.EntityType.LINK, id);
                const recipients = favoritedBy.filter((uid) => uid !== actor.id);
                if (recipients.length > 0) {
                    await this.notificationsService.createBulk(recipients, {
                        type: client_1.NotificationType.FAVORITE_UPDATED,
                        entityType: client_1.EntityType.LINK,
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
            }
            catch (error) {
                console.error('Failed to notify favorites:', error);
            }
        }
        return updated;
    }
    async remove(id, actor, adminMessage) {
        const existingLink = await this.findOne(id);
        this.assertCanMutate(existingLink, actor);
        const deleted = await this.prisma.link.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: client_1.EntityStatus.INACTIVE,
            },
        });
        if (actor?.role && ['ADMIN', 'SUPERADMIN'].includes(actor.role)) {
            try {
                const recipients = await this.notificationsService.getRecipientsByAudience(existingLink.companyId, existingLink.sectorId, existingLink.audience, actor.id);
                const message = adminMessage || `Link "${existingLink.title}" foi removido por um administrador`;
                if (recipients.length > 0) {
                    await this.notificationsService.createBulk(recipients, {
                        type: client_1.NotificationType.CONTENT_DELETED,
                        entityType: client_1.EntityType.LINK,
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
                const favoritedBy = await this.notificationsService.getUsersWhoFavorited(client_1.EntityType.LINK, id);
                const favoriteRecipients = favoritedBy.filter((uid) => uid !== actor.id && !recipients.includes(uid));
                if (favoriteRecipients.length > 0) {
                    await this.notificationsService.createBulk(favoriteRecipients, {
                        type: client_1.NotificationType.FAVORITE_DELETED,
                        entityType: client_1.EntityType.LINK,
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
            }
            catch (error) {
                console.error('Failed to notify deletion:', error);
            }
        }
        return deleted;
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
    assertCanMutate(link, actor) {
        if (!actor)
            return;
        if (actor.role === client_1.UserRole.SUPERADMIN) {
            return;
        }
        if (actor.role === client_1.UserRole.ADMIN) {
            if (actor.companyId && actor.companyId !== link.companyId) {
                throw new common_1.ForbiddenException('Empresa nao autorizada.');
            }
            return;
        }
        if (actor.role === client_1.UserRole.COLLABORATOR) {
            if (!link.userId || link.userId !== actor.id) {
                throw new common_1.ForbiddenException('Link nao autorizado.');
            }
            return;
        }
        throw new common_1.ForbiddenException('Permissao insuficiente.');
    }
    resolveAudienceFromExisting(link) {
        if (link.isPublic)
            return client_1.ContentAudience.PUBLIC;
        if (link.audience)
            return link.audience;
        if (link.sectorId)
            return client_1.ContentAudience.SECTOR;
        return client_1.ContentAudience.COMPANY;
    }
    resolveAudienceForUpdate(existing, updateLinkDto) {
        if (updateLinkDto.audience)
            return updateLinkDto.audience;
        if (updateLinkDto.isPublic !== undefined) {
            return updateLinkDto.isPublic ? client_1.ContentAudience.PUBLIC : existing;
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
    async restore(id) {
        const link = await this.prisma.link.findUnique({
            where: { id },
            include: {
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
            },
        });
        if (!link) {
            throw new common_1.NotFoundException(`Link with ID ${id} not found`);
        }
        const restored = await this.prisma.link.update({
            where: { id },
            data: {
                deletedAt: null,
                status: client_1.EntityStatus.ACTIVE,
            },
            include: {
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
            },
        });
        try {
            const recipients = await this.notificationsService.getRecipientsByAudience(restored.companyId, restored.sectorId, restored.audience, undefined);
            if (recipients.length > 0) {
                await this.notificationsService.createBulk(recipients, {
                    type: client_1.NotificationType.CONTENT_RESTORED,
                    entityType: client_1.EntityType.LINK,
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
        }
        catch (error) {
            console.error('Failed to notify restoration:', error);
        }
        return restored;
    }
    async activate(id, actor) {
        const link = await this.prisma.link.findUnique({
            where: { id },
            include: {
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
            },
        });
        if (!link) {
            throw new common_1.NotFoundException(`Link with ID ${id} not found`);
        }
        if (actor) {
            this.assertCanMutate(link, actor);
        }
        const activated = await this.prisma.link.update({
            where: { id },
            data: {
                status: client_1.EntityStatus.ACTIVE,
            },
            include: {
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
            },
        });
        if (actor?.role && ['ADMIN', 'SUPERADMIN'].includes(actor.role)) {
            try {
                const recipients = await this.notificationsService.getRecipientsByAudience(activated.companyId, activated.sectorId, activated.audience, actor.id);
                if (recipients.length > 0) {
                    await this.notificationsService.createBulk(recipients, {
                        type: client_1.NotificationType.CONTENT_ACTIVATED,
                        entityType: client_1.EntityType.LINK,
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
            }
            catch (error) {
                console.error('Failed to notify activation:', error);
            }
        }
        return activated;
    }
    async deactivate(id, actor) {
        const link = await this.prisma.link.findUnique({
            where: { id },
            include: {
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
            },
        });
        if (!link) {
            throw new common_1.NotFoundException(`Link with ID ${id} not found`);
        }
        if (actor) {
            this.assertCanMutate(link, actor);
        }
        const deactivated = await this.prisma.link.update({
            where: { id },
            data: {
                status: client_1.EntityStatus.INACTIVE,
            },
            include: {
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
            },
        });
        if (actor?.role && ['ADMIN', 'SUPERADMIN'].includes(actor.role)) {
            try {
                const recipients = await this.notificationsService.getRecipientsByAudience(deactivated.companyId, deactivated.sectorId, deactivated.audience, actor.id);
                if (recipients.length > 0) {
                    await this.notificationsService.createBulk(recipients, {
                        type: client_1.NotificationType.CONTENT_DEACTIVATED,
                        entityType: client_1.EntityType.LINK,
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
            }
            catch (error) {
                console.error('Failed to notify deactivation:', error);
            }
        }
        return deactivated;
    }
};
exports.LinksService = LinksService;
exports.LinksService = LinksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        notifications_gateway_1.NotificationsGateway])
], LinksService);
//# sourceMappingURL=links.service.js.map