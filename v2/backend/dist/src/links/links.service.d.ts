import { PrismaService } from '../prisma/prisma.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { ContentAudience, UserRole } from '@prisma/client';
type LinkActor = {
    id: string;
    role: UserRole;
    companyId?: string | null;
};
export declare class LinksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createLinkDto: CreateLinkDto): Promise<{
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            unitId: string;
            description: string | null;
        } | null;
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        category: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
        } | null;
    } & {
        url: string;
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        description: string | null;
        color: string | null;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
    }>;
    findAll(companyId?: string, filters?: {
        sectorId?: string;
        categoryId?: string;
        isPublic?: boolean;
        audience?: ContentAudience;
    }): Promise<({
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            unitId: string;
            description: string | null;
        } | null;
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        category: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
        } | null;
        tags: ({
            tag: {
                id: string;
                name: string;
                createdAt: Date;
                color: string | null;
            };
        } & {
            linkId: string;
            tagId: string;
        })[];
    } & {
        url: string;
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        description: string | null;
        color: string | null;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            unitId: string;
            description: string | null;
        } | null;
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        category: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
        } | null;
        tags: ({
            tag: {
                id: string;
                name: string;
                createdAt: Date;
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
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        description: string | null;
        color: string | null;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
    }>;
    update(id: string, updateLinkDto: UpdateLinkDto, actor?: LinkActor): Promise<{
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            unitId: string;
            description: string | null;
        } | null;
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
        category: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            color: string | null;
            icon: string | null;
            adminOnly: boolean;
        } | null;
        tags: ({
            tag: {
                id: string;
                name: string;
                createdAt: Date;
                color: string | null;
            };
        } & {
            linkId: string;
            tagId: string;
        })[];
    } & {
        url: string;
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        description: string | null;
        color: string | null;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
    }>;
    remove(id: string, actor?: LinkActor): Promise<{
        url: string;
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        description: string | null;
        color: string | null;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
    }>;
    private assertCanMutate;
    private resolveAudienceFromExisting;
    private resolveAudienceForUpdate;
    private assertAudienceAllowed;
    restore(id: string): Promise<{
        url: string;
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        userId: string | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        description: string | null;
        color: string | null;
        categoryId: string | null;
        title: string;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
    }>;
}
export {};
