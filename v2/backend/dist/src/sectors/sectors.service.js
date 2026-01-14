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
exports.SectorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SectorsService = class SectorsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.sector.findMany({
            orderBy: { createdAt: 'desc' },
            include: { company: true, unit: true },
        });
    }
    async findById(id) {
        const sector = await this.prisma.sector.findUnique({
            where: { id },
            include: { company: true, unit: true },
        });
        if (!sector) {
            throw new common_1.NotFoundException('Sector not found');
        }
        return sector;
    }
    create(data) {
        return this.prisma.sector.create({
            data: {
                companyId: data.companyId,
                unitId: data.unitId,
                name: data.name,
                description: data.description,
                status: data.status,
            },
            include: { company: true, unit: true },
        });
    }
    async update(id, data) {
        await this.findById(id);
        return this.prisma.sector.update({
            where: { id },
            data,
            include: { company: true, unit: true },
        });
    }
    async getDependencies(id) {
        const [users, links, schedules, notes] = await Promise.all([
            this.prisma.user.count({ where: { sectorId: id } }),
            this.prisma.link.count({ where: { sectorId: id } }),
            this.prisma.uploadedSchedule.count({ where: { sectorId: id } }),
            this.prisma.note.count({ where: { sectorId: id } }),
        ]);
        return {
            users,
            links,
            schedules,
            notes,
            hasAny: users > 0 || links > 0 || schedules > 0 || notes > 0,
        };
    }
    async remove(id) {
        await this.findById(id);
        return this.prisma.$transaction(async (tx) => {
            await tx.user.updateMany({
                data: { sectorId: null },
                where: { sectorId: id },
            });
            await tx.link.updateMany({
                data: { sectorId: null },
                where: { sectorId: id },
            });
            await tx.uploadedSchedule.updateMany({
                data: { sectorId: null },
                where: { sectorId: id },
            });
            await tx.note.updateMany({
                data: { sectorId: null },
                where: { sectorId: id },
            });
            return tx.sector.delete({
                where: { id },
                include: { company: true, unit: true },
            });
        });
    }
};
exports.SectorsService = SectorsService;
exports.SectorsService = SectorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SectorsService);
//# sourceMappingURL=sectors.service.js.map