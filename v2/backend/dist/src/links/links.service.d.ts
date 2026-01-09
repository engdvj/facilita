import { PrismaService } from '../prisma/prisma.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
export declare class LinksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createLinkDto: CreateLinkDto): Promise<{
        sector: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            companyId: string;
            unitId: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            description: string | null;
        } | null;
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        category: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            companyId: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
        } | null;
    } & {
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        status: import(".prisma/client").$Enums.EntityStatus;
        userId: string | null;
        description: string | null;
        color: string | null;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
    }>;
    findAll(companyId?: string, filters?: {
        sectorId?: string;
        categoryId?: string;
        isPublic?: boolean;
    }): Promise<({
        sector: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            companyId: string;
            unitId: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            description: string | null;
        } | null;
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        category: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            companyId: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
        } | null;
        tags: ({
            tag: {
                id: string;
                createdAt: Date;
                name: string;
                color: string | null;
            };
        } & {
            linkId: string;
            tagId: string;
        })[];
    } & {
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        status: import(".prisma/client").$Enums.EntityStatus;
        userId: string | null;
        description: string | null;
        color: string | null;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        sector: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            companyId: string;
            unitId: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            description: string | null;
        } | null;
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        category: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            companyId: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
        } | null;
        tags: ({
            tag: {
                id: string;
                createdAt: Date;
                name: string;
                color: string | null;
            };
        } & {
            linkId: string;
            tagId: string;
        })[];
        versions: ({
            changedByUser: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            url: string;
            id: string;
            createdAt: Date;
            description: string | null;
            title: string;
            changeReason: string | null;
            linkId: string;
            changedBy: string;
        })[];
    } & {
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        status: import(".prisma/client").$Enums.EntityStatus;
        userId: string | null;
        description: string | null;
        color: string | null;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
    }>;
    update(id: string, updateLinkDto: UpdateLinkDto, userId?: string): Promise<{
        sector: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            companyId: string;
            unitId: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            description: string | null;
        } | null;
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        category: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            companyId: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
        } | null;
        tags: ({
            tag: {
                id: string;
                createdAt: Date;
                name: string;
                color: string | null;
            };
        } & {
            linkId: string;
            tagId: string;
        })[];
    } & {
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        status: import(".prisma/client").$Enums.EntityStatus;
        userId: string | null;
        description: string | null;
        color: string | null;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
    }>;
    remove(id: string): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        status: import(".prisma/client").$Enums.EntityStatus;
        userId: string | null;
        description: string | null;
        color: string | null;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
    }>;
    restore(id: string): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        status: import(".prisma/client").$Enums.EntityStatus;
        userId: string | null;
        description: string | null;
        color: string | null;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
    }>;
}
