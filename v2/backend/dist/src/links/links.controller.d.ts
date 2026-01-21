import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
export declare class LinksController {
    private readonly linksService;
    constructor(linksService: LinksService);
    create(createLinkDto: CreateLinkDto, req: any): Promise<{
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
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            description: string | null;
        } | null;
        linkUnits: ({
            unit: {
                id: string;
                cnpj: string | null;
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            unitId: string;
            linkId: string;
        })[];
    } & {
        url: string;
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        description: string | null;
        sectorId: string | null;
        userId: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
        unitId: string | null;
        categoryId: string | null;
    }>;
    findAll(companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string): Promise<({
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
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            description: string | null;
        } | null;
        linkUnits: ({
            unit: {
                id: string;
                cnpj: string | null;
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            unitId: string;
            linkId: string;
        })[];
    } & {
        url: string;
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        description: string | null;
        sectorId: string | null;
        userId: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
        unitId: string | null;
        categoryId: string | null;
    })[]>;
    findAllAdmin(req: any, companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string): Promise<({
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
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            description: string | null;
        } | null;
        linkUnits: ({
            unit: {
                id: string;
                cnpj: string | null;
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            unitId: string;
            linkId: string;
        })[];
    } & {
        url: string;
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        description: string | null;
        sectorId: string | null;
        userId: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
        unitId: string | null;
        categoryId: string | null;
    })[]>;
    findAllAdminAlias(req: any, companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string): Promise<({
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
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            description: string | null;
        } | null;
        linkUnits: ({
            unit: {
                id: string;
                cnpj: string | null;
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            unitId: string;
            linkId: string;
        })[];
    } & {
        url: string;
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        description: string | null;
        sectorId: string | null;
        userId: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
        unitId: string | null;
        categoryId: string | null;
    })[]>;
    findOne(id: string): Promise<{
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
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            description: string | null;
        } | null;
        linkUnits: ({
            unit: {
                id: string;
                cnpj: string | null;
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            unitId: string;
            linkId: string;
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
            changedBy: string;
            title: string;
            linkId: string;
            changeReason: string | null;
        })[];
    } & {
        url: string;
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        description: string | null;
        sectorId: string | null;
        userId: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
        unitId: string | null;
        categoryId: string | null;
    }>;
    update(id: string, updateLinkDto: UpdateLinkDto, req: any): Promise<{
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
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            description: string | null;
        } | null;
        linkUnits: ({
            unit: {
                id: string;
                cnpj: string | null;
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            unitId: string;
            linkId: string;
        })[];
    } & {
        url: string;
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        description: string | null;
        sectorId: string | null;
        userId: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
        unitId: string | null;
        categoryId: string | null;
    }>;
    remove(id: string, body: {
        adminMessage?: string;
    } | undefined, req: any): Promise<{
        url: string;
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        description: string | null;
        sectorId: string | null;
        userId: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
        unitId: string | null;
        categoryId: string | null;
    }>;
    restore(id: string): Promise<{
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
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            description: string | null;
        } | null;
        linkUnits: ({
            unit: {
                id: string;
                cnpj: string | null;
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            unitId: string;
            linkId: string;
        })[];
    } & {
        url: string;
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        description: string | null;
        sectorId: string | null;
        userId: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
        unitId: string | null;
        categoryId: string | null;
    }>;
    activate(id: string, req: any): Promise<{
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
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            description: string | null;
        } | null;
        linkUnits: ({
            unit: {
                id: string;
                cnpj: string | null;
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            unitId: string;
            linkId: string;
        })[];
    } & {
        url: string;
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        description: string | null;
        sectorId: string | null;
        userId: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
        unitId: string | null;
        categoryId: string | null;
    }>;
    deactivate(id: string, req: any): Promise<{
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
        sector: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            description: string | null;
        } | null;
        linkUnits: ({
            unit: {
                id: string;
                cnpj: string | null;
                name: string;
                status: import(".prisma/client").$Enums.EntityStatus;
                createdAt: Date;
                updatedAt: Date;
                companyId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            unitId: string;
            linkId: string;
        })[];
    } & {
        url: string;
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        description: string | null;
        sectorId: string | null;
        userId: string | null;
        title: string;
        color: string | null;
        imageUrl: string | null;
        imagePosition: string | null;
        imageScale: number | null;
        audience: import(".prisma/client").$Enums.ContentAudience;
        isPublic: boolean;
        order: number;
        deletedAt: Date | null;
        unitId: string | null;
        categoryId: string | null;
    }>;
}
