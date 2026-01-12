import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        companyId: string | null;
        unitId: string | null;
        sectorId: string | null;
        avatarUrl: string | null;
        theme: import("@prisma/client/runtime/client").JsonValue;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        companyId: string | null;
        unitId: string | null;
        sectorId: string | null;
        avatarUrl: string | null;
        theme: import("@prisma/client/runtime/client").JsonValue;
    }>;
    create(data: CreateUserDto): Promise<{
        id: string;
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        companyId: string | null;
        unitId: string | null;
        sectorId: string | null;
        avatarUrl: string | null;
        theme: import("@prisma/client/runtime/client").JsonValue;
    }>;
    update(id: string, data: UpdateUserDto): Promise<{
        id: string;
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        companyId: string | null;
        unitId: string | null;
        sectorId: string | null;
        avatarUrl: string | null;
        theme: import("@prisma/client/runtime/client").JsonValue;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        companyId: string | null;
        unitId: string | null;
        sectorId: string | null;
        avatarUrl: string | null;
        theme: import("@prisma/client/runtime/client").JsonValue;
    }>;
}
