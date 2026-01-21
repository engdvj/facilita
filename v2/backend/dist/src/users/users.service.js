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
        return this.prisma.user.findFirst({
            where: { id, status: client_1.UserStatus.ACTIVE },
        });
    }
    findAll() {
        return this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: userSelect,
        });
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: userSelect,
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async create(data) {
        const passwordHash = await bcrypt.hash(data.password, 12);
        const theme = data.theme
            ? data.theme
            : undefined;
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
            updateData.userSectors = {
                deleteMany: {},
                create: data.sectors.map((sector) => ({
                    sectorId: sector.sectorId,
                    isPrimary: sector.isPrimary ?? false,
                    role: sector.role ?? 'MEMBER',
                })),
            };
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map