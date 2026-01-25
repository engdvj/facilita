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
exports.CompaniesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let CompaniesService = class CompaniesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(options) {
        const search = options?.search?.trim();
        const where = {
            ...(options?.excludeInternal
                ? {
                    NOT: {
                        name: 'ADM',
                    },
                }
                : {}),
            ...(search
                ? {
                    OR: [
                        { name: { contains: search, mode: client_1.Prisma.QueryMode.insensitive } },
                        { cnpj: { contains: search, mode: client_1.Prisma.QueryMode.insensitive } },
                    ],
                }
                : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.company.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                ...(options?.skip !== undefined ? { skip: options.skip } : {}),
                ...(options?.take !== undefined ? { take: options.take } : {}),
            }),
            this.prisma.company.count({ where }),
        ]);
        return { items, total };
    }
    async findById(id) {
        const company = await this.prisma.company.findUnique({ where: { id } });
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        return company;
    }
    create(data) {
        return this.prisma.company.create({
            data: {
                name: data.name,
                cnpj: data.cnpj,
                logoUrl: data.logoUrl,
                status: data.status,
            },
        });
    }
    async update(id, data) {
        await this.findById(id);
        return this.prisma.company.update({
            where: { id },
            data,
        });
    }
    async getDependencies(id) {
        const [units, sectors, users, categories, links, schedules, notes, uploadedImages,] = await Promise.all([
            this.prisma.unit.count({ where: { companyId: id } }),
            this.prisma.sector.count({ where: { companyId: id } }),
            this.prisma.user.count({ where: { companyId: id } }),
            this.prisma.category.count({ where: { companyId: id } }),
            this.prisma.link.count({ where: { companyId: id } }),
            this.prisma.uploadedSchedule.count({ where: { companyId: id } }),
            this.prisma.note.count({ where: { companyId: id } }),
            this.prisma.uploadedImage.count({ where: { companyId: id } }),
        ]);
        return {
            units,
            sectors,
            users,
            categories,
            links,
            schedules,
            notes,
            uploadedImages,
            hasAny: units > 0 ||
                sectors > 0 ||
                users > 0 ||
                categories > 0 ||
                links > 0 ||
                schedules > 0 ||
                notes > 0 ||
                uploadedImages > 0,
        };
    }
    async remove(id) {
        await this.findById(id);
        return this.prisma.$transaction(async (tx) => {
            await tx.favorite.deleteMany({
                where: {
                    OR: [
                        { link: { companyId: id } },
                        { schedule: { companyId: id } },
                        { note: { companyId: id } },
                    ],
                },
            });
            await tx.linkVersion.deleteMany({
                where: { link: { companyId: id } },
            });
            await tx.link.deleteMany({ where: { companyId: id } });
            await tx.uploadedSchedule.deleteMany({ where: { companyId: id } });
            await tx.note.deleteMany({ where: { companyId: id } });
            await tx.uploadedImage.deleteMany({ where: { companyId: id } });
            await tx.category.deleteMany({ where: { companyId: id } });
            await tx.refreshToken.deleteMany({
                where: { user: { companyId: id } },
            });
            await tx.favorite.deleteMany({
                where: { user: { companyId: id } },
            });
            await tx.user.deleteMany({ where: { companyId: id } });
            await tx.sector.deleteMany({ where: { companyId: id } });
            await tx.unit.deleteMany({ where: { companyId: id } });
            return tx.company.delete({ where: { id } });
        });
    }
};
exports.CompaniesService = CompaniesService;
exports.CompaniesService = CompaniesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompaniesService);
//# sourceMappingURL=companies.service.js.map