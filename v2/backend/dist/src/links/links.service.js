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
let LinksService = class LinksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createLinkDto) {
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
        return link;
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
    async findOne(id) {
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
        const { companyId, userId, sectorId: _sectorId, audience, isPublic, ...rest } = updateLinkDto;
        const sectorId = resolvedAudience === client_1.ContentAudience.SECTOR
            ? _sectorId ?? existingLink.sectorId ?? undefined
            : undefined;
        if (resolvedAudience === client_1.ContentAudience.SECTOR && !sectorId) {
            throw new common_1.ForbiddenException('Setor obrigatorio para links de setor.');
        }
        const updateData = {
            ...rest,
            sectorId,
        };
        if (shouldUpdateAudience) {
            updateData.audience = resolvedAudience;
            updateData.isPublic = resolvedAudience === client_1.ContentAudience.PUBLIC;
        }
        return this.prisma.link.update({
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
        const existingLink = await this.findOne(id);
        this.assertCanMutate(existingLink, actor);
        return this.prisma.link.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: client_1.EntityStatus.INACTIVE,
            },
        });
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
        });
        if (!link) {
            throw new common_1.NotFoundException(`Link with ID ${id} not found`);
        }
        return this.prisma.link.update({
            where: { id },
            data: {
                deletedAt: null,
                status: client_1.EntityStatus.ACTIVE,
            },
        });
    }
};
exports.LinksService = LinksService;
exports.LinksService = LinksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LinksService);
//# sourceMappingURL=links.service.js.map