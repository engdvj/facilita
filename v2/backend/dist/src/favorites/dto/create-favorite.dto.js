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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateFavoriteDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateFavoriteDto {
}
exports.CreateFavoriteDto = CreateFavoriteDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo de entidade a ser favoritada',
        enum: client_1.EntityType,
        example: 'LINK',
    }),
    (0, class_validator_1.IsEnum)(client_1.EntityType),
    __metadata("design:type", typeof (_a = typeof client_1.EntityType !== "undefined" && client_1.EntityType) === "function" ? _a : Object)
], CreateFavoriteDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID do link (quando entityType = LINK)',
        required: false,
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateFavoriteDto.prototype, "linkId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID da agenda (quando entityType = SCHEDULE)',
        required: false,
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateFavoriteDto.prototype, "scheduleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID da nota (quando entityType = NOTE)',
        required: false,
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateFavoriteDto.prototype, "noteId", void 0);
//# sourceMappingURL=create-favorite.dto.js.map