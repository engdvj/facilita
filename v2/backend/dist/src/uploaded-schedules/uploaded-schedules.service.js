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
exports.UploadedSchedulesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let UploadedSchedulesService = class UploadedSchedulesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createScheduleDto) {
        return this.prisma.uploadedSchedule.create({
            data: createScheduleDto,
            include: {
                category: true,
                sector: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async findAll(companyId, filters) {
        return this.prisma.uploadedSchedule.findMany({
            where: {
                companyId,
                status: client_1.EntityStatus.ACTIVE,
                deletedAt: null,
                ...(filters?.sectorId && { sectorId: filters.sectorId }),
                ...(filters?.categoryId && { categoryId: filters.categoryId }),
                ...(filters?.isPublic !== undefined && { isPublic: filters.isPublic }),
            },
            include: {
                category: true,
                sector: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        const schedule = await this.prisma.uploadedSchedule.findUnique({
            where: { id },
            include: {
                category: true,
                sector: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });
        if (!schedule || schedule.deletedAt) {
            throw new common_1.NotFoundException(`Schedule with ID ${id} not found`);
        }
        return schedule;
    }
    async update(id, updateScheduleDto) {
        await this.findOne(id);
        return this.prisma.uploadedSchedule.update({
            where: { id },
            data: updateScheduleDto,
            include: {
                category: true,
                sector: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.uploadedSchedule.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: client_1.EntityStatus.INACTIVE,
            },
        });
    }
    async restore(id) {
        const schedule = await this.prisma.uploadedSchedule.findUnique({
            where: { id },
        });
        if (!schedule) {
            throw new common_1.NotFoundException(`Schedule with ID ${id} not found`);
        }
        return this.prisma.uploadedSchedule.update({
            where: { id },
            data: {
                deletedAt: null,
                status: client_1.EntityStatus.ACTIVE,
            },
        });
    }
};
exports.UploadedSchedulesService = UploadedSchedulesService;
exports.UploadedSchedulesService = UploadedSchedulesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UploadedSchedulesService);
//# sourceMappingURL=uploaded-schedules.service.js.map