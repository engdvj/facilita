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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
const userSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    status: true,
    companyId: true,
    avatarUrl: true,
    theme: true,
    createdAt: true,
    updatedAt: true,
    userSectors: {
        include: {
            userSectorUnits: {
                select: {
                    unitId: true,
                },
            },
            sector: {
                include: {
                    sectorUnits: {
                        include: {
                            unit: true,
                        },
                    },
                },
            },
        },
    },
};
const resolveCompanyIdFromSectors = (user) => {
    if (user.companyId) {
        return user.companyId;
    }
    for (const userSector of user.userSectors ?? []) {
        const sectorCompanyId = userSector.sector?.companyId;
        if (sectorCompanyId) {
            return sectorCompanyId;
        }
    }
    return null;
};
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    findByUsername(username) {
        return this.prisma.user.findUnique({ where: { email: username } });
    }
    findById(id) {
        return this.prisma.user.findUnique({ where: { id } });
    }
    findActiveById(id) {
        return this.prisma.user
            .findFirst({
            where: { id, status: client_1.UserStatus.ACTIVE },
            select: userSelect,
        })
            .then((user) => (user ? this.ensureCompanyId(user) : null));
    }
    async findAll(options) {
        const search = options?.search?.trim();
        const where = {
            ...(options?.companyId ? { companyId: options.companyId } : {}),
            ...(options?.sectorId
                ? {
                    userSectors: {
                        some: { sectorId: options.sectorId },
                    },
                }
                : {}),
            ...(search
                ? {
                    OR: [
                        { name: { contains: search, mode: client_1.Prisma.QueryMode.insensitive } },
                        { email: { contains: search, mode: client_1.Prisma.QueryMode.insensitive } },
                    ],
                }
                : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                select: userSelect,
                ...(options?.skip !== undefined ? { skip: options.skip } : {}),
                ...(options?.take !== undefined ? { take: options.take } : {}),
            }),
            this.prisma.user.count({ where }),
        ]);
        return { items, total };
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: userSelect,
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.ensureCompanyId(user);
    }
    async create(data) {
        const passwordHash = await bcrypt.hash(data.password, 12);
        const theme = data.theme
            ? data.theme
            : undefined;
        await this.assertUserSectorUnits(data.sectors);
        return this.prisma.user.create({
            data: {
                name: data.name,
                email: data.username,
                passwordHash,
                role: data.role,
                status: data.status,
                companyId: data.companyId,
                avatarUrl: data.avatarUrl,
                theme,
                userSectors: data.sectors
                    ? {
                        create: data.sectors.map((sector) => ({
                            sectorId: sector.sectorId,
                            isPrimary: sector.isPrimary ?? false,
                            role: sector.role ?? 'MEMBER',
                            userSectorUnits: this.buildUserSectorUnits(sector.unitIds),
                        })),
                    }
                    : undefined,
            },
            select: userSelect,
        });
    }
    async update(id, data) {
        await this.findOne(id);
        const updateData = {
            name: data.name,
            email: data.username,
            role: data.role,
            status: data.status,
            companyId: data.companyId,
            avatarUrl: data.avatarUrl,
            theme: data.theme
                ? data.theme
                : undefined,
        };
        if (data.password) {
            updateData.passwordHash = await bcrypt.hash(data.password, 12);
        }
        if (data.sectors) {
            await this.assertUserSectorUnits(data.sectors);
            updateData.userSectors = {
                deleteMany: {},
                create: data.sectors.map((sector) => ({
                    sectorId: sector.sectorId,
                    isPrimary: sector.isPrimary ?? false,
                    role: sector.role ?? 'MEMBER',
                    userSectorUnits: this.buildUserSectorUnits(sector.unitIds),
                })),
            };
        }
        return this.prisma.user.update({
            where: { id },
            data: updateData,
            select: userSelect,
        });
    }
    async updateProfile(id, data) {
        await this.findOne(id);
        const updateData = {
            name: data.name,
            email: data.username,
            avatarUrl: data.avatarUrl,
            theme: data.theme
                ? data.theme
                : undefined,
        };
        if (data.password) {
            updateData.passwordHash = await bcrypt.hash(data.password, 12);
        }
        return this.prisma.user.update({
            where: { id },
            data: updateData,
            select: userSelect,
        });
    }
    async getDependencies(id) {
        const [sectors, links, schedules, notes, uploadedImages, linkVersions, favorites, refreshTokens, activityLogs, auditLogs,] = await Promise.all([
            this.prisma.userSector.count({ where: { userId: id } }),
            this.prisma.link.count({ where: { userId: id } }),
            this.prisma.uploadedSchedule.count({ where: { userId: id } }),
            this.prisma.note.count({ where: { userId: id } }),
            this.prisma.uploadedImage.count({ where: { uploadedBy: id } }),
            this.prisma.linkVersion.count({ where: { changedBy: id } }),
            this.prisma.favorite.count({ where: { userId: id } }),
            this.prisma.refreshToken.count({ where: { userId: id } }),
            this.prisma.activityLog.count({ where: { userId: id } }),
            this.prisma.auditLog.count({ where: { userId: id } }),
        ]);
        return {
            sectors,
            links,
            schedules,
            notes,
            uploadedImages,
            linkVersions,
            favorites,
            refreshTokens,
            activityLogs,
            auditLogs,
            hasAny: sectors > 0 ||
                links > 0 ||
                schedules > 0 ||
                notes > 0 ||
                uploadedImages > 0 ||
                linkVersions > 0 ||
                favorites > 0 ||
                refreshTokens > 0 ||
                activityLogs > 0 ||
                auditLogs > 0,
        };
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.$transaction(async (tx) => {
            await tx.link.updateMany({
                data: { userId: null },
                where: { userId: id },
            });
            await tx.uploadedSchedule.updateMany({
                data: { userId: null },
                where: { userId: id },
            });
            await tx.note.updateMany({
                data: { userId: null },
                where: { userId: id },
            });
            await tx.activityLog.updateMany({
                data: { userId: null },
                where: { userId: id },
            });
            await tx.auditLog.updateMany({
                data: { userId: null },
                where: { userId: id },
            });
            await tx.uploadedImage.deleteMany({ where: { uploadedBy: id } });
            await tx.refreshToken.deleteMany({ where: { userId: id } });
            await tx.favorite.deleteMany({ where: { userId: id } });
            await tx.linkVersion.deleteMany({ where: { changedBy: id } });
            return tx.user.delete({ where: { id }, select: userSelect });
        });
    }
    async getAccessItems(userId, options) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                role: true,
                companyId: true,
                userSectors: {
                    select: {
                        sectorId: true,
                        userSectorUnits: {
                            select: {
                                unitId: true,
                            },
                        },
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
            throw new common_1.NotFoundException('User not found');
        }
        const sectorIds = new Set(user.userSectors?.map((userSector) => userSector.sectorId) ?? []);
        if (options?.sectorId && !sectorIds.has(options.sectorId)) {
            return { items: [], total: 0 };
        }
        const unitsBySector = this.getUserUnitsBySector(user.userSectors);
        const targetSectorId = options?.sectorId;
        const baseWhere = {
            deletedAt: null,
            ...(user.companyId ? { companyId: user.companyId } : {}),
            ...(targetSectorId ? { sectorId: targetSectorId } : {}),
        };
        const [links, schedules, notes] = await Promise.all([
            this.prisma.link.findMany({
                where: baseWhere,
                select: {
                    id: true,
                    title: true,
                    companyId: true,
                    sectorId: true,
                    unitId: true,
                    userId: true,
                    isPublic: true,
                    audience: true,
                    imageUrl: true,
                    imagePosition: true,
                    imageScale: true,
                    status: true,
                    createdAt: true,
                    linkUnits: {
                        select: {
                            unitId: true,
                        },
                    },
                },
            }),
            this.prisma.uploadedSchedule.findMany({
                where: baseWhere,
                select: {
                    id: true,
                    title: true,
                    companyId: true,
                    sectorId: true,
                    unitId: true,
                    userId: true,
                    isPublic: true,
                    audience: true,
                    imageUrl: true,
                    imagePosition: true,
                    imageScale: true,
                    status: true,
                    createdAt: true,
                    scheduleUnits: {
                        select: {
                            unitId: true,
                        },
                    },
                },
            }),
            this.prisma.note.findMany({
                where: baseWhere,
                select: {
                    id: true,
                    title: true,
                    companyId: true,
                    sectorId: true,
                    unitId: true,
                    userId: true,
                    isPublic: true,
                    audience: true,
                    imageUrl: true,
                    imagePosition: true,
                    imageScale: true,
                    status: true,
                    createdAt: true,
                    noteUnits: {
                        select: {
                            unitId: true,
                        },
                    },
                },
            }),
        ]);
        const accessibleLinks = links
            .filter((link) => this.canUserAccessItem(user, this.resolveAudience(link), {
            companyId: link.companyId,
            sectorId: link.sectorId,
            userId: link.userId,
            unitIds: this.resolveUnitIds(link.linkUnits, link.unitId),
        }, sectorIds, unitsBySector))
            .map((link) => ({
            id: link.id,
            title: link.title,
            type: 'link',
            imageUrl: link.imageUrl,
            imagePosition: link.imagePosition,
            imageScale: link.imageScale,
            status: link.status,
            createdAt: link.createdAt,
        }));
        const accessibleSchedules = schedules
            .filter((schedule) => this.canUserAccessItem(user, this.resolveAudience(schedule), {
            companyId: schedule.companyId,
            sectorId: schedule.sectorId,
            userId: schedule.userId,
            unitIds: this.resolveUnitIds(schedule.scheduleUnits, schedule.unitId),
        }, sectorIds, unitsBySector))
            .map((schedule) => ({
            id: schedule.id,
            title: schedule.title,
            type: 'document',
            imageUrl: schedule.imageUrl,
            imagePosition: schedule.imagePosition,
            imageScale: schedule.imageScale,
            status: schedule.status,
            createdAt: schedule.createdAt,
        }));
        const accessibleNotes = notes
            .filter((note) => this.canUserAccessItem(user, this.resolveAudience(note), {
            companyId: note.companyId,
            sectorId: note.sectorId,
            userId: note.userId,
            unitIds: this.resolveUnitIds(note.noteUnits, note.unitId),
        }, sectorIds, unitsBySector))
            .map((note) => ({
            id: note.id,
            title: note.title,
            type: 'note',
            imageUrl: note.imageUrl,
            imagePosition: note.imagePosition,
            imageScale: note.imageScale,
            status: note.status,
            createdAt: note.createdAt,
        }));
        const items = [...accessibleLinks, ...accessibleSchedules, ...accessibleNotes];
        items.sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            const diff = bTime - aTime;
            if (diff !== 0)
                return diff;
            return a.title.localeCompare(b.title);
        });
        const total = items.length;
        if (!options?.shouldPaginate) {
            return { items, total };
        }
        const page = options.page ?? 1;
        const pageSize = (options.pageSize ?? total) || 1;
        const start = (page - 1) * pageSize;
        const pagedItems = items.slice(start, start + pageSize);
        return { items: pagedItems, total };
    }
    async ensureCompanyId(user) {
        if (user.companyId) {
            return user;
        }
        const resolvedCompanyId = resolveCompanyIdFromSectors(user);
        if (!resolvedCompanyId) {
            return user;
        }
        return this.prisma.user.update({
            where: { id: user.id },
            data: { companyId: resolvedCompanyId },
            select: userSelect,
        });
    }
    getUserUnitsBySector(userSectors) {
        const map = new Map();
        if (!userSectors)
            return map;
        userSectors.forEach((userSector) => {
            const explicitUnitIds = userSector.userSectorUnits?.map((unit) => unit.unitId) || [];
            const fallbackUnitIds = userSector.sector?.sectorUnits?.map((unit) => unit.unitId) || [];
            const unitIds = explicitUnitIds.length > 0 ? explicitUnitIds : fallbackUnitIds;
            map.set(userSector.sectorId, new Set(unitIds));
        });
        return map;
    }
    resolveUnitIds(units, unitId) {
        const collected = [
            ...(units?.map((unit) => unit.unitId) ?? []),
            ...(unitId ? [unitId] : []),
        ].filter(Boolean);
        return Array.from(new Set(collected));
    }
    resolveAudience(item) {
        if (item.isPublic)
            return client_1.ContentAudience.PUBLIC;
        if (item.audience)
            return item.audience;
        if (item.sectorId)
            return client_1.ContentAudience.SECTOR;
        return client_1.ContentAudience.COMPANY;
    }
    canUserAccessItem(subject, audience, item, sectorIds, unitsBySector) {
        if (audience === client_1.ContentAudience.PUBLIC)
            return true;
        if (subject.role === client_1.UserRole.SUPERADMIN)
            return true;
        if (audience === client_1.ContentAudience.SUPERADMIN)
            return false;
        const hasCompanyMatch = Boolean(subject.companyId &&
            item.companyId &&
            subject.companyId === item.companyId);
        if (item.companyId && subject.companyId && !hasCompanyMatch) {
            return false;
        }
        if (audience === client_1.ContentAudience.ADMIN) {
            return subject.role === client_1.UserRole.ADMIN;
        }
        if (audience === client_1.ContentAudience.PRIVATE) {
            return item.userId === subject.id;
        }
        if (audience === client_1.ContentAudience.SECTOR) {
            if (subject.role === client_1.UserRole.ADMIN)
                return true;
            if (!item.sectorId || !sectorIds.has(item.sectorId)) {
                return false;
            }
            if (item.unitIds && item.unitIds.length > 0) {
                const allowedUnits = unitsBySector.get(item.sectorId);
                if (allowedUnits && allowedUnits.size > 0) {
                    return item.unitIds.some((unitId) => allowedUnits.has(unitId));
                }
            }
            return true;
        }
        if (audience === client_1.ContentAudience.COMPANY) {
            return hasCompanyMatch;
        }
        return false;
    }
    normalizeUnitIds(unitIds) {
        const filtered = (unitIds ?? []).filter((unitId) => Boolean(unitId));
        return Array.from(new Set(filtered));
    }
    buildUserSectorUnits(unitIds) {
        const normalizedUnitIds = this.normalizeUnitIds(unitIds);
        if (normalizedUnitIds.length === 0) {
            return undefined;
        }
        return {
            create: normalizedUnitIds.map((unitId) => ({ unitId })),
        };
    }
    async assertUserSectorUnits(sectors) {
        if (!sectors || sectors.length === 0)
            return;
        const pairs = [];
        sectors.forEach((sector) => {
            const normalizedUnitIds = this.normalizeUnitIds(sector.unitIds);
            if (normalizedUnitIds.length === 0) {
                return;
            }
            normalizedUnitIds.forEach((unitId) => {
                pairs.push({ sectorId: sector.sectorId, unitId });
            });
        });
        if (pairs.length === 0)
            return;
        const validPairs = await this.prisma.sectorUnit.findMany({
            where: {
                OR: pairs.map((pair) => ({
                    sectorId: pair.sectorId,
                    unitId: pair.unitId,
                })),
            },
            select: {
                sectorId: true,
                unitId: true,
            },
        });
        const validSet = new Set(validPairs.map((pair) => `${pair.sectorId}:${pair.unitId}`));
        const invalid = pairs.find((pair) => !validSet.has(`${pair.sectorId}:${pair.unitId}`));
        if (invalid) {
            throw new common_1.ForbiddenException('Unidade nao pertence ao setor.');
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map