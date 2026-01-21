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
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const system_config_store_1 = require("../system-config/system-config.store");
const prisma_service_1 = require("../prisma/prisma.service");
const resolveUploadRoot = () => {
    const configured = system_config_store_1.systemConfigStore.getString('upload_directory', 'uploads');
    const value = configured.trim() || 'uploads';
    return (0, path_1.isAbsolute)(value) ? value : (0, path_1.resolve)(process.cwd(), value);
};
const resolveUploadPath = (filePath) => {
    if ((0, path_1.isAbsolute)(filePath)) {
        return filePath;
    }
    const trimmed = filePath.replace(/^[/\\]+/, '');
    const root = resolveUploadRoot();
    if (trimmed.startsWith('uploads/')) {
        return (0, path_1.resolve)(root, trimmed.slice('uploads/'.length));
    }
    return (0, path_1.resolve)(root, trimmed);
};
let UploadsService = class UploadsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async deleteFile(filePath) {
        try {
            const fullPath = resolveUploadPath(filePath);
            await (0, promises_1.unlink)(fullPath);
        }
        catch (error) {
            console.error('Error deleting file:', error);
        }
    }
    getFileUrl(filename, type = 'documents') {
        return `/uploads/${type}/${filename}`;
    }
    async createImageRecord(dto) {
        return this.prisma.uploadedImage.create({
            data: {
                companyId: dto.companyId,
                uploadedBy: dto.uploadedBy,
                filename: dto.filename,
                originalName: dto.originalName,
                url: dto.url,
                mimeType: dto.mimeType,
                size: dto.size,
                width: dto.width,
                height: dto.height,
                alt: dto.alt,
                tags: dto.tags || [],
                status: dto.status || 'ACTIVE',
            },
        });
    }
    async listImages(query) {
        const { companyId, uploadedBy, search, tags, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        const where = {
            status: 'ACTIVE',
            deletedAt: null,
        };
        if (companyId) {
            where.companyId = companyId;
        }
        if (uploadedBy) {
            where.uploadedBy = uploadedBy;
        }
        if (search) {
            where.OR = [
                { originalName: { contains: search, mode: 'insensitive' } },
                { filename: { contains: search, mode: 'insensitive' } },
                { alt: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (tags && tags.length > 0) {
            where.tags = { hasSome: tags };
        }
        const [data, total] = await Promise.all([
            this.prisma.uploadedImage.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatarUrl: true,
                        },
                    },
                },
            }),
            this.prisma.uploadedImage.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getImageById(id) {
        const image = await this.prisma.uploadedImage.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        if (!image) {
            throw new common_1.NotFoundException('Imagem não encontrada');
        }
        const usageCount = await this.getImageUsageCount(image.url);
        return {
            ...image,
            usageCount,
        };
    }
    async updateImage(id, dto) {
        const image = await this.prisma.uploadedImage.findUnique({
            where: { id },
        });
        if (!image) {
            throw new common_1.NotFoundException('Imagem não encontrada');
        }
        return this.prisma.uploadedImage.update({
            where: { id },
            data: {
                alt: dto.alt,
                tags: dto.tags,
            },
        });
    }
    async deleteImage(id) {
        const image = await this.prisma.uploadedImage.findUnique({
            where: { id },
        });
        if (!image) {
            throw new common_1.NotFoundException('Imagem não encontrada');
        }
        const canDelete = await this.canDeleteImage(image.url);
        if (!canDelete) {
            const usageCount = await this.getImageUsageCount(image.url);
            throw new common_1.ConflictException(`Não é possível deletar esta imagem. Ela está sendo usada em ${usageCount} lugar(es).`);
        }
        await this.prisma.uploadedImage.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        await this.deleteFile(image.url);
        return { message: 'Imagem deletada com sucesso' };
    }
    async getImageUsageCount(imageUrl) {
        const [notesCount, linksCount, schedulesCount] = await Promise.all([
            this.prisma.note.count({
                where: {
                    imageUrl,
                    deletedAt: null,
                },
            }),
            this.prisma.link.count({
                where: {
                    imageUrl,
                    deletedAt: null,
                },
            }),
            this.prisma.uploadedSchedule.count({
                where: {
                    imageUrl,
                    deletedAt: null,
                },
            }),
        ]);
        return notesCount + linksCount + schedulesCount;
    }
    async canDeleteImage(imageUrl) {
        const count = await this.getImageUsageCount(imageUrl);
        return count === 0;
    }
};
exports.UploadsService = UploadsService;
exports.UploadsService = UploadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UploadsService);
//# sourceMappingURL=uploads.service.js.map