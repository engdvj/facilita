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
exports.FavoritesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let FavoritesService = class FavoritesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    assertEntityTypeSupported(entityType) {
        if (entityType !== client_1.EntityType.LINK &&
            entityType !== client_1.EntityType.SCHEDULE &&
            entityType !== client_1.EntityType.NOTE) {
            throw new common_1.BadRequestException('Unsupported entity type for favorites');
        }
    }
    async canAccessEntity(userId, entityType, entityId) {
        if (entityType === client_1.EntityType.LINK) {
            const link = await this.prisma.link.findUnique({
                where: { id: entityId },
                include: {
                    owner: {
                        select: { role: true },
                    },
                },
            });
            if (!link || link.deletedAt)
                return false;
            if (link.ownerId === userId)
                return true;
            if (link.visibility === 'PUBLIC' && link.owner.role === 'SUPERADMIN')
                return true;
            const shared = await this.prisma.share.findFirst({
                where: {
                    recipientId: userId,
                    linkId: entityId,
                    revokedAt: null,
                    removedAt: null,
                },
            });
            return Boolean(shared);
        }
        if (entityType === client_1.EntityType.SCHEDULE) {
            const schedule = await this.prisma.uploadedSchedule.findUnique({
                where: { id: entityId },
                include: {
                    owner: {
                        select: { role: true },
                    },
                },
            });
            if (!schedule || schedule.deletedAt)
                return false;
            if (schedule.ownerId === userId)
                return true;
            if (schedule.visibility === 'PUBLIC' && schedule.owner.role === 'SUPERADMIN')
                return true;
            const shared = await this.prisma.share.findFirst({
                where: {
                    recipientId: userId,
                    scheduleId: entityId,
                    revokedAt: null,
                    removedAt: null,
                },
            });
            return Boolean(shared);
        }
        if (entityType === client_1.EntityType.NOTE) {
            const note = await this.prisma.note.findUnique({
                where: { id: entityId },
                include: {
                    owner: {
                        select: { role: true },
                    },
                },
            });
            if (!note || note.deletedAt)
                return false;
            if (note.ownerId === userId)
                return true;
            if (note.visibility === 'PUBLIC' && note.owner.role === 'SUPERADMIN')
                return true;
            const shared = await this.prisma.share.findFirst({
                where: {
                    recipientId: userId,
                    noteId: entityId,
                    revokedAt: null,
                    removedAt: null,
                },
            });
            return Boolean(shared);
        }
        return false;
    }
    async create(userId, dto) {
        this.assertEntityTypeSupported(dto.entityType);
        const idsProvided = [dto.linkId, dto.scheduleId, dto.noteId].filter(Boolean).length;
        if (idsProvided !== 1) {
            throw new common_1.BadRequestException('Provide exactly one ID (linkId, scheduleId or noteId)');
        }
        if (dto.entityType === client_1.EntityType.LINK && !dto.linkId) {
            throw new common_1.BadRequestException('linkId is required when entityType = LINK');
        }
        if (dto.entityType === client_1.EntityType.SCHEDULE && !dto.scheduleId) {
            throw new common_1.BadRequestException('scheduleId is required when entityType = SCHEDULE');
        }
        if (dto.entityType === client_1.EntityType.NOTE && !dto.noteId) {
            throw new common_1.BadRequestException('noteId is required when entityType = NOTE');
        }
        const entityId = dto.linkId || dto.scheduleId || dto.noteId;
        if (!entityId) {
            throw new common_1.BadRequestException('Entity ID is required');
        }
        const canAccess = await this.canAccessEntity(userId, dto.entityType, entityId);
        if (!canAccess) {
            throw new common_1.NotFoundException('Content not found or not accessible');
        }
        const existingFavorite = await this.prisma.favorite.findFirst({
            where: {
                userId,
                entityType: dto.entityType,
                linkId: dto.linkId ?? null,
                scheduleId: dto.scheduleId ?? null,
                noteId: dto.noteId ?? null,
            },
        });
        if (existingFavorite) {
            throw new common_1.ConflictException('This item is already in favorites');
        }
        return this.prisma.favorite.create({
            data: {
                userId,
                entityType: dto.entityType,
                linkId: dto.linkId,
                scheduleId: dto.scheduleId,
                noteId: dto.noteId,
            },
            include: {
                link: {
                    include: {
                        category: true,
                        owner: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                schedule: {
                    include: {
                        category: true,
                        owner: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                note: {
                    include: {
                        category: true,
                        owner: {
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
    }
    async findAllByUser(userId) {
        return this.prisma.favorite.findMany({
            where: { userId },
            include: {
                link: {
                    where: { deletedAt: null },
                    include: {
                        category: true,
                        owner: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                schedule: {
                    where: { deletedAt: null },
                    include: {
                        category: true,
                        owner: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                note: {
                    where: { deletedAt: null },
                    include: {
                        category: true,
                        owner: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByUserAndType(userId, entityType) {
        this.assertEntityTypeSupported(entityType);
        return this.prisma.favorite.findMany({
            where: { userId, entityType },
            include: {
                link: {
                    where: { deletedAt: null },
                    include: { category: true, owner: true },
                },
                schedule: {
                    where: { deletedAt: null },
                    include: { category: true, owner: true },
                },
                note: {
                    where: { deletedAt: null },
                    include: { category: true, owner: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async isFavorited(userId, entityType, entityId) {
        this.assertEntityTypeSupported(entityType);
        const where = {
            userId,
            entityType,
        };
        if (entityType === client_1.EntityType.LINK) {
            where.linkId = entityId;
        }
        else if (entityType === client_1.EntityType.SCHEDULE) {
            where.scheduleId = entityId;
        }
        else if (entityType === client_1.EntityType.NOTE) {
            where.noteId = entityId;
        }
        const favorite = await this.prisma.favorite.findFirst({ where });
        return !!favorite;
    }
    async remove(id, userId) {
        const favorite = await this.prisma.favorite.findUnique({ where: { id } });
        if (!favorite) {
            throw new common_1.NotFoundException('Favorite not found');
        }
        if (favorite.userId !== userId) {
            throw new common_1.BadRequestException('You cannot remove favorites from other users');
        }
        await this.prisma.favorite.delete({ where: { id } });
        return { message: 'Favorite removed successfully' };
    }
    async removeByEntity(userId, entityType, entityId) {
        this.assertEntityTypeSupported(entityType);
        const where = { userId, entityType };
        if (entityType === client_1.EntityType.LINK) {
            where.linkId = entityId;
        }
        else if (entityType === client_1.EntityType.SCHEDULE) {
            where.scheduleId = entityId;
        }
        else if (entityType === client_1.EntityType.NOTE) {
            where.noteId = entityId;
        }
        const favorite = await this.prisma.favorite.findFirst({ where });
        if (!favorite) {
            throw new common_1.NotFoundException('Favorite not found');
        }
        await this.prisma.favorite.delete({ where: { id: favorite.id } });
        return { message: 'Favorite removed successfully' };
    }
    async countByUser(userId) {
        return this.prisma.favorite.count({ where: { userId } });
    }
    async countByEntity(entityType, entityId) {
        this.assertEntityTypeSupported(entityType);
        const where = { entityType };
        if (entityType === client_1.EntityType.LINK) {
            where.linkId = entityId;
        }
        else if (entityType === client_1.EntityType.SCHEDULE) {
            where.scheduleId = entityId;
        }
        else if (entityType === client_1.EntityType.NOTE) {
            where.noteId = entityId;
        }
        return this.prisma.favorite.count({ where });
    }
};
exports.FavoritesService = FavoritesService;
exports.FavoritesService = FavoritesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FavoritesService);
//# sourceMappingURL=favorites.service.js.map