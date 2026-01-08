import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { User, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AuthPayload } from './types/auth-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(user);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
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
      throw new UnauthorizedException('Refresh token invalid');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.usersService.findActiveById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.issueTokens(user);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async logout(refreshToken?: string) {
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

  private async issueTokens(user: User) {
    const payload: AuthPayload = {
      sub: user.id,
      role: user.role,
      email: user.email,
      companyId: user.companyId,
      unitId: user.unitId,
      sectorId: user.sectorId,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') || 'dev-refresh';
    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn as StringValue,
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

  private async verifyRefreshToken(token: string): Promise<AuthPayload> {
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') || 'dev-refresh';

    try {
      return await this.jwtService.verifyAsync<AuthPayload>(token, {
        secret: refreshSecret,
      });
    } catch (error) {
      throw new UnauthorizedException('Refresh token invalid');
    }
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getTokenExpiration(token: string): Date {
    const decoded = this.jwtService.decode(token);

    if (!decoded || typeof decoded !== 'object' || !('exp' in decoded)) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const exp = (decoded as { exp: number }).exp;
    return new Date(exp * 1000);
  }

  private sanitizeUser(user: Record<string, any>) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
