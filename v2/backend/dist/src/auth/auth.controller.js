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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const refresh_dto_1 = require("./dto/refresh.dto");
let AuthController = class AuthController {
    constructor(authService, configService) {
        this.authService = authService;
        this.configService = configService;
    }
    async login(body, res) {
        const { user, tokens } = await this.authService.login(body.username, body.password);
        this.setRefreshCookie(res, tokens.refreshToken, tokens.refreshTokenExpiresAt);
        return {
            user,
            accessToken: tokens.accessToken,
            tokenType: tokens.tokenType,
        };
    }
    async refresh(body, req, res) {
        const cookieToken = req.cookies?.refresh_token;
        const refreshToken = body.refreshToken || cookieToken;
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('Refresh token missing');
        }
        const { user, tokens } = await this.authService.refresh(refreshToken);
        this.setRefreshCookie(res, tokens.refreshToken, tokens.refreshTokenExpiresAt);
        return {
            user,
            accessToken: tokens.accessToken,
            tokenType: tokens.tokenType,
        };
    }
    async logout(body, req, res) {
        const cookieToken = req.cookies?.refresh_token;
        const refreshToken = body.refreshToken || cookieToken;
        await this.authService.logout(refreshToken);
        this.clearRefreshCookie(res);
        return { success: true };
    }
    me(user) {
        return user;
    }
    setRefreshCookie(res, refreshToken, expiresAt) {
        const secure = this.configService.get('COOKIE_SECURE') === 'true';
        const domain = this.configService.get('COOKIE_DOMAIN');
        const maxAge = Math.max(expiresAt.getTime() - Date.now(), 0);
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure,
            sameSite: 'lax',
            maxAge,
            path: '/api/auth/refresh',
            domain: domain || undefined,
        });
    }
    clearRefreshCookie(res) {
        const secure = this.configService.get('COOKIE_SECURE') === 'true';
        const domain = this.configService.get('COOKIE_DOMAIN');
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure,
            sameSite: 'lax',
            path: '/api/auth/refresh',
            domain: domain || undefined,
        });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_dto_1.RefreshDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_dto_1.RefreshDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "me", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map