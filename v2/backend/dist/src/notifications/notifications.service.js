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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let NotificationsService = class NotificationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.notification.create({
            data: dto,
        });
    }
    async createBulk(userIds, dto) {
        const notifications = userIds.map((userId) => ({
            userId,
            ...dto,
        }));
        return this.prisma.notification.createMany({
            data: notifications,
        });
    }
    async findByUser(userId, limit = 50, offset = 0) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });
    }
    async getUnreadCount(userId) {
        return this.prisma.notification.count({
            where: { userId, read: false },
        });
    }
    async markAsRead(id, userId) {
        return this.prisma.notification.updateMany({
            where: { id, userId },
            data: { read: true },
        });
    }
    async markAllAsRead(userId) {
        return this.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    }
    async delete(id, userId) {
        return this.prisma.notification.deleteMany({
            where: { id, userId },
        });
    }
    async cleanupOld() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return this.prisma.notification.deleteMany({
            where: {
                createdAt: {
                    lt: sevenDaysAgo,
                },
            },
        });
    }
    async getRecipientsByAudience(companyId, sectorId, audience, excludeUserId) {
        const where = {
            status: 'ACTIVE',
            ...(excludeUserId && { id: { not: excludeUserId } }),
        };
        switch (audience) {
            case client_1.ContentAudience.PUBLIC:
                break;
            case client_1.ContentAudience.COMPANY:
                where.companyId = companyId;
                break;
            case client_1.ContentAudience.SECTOR:
                if (sectorId) {
                    where.userSectors = {
                        some: {
                            sectorId: sectorId,
                        },
                    };
                }
                else {
                    where.companyId = companyId;
                }
                break;
            case client_1.ContentAudience.ADMIN:
                where.companyId = companyId;
                where.role = { in: ['ADMIN', 'SUPERADMIN'] };
                break;
            case client_1.ContentAudience.SUPERADMIN:
                where.role = 'SUPERADMIN';
                break;
            case client_1.ContentAudience.PRIVATE:
                return [];
            default:
                where.companyId = companyId;
        }
        const users = await this.prisma.user.findMany({
            where,
            select: { id: true },
        });
        return users.map((u) => u.id);
    }
    async getUsersWhoFavorited(entityType, entityId) {
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
        const favorites = await this.prisma.favorite.findMany({
            where,
            select: { userId: true },
        });
        return favorites.map((f) => f.userId);
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map