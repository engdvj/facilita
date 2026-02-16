import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(req: any, ownerId?: string, includeInactive?: string): Promise<({
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
    create(req: any, data: CreateCategoryDto): Promise<{
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
    update(id: string, req: any, data: UpdateCategoryDto): Promise<{
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
    remove(id: string, req: any): Promise<{
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
