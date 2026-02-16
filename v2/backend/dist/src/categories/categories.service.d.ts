import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(options: {
        ownerId?: string;
        includeInactive?: boolean;
    }): Promise<({
        _count: {
            links: number;
            schedules: number;
            notes: number;
        };
    } & {
        name: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        icon: string | null;
        adminOnly: boolean;
        ownerId: string;
    })[]>;
    findOne(id: string): Promise<{
        _count: {
            links: number;
            schedules: number;
            notes: number;
        };
    } & {
        name: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        icon: string | null;
        adminOnly: boolean;
        ownerId: string;
    }>;
    create(ownerId: string, data: CreateCategoryDto): Promise<{
        _count: {
            links: number;
            schedules: number;
            notes: number;
        };
    } & {
        name: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        icon: string | null;
        adminOnly: boolean;
        ownerId: string;
    }>;
    update(id: string, actor: {
        id: string;
        role: string;
    }, data: UpdateCategoryDto): Promise<{
        _count: {
            links: number;
            schedules: number;
            notes: number;
        };
    } & {
        name: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        icon: string | null;
        adminOnly: boolean;
        ownerId: string;
    }>;
    remove(id: string, actor: {
        id: string;
        role: string;
    }): Promise<{
        name: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string | null;
        icon: string | null;
        adminOnly: boolean;
        ownerId: string;
    }>;
}
