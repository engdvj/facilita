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
        return this.prisma.link.findMany({
            where: {
                companyId,
                status: client_1.EntityStatus.ACTIVE,
                deletedAt: null,
                ...(filters?.sectorId && { sectorId: filters.sectorId }),
                ...(filters?.categoryId && { categoryId: filters.categoryId }),
                ...(filters?.isPublic !== undefined && { isPublic: filters.isPublic }),
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
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
            orderBy: [
                { order: 'asc' },
                { createdAt: 'desc' },
            ],
        });
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
                tags: {
                    include: {
                        tag: true,
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
    async update(id, updateLinkDto, userId) {
        const existingLink = await this.findOne(id);
        const hasChanges = updateLinkDto.title !== existingLink.title ||
            updateLinkDto.url !== existingLink.url ||
            updateLinkDto.description !== existingLink.description;
        if (hasChanges && userId) {
            await this.prisma.linkVersion.create({
                data: {
                    linkId: id,
                    title: existingLink.title,
                    url: existingLink.url,
                    description: existingLink.description,
                    changedBy: userId,
                },
            });
        }
        return this.prisma.link.update({
            where: { id },
            data: updateLinkDto,
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
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.link.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: client_1.EntityStatus.INACTIVE,
            },
        });
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