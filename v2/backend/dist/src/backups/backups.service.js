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
exports.BackupsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const backups_types_1 = require("./backups.types");
const restoreOrder = [
    'companies',
    'units',
    'sectors',
    'users',
    'rolePermissions',
    'categories',
    'links',
    'uploadedSchedules',
    'tags',
    'tagOnLink',
    'tagOnSchedule',
];
let BackupsService = class BackupsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async export(entities) {
        const data = {};
        for (const entity of entities) {
            switch (entity) {
                case 'companies':
                    data.companies = await this.prisma.company.findMany();
                    break;
                case 'units':
                    data.units = await this.prisma.unit.findMany();
                    break;
                case 'sectors':
                    data.sectors = await this.prisma.sector.findMany();
                    break;
                case 'users':
                    data.users = await this.prisma.user.findMany();
                    break;
                case 'rolePermissions':
                    data.rolePermissions = await this.prisma.rolePermission.findMany();
                    break;
                case 'categories':
                    data.categories = await this.prisma.category.findMany();
                    break;
                case 'links':
                    data.links = await this.prisma.link.findMany();
                    break;
                case 'uploadedSchedules':
                    data.uploadedSchedules = await this.prisma.uploadedSchedule.findMany();
                    break;
                case 'tags':
                    data.tags = await this.prisma.tag.findMany();
                    break;
                case 'tagOnLink':
                    data.tagOnLink = await this.prisma.tagOnLink.findMany();
                    break;
                case 'tagOnSchedule':
                    data.tagOnSchedule = await this.prisma.tagOnSchedule.findMany();
                    break;
                default:
                    break;
            }
        }
        return {
            meta: {
                version: 1,
                createdAt: new Date().toISOString(),
                entities,
            },
            data,
        };
    }
    async restore(payload, entities, mode = 'merge') {
        if (mode !== 'merge') {
            return { restored: {}, skipped: backups_types_1.backupEntities };
        }
        const fallbackEntities = Object.keys(payload.data || {});
        const selectedEntities = entities && entities.length
            ? entities
            : payload.meta?.entities || fallbackEntities;
        const restoreTargets = restoreOrder.filter((entity) => selectedEntities.includes(entity));
        const results = {};
        await this.prisma.$transaction(async (tx) => {
            for (const entity of restoreTargets) {
                const raw = payload.data?.[entity];
                const items = Array.isArray(raw) ? raw : [];
                switch (entity) {
                    case 'companies':
                        results.companies = await this.upsertById(tx.company, items);
                        break;
                    case 'units':
                        results.units = await this.upsertById(tx.unit, items);
                        break;
                    case 'sectors':
                        results.sectors = await this.upsertById(tx.sector, items);
                        break;
                    case 'users':
                        results.users = await this.upsertById(tx.user, items);
                        break;
                    case 'rolePermissions':
                        results.rolePermissions = await this.upsertByRole(tx.rolePermission, items);
                        break;
                    case 'categories':
                        results.categories = await this.upsertById(tx.category, items);
                        break;
                    case 'links':
                        results.links = await this.upsertById(tx.link, items);
                        break;
                    case 'uploadedSchedules':
                        results.uploadedSchedules = await this.upsertById(tx.uploadedSchedule, items);
                        break;
                    case 'tags':
                        results.tags = await this.upsertById(tx.tag, items);
                        break;
                    case 'tagOnLink':
                        results.tagOnLink = await this.upsertTagOnLink(tx, items);
                        break;
                    case 'tagOnSchedule':
                        results.tagOnSchedule = await this.upsertTagOnSchedule(tx, items);
                        break;
                    default:
                        break;
                }
            }
        });
        return { restored: results };
    }
    async upsertById(model, items) {
        let count = 0;
        for (const item of items) {
            const { id, ...data } = item;
            if (!id) {
                continue;
            }
            await model.upsert({
                where: { id },
                update: data,
                create: { id, ...data },
            });
            count += 1;
        }
        return count;
    }
    async upsertByRole(model, items) {
        let count = 0;
        for (const item of items) {
            const { role, ...data } = item;
            await model.upsert({
                where: { role },
                update: data,
                create: { role, ...data },
            });
            count += 1;
        }
        return count;
    }
    async upsertTagOnLink(tx, items) {
        let count = 0;
        for (const item of items) {
            await tx.tagOnLink.upsert({
                where: {
                    linkId_tagId: {
                        linkId: item.linkId,
                        tagId: item.tagId,
                    },
                },
                update: {},
                create: item,
            });
            count += 1;
        }
        return count;
    }
    async upsertTagOnSchedule(tx, items) {
        let count = 0;
        for (const item of items) {
            await tx.tagOnSchedule.upsert({
                where: {
                    scheduleId_tagId: {
                        scheduleId: item.scheduleId,
                        tagId: item.tagId,
                    },
                },
                update: {},
                create: item,
            });
            count += 1;
        }
        return count;
    }
};
exports.BackupsService = BackupsService;
exports.BackupsService = BackupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BackupsService);
//# sourceMappingURL=backups.service.js.map