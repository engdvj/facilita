import { Response } from 'express';
import { UserRole, UserStatus } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(role?: UserRole, status?: UserStatus, page?: string, pageSize?: string, search?: string, res?: Response): Promise<{
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.UserStatus;
        avatarUrl: string | null;
        theme: import("@prisma/client/runtime/client").JsonValue;
        id: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
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
    create(data: CreateUserDto): Promise<{
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
    updateMe(user: {
        id: string;
    }, data: UpdateProfileDto): Promise<{
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
    update(id: string, data: UpdateUserDto): Promise<{
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
    remove(id: string, actor: {
        id: string;
    }): Promise<{
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
