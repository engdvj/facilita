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
exports.UploadedSchedulesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const notifications_service_1 = require("../notifications/notifications.service");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
let UploadedSchedulesService = class UploadedSchedulesService {
    constructor(prisma, notificationsService, notificationsGateway) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.notificationsGateway = notificationsGateway;
    }
    async create(createScheduleDto) {
        const schedule = await this.prisma.uploadedSchedule.create({
            data: createScheduleDto,
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
        try {
            const recipients = await this.notificationsService.getRecipientsByAudience(schedule.companyId, schedule.sectorId, schedule.audience, schedule.userId || undefined);
            if (recipients.length > 0) {
                await this.notificationsService.createBulk(recipients, {
                    type: client_1.NotificationType.CONTENT_CREATED,
                    entityType: client_1.EntityType.SCHEDULE,
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
        }
        catch (error) {
            console.error('Failed to create notification:', error);
        }
        return schedule;
    }
    async findAll(companyId, filters) {
        const shouldFilterPublic = filters?.audience === client_1.ContentAudience.PUBLIC;
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
                    { audience: client_1.ContentAudience.PUBLIC },
                    { isPublic: true },
                ],
            }),
        };
        console.log('SchedulesService.findAll - where clause:', JSON.stringify(where, null, 2));
        const schedules = await this.prisma.uploadedSchedule.findMany({
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
        console.log('SchedulesService.findAll - schedules encontrados:', schedules.length);
        return schedules;
    }
    async findOne(id) {
        const schedule = await this.prisma.uploadedSchedule.findUnique({
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
        if (!schedule || schedule.deletedAt) {
            throw new common_1.NotFoundException(`Schedule with ID ${id} not found`);
        }
        return schedule;
    }
    async update(id, updateScheduleDto, actor) {
        const existingSchedule = await this.findOne(id);
        this.assertCanMutate(existingSchedule, actor);
        const existingAudience = this.resolveAudienceFromExisting(existingSchedule);
        const shouldUpdateAudience = updateScheduleDto.audience !== undefined ||
            updateScheduleDto.isPublic !== undefined;
        const resolvedAudience = shouldUpdateAudience
            ? this.resolveAudienceForUpdate(existingAudience, updateScheduleDto)
            : existingAudience;
        if (shouldUpdateAudience && actor?.role) {
            this.assertAudienceAllowed(actor.role, resolvedAudience);
        }
        const hasChanges = updateScheduleDto.title !== existingSchedule.title;
        const { companyId, userId, sectorId: _sectorId, audience, isPublic, ...rest } = updateScheduleDto;
        const sectorId = resolvedAudience === client_1.ContentAudience.SECTOR
            ? _sectorId ?? existingSchedule.sectorId ?? undefined
            : undefined;
        if (resolvedAudience === client_1.ContentAudience.SECTOR && !sectorId) {
            throw new common_1.ForbiddenException('Setor obrigatorio para documentos de setor.');
        }
        const updateData = {
            ...rest,
            sectorId,
        };
        if (shouldUpdateAudience) {
            updateData.audience = resolvedAudience;
            updateData.isPublic = resolvedAudience === client_1.ContentAudience.PUBLIC;
        }
        const updated = await this.prisma.uploadedSchedule.update({
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
        if (hasChanges && actor?.id) {
            try {
                const favoritedBy = await this.notificationsService.getUsersWhoFavorited(client_1.EntityType.SCHEDULE, id);
                const recipients = favoritedBy.filter((uid) => uid !== actor.id);
                if (recipients.length > 0) {
                    await this.notificationsService.createBulk(recipients, {
                        type: client_1.NotificationType.FAVORITE_UPDATED,
                        entityType: client_1.EntityType.SCHEDULE,
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
            }
            catch (error) {
                console.error('Failed to notify favorites:', error);
            }
        }
        return updated;
    }
    async remove(id, actor, adminMessage) {
        const existingSchedule = await this.findOne(id);
        this.assertCanMutate(existingSchedule, actor);
        const deleted = await this.prisma.uploadedSchedule.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: client_1.EntityStatus.INACTIVE,
            },
        });
        if (actor?.role && ['ADMIN', 'SUPERADMIN'].includes(actor.role)) {
            try {
                const recipients = await this.notificationsService.getRecipientsByAudience(existingSchedule.companyId, existingSchedule.sectorId, existingSchedule.audience, actor.id);
                const message = adminMessage || `Documento "${existingSchedule.title}" foi removido por um administrador`;
                if (recipients.length > 0) {
                    await this.notificationsService.createBulk(recipients, {
                        type: client_1.NotificationType.CONTENT_DELETED,
                        entityType: client_1.EntityType.SCHEDULE,
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
                const favoritedBy = await this.notificationsService.getUsersWhoFavorited(client_1.EntityType.SCHEDULE, id);
                const favoriteRecipients = favoritedBy.filter((uid) => uid !== actor.id && !recipients.includes(uid));
                if (favoriteRecipients.length > 0) {
                    await this.notificationsService.createBulk(favoriteRecipients, {
                        type: client_1.NotificationType.FAVORITE_DELETED,
                        entityType: client_1.EntityType.SCHEDULE,
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
            }
            catch (error) {
                console.error('Failed to notify deletion:', error);
            }
        }
        return deleted;
    }
    async restore(id) {
        const schedule = await this.prisma.uploadedSchedule.findUnique({
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
        if (!schedule) {
            throw new common_1.NotFoundException(`Schedule with ID ${id} not found`);
        }
        const restored = await this.prisma.uploadedSchedule.update({
            where: { id },
            data: {
                deletedAt: null,
                status: client_1.EntityStatus.ACTIVE,
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
        try {
            const recipients = await this.notificationsService.getRecipientsByAudience(restored.companyId, restored.sectorId, restored.audience, undefined);
            if (recipients.length > 0) {
                await this.notificationsService.createBulk(recipients, {
                    type: client_1.NotificationType.CONTENT_RESTORED,
                    entityType: client_1.EntityType.SCHEDULE,
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
        }
        catch (error) {
            console.error('Failed to notify restoration:', error);
        }
        return restored;
    }
    async activate(id, actor) {
        const schedule = await this.prisma.uploadedSchedule.findUnique({
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
        if (!schedule) {
            throw new common_1.NotFoundException(`Schedule with ID ${id} not found`);
        }
        if (actor) {
            this.assertCanMutate(schedule, actor);
        }
        const activated = await this.prisma.uploadedSchedule.update({
            where: { id },
            data: {
                status: client_1.EntityStatus.ACTIVE,
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
        if (actor?.role && ['ADMIN', 'SUPERADMIN'].includes(actor.role)) {
            try {
                const recipients = await this.notificationsService.getRecipientsByAudience(activated.companyId, activated.sectorId, activated.audience, actor.id);
                if (recipients.length > 0) {
                    await this.notificationsService.createBulk(recipients, {
                        type: client_1.NotificationType.CONTENT_ACTIVATED,
                        entityType: client_1.EntityType.SCHEDULE,
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
            }
            catch (error) {
                console.error('Failed to notify activation:', error);
            }
        }
        return activated;
    }
    async deactivate(id, actor) {
        const schedule = await this.prisma.uploadedSchedule.findUnique({
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
        if (!schedule) {
            throw new common_1.NotFoundException(`Schedule with ID ${id} not found`);
        }
        if (actor) {
            this.assertCanMutate(schedule, actor);
        }
        const deactivated = await this.prisma.uploadedSchedule.update({
            where: { id },
            data: {
                status: client_1.EntityStatus.INACTIVE,
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
        if (actor?.role && ['ADMIN', 'SUPERADMIN'].includes(actor.role)) {
            try {
                const recipients = await this.notificationsService.getRecipientsByAudience(deactivated.companyId, deactivated.sectorId, deactivated.audience, actor.id);
                if (recipients.length > 0) {
                    await this.notificationsService.createBulk(recipients, {
                        type: client_1.NotificationType.CONTENT_DEACTIVATED,
                        entityType: client_1.EntityType.SCHEDULE,
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
            }
            catch (error) {
                console.error('Failed to notify deactivation:', error);
            }
        }
        return deactivated;
    }
    assertCanMutate(schedule, actor) {
        if (!actor)
            return;
        if (actor.role === client_1.UserRole.SUPERADMIN) {
            return;
        }
        if (actor.role === client_1.UserRole.ADMIN) {
            if (actor.companyId && actor.companyId !== schedule.companyId) {
                throw new common_1.ForbiddenException('Empresa nao autorizada.');
            }
            return;
        }
        throw new common_1.ForbiddenException('Permissao insuficiente.');
    }
    resolveAudienceFromExisting(schedule) {
        if (schedule.isPublic)
            return client_1.ContentAudience.PUBLIC;
        if (schedule.audience)
            return schedule.audience;
        if (schedule.sectorId)
            return client_1.ContentAudience.SECTOR;
        return client_1.ContentAudience.COMPANY;
    }
    resolveAudienceForUpdate(existing, updateScheduleDto) {
        if (updateScheduleDto.audience)
            return updateScheduleDto.audience;
        if (updateScheduleDto.isPublic !== undefined) {
            return updateScheduleDto.isPublic ? client_1.ContentAudience.PUBLIC : existing;
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
    }
};
exports.UploadedSchedulesService = UploadedSchedulesService;
exports.UploadedSchedulesService = UploadedSchedulesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        notifications_gateway_1.NotificationsGateway])
], UploadedSchedulesService);
//# sourceMappingURL=uploaded-schedules.service.js.map