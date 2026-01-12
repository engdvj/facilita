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
const defaultAudienceByRole = {
    [client_1.UserRole.SUPERADMIN]: client_1.ContentAudience.COMPANY,
    [client_1.UserRole.ADMIN]: client_1.ContentAudience.COMPANY,
    [client_1.UserRole.COLLABORATOR]: client_1.ContentAudience.PRIVATE,
};
const audienceOptionsByRole = {
    [client_1.UserRole.SUPERADMIN]: [
        client_1.ContentAudience.PUBLIC,
        client_1.ContentAudience.COMPANY,
        client_1.ContentAudience.SECTOR,
        client_1.ContentAudience.PRIVATE,
        client_1.ContentAudience.ADMIN,
        client_1.ContentAudience.SUPERADMIN,
    ],
    [client_1.UserRole.ADMIN]: [client_1.ContentAudience.COMPANY, client_1.ContentAudience.SECTOR],
    [client_1.UserRole.COLLABORATOR]: [client_1.ContentAudience.PRIVATE],
};
const resolveAudience = (role, payload) => {
    if (payload.audience)
        return payload.audience;
    if (payload.isPublic !== undefined) {
        return payload.isPublic
            ? client_1.ContentAudience.PUBLIC
            : defaultAudienceByRole[role];
    }
    return defaultAudienceByRole[role];
};
const isAllowedAudience = (role, audience) => {
    return audienceOptionsByRole[role]?.includes(audience);
};
const parseAudienceParam = (value) => {
    if (!value)
        return undefined;
    const candidate = value.toUpperCase();
    return Object.values(client_1.ContentAudience).includes(candidate) ? candidate : undefined;
};
let LinksController = class LinksController {
    constructor(linksService) {
        this.linksService = linksService;
    }
    create(createLinkDto, req) {
        const user = req.user;
        const isSuperAdmin = user?.role === client_1.UserRole.SUPERADMIN;
        const companyId = isSuperAdmin ? createLinkDto.companyId : user?.companyId;
        const audience = resolveAudience(user?.role, createLinkDto);
        if (!companyId) {
            throw new common_1.ForbiddenException('Empresa obrigatoria.');
        }
        if (!isSuperAdmin && createLinkDto.companyId && createLinkDto.companyId !== companyId) {
            throw new common_1.ForbiddenException('Empresa nao autorizada.');
        }
        if (!isAllowedAudience(user?.role, audience)) {
            throw new common_1.ForbiddenException('Visibilidade nao autorizada.');
        }
        if (user?.role === client_1.UserRole.COLLABORATOR &&
            createLinkDto.sectorId &&
            createLinkDto.sectorId !== user?.sectorId) {
            throw new common_1.ForbiddenException('Setor nao autorizado.');
        }
        if (audience === client_1.ContentAudience.SECTOR && !createLinkDto.sectorId) {
            throw new common_1.ForbiddenException('Setor obrigatorio para links de setor.');
        }
        return this.linksService.create({
            ...createLinkDto,
            companyId,
            sectorId: audience === client_1.ContentAudience.SECTOR
                ? createLinkDto.sectorId || undefined
                : undefined,
            userId: req.user.id,
            audience,
            isPublic: audience === client_1.ContentAudience.PUBLIC,
        });
    }
    async findAll(companyId, sectorId, categoryId, isPublic, audience) {
        const normalizedCompanyId = companyId?.trim() || undefined;
        const parsedAudience = parseAudienceParam(audience);
        const filters = {
            sectorId,
            categoryId,
            audience: parsedAudience ||
                (isPublic
                    ? isPublic === 'true'
                        ? client_1.ContentAudience.PUBLIC
                        : undefined
                    : undefined) ||
                (normalizedCompanyId ? undefined : client_1.ContentAudience.PUBLIC),
            isPublic: isPublic && isPublic === 'false'
                ? false
                : normalizedCompanyId
                    ? undefined
                    : true,
        };
        console.log('LinksController.findAll - companyId:', normalizedCompanyId, 'filters:', filters);
        const result = await this.linksService.findAll(normalizedCompanyId, filters);
        console.log('LinksController.findAll - resultado:', result.length, 'links');
        return result;
    }
    async findAllAdmin(req, companyId, sectorId, categoryId, isPublic, audience) {
        const normalizedCompanyId = companyId?.trim() || undefined;
        const isSuperAdmin = req.user?.role === client_1.UserRole.SUPERADMIN;
        const resolvedCompanyId = normalizedCompanyId || (!isSuperAdmin ? req.user?.companyId : undefined);
        if (!resolvedCompanyId && !isSuperAdmin) {
            throw new common_1.ForbiddenException('Empresa obrigatoria.');
        }
        const parsedAudience = parseAudienceParam(audience);
        const filters = {
            sectorId,
            categoryId,
            audience: parsedAudience,
            isPublic: isPublic ? isPublic === 'true' : undefined,
            includeInactive: true,
        };
        const result = await this.linksService.findAll(resolvedCompanyId, filters);
        console.log('LinksController.findAllAdmin - resultado:', result.length, 'links');
        return result;
    }
    async findAllAdminAlias(req, companyId, sectorId, categoryId, isPublic, audience) {
        return this.findAllAdmin(req, companyId, sectorId, categoryId, isPublic, audience);
    }
    findOne(id) {
        return this.linksService.findOne(id);
    }
    update(id, updateLinkDto, req) {
        return this.linksService.update(id, updateLinkDto, {
            id: req.user.id,
            role: req.user.role,
            companyId: req.user.companyId,
        });
    }
    remove(id, req) {
        return this.linksService.remove(id, {
            id: req.user.id,
            role: req.user.role,
            companyId: req.user.companyId,
        });
    }
    restore(id) {
        return this.linksService.restore(id);
    }
};
exports.LinksController = LinksController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN, client_1.UserRole.COLLABORATOR),
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
    __param(4, (0, common_1.Query)('audience')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], LinksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('admin/list'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('sectorId')),
    __param(3, (0, common_1.Query)('categoryId')),
    __param(4, (0, common_1.Query)('isPublic')),
    __param(5, (0, common_1.Query)('audience')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], LinksController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('sectorId')),
    __param(3, (0, common_1.Query)('categoryId')),
    __param(4, (0, common_1.Query)('isPublic')),
    __param(5, (0, common_1.Query)('audience')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], LinksController.prototype, "findAllAdminAlias", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LinksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN, client_1.UserRole.COLLABORATOR),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_link_dto_1.UpdateLinkDto, Object]),
    __metadata("design:returntype", void 0)
], LinksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN, client_1.UserRole.COLLABORATOR),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LinksController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LinksController.prototype, "restore", null);
exports.LinksController = LinksController = __decorate([
    (0, common_1.Controller)('links'),
    __metadata("design:paramtypes", [links_service_1.LinksService])
], LinksController);
//# sourceMappingURL=links.controller.js.map