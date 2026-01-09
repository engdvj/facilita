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
let UploadedSchedulesService = class UploadedSchedulesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createScheduleDto) {
        return this.prisma.uploadedSchedule.create({
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
    }
    async findAll(companyId, filters) {
        const shouldFilterPublic = filters?.audience === client_1.ContentAudience.PUBLIC;
        const where = {
            status: client_1.EntityStatus.ACTIVE,
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
                tags: {
                    include: {
                        tag: true,
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
                tags: {
                    include: {
                        tag: true,
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
        return this.prisma.uploadedSchedule.update({
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
    }
    async remove(id, actor) {
        const existingSchedule = await this.findOne(id);
        this.assertCanMutate(existingSchedule, actor);
        return this.prisma.uploadedSchedule.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: client_1.EntityStatus.INACTIVE,
            },
        });
    }
    async restore(id) {
        const schedule = await this.prisma.uploadedSchedule.findUnique({
            where: { id },
        });
        if (!schedule) {
            throw new common_1.NotFoundException(`Schedule with ID ${id} not found`);
        }
        return this.prisma.uploadedSchedule.update({
            where: { id },
            data: {
                deletedAt: null,
                status: client_1.EntityStatus.ACTIVE,
            },
        });
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UploadedSchedulesService);
//# sourceMappingURL=uploaded-schedules.service.js.map