import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createCategoryDto: CreateCategoryDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        companyId: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        color: string | null;
        icon: string | null;
        adminOnly: boolean;
    }>;
    findAll(companyId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        companyId: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        color: string | null;
        icon: string | null;
        adminOnly: boolean;
    }[]>;
    findOne(id: string): Promise<{
        _count: {
            links: number;
            schedules: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        companyId: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        color: string | null;
        icon: string | null;
        adminOnly: boolean;
    }>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        companyId: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        color: string | null;
        icon: string | null;
        adminOnly: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        companyId: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        color: string | null;
        icon: string | null;
        adminOnly: boolean;
    }>;
}
