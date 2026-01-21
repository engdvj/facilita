import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private readonly usersService;
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    constructor(usersService: UsersService, prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    login(username: string, password: string): Promise<{
        user: {
            [x: string]: any;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            refreshTokenExpiresAt: Date;
            tokenType: string;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        user: {
            [x: string]: any;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            refreshTokenExpiresAt: Date;
            tokenType: string;
        };
    }>;
    logout(refreshToken?: string): Promise<void>;
    private issueTokens;
    private verifyRefreshToken;
    private hashToken;
    private getTokenExpiration;
    private sanitizeUser;
}
