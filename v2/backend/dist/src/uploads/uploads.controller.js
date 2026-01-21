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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const uploads_service_1 = require("./uploads.service");
const multer_config_1 = require("./config/multer.config");
const file_type_filter_1 = require("./filters/file-type.filter");
const query_images_dto_1 = require("./dto/query-images.dto");
const update_image_dto_1 = require("./dto/update-image.dto");
const app_mode_1 = require("../common/app-mode");
let UploadsController = class UploadsController {
    constructor(uploadsService) {
        this.uploadsService = uploadsService;
    }
    async uploadImage(file, req, companyIdParam) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const isCompanySuperAdmin = req.user.role === 'SUPERADMIN' && (0, app_mode_1.isCompanyMode)();
        const isUserSuperAdmin = req.user.role === 'SUPERADMIN' && (0, app_mode_1.isUserMode)();
        const companyId = (0, app_mode_1.isUserMode)()
            ? (isUserSuperAdmin && companyIdParam ? companyIdParam : req.user.id)
            : isCompanySuperAdmin && companyIdParam
                ? companyIdParam
                : req.user.companyId;
        const url = this.uploadsService.getFileUrl(file.filename, 'images');
        const image = await this.uploadsService.createImageRecord({
            companyId,
            uploadedBy: req.user.id,
            filename: file.filename,
            originalName: file.originalname,
            url,
            mimeType: file.mimetype,
            size: file.size,
        });
        return image;
    }
    async listImages(query, req) {
        if (!query.companyId) {
            query.companyId = (0, app_mode_1.isUserMode)() ? req.user.id : req.user.companyId;
        }
        return this.uploadsService.listImages(query);
    }
    async getImage(id) {
        return this.uploadsService.getImageById(id);
    }
    async updateImage(id, dto) {
        return this.uploadsService.updateImage(id, dto);
    }
    async deleteImage(id) {
        return this.uploadsService.deleteImage(id);
    }
    uploadDocument(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        return {
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            url: this.uploadsService.getFileUrl(file.filename, 'documents'),
        };
    }
};
exports.UploadsController = UploadsController;
__decorate([
    (0, common_1.Post)('image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        ...multer_config_1.imageMulterConfig,
        fileFilter: file_type_filter_1.imageFileFilter,
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Get)('images'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_images_dto_1.QueryImagesDto, Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "listImages", null);
__decorate([
    (0, common_1.Get)('images/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "getImage", null);
__decorate([
    (0, common_1.Patch)('images/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_image_dto_1.UpdateImageDto]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "updateImage", null);
__decorate([
    (0, common_1.Delete)('images/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "deleteImage", null);
__decorate([
    (0, common_1.Post)('document'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        ...multer_config_1.documentMulterConfig,
        fileFilter: file_type_filter_1.documentFileFilter,
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UploadsController.prototype, "uploadDocument", null);
exports.UploadsController = UploadsController = __decorate([
    (0, common_1.Controller)('uploads'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [uploads_service_1.UploadsService])
], UploadsController);
//# sourceMappingURL=uploads.controller.js.map