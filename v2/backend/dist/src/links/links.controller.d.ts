import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
export declare class LinksController {
    private readonly linksService;
    constructor(linksService: LinksService);
    create(createLinkDto: CreateLinkDto, req: any): Promise<{
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
        description: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
        userId: string | null;
        categoryId: string | null;
    }>;
    findAll(companyId?: string, sectorId?: string, categoryId?: string, isPublic?: string, audience?: string): Promise<({
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
        description: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
        userId: string | null;
        categoryId: string | null;
    })[]>;
    findAllAdmin(req: any, companyId?: string, sectorId?: string, categoryId?: string, isPublic?: string, audience?: string): Promise<({
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
        description: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
        userId: string | null;
        categoryId: string | null;
    })[]>;
    findAllAdminAlias(req: any, companyId?: string, sectorId?: string, categoryId?: string, isPublic?: string, audience?: string): Promise<({
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
        description: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
        userId: string | null;
        categoryId: string | null;
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
            changedBy: string;
            changeReason: string | null;
            linkId: string;
        })[];
    } & {
        url: string;
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        description: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
        userId: string | null;
        categoryId: string | null;
    }>;
    update(id: string, updateLinkDto: UpdateLinkDto, req: any): Promise<{
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
        description: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
        userId: string | null;
        categoryId: string | null;
    }>;
    remove(id: string, req: any): Promise<{
        url: string;
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        description: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
        userId: string | null;
        categoryId: string | null;
    }>;
    restore(id: string): Promise<{
        url: string;
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        sectorId: string | null;
        description: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
        userId: string | null;
        categoryId: string | null;
    }>;
}
