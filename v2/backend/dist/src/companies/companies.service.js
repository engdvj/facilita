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
const prisma_service_1 = require("../prisma/prisma.service");
let CompaniesService = class CompaniesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(options) {
        return this.prisma.company.findMany({
            ...(options?.excludeInternal
                ? {
                    where: {
                        NOT: {
                            name: 'ADM',
                        },
                    },
                }
                : {}),
            orderBy: { createdAt: 'desc' },
        });
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
    async remove(id) {
        await this.findById(id);
        return this.prisma.company.delete({ where: { id } });
    }
};
exports.CompaniesService = CompaniesService;
exports.CompaniesService = CompaniesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompaniesService);
//# sourceMappingURL=companies.service.js.map