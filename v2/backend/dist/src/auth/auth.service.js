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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    constructor(usersService, prisma, jwtService, configService) {
        this.usersService = usersService;
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(username, password) {
        const user = await this.usersService.findByUsername(username);
        if (!user || user.status !== client_1.UserStatus.ACTIVE) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const profile = await this.usersService.findOne(user.id);
        const tokens = await this.issueTokens(profile);
        return {
            user: this.sanitizeUser(profile),
            tokens,
        };
    }
    async refresh(refreshToken) {
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('Refresh token missing');
        }
        const payload = await this.verifyRefreshToken(refreshToken);
        const tokenHash = this.hashToken(refreshToken);
        const storedToken = await this.prisma.refreshToken.findFirst({
            where: {
                tokenHash,
                userId: payload.sub,
                revokedAt: null,
            },
        });
        if (!storedToken || storedToken.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Refresh token invalid');
        }
        await this.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { revokedAt: new Date() },
        });
        const user = await this.usersService.findActiveById(payload.sub);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const profile = await this.usersService.findOne(user.id);
        const tokens = await this.issueTokens(profile);
        return {
            user: this.sanitizeUser(profile),
            tokens,
        };
    }
    async logout(refreshToken) {
        if (!refreshToken) {
            return;
        }
        const tokenHash = this.hashToken(refreshToken);
        await this.prisma.refreshToken.updateMany({
            where: {
                tokenHash,
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
            },
        });
    }
    async issueTokens(user) {
        const payload = {
            sub: user.id,
            role: user.role,
            email: user.email,
        };
        const accessToken = await this.jwtService.signAsync(payload);
        const refreshSecret = this.configService.get('JWT_REFRESH_SECRET') || 'dev-refresh';
        const refreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d';
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: refreshSecret,
            expiresIn: refreshExpiresIn,
        });
        const refreshTokenExpiresAt = this.getTokenExpiration(refreshToken);
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: this.hashToken(refreshToken),
                expiresAt: refreshTokenExpiresAt,
            },
        });
        return {
            accessToken,
            refreshToken,
            refreshTokenExpiresAt,
            tokenType: 'Bearer',
        };
    }
    async verifyRefreshToken(token) {
        const refreshSecret = this.configService.get('JWT_REFRESH_SECRET') || 'dev-refresh';
        try {
            return await this.jwtService.verifyAsync(token, {
                secret: refreshSecret,
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Refresh token invalid');
        }
    }
    hashToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
    getTokenExpiration(token) {
        const decoded = this.jwtService.decode(token);
        if (!decoded || typeof decoded !== 'object' || !('exp' in decoded)) {
            return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        }
        const exp = decoded.exp;
        return new Date(exp * 1000);
    }
    sanitizeUser(user) {
        const { passwordHash, ...rest } = user;
        return rest;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map