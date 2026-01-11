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
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let FavoritesService = class FavoritesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const idsProvided = [dto.linkId, dto.scheduleId, dto.noteId].filter(Boolean).length;
        if (idsProvided !== 1) {
            throw new common_1.BadRequestException('Você deve fornecer exatamente um ID (linkId, scheduleId ou noteId)');
        }
        if (dto.entityType === client_1.EntityType.LINK && !dto.linkId) {
            throw new common_1.BadRequestException('linkId é obrigatório quando entityType = LINK');
        }
        if (dto.entityType === client_1.EntityType.SCHEDULE && !dto.scheduleId) {
            throw new common_1.BadRequestException('scheduleId é obrigatório quando entityType = SCHEDULE');
        }
        if (dto.entityType === client_1.EntityType.NOTE && !dto.noteId) {
            throw new common_1.BadRequestException('noteId é obrigatório quando entityType = NOTE');
        }
        if (dto.linkId) {
            const link = await this.prisma.link.findUnique({
                where: { id: dto.linkId },
            });
            if (!link) {
                throw new common_1.NotFoundException('Link não encontrado');
            }
        }
        if (dto.scheduleId) {
            const schedule = await this.prisma.uploadedSchedule.findUnique({
                where: { id: dto.scheduleId },
            });
            if (!schedule) {
                throw new common_1.NotFoundException('Agenda não encontrada');
            }
        }
        if (dto.noteId) {
            const note = await this.prisma.note.findUnique({
                where: { id: dto.noteId },
            });
            if (!note) {
                throw new common_1.NotFoundException('Nota não encontrada');
            }
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
            throw new common_1.ConflictException('Este item já está nos seus favoritos');
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
                        sector: true,
                    },
                },
                schedule: {
                    include: {
                        category: true,
                        sector: true,
                    },
                },
                note: {
                    include: {
                        category: true,
                        sector: true,
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
                    include: {
                        category: true,
                        sector: true,
                        user: {
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
                    include: {
                        category: true,
                        sector: true,
                        user: {
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
                    include: {
                        category: true,
                        sector: true,
                        user: {
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
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findByUserAndType(userId, entityType) {
        return this.prisma.favorite.findMany({
            where: {
                userId,
                entityType,
            },
            include: {
                link: {
                    include: {
                        category: true,
                        sector: true,
                    },
                },
                schedule: {
                    include: {
                        category: true,
                        sector: true,
                    },
                },
                note: {
                    include: {
                        category: true,
                        sector: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async isFavorited(userId, entityType, entityId) {
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
        const favorite = await this.prisma.favorite.findUnique({
            where: { id },
        });
        if (!favorite) {
            throw new common_1.NotFoundException('Favorito não encontrado');
        }
        if (favorite.userId !== userId) {
            throw new common_1.BadRequestException('Você não pode remover favoritos de outros usuários');
        }
        await this.prisma.favorite.delete({
            where: { id },
        });
        return { message: 'Favorito removido com sucesso' };
    }
    async removeByEntity(userId, entityType, entityId) {
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
        if (!favorite) {
            throw new common_1.NotFoundException('Favorito não encontrado');
        }
        await this.prisma.favorite.delete({
            where: { id: favorite.id },
        });
        return { message: 'Favorito removido com sucesso' };
    }
    async countByUser(userId) {
        return this.prisma.favorite.count({
            where: { userId },
        });
    }
    async countByEntity(entityType, entityId) {
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