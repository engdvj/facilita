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
exports.UploadedSchedulesController = void 0;
const common_1 = require("@nestjs/common");
const uploaded_schedules_service_1 = require("./uploaded-schedules.service");
const create_schedule_dto_1 = require("./dto/create-schedule.dto");
const update_schedule_dto_1 = require("./dto/update-schedule.dto");
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
let UploadedSchedulesController = class UploadedSchedulesController {
    constructor(schedulesService) {
        this.schedulesService = schedulesService;
    }
    create(createScheduleDto, req) {
        const user = req.user;
        const isSuperAdmin = user?.role === client_1.UserRole.SUPERADMIN;
        const companyId = isSuperAdmin ? createScheduleDto.companyId : user?.companyId;
        const audience = resolveAudience(user?.role, createScheduleDto);
        if (!companyId) {
            throw new common_1.ForbiddenException('Empresa obrigatoria.');
        }
        if (!isSuperAdmin && createScheduleDto.companyId && createScheduleDto.companyId !== companyId) {
            throw new common_1.ForbiddenException('Empresa nao autorizada.');
        }
        if (!isAllowedAudience(user?.role, audience)) {
            throw new common_1.ForbiddenException('Visibilidade nao autorizada.');
        }
        if (audience === client_1.ContentAudience.SECTOR && !createScheduleDto.sectorId) {
            throw new common_1.ForbiddenException('Setor obrigatorio para documentos de setor.');
        }
        return this.schedulesService.create({
            ...createScheduleDto,
            companyId,
            sectorId: audience === client_1.ContentAudience.SECTOR
                ? createScheduleDto.sectorId || undefined
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
        console.log('SchedulesController.findAll - companyId:', normalizedCompanyId, 'filters:', filters);
        const result = await this.schedulesService.findAll(normalizedCompanyId, filters);
        console.log('SchedulesController.findAll - resultado:', result.length, 'schedules');
        return result;
    }
    findOne(id) {
        return this.schedulesService.findOne(id);
    }
    update(id, updateScheduleDto, req) {
        return this.schedulesService.update(id, updateScheduleDto, {
            id: req.user.id,
            role: req.user.role,
            companyId: req.user.companyId,
        });
    }
    remove(id, req) {
        return this.schedulesService.remove(id, {
            id: req.user.id,
            role: req.user.role,
            companyId: req.user.companyId,
        });
    }
    restore(id) {
        return this.schedulesService.restore(id);
    }
};
exports.UploadedSchedulesController = UploadedSchedulesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_schedule_dto_1.CreateScheduleDto, Object]),
    __metadata("design:returntype", void 0)
], UploadedSchedulesController.prototype, "create", null);
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
], UploadedSchedulesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UploadedSchedulesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_schedule_dto_1.UpdateScheduleDto, Object]),
    __metadata("design:returntype", void 0)
], UploadedSchedulesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UploadedSchedulesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UploadedSchedulesController.prototype, "restore", null);
exports.UploadedSchedulesController = UploadedSchedulesController = __decorate([
    (0, common_1.Controller)('schedules'),
    __metadata("design:paramtypes", [uploaded_schedules_service_1.UploadedSchedulesService])
], UploadedSchedulesController);
//# sourceMappingURL=uploaded-schedules.controller.js.map