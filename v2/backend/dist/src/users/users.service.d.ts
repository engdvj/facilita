import { Prisma, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
declare const userSelect: {
    id: boolean;
    name: boolean;
    email: boolean;
    role: boolean;
    status: boolean;
    avatarUrl: boolean;
    theme: boolean;
    createdAt: boolean;
    updatedAt: boolean;
};
type UserProfile = Prisma.UserGetPayload<{
    select: typeof userSelect;
}>;
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Prisma.Prisma__UserClient<{
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        avatarUrl: string | null;
        theme: Prisma.JsonValue | null;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        cpf: string | null;
        passwordHash: string;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, Prisma.PrismaClientOptions>;
    findByUsername(username: string): Prisma.Prisma__UserClient<{
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        avatarUrl: string | null;
        theme: Prisma.JsonValue | null;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        cpf: string | null;
        passwordHash: string;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, Prisma.PrismaClientOptions>;
    findById(id: string): Prisma.Prisma__UserClient<{
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        avatarUrl: string | null;
        theme: Prisma.JsonValue | null;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        cpf: string | null;
        passwordHash: string;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, Prisma.PrismaClientOptions>;
    findActiveById(id: string): Prisma.Prisma__UserClient<{
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        avatarUrl: string | null;
        theme: Prisma.JsonValue;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, Prisma.PrismaClientOptions>;
    findAll(options?: {
        search?: string;
        role?: UserRole;
        status?: UserStatus;
        skip?: number;
        take?: number;
    }): Promise<{
        items: {
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.UserStatus;
            avatarUrl: string | null;
            theme: Prisma.JsonValue;
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
    }>;
    findOne(id: string): Promise<UserProfile>;
    create(data: CreateUserDto): Promise<{
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        avatarUrl: string | null;
        theme: Prisma.JsonValue;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: UpdateUserDto): Promise<{
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        avatarUrl: string | null;
        theme: Prisma.JsonValue;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(id: string, data: UpdateProfileDto): Promise<{
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        avatarUrl: string | null;
        theme: Prisma.JsonValue;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getDependencies(id: string): Promise<{
        links: number;
        schedules: number;
        notes: number;
        uploadedImages: number;
        sharesSent: number;
        sharesReceived: number;
        favorites: number;
        refreshTokens: number;
        activityLogs: number;
        auditLogs: number;
        notifications: number;
        hasAny: boolean;
    }>;
    remove(id: string, actorId?: string): Promise<{
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        avatarUrl: string | null;
        theme: Prisma.JsonValue;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
