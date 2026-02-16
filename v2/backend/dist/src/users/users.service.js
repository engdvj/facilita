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
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
const userSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    status: true,
    avatarUrl: true,
    theme: true,
    createdAt: true,
    updatedAt: true,
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
            select: userSelect,
        });
    }
    async findAll(options) {
        const search = options?.search?.trim();
        const where = {
            ...(options?.role ? { role: options.role } : {}),
            ...(options?.status ? { status: options.status } : {}),
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
        return user;
    }
    async create(data) {
        const existingEmail = await this.findByEmail(data.username);
        if (existingEmail) {
            throw new common_1.ConflictException('Email already in use');
        }
        const passwordHash = await bcrypt.hash(data.password, 12);
        const theme = data.theme
            ? data.theme
            : undefined;
        return this.prisma.user.create({
            data: {
                name: data.name,
                email: data.username,
                passwordHash,
                role: data.role ?? client_1.UserRole.USER,
                status: data.status ?? client_1.UserStatus.ACTIVE,
                avatarUrl: data.avatarUrl,
                theme,
            },
            select: userSelect,
        });
    }
    async update(id, data) {
        const current = await this.findOne(id);
        if (data.username && data.username !== current.email) {
            const existingEmail = await this.findByEmail(data.username);
            if (existingEmail) {
                throw new common_1.ConflictException('Email already in use');
            }
        }
        const updateData = {
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.username !== undefined ? { email: data.username } : {}),
            ...(data.role !== undefined ? { role: data.role } : {}),
            ...(data.status !== undefined ? { status: data.status } : {}),
            ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
            ...(data.theme !== undefined
                ? { theme: data.theme }
                : {}),
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
    async updateProfile(id, data) {
        const current = await this.findOne(id);
        if (data.username && data.username !== current.email) {
            const existingEmail = await this.findByEmail(data.username);
            if (existingEmail) {
                throw new common_1.ConflictException('Email already in use');
            }
        }
        const updateData = {
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.username !== undefined ? { email: data.username } : {}),
            ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
            ...(data.theme !== undefined
                ? { theme: data.theme }
                : {}),
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
        const [links, schedules, notes, uploadedImages, sharesSent, sharesReceived, favorites, refreshTokens, activityLogs, auditLogs, notifications,] = await Promise.all([
            this.prisma.link.count({ where: { ownerId: id } }),
            this.prisma.uploadedSchedule.count({ where: { ownerId: id } }),
            this.prisma.note.count({ where: { ownerId: id } }),
            this.prisma.uploadedImage.count({ where: { uploadedBy: id } }),
            this.prisma.share.count({ where: { ownerId: id, revokedAt: null } }),
            this.prisma.share.count({ where: { recipientId: id, revokedAt: null } }),
            this.prisma.favorite.count({ where: { userId: id } }),
            this.prisma.refreshToken.count({ where: { userId: id } }),
            this.prisma.activityLog.count({ where: { userId: id } }),
            this.prisma.auditLog.count({ where: { userId: id } }),
            this.prisma.notification.count({ where: { userId: id } }),
        ]);
        return {
            links,
            schedules,
            notes,
            uploadedImages,
            sharesSent,
            sharesReceived,
            favorites,
            refreshTokens,
            activityLogs,
            auditLogs,
            notifications,
            hasAny: links > 0 ||
                schedules > 0 ||
                notes > 0 ||
                uploadedImages > 0 ||
                sharesSent > 0 ||
                sharesReceived > 0 ||
                favorites > 0 ||
                refreshTokens > 0 ||
                activityLogs > 0 ||
                auditLogs > 0 ||
                notifications > 0,
        };
    }
    async remove(id, actorId) {
        const target = await this.findById(id);
        if (!target) {
            throw new common_1.NotFoundException('User not found');
        }
        if (actorId && actorId === id) {
            throw new common_1.ForbiddenException('You cannot delete your own account');
        }
        return this.prisma.user.delete({
            where: { id },
            select: userSelect,
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map