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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoritesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const favorites_service_1 = require("./favorites.service");
const create_favorite_dto_1 = require("./dto/create-favorite.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const client_1 = require("@prisma/client");
let FavoritesController = class FavoritesController {
    constructor(favoritesService) {
        this.favoritesService = favoritesService;
    }
    async create(req, createFavoriteDto) {
        return this.favoritesService.create(req.user.id, createFavoriteDto);
    }
    async findMyFavorites(req, type) {
        if (type) {
            return this.favoritesService.findByUserAndType(req.user.id, type);
        }
        return this.favoritesService.findAllByUser(req.user.id);
    }
    async countMyFavorites(req) {
        const count = await this.favoritesService.countByUser(req.user.id);
        return { count };
    }
    async checkFavorited(req, entityType, entityId) {
        const isFavorited = await this.favoritesService.isFavorited(req.user.id, entityType, entityId);
        return { isFavorited };
    }
    async countByEntity(entityType, entityId) {
        const count = await this.favoritesService.countByEntity(entityType, entityId);
        return { count };
    }
    async remove(req, id) {
        return this.favoritesService.remove(id, req.user.id);
    }
    async removeByEntity(req, entityType, entityId) {
        return this.favoritesService.removeByEntity(req.user.id, entityType, entityId);
    }
};
exports.FavoritesController = FavoritesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Adicionar item aos favoritos' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Item favoritado com sucesso',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Dados inválidos',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Item não encontrado',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Item já está nos favoritos',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_favorite_dto_1.CreateFavoriteDto]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar meus favoritos' }),
    (0, swagger_1.ApiQuery)({
        name: 'type',
        required: false,
        enum: client_1.EntityType,
        description: 'Filtrar por tipo de entidade',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de favoritos retornada com sucesso',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_a = typeof client_1.EntityType !== "undefined" && client_1.EntityType) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "findMyFavorites", null);
__decorate([
    (0, common_1.Get)('me/count'),
    (0, swagger_1.ApiOperation)({ summary: 'Contar meus favoritos' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Total de favoritos',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "countMyFavorites", null);
__decorate([
    (0, common_1.Get)('check/:entityType/:entityId'),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar se um item está favoritado' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Status de favorito retornado',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('entityType')),
    __param(2, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof client_1.EntityType !== "undefined" && client_1.EntityType) === "function" ? _b : Object, String]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "checkFavorited", null);
__decorate([
    (0, common_1.Get)('entity/:entityType/:entityId/count'),
    (0, swagger_1.ApiOperation)({ summary: 'Contar quantas vezes um item foi favoritado' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Total de vezes que o item foi favoritado',
    }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof client_1.EntityType !== "undefined" && client_1.EntityType) === "function" ? _c : Object, String]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "countByEntity", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover favorito por ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Favorito removido com sucesso',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Favorito não encontrado',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('entity/:entityType/:entityId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover favorito por entidade' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Favorito removido com sucesso',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Favorito não encontrado',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('entityType')),
    __param(2, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_d = typeof client_1.EntityType !== "undefined" && client_1.EntityType) === "function" ? _d : Object, String]),
    __metadata("design:returntype", Promise)
], FavoritesController.prototype, "removeByEntity", null);
exports.FavoritesController = FavoritesController = __decorate([
    (0, swagger_1.ApiTags)('Favoritos'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('favorites'),
    __metadata("design:paramtypes", [favorites_service_1.FavoritesService])
], FavoritesController);
//# sourceMappingURL=favorites.controller.js.map