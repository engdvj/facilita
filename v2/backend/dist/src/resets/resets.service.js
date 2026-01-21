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
const app_mode_1 = require("../common/app-mode");
let ResetsService = class ResetsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async reset(entities) {
        const selection = new Set((0, app_mode_1.isUserMode)()
            ? entities.filter((entity) => entity !== 'companies' &&
                entity !== 'units' &&
                entity !== 'sectors')
            : entities);
        if (selection.has('units')) {
            selection.add('sectors');
        }
        if (!(0, app_mode_1.isUserMode)() && selection.has('companies')) {
            selection.add('units');
            selection.add('sectors');
            selection.add('categories');
            selection.add('links');
            selection.add('uploadedSchedules');
            selection.add('notes');
            selection.add('uploadedImages');
        }
        const resolvedEntities = Array.from(selection);
        const resetAll = backups_types_1.backupEntities.every((entity) => selection.has(entity));
        const shouldSeedUsers = resetAll || selection.has('users');
        const shouldSeedPermissions = resetAll || selection.has('rolePermissions');
        const deleted = {};
        await this.prisma.$transaction(async (tx) => {
            await this.detachRelations(tx, selection);
            await this.clearDependents(tx, selection, deleted);
            await this.deleteEntities(tx, selection, deleted);
            if (shouldSeedUsers) {
                if (!(0, app_mode_1.isUserMode)()) {
                    await this.seedAdmCompany(tx);
                }
                await this.seedSuperAdmin(tx);
            }
            if (shouldSeedPermissions) {
                await this.seedRolePermissions(tx);
            }
        });
        return {
            deleted,
            entities: resolvedEntities,
            seeded: shouldSeedUsers || shouldSeedPermissions,
        };
    }
    async detachRelations(tx, selection) {
        if (selection.has('categories') && !selection.has('links')) {
            await tx.link.updateMany({
                data: { categoryId: null },
                where: { categoryId: { not: null } },
            });
        }
        if (selection.has('categories') && !selection.has('uploadedSchedules')) {
            await tx.uploadedSchedule.updateMany({
                data: { categoryId: null },
                where: { categoryId: { not: null } },
            });
        }
        if (selection.has('categories') && !selection.has('notes')) {
            await tx.note.updateMany({
                data: { categoryId: null },
                where: { categoryId: { not: null } },
            });
        }
        if (selection.has('sectors') && !selection.has('links')) {
            await tx.link.updateMany({
                data: { sectorId: null },
                where: { sectorId: { not: null } },
            });
        }
        if (selection.has('sectors') && !selection.has('uploadedSchedules')) {
            await tx.uploadedSchedule.updateMany({
                data: { sectorId: null },
                where: { sectorId: { not: null } },
            });
        }
        if (selection.has('sectors') && !selection.has('notes')) {
            await tx.note.updateMany({
                data: { sectorId: null },
                where: { sectorId: { not: null } },
            });
        }
        if (!(0, app_mode_1.isUserMode)() && selection.has('companies') && !selection.has('users')) {
            await tx.user.updateMany({
                data: { companyId: null },
                where: { companyId: { not: null } },
            });
        }
        if (selection.has('users')) {
            if (!selection.has('links')) {
                await tx.link.updateMany({
                    data: { userId: null },
                    where: { userId: { not: null } },
                });
            }
            if (!selection.has('uploadedSchedules')) {
                await tx.uploadedSchedule.updateMany({
                    data: { userId: null },
                    where: { userId: { not: null } },
                });
            }
            if (!selection.has('notes')) {
                await tx.note.updateMany({
                    data: { userId: null },
                    where: { userId: { not: null } },
                });
            }
            await tx.activityLog.updateMany({
                data: { userId: null },
                where: { userId: { not: null } },
            });
            await tx.auditLog.updateMany({
                data: { userId: null },
                where: { userId: { not: null } },
            });
        }
    }
    async clearDependents(tx, selection, deleted) {
        if (selection.has('companies')) {
            if (!selection.has('uploadedImages')) {
                await tx.uploadedImage.deleteMany();
            }
        }
        if (selection.has('users')) {
            await tx.refreshToken.deleteMany();
            await tx.favorite.deleteMany();
            if (!selection.has('links')) {
                await tx.linkVersion.deleteMany();
            }
            if (!selection.has('uploadedImages')) {
                await tx.uploadedImage.deleteMany();
            }
        }
        else {
            if (selection.has('links')) {
                await tx.favorite.deleteMany({
                    where: { linkId: { not: null } },
                });
            }
            if (selection.has('uploadedSchedules')) {
                await tx.favorite.deleteMany({
                    where: { scheduleId: { not: null } },
                });
            }
        }
    }
    async deleteEntities(tx, selection, deleted) {
        if (selection.has('uploadedSchedules')) {
            deleted.uploadedSchedules = (await tx.uploadedSchedule.deleteMany()).count;
        }
        if (selection.has('notes')) {
            deleted.notes = (await tx.note.deleteMany()).count;
        }
        if (selection.has('links')) {
            deleted.links = (await tx.link.deleteMany()).count;
        }
        if (selection.has('categories')) {
            deleted.categories = (await tx.category.deleteMany()).count;
        }
        if (selection.has('uploadedImages')) {
            deleted.uploadedImages = (await tx.uploadedImage.deleteMany()).count;
        }
        if (!(0, app_mode_1.isUserMode)()) {
            if (selection.has('sectors')) {
                deleted.sectors = (await tx.sector.deleteMany()).count;
            }
            if (selection.has('units')) {
                deleted.units = (await tx.unit.deleteMany()).count;
            }
        }
        if (selection.has('users')) {
            deleted.users = (await tx.user.deleteMany()).count;
        }
        if (selection.has('rolePermissions')) {
            deleted.rolePermissions = (await tx.rolePermission.deleteMany()).count;
        }
        if (!(0, app_mode_1.isUserMode)() && selection.has('companies')) {
            deleted.companies = (await tx.company.deleteMany()).count;
        }
    }
    async seedAdmCompany(tx) {
        await tx.company.upsert({
            where: { id: '00000000-0000-4000-8000-000000000001' },
            update: { name: 'ADM', status: 'ACTIVE' },
            create: {
                id: '00000000-0000-4000-8000-000000000001',
                name: 'ADM',
                status: 'ACTIVE',
            },
        });
    }
    async seedRolePermissions(tx) {
        const roles = [
            {
                role: client_1.UserRole.COLLABORATOR,
                canViewLinks: true,
                canManageLinks: true,
                restrictToOwnSector: !(0, app_mode_1.isUserMode)(),
            },
            {
                role: client_1.UserRole.ADMIN,
                canViewDashboard: true,
                canAccessAdmin: true,
                canViewUsers: true,
                canCreateUsers: true,
                canEditUsers: true,
                canDeleteUsers: true,
                canViewSectors: !(0, app_mode_1.isUserMode)(),
                canManageSectors: !(0, app_mode_1.isUserMode)(),
                canViewLinks: true,
                canManageLinks: true,
                canManageCategories: true,
                canManageSchedules: true,
                canBackupSystem: true,
                canResetSystem: true,
                canViewAuditLogs: true,
                canManageSystemConfig: true,
                restrictToOwnSector: false,
            },
            {
                role: client_1.UserRole.SUPERADMIN,
                canViewDashboard: true,
                canAccessAdmin: true,
                canViewUsers: true,
                canCreateUsers: true,
                canEditUsers: true,
                canDeleteUsers: true,
                canViewSectors: !(0, app_mode_1.isUserMode)(),
                canManageSectors: !(0, app_mode_1.isUserMode)(),
                canViewLinks: true,
                canManageLinks: true,
                canManageCategories: true,
                canManageSchedules: true,
                canBackupSystem: true,
                canResetSystem: true,
                canViewAuditLogs: true,
                canManageSystemConfig: true,
                restrictToOwnSector: false,
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
        const email = 'superadmin';
        const password = 'superadmin';
        const name = 'Superadmin';
        const passwordHash = await bcrypt.hash(password, 12);
        if ((0, app_mode_1.isUserMode)()) {
            const existing = await tx.user.findUnique({
                where: { email },
                select: { id: true },
            });
            if (existing) {
                await tx.user.update({
                    where: { id: existing.id },
                    data: {
                        name,
                        passwordHash,
                        role: client_1.UserRole.SUPERADMIN,
                        status: client_1.UserStatus.ACTIVE,
                        companyId: existing.id,
                    },
                });
                return;
            }
            const created = await tx.user.create({
                data: {
                    name,
                    email,
                    passwordHash,
                    role: client_1.UserRole.SUPERADMIN,
                    status: client_1.UserStatus.ACTIVE,
                },
                select: { id: true },
            });
            await tx.user.update({
                where: { id: created.id },
                data: { companyId: created.id },
            });
            return;
        }
        await tx.user.upsert({
            where: { email },
            update: {
                name,
                passwordHash,
                role: client_1.UserRole.SUPERADMIN,
                status: client_1.UserStatus.ACTIVE,
                companyId: '00000000-0000-4000-8000-000000000001',
            },
            create: {
                name,
                email,
                passwordHash,
                role: client_1.UserRole.SUPERADMIN,
                status: client_1.UserStatus.ACTIVE,
                companyId: '00000000-0000-4000-8000-000000000001',
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