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
const client_1 = require("@prisma/client");
let CategoriesService = class CategoriesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCategoryDto) {
        return this.prisma.category.create({
            data: createCategoryDto,
        });
    }
    async findAll(companyId, includeInactive = false) {
        return this.prisma.category.findMany({
            where: {
                ...(includeInactive ? {} : { status: client_1.EntityStatus.ACTIVE }),
                ...(companyId ? { companyId } : {}),
            },
            include: {
                _count: {
                    select: {
                        links: {
                            where: {
                                status: client_1.EntityStatus.ACTIVE,
                                deletedAt: null,
                            },
                        },
                        schedules: {
                            where: {
                                status: client_1.EntityStatus.ACTIVE,
                                deletedAt: null,
                            },
                        },
                        notes: {
                            where: {
                                status: client_1.EntityStatus.ACTIVE,
                                deletedAt: null,
                            },
                        },
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
    }
    async findOne(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        links: {
                            where: {
                                status: client_1.EntityStatus.ACTIVE,
                                deletedAt: null,
                            },
                        },
                        schedules: {
                            where: {
                                status: client_1.EntityStatus.ACTIVE,
                                deletedAt: null,
                            },
                        },
                        notes: {
                            where: {
                                status: client_1.EntityStatus.ACTIVE,
                                deletedAt: null,
                            },
                        },
                    },
                },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }
    async update(id, updateCategoryDto) {
        const category = await this.findOne(id);
        if (updateCategoryDto.status === client_1.EntityStatus.INACTIVE) {
            console.log(`Inativando categoria ${category.name} (${id}) - desassociando itens...`);
            const [linksUpdated, schedulesUpdated, notesUpdated] = await this.prisma.$transaction([
                this.prisma.link.updateMany({
                    where: { categoryId: id },
                    data: { categoryId: null },
                }),
                this.prisma.uploadedSchedule.updateMany({
                    where: { categoryId: id },
                    data: { categoryId: null },
                }),
                this.prisma.note.updateMany({
                    where: { categoryId: id },
                    data: { categoryId: null },
                }),
            ]);
            console.log(`Desassociados: ${linksUpdated.count} links, ${schedulesUpdated.count} documentos, ${notesUpdated.count} notas`);
            await this.prisma.category.update({
                where: { id },
                data: updateCategoryDto,
            });
            return this.findOne(id);
        }
        return this.prisma.category.update({
            where: { id },
            data: updateCategoryDto,
        });
    }
    async remove(id) {
        const category = await this.findOne(id);
        console.log(`Removendo categoria ${category.name} (${id}) - desassociando e excluindo...`);
        await this.prisma.$transaction([
            this.prisma.link.updateMany({
                where: { categoryId: id },
                data: { categoryId: null },
            }),
            this.prisma.uploadedSchedule.updateMany({
                where: { categoryId: id },
                data: { categoryId: null },
            }),
            this.prisma.note.updateMany({
                where: { categoryId: id },
                data: { categoryId: null },
            }),
            this.prisma.category.delete({
                where: { id },
            }),
        ]);
        console.log(`Categoria ${category.name} removida com sucesso`);
        return category;
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map