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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(options) {
        return this.prisma.category.findMany({
            where: {
                ...(options.ownerId ? { ownerId: options.ownerId } : {}),
                ...(options.includeInactive ? {} : { status: 'ACTIVE' }),
            },
            include: {
                _count: {
                    select: {
                        links: true,
                        schedules: true,
                        notes: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        links: true,
                        schedules: true,
                        notes: true,
                    },
                },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async create(ownerId, data) {
        return this.prisma.category.create({
            data: {
                ownerId,
                name: data.name,
                color: data.color,
                icon: data.icon,
                adminOnly: data.adminOnly ?? false,
                status: data.status ?? 'ACTIVE',
            },
            include: {
                _count: {
                    select: {
                        links: true,
                        schedules: true,
                        notes: true,
                    },
                },
            },
        });
    }
    async update(id, actor, data) {
        const category = await this.findOne(id);
        if (actor.role !== 'SUPERADMIN' && category.ownerId !== actor.id) {
            throw new common_1.ForbiddenException('Category not authorized');
        }
        return this.prisma.category.update({
            where: { id },
            data,
            include: {
                _count: {
                    select: {
                        links: true,
                        schedules: true,
                        notes: true,
                    },
                },
            },
        });
    }
    async remove(id, actor) {
        const category = await this.findOne(id);
        if (actor.role !== 'SUPERADMIN' && category.ownerId !== actor.id) {
            throw new common_1.ForbiddenException('Category not authorized');
        }
        return this.prisma.category.delete({
            where: { id },
        });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map