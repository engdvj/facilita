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
exports.ResetsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const backups_types_1 = require("../backups/backups.types");
const prisma_service_1 = require("../prisma/prisma.service");
let ResetsService = class ResetsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async reset(entities) {
        const selection = new Set(entities);
        const resetAll = backups_types_1.backupEntities.every((entity) => selection.has(entity));
        const shouldSeedUsers = resetAll || selection.has('users');
        const shouldSeedPermissions = resetAll || selection.has('rolePermissions');
        const deleted = {};
        await this.prisma.$transaction(async (tx) => {
            if (selection.has('favorites')) {
                deleted.favorites = (await tx.favorite.deleteMany()).count;
            }
            if (selection.has('shares')) {
                deleted.shares = (await tx.share.deleteMany()).count;
            }
            if (selection.has('notifications')) {
                deleted.notifications = (await tx.notification.deleteMany()).count;
            }
            if (selection.has('links')) {
                deleted.links = (await tx.link.deleteMany()).count;
            }
            if (selection.has('uploadedSchedules')) {
                deleted.uploadedSchedules = (await tx.uploadedSchedule.deleteMany()).count;
            }
            if (selection.has('notes')) {
                deleted.notes = (await tx.note.deleteMany()).count;
            }
            if (selection.has('uploadedImages')) {
                deleted.uploadedImages = (await tx.uploadedImage.deleteMany()).count;
            }
            if (selection.has('categories')) {
                deleted.categories = (await tx.category.deleteMany()).count;
            }
            if (selection.has('systemConfig')) {
                deleted.systemConfig = (await tx.systemConfig.deleteMany()).count;
            }
            if (selection.has('users')) {
                await tx.refreshToken.deleteMany();
                deleted.users = (await tx.user.deleteMany()).count;
            }
            if (selection.has('rolePermissions')) {
                deleted.rolePermissions = (await tx.rolePermission.deleteMany()).count;
            }
            if (shouldSeedUsers) {
                await this.seedSuperAdmin(tx);
            }
            if (shouldSeedPermissions) {
                await this.seedRolePermissions(tx);
            }
        });
        return {
            deleted,
            entities: Array.from(selection),
            seeded: shouldSeedUsers || shouldSeedPermissions,
        };
    }
    async seedRolePermissions(tx) {
        const roles = [
            {
                role: client_1.UserRole.USER,
                canViewDashboard: false,
                canAccessAdmin: false,
                canViewUsers: false,
                canCreateUsers: false,
                canEditUsers: false,
                canDeleteUsers: false,
                canViewLinks: true,
                canManageLinks: true,
                canManageCategories: true,
                canManageSchedules: true,
                canViewPrivateContent: false,
                canBackupSystem: false,
                canResetSystem: false,
                canViewAuditLogs: false,
                canManageSystemConfig: false,
                canManageShares: true,
            },
            {
                role: client_1.UserRole.SUPERADMIN,
                canViewDashboard: true,
                canAccessAdmin: true,
                canViewUsers: true,
                canCreateUsers: true,
                canEditUsers: true,
                canDeleteUsers: true,
                canViewLinks: true,
                canManageLinks: true,
                canManageCategories: true,
                canManageSchedules: true,
                canViewPrivateContent: true,
                canBackupSystem: true,
                canResetSystem: true,
                canViewAuditLogs: true,
                canManageSystemConfig: true,
                canManageShares: false,
            },
        ];
        for (const rolePermission of roles) {
            await tx.rolePermission.upsert({
                where: { role: rolePermission.role },
                update: rolePermission,
                create: rolePermission,
            });
        }
    }
    async seedSuperAdmin(tx) {
        const email = process.env.SUPERADMIN_EMAIL || 'superadmin@facilita.local';
        const password = process.env.SUPERADMIN_PASSWORD || 'superadmin';
        const name = process.env.SUPERADMIN_NAME || 'Superadmin';
        const passwordHash = await bcrypt.hash(password, 12);
        await tx.user.upsert({
            where: { email },
            update: {
                name,
                passwordHash,
                role: client_1.UserRole.SUPERADMIN,
                status: client_1.UserStatus.ACTIVE,
            },
            create: {
                name,
                email,
                passwordHash,
                role: client_1.UserRole.SUPERADMIN,
                status: client_1.UserStatus.ACTIVE,
            },
        });
    }
};
exports.ResetsService = ResetsService;
exports.ResetsService = ResetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ResetsService);
//# sourceMappingURL=resets.service.js.map