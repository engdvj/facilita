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
exports.SectorsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const sectors_service_1 = require("./sectors.service");
const create_sector_dto_1 = require("./dto/create-sector.dto");
const update_sector_dto_1 = require("./dto/update-sector.dto");
const pagination_1 = require("../common/utils/pagination");
let SectorsController = class SectorsController {
    constructor(sectorsService) {
        this.sectorsService = sectorsService;
    }
    async findAll(companyId, unitId, page, pageSize, search, res) {
        const pagination = (0, pagination_1.parsePagination)(page, pageSize, {
            defaultPageSize: 12,
        });
        const { items, total } = await this.sectorsService.findAll({
            companyId,
            unitId,
            search,
            ...(pagination.shouldPaginate
                ? { skip: pagination.skip, take: pagination.take }
                : {}),
        });
        if (pagination.shouldPaginate && res) {
            res.setHeader('X-Total-Count', total.toString());
        }
        return items;
    }
    findOne(id) {
        return this.sectorsService.findById(id);
    }
    getDependencies(id) {
        return this.sectorsService.getDependencies(id);
    }
    create(data) {
        return this.sectorsService.create(data);
    }
    update(id, data) {
        return this.sectorsService.update(id, data);
    }
    remove(id) {
        return this.sectorsService.remove(id);
    }
};
exports.SectorsController = SectorsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('unitId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('pageSize')),
    __param(4, (0, common_1.Query)('search')),
    __param(5, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], SectorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SectorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/dependencies'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SectorsController.prototype, "getDependencies", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sector_dto_1.CreateSectorDto]),
    __metadata("design:returntype", void 0)
], SectorsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_sector_dto_1.UpdateSectorDto]),
    __metadata("design:returntype", void 0)
], SectorsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SectorsController.prototype, "remove", null);
exports.SectorsController = SectorsController = __decorate([
    (0, common_1.Controller)('sectors'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERADMIN),
    __metadata("design:paramtypes", [sectors_service_1.SectorsService])
], SectorsController);
//# sourceMappingURL=sectors.controller.js.map