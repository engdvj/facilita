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
exports.NotesController = void 0;
const common_1 = require("@nestjs/common");
const notes_service_1 = require("./notes.service");
const create_note_dto_1 = require("./dto/create-note.dto");
const update_note_dto_1 = require("./dto/update-note.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const optional_jwt_auth_guard_1 = require("../auth/guards/optional-jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/guards/roles.decorator");
const client_1 = require("@prisma/client");
const permissions_service_1 = require("../permissions/permissions.service");
const pagination_1 = require("../common/utils/pagination");
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
    return Object.values(client_1.ContentAudience).includes(candidate)
        ? candidate
        : undefined;
};
let NotesController = class NotesController {
    constructor(notesService, permissionsService) {
        this.notesService = notesService;
        this.permissionsService = permissionsService;
    }
    async create(createNoteDto, req) {
        const user = req.user;
        const isSuperAdmin = user?.role === client_1.UserRole.SUPERADMIN;
        const companyId = isSuperAdmin ? createNoteDto.companyId : user?.companyId;
        const audience = resolveAudience(user?.role, createNoteDto);
        if (!companyId) {
            throw new common_1.ForbiddenException('Empresa obrigatoria.');
        }
        if (!isSuperAdmin && createNoteDto.companyId && createNoteDto.companyId !== companyId) {
            throw new common_1.ForbiddenException('Empresa nao autorizada.');
        }
        if (!isAllowedAudience(user?.role, audience)) {
            throw new common_1.ForbiddenException('Visibilidade nao autorizada.');
        }
        if (user?.role === client_1.UserRole.COLLABORATOR &&
            createNoteDto.sectorId &&
            !(await this.notesService.userHasSector(user.id, createNoteDto.sectorId))) {
            throw new common_1.ForbiddenException('Setor nao autorizado.');
        }
        if (audience === client_1.ContentAudience.SECTOR && !createNoteDto.sectorId) {
            throw new common_1.ForbiddenException('Setor obrigatorio para notas de setor.');
        }
        return this.notesService.create({
            ...createNoteDto,
            companyId,
            sectorId: audience === client_1.ContentAudience.SECTOR
                ? createNoteDto.sectorId || undefined
                : undefined,
            unitId: audience === client_1.ContentAudience.SECTOR
                ? createNoteDto.unitId ?? undefined
                : undefined,
            unitIds: audience === client_1.ContentAudience.SECTOR
                ? createNoteDto.unitIds ?? undefined
                : undefined,
            userId: req.user.id,
            audience,
            isPublic: audience === client_1.ContentAudience.PUBLIC,
        });
    }
    async findAll(companyId, sectorId, unitId, categoryId, isPublic, audience, req) {
        const normalizedCompanyId = companyId?.trim() || undefined;
        const parsedAudience = parseAudienceParam(audience);
        const filters = {
            sectorId,
            unitId,
            categoryId,
            audience: parsedAudience || (isPublic === 'true' ? client_1.ContentAudience.PUBLIC : undefined),
            isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
        };
        const { id, canViewPrivate } = await this.getAccessContext(req?.user);
        return this.notesService.findAll(normalizedCompanyId, filters, {
            id,
            canViewPrivate,
        });
    }
    async findAllAdmin(req, companyId, sectorId, unitId, categoryId, isPublic, audience, search, page, pageSize, res) {
        const normalizedCompanyId = companyId?.trim() || undefined;
        const isSuperAdmin = req.user?.role === client_1.UserRole.SUPERADMIN;
        const resolvedCompanyId = normalizedCompanyId || (!isSuperAdmin ? req.user?.companyId : undefined);
        if (!resolvedCompanyId && !isSuperAdmin) {
            throw new common_1.ForbiddenException('Empresa obrigatoria.');
        }
        const parsedAudience = parseAudienceParam(audience);
        const filters = {
            sectorId,
            unitId,
            categoryId,
            audience: parsedAudience,
            isPublic: isPublic ? isPublic === 'true' : undefined,
            includeInactive: true,
        };
        const { id, canViewPrivate } = await this.getAccessContext(req.user);
        const pagination = (0, pagination_1.parsePagination)(page, pageSize, {
            defaultPageSize: 12,
        });
        const { items, total } = await this.notesService.findAllPaginated(resolvedCompanyId, { ...filters, search }, { id, canViewPrivate }, pagination.shouldPaginate
            ? { skip: pagination.skip, take: pagination.take }
            : undefined);
        if (pagination.shouldPaginate && res) {
            res.setHeader('X-Total-Count', total.toString());
        }
        return items;
    }
    async findAllAdminAlias(req, companyId, sectorId, unitId, categoryId, isPublic, audience, search, page, pageSize, res) {
        return this.findAllAdmin(req, companyId, sectorId, unitId, categoryId, isPublic, audience, search, page, pageSize, res);
    }
    async findOne(id, req) {
        const { id: userId, canViewPrivate } = await this.getAccessContext(req?.user);
        return this.notesService.findOne(id, { id: userId, canViewPrivate });
    }
    async update(id, updateNoteDto, req) {
        const actor = await this.getAccessContext(req.user);
        return this.notesService.update(id, updateNoteDto, actor);
    }
    async remove(id, body, req) {
        const actor = await this.getAccessContext(req.user);
        return this.notesService.remove(id, actor, body?.adminMessage);
    }
    async restore(id, req) {
        const actor = await this.getAccessContext(req.user);
        return this.notesService.restore(id, actor);
    }
    async activate(id, req) {
        const actor = await this.getAccessContext(req.user);
        return this.notesService.activate(id, actor);
    }
    async deactivate(id, req) {
        const actor = await this.getAccessContext(req.user);
        return this.notesService.deactivate(id, actor);
    }
    async getAccessContext(user) {
        if (!user) {
            return {
                id: undefined,
                role: undefined,
                companyId: undefined,
                canViewPrivate: false,
            };
        }
        const canViewPrivate = await this.permissionsService.hasPermissions(user.role, ['canViewPrivateContent']);
        return {
            id: user.id,
            role: user.role,
            companyId: user.companyId,
            canViewPrivate,
        };
    }
};
exports.NotesController = NotesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN, client_1.UserRole.COLLABORATOR),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_note_dto_1.CreateNoteDto, Object]),
    __metadata("design:returntype", Promise)
], NotesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('sectorId')),
    __param(2, (0, common_1.Query)('unitId')),
    __param(3, (0, common_1.Query)('categoryId')),
    __param(4, (0, common_1.Query)('isPublic')),
    __param(5, (0, common_1.Query)('audience')),
    __param(6, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], NotesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('admin/list'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('sectorId')),
    __param(3, (0, common_1.Query)('unitId')),
    __param(4, (0, common_1.Query)('categoryId')),
    __param(5, (0, common_1.Query)('isPublic')),
    __param(6, (0, common_1.Query)('audience')),
    __param(7, (0, common_1.Query)('search')),
    __param(8, (0, common_1.Query)('page')),
    __param(9, (0, common_1.Query)('pageSize')),
    __param(10, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], NotesController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('sectorId')),
    __param(3, (0, common_1.Query)('unitId')),
    __param(4, (0, common_1.Query)('categoryId')),
    __param(5, (0, common_1.Query)('isPublic')),
    __param(6, (0, common_1.Query)('audience')),
    __param(7, (0, common_1.Query)('search')),
    __param(8, (0, common_1.Query)('page')),
    __param(9, (0, common_1.Query)('pageSize')),
    __param(10, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], NotesController.prototype, "findAllAdminAlias", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN, client_1.UserRole.COLLABORATOR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_note_dto_1.UpdateNoteDto, Object]),
    __metadata("design:returntype", Promise)
], NotesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN, client_1.UserRole.COLLABORATOR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], NotesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotesController.prototype, "restore", null);
__decorate([
    (0, common_1.Post)(':id/activate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotesController.prototype, "activate", null);
__decorate([
    (0, common_1.Post)(':id/deactivate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotesController.prototype, "deactivate", null);
exports.NotesController = NotesController = __decorate([
    (0, common_1.Controller)('notes'),
    __metadata("design:paramtypes", [notes_service_1.NotesService,
        permissions_service_1.PermissionsService])
], NotesController);
//# sourceMappingURL=notes.controller.js.map