import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { AuthPayload } from './types/auth-payload';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly usersService;
    constructor(configService: ConfigService, usersService: UsersService);
    validate(payload: AuthPayload): Promise<{
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        avatarUrl: string | null;
        theme: import("@prisma/client/runtime/client").JsonValue;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
