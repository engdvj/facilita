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
exports.LinksController = void 0;
const common_1 = require("@nestjs/common");
const links_service_1 = require("./links.service");
const create_link_dto_1 = require("./dto/create-link.dto");
const update_link_dto_1 = require("./dto/update-link.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/guards/roles.decorator");
const client_1 = require("@prisma/client");
let LinksController = class LinksController {
    constructor(linksService) {
        this.linksService = linksService;
    }
    create(createLinkDto, req) {
        return this.linksService.create({
            ...createLinkDto,
            userId: req.user.id,
        });
    }
    async findAll(companyId, sectorId, categoryId, isPublic) {
        const normalizedCompanyId = companyId?.trim() || undefined;
        const filters = {
            sectorId,
            categoryId,
            isPublic: isPublic ? isPublic === 'true' : normalizedCompanyId ? undefined : true,
        };
        console.log('LinksController.findAll - companyId:', normalizedCompanyId, 'filters:', filters);
        const result = await this.linksService.findAll(normalizedCompanyId, filters);
        console.log('LinksController.findAll - resultado:', result.length, 'links');
        return result;
    }
    findOne(id) {
        return this.linksService.findOne(id);
    }
    update(id, updateLinkDto, req) {
        return this.linksService.update(id, updateLinkDto, req.user.id);
    }
    remove(id) {
        return this.linksService.remove(id);
    }
    restore(id) {
        return this.linksService.restore(id);
    }
};
exports.LinksController = LinksController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN, client_1.UserRole.COORDINATOR, client_1.UserRole.MANAGER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_link_dto_1.CreateLinkDto, Object]),
    __metadata("design:returntype", void 0)
], LinksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('sectorId')),
    __param(2, (0, common_1.Query)('categoryId')),
    __param(3, (0, common_1.Query)('isPublic')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], LinksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LinksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN, client_1.UserRole.COORDINATOR, client_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_link_dto_1.UpdateLinkDto, Object]),
    __metadata("design:returntype", void 0)
], LinksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN, client_1.UserRole.COORDINATOR, client_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LinksController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LinksController.prototype, "restore", null);
exports.LinksController = LinksController = __decorate([
    (0, common_1.Controller)('links'),
    __metadata("design:paramtypes", [links_service_1.LinksService])
], LinksController);
//# sourceMappingURL=links.controller.js.map