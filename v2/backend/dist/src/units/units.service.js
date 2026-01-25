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
exports.UnitsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let UnitsService = class UnitsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(options) {
        const search = options?.search?.trim();
        const where = {
            ...(options?.companyId ? { companyId: options.companyId } : {}),
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
            this.prisma.unit.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: { company: true },
                ...(options?.skip !== undefined ? { skip: options.skip } : {}),
                ...(options?.take !== undefined ? { take: options.take } : {}),
            }),
            this.prisma.unit.count({ where }),
        ]);
        return { items, total };
    }
    async findById(id) {
        const unit = await this.prisma.unit.findUnique({
            where: { id },
            include: { company: true },
        });
        if (!unit) {
            throw new common_1.NotFoundException('Unit not found');
        }
        return unit;
    }
    create(data) {
        return this.prisma.unit.create({
            data: {
                companyId: data.companyId,
                name: data.name,
                cnpj: data.cnpj,
                status: data.status,
            },
            include: { company: true },
        });
    }
    async update(id, data) {
        await this.findById(id);
        return this.prisma.unit.update({
            where: { id },
            data,
            include: { company: true },
        });
    }
    async getDependencies(id) {
        const [sectors, users] = await Promise.all([
            this.prisma.sectorUnit.count({ where: { unitId: id } }),
            this.prisma.userSector.count({
                where: {
                    sector: {
                        sectorUnits: {
                            some: { unitId: id },
                        },
                    },
                },
            }),
        ]);
        return {
            sectors,
            users,
            hasAny: sectors > 0 || users > 0,
        };
    }
    async remove(id) {
        await this.findById(id);
        return this.prisma.$transaction(async (tx) => {
            const sectorUnits = await tx.sectorUnit.findMany({
                where: { unitId: id },
                select: { sectorId: true },
            });
            const sectorIds = sectorUnits.map((su) => su.sectorId);
            if (sectorIds.length > 0) {
                await tx.link.updateMany({
                    data: { sectorId: null },
                    where: { sectorId: { in: sectorIds } },
                });
                await tx.uploadedSchedule.updateMany({
                    data: { sectorId: null },
                    where: { sectorId: { in: sectorIds } },
                });
                await tx.note.updateMany({
                    data: { sectorId: null },
                    where: { sectorId: { in: sectorIds } },
                });
            }
            await tx.sectorUnit.deleteMany({ where: { unitId: id } });
            return tx.unit.delete({
                where: { id },
                include: { company: true },
            });
        });
    }
};
exports.UnitsService = UnitsService;
exports.UnitsService = UnitsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UnitsService);
//# sourceMappingURL=units.service.js.map