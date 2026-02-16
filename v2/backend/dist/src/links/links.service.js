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
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
let LinksService = class LinksService {
    constructor(prisma) {
        this.prisma = prisma;
        this.include = {
            category: true,
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
            shares: {
                where: { revokedAt: null },
                select: {
                    id: true,
                    recipient: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            _count: {
                select: {
                    favorites: true,
                },
            },
        };
    }
    withShareMetadata(item) {
        const shares = item.shares ?? [];
        return {
            ...item,
            createdBy: item.owner,
            shareCount: shares.length,
            sharedWithPreview: shares.slice(0, 5).map((s) => s.recipient),
        };
    }
    normalizeVisibility(actorRole, requested) {
        if (actorRole === client_1.UserRole.SUPERADMIN) {
            return requested ?? client_1.ContentVisibility.PRIVATE;
        }
        return client_1.ContentVisibility.PRIVATE;
    }
    ensurePublicToken(visibility, provided) {
        if (visibility !== client_1.ContentVisibility.PUBLIC) {
            return null;
        }
        return provided?.trim() || (0, crypto_1.randomUUID)();
    }
    async assertCategoryOwner(categoryId, ownerId) {
        if (!categoryId)
            return;
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
            select: { id: true, ownerId: true },
        });
        if (!category || category.ownerId !== ownerId) {
            throw new common_1.ForbiddenException('Category not authorized');
        }
    }
    assertCanMutate(link, actor) {
        if (actor.role === client_1.UserRole.SUPERADMIN)
            return;
        if (!actor.id || actor.id !== link.ownerId) {
            throw new common_1.ForbiddenException('Link not authorized');
        }
    }
    async create(actor, dto) {
        const visibility = this.normalizeVisibility(actor.role, dto.visibility);
        const publicToken = this.ensurePublicToken(visibility, dto.publicToken);
        await this.assertCategoryOwner(dto.categoryId, actor.id);
        const created = await this.prisma.link.create({
            data: {
                ownerId: actor.id,
                categoryId: dto.categoryId,
                title: dto.title,
                url: dto.url,
                description: dto.description,
                color: dto.color,
                imageUrl: dto.imageUrl,
                imagePosition: dto.imagePosition,
                imageScale: dto.imageScale,
                visibility,
                publicToken,
                order: dto.order ?? 0,
                status: dto.status ?? client_1.EntityStatus.ACTIVE,
            },
            include: this.include,
        });
        return this.withShareMetadata(created);
    }
    async findAll(viewer, filters) {
        if (!viewer)
            return [];
        const search = filters?.search?.trim();
        const and = [
            {
                deletedAt: null,
                status: client_1.EntityStatus.ACTIVE,
            },
        ];
        if (filters?.categoryId) {
            and.push({ categoryId: filters.categoryId });
        }
        if (search) {
            and.push({
                OR: [
                    { title: { contains: search, mode: client_1.Prisma.QueryMode.insensitive } },
                    { description: { contains: search, mode: client_1.Prisma.QueryMode.insensitive } },
                    { url: { contains: search, mode: client_1.Prisma.QueryMode.insensitive } },
                ],
            });
        }
        if (viewer.role !== client_1.UserRole.SUPERADMIN) {
            and.push({
                OR: [
                    { ownerId: viewer.id },
                    {
                        visibility: client_1.ContentVisibility.PUBLIC,
                        owner: { role: client_1.UserRole.SUPERADMIN },
                    },
                ],
            });
        }
        const where = { AND: and };
        const items = await this.prisma.link.findMany({
            where,
            include: this.include,
            orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        });
        return items.map((item) => this.withShareMetadata(item));
    }
    async findAllPaginated(filters, pagination) {
        const search = filters.search?.trim();
        const where = {
            deletedAt: null,
            ...(filters.includeInactive ? {} : { status: client_1.EntityStatus.ACTIVE }),
            ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
            ...(search
                ? {
                    OR: [
                        { title: { contains: search, mode: client_1.Prisma.QueryMode.insensitive } },
                        { description: { contains: search, mode: client_1.Prisma.QueryMode.insensitive } },
                        { url: { contains: search, mode: client_1.Prisma.QueryMode.insensitive } },
                        { owner: { name: { contains: search, mode: client_1.Prisma.QueryMode.insensitive } } },
                    ],
                }
                : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.link.findMany({
                where,
                include: this.include,
                orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
                ...(pagination?.skip !== undefined ? { skip: pagination.skip } : {}),
                ...(pagination?.take !== undefined ? { take: pagination.take } : {}),
            }),
            this.prisma.link.count({ where }),
        ]);
        return { items: items.map((item) => this.withShareMetadata(item)), total };
    }
    async findOne(id, viewer) {
        const link = await this.prisma.link.findUnique({
            where: { id },
            include: this.include,
        });
        if (!link || link.deletedAt) {
            throw new common_1.NotFoundException(`Link with ID ${id} not found`);
        }
        if (viewer?.role === client_1.UserRole.SUPERADMIN) {
            return this.withShareMetadata(link);
        }
        if (!viewer?.id) {
            throw new common_1.ForbiddenException('Link not authorized');
        }
        const canView = link.ownerId === viewer.id ||
            (link.visibility === client_1.ContentVisibility.PUBLIC && link.owner.role === client_1.UserRole.SUPERADMIN);
        if (!canView) {
            throw new common_1.ForbiddenException('Link not authorized');
        }
        return this.withShareMetadata(link);
    }
    async findPublicByToken(publicToken) {
        const link = await this.prisma.link.findFirst({
            where: {
                publicToken,
                visibility: client_1.ContentVisibility.PUBLIC,
                deletedAt: null,
                status: client_1.EntityStatus.ACTIVE,
            },
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
        });
        if (!link) {
            throw new common_1.NotFoundException('Public link not found');
        }
        return link;
    }
    async update(id, actor, dto) {
        const existing = await this.prisma.link.findUnique({
            where: { id },
            include: this.include,
        });
        if (!existing || existing.deletedAt) {
            throw new common_1.NotFoundException(`Link with ID ${id} not found`);
        }
        this.assertCanMutate(existing, actor);
        const requestedVisibility = dto.visibility ?? existing.visibility;
        const visibility = this.normalizeVisibility(actor.role, requestedVisibility);
        const publicToken = this.ensurePublicToken(visibility, dto.publicToken ?? existing.publicToken);
        const nextCategoryId = dto.categoryId === undefined ? existing.categoryId : dto.categoryId;
        await this.assertCategoryOwner(nextCategoryId, existing.ownerId);
        const updated = await this.prisma.link.update({
            where: { id },
            data: {
                ...(dto.title !== undefined ? { title: dto.title } : {}),
                ...(dto.url !== undefined ? { url: dto.url } : {}),
                ...(dto.description !== undefined ? { description: dto.description } : {}),
                ...(dto.color !== undefined ? { color: dto.color } : {}),
                ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
                ...(dto.imagePosition !== undefined ? { imagePosition: dto.imagePosition } : {}),
                ...(dto.imageScale !== undefined ? { imageScale: dto.imageScale } : {}),
                ...(dto.order !== undefined ? { order: dto.order } : {}),
                ...(dto.status !== undefined ? { status: dto.status } : {}),
                ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
                visibility,
                publicToken,
            },
            include: this.include,
        });
        return this.withShareMetadata(updated);
    }
    async remove(id, actor) {
        const existing = await this.prisma.link.findUnique({
            where: { id },
            include: this.include,
        });
        if (!existing || existing.deletedAt) {
            throw new common_1.NotFoundException(`Link with ID ${id} not found`);
        }
        this.assertCanMutate(existing, actor);
        const removed = await this.prisma.link.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
            include: this.include,
        });
        return this.withShareMetadata(removed);
    }
    async restore(id, actor) {
        const existing = await this.prisma.link.findUnique({
            where: { id },
            include: this.include,
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Link with ID ${id} not found`);
        }
        this.assertCanMutate(existing, actor);
        const restored = await this.prisma.link.update({
            where: { id },
            data: {
                deletedAt: null,
                status: client_1.EntityStatus.ACTIVE,
            },
            include: this.include,
        });
        return this.withShareMetadata(restored);
    }
    async activate(id, actor) {
        const existing = await this.prisma.link.findUnique({
            where: { id },
            include: this.include,
        });
        if (!existing || existing.deletedAt) {
            throw new common_1.NotFoundException(`Link with ID ${id} not found`);
        }
        this.assertCanMutate(existing, actor);
        const activated = await this.prisma.link.update({
            where: { id },
            data: { status: client_1.EntityStatus.ACTIVE },
            include: this.include,
        });
        return this.withShareMetadata(activated);
    }
    async deactivate(id, actor) {
        const existing = await this.prisma.link.findUnique({
            where: { id },
            include: this.include,
        });
        if (!existing || existing.deletedAt) {
            throw new common_1.NotFoundException(`Link with ID ${id} not found`);
        }
        this.assertCanMutate(existing, actor);
        const deactivated = await this.prisma.link.update({
            where: { id },
            data: { status: client_1.EntityStatus.INACTIVE },
            include: this.include,
        });
        return this.withShareMetadata(deactivated);
    }
};
exports.LinksService = LinksService;
exports.LinksService = LinksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LinksService);
//# sourceMappingURL=links.service.js.map