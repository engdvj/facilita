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
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const optional_jwt_auth_guard_1 = require("../auth/guards/optional-jwt-auth.guard");
const roles_decorator_1 = require("../auth/guards/roles.decorator");
const roles_guard_1 = require("../auth/guards/roles.guard");
const pagination_1 = require("../common/utils/pagination");
const create_note_dto_1 = require("./dto/create-note.dto");
const update_note_dto_1 = require("./dto/update-note.dto");
const notes_service_1 = require("./notes.service");
let NotesController = class NotesController {
    constructor(notesService) {
        this.notesService = notesService;
    }
    create(dto, req) {
        return this.notesService.create(req.user, dto);
    }
    findAll(req, categoryId, search) {
        return this.notesService.findAll(req?.user, { categoryId, search });
    }
    async findAllAdmin(req, categoryId, search, includeInactive, page, pageSize, res) {
        if (req.user?.role !== client_1.UserRole.SUPERADMIN) {
            throw new common_1.ForbiddenException('Only superadmin can access this route');
        }
        const pagination = (0, pagination_1.parsePagination)(page, pageSize, {
            defaultPageSize: 12,
        });
        const { items, total } = await this.notesService.findAllPaginated({
            categoryId,
            search,
            includeInactive: includeInactive === 'true',
        }, pagination.shouldPaginate
            ? { skip: pagination.skip, take: pagination.take }
            : undefined);
        if (pagination.shouldPaginate && res) {
            res.setHeader('X-Total-Count', total.toString());
        }
        return items;
    }
    findAllAdminAlias(req, categoryId, search, includeInactive, page, pageSize, res) {
        return this.findAllAdmin(req, categoryId, search, includeInactive, page, pageSize, res);
    }
    findOne(id, req) {
        return this.notesService.findOne(id, req?.user);
    }
    update(id, dto, req) {
        return this.notesService.update(id, req.user, dto);
    }
    remove(id, req) {
        return this.notesService.remove(id, req.user);
    }
    restore(id, req) {
        return this.notesService.restore(id, req.user);
    }
    activate(id, req) {
        return this.notesService.activate(id, req.user);
    }
    deactivate(id, req) {
        return this.notesService.deactivate(id, req.user);
    }
};
exports.NotesController = NotesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERADMIN, client_1.UserRole.USER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_note_dto_1.CreateNoteDto, Object]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('admin/list'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('includeInactive')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('pageSize')),
    __param(6, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], NotesController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('includeInactive')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('pageSize')),
    __param(6, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "findAllAdminAlias", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERADMIN, client_1.UserRole.USER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_note_dto_1.UpdateNoteDto, Object]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERADMIN, client_1.UserRole.USER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERADMIN, client_1.UserRole.USER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "restore", null);
__decorate([
    (0, common_1.Post)(':id/activate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERADMIN, client_1.UserRole.USER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "activate", null);
__decorate([
    (0, common_1.Post)(':id/deactivate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERADMIN, client_1.UserRole.USER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NotesController.prototype, "deactivate", null);
exports.NotesController = NotesController = __decorate([
    (0, common_1.Controller)('notes'),
    __metadata("design:paramtypes", [notes_service_1.NotesService])
], NotesController);
//# sourceMappingURL=notes.controller.js.map