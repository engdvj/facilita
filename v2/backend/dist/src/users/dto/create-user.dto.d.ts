import { UserRole, UserStatus } from '@prisma/client';
export declare class CreateUserDto {
    name: string;
    username: string;
    password: string;
    role?: UserRole;
    status?: UserStatus;
    avatarUrl?: string;
    theme?: Record<string, unknown>;
}
